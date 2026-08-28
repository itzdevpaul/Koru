import express from 'express'
import crypto from 'node:crypto'
import { Resend } from 'resend'
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

// ── Firebase Admin init (lazy, only if credentials are present) ───────────────
let _adminApp: App | null = null
function getAdminApp(): App {
  if (_adminApp) return _adminApp
  if (getApps().length) { _adminApp = getApps()[0]; return _adminApp }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  const credential = JSON.parse(
    raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  )
  _adminApp = initializeApp({ credential: cert(credential) })
  return _adminApp
}

async function getAuthenticatedUser(req: express.Request) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) throw new Error('Authentication required')
  return getAuth(getAdminApp()).verifyIdToken(header.slice(7))
}

function inviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char] ?? char))
}

function safeInviteCode(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

const BASE_PRICE_KOBO = 250000 // ₦2,500

function calculatePrice(referredBy: boolean): {
  amount: number
  discountPercent: number
  discountReason: string
} {
  const now = new Date()
  // Anniversary: September 4 (month is 0-indexed, so September = 8)
  const isAnniversary = now.getMonth() === 8 && now.getDate() === 4
  if (isAnniversary) {
    return {
      amount: Math.round(BASE_PRICE_KOBO * 0.5),
      discountPercent: 50,
      discountReason: 'Happy Anniversary! 50% off Koru Pro',
    }
  }
  if (referredBy) {
    return {
      amount: Math.round(BASE_PRICE_KOBO * 0.95),
      discountPercent: 5,
      discountReason: 'Invite code benefit — 5% off',
    }
  }
  return { amount: BASE_PRICE_KOBO, discountPercent: 0, discountReason: '' }
}

async function notifyInviter(inviterUid: string, referralCount: number, rewardGranted: boolean): Promise<void> {
  try {
    const firestore = getFirestore(getAdminApp())

    // Create a notification document for the inviter
    const message = rewardGranted
      ? "Your invite code was used! You've reached 10 referrals — 7 days of Pro unlocked! 🎉"
      : `Your invite code was used! ${referralCount} of 10 referrals — keep inviting to unlock Pro.`
    await firestore.collection(`users/${inviterUid}/notifications`).add({
      type: 'referral',
      title: 'Your invite code was used! 🎉',
      message,
      referralCount,
      rewardGranted,
      read: false,
      createdAt: new Date(),
    })

    // Try to send a push notification if the inviter has push enabled
    const profileSnap = await firestore.doc(`users/${inviterUid}/profile/main`).get()
    const pushToken = profileSnap.data()?.pushToken
    const pushEnabled = profileSnap.data()?.pushNotificationsEnabled
    if (pushToken && pushEnabled) {
      try {
        await getMessaging(getAdminApp()).send({
          token: pushToken,
          notification: {
            title: 'Your invite code was used! 🎉',
            body: rewardGranted
              ? '10 referrals reached — 7 days of Pro unlocked!'
              : `${referralCount} of 10 invites — keep going!`,
          },
          data: { url: '/profile' },
        })
      } catch (err) {
        console.warn('[Koru] Referral push notification failed:', err instanceof Error ? err.message : err)
      }
    }
  } catch (err) {
    console.error('[Koru] Failed to notify inviter:', err instanceof Error ? err.message : err)
  }
}

const app = express()
const PORT = 3001

app.use(express.json())

// Allow requests from Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') { res.sendStatus(200); return }
  next()
})

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')
  return new Resend(key)
}

// ── Send a weekly reflection reminder ────────────────────────────────────────
app.post('/api/send-reminder', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const { to, name, resultTitle } = req.body as { to: string; name: string; resultTitle?: string }
    if (!to || !name || to.toLowerCase() !== decoded.email?.toLowerCase()) {
      res.status(403).json({ error: 'Email ownership could not be verified' }); return
    }

    const resend = getResend()
    const prompt = getReflectionPrompt(resultTitle)

    await resend.emails.send({
      from: 'Koru <hello@koru.com.ng>',
      to,
      subject: '🌿 Your weekly reflection prompt',
      html: buildReminderEmail(name, prompt),
    })

    res.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/send-reminder error:', msg)
    res.status(500).json({ error: msg })
  }
})

// ── Send a welcome email ──────────────────────────────────────────────────────
app.post('/api/send-welcome', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const { to, name } = req.body as { to: string; name: string }
    if (!to || !name || to.toLowerCase() !== decoded.email?.toLowerCase()) {
      res.status(403).json({ error: 'Email ownership could not be verified' }); return
    }

    const resend = getResend()
    await resend.emails.send({
      from: 'Koru <hello@koru.com.ng>',
      to,
      subject: `Hey ${name}, welcome to Koru 🌿`,
      html: buildWelcomeEmail(name),
    })

    res.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/send-welcome error:', msg)
    res.status(500).json({ error: msg })
  }
})

// ── Squad subscription ────────────────────────────────────────────────────────

function squadBase() {
  return process.env.SQUAD_ENV === 'prod'
    ? 'https://api-d.squadco.com'
    : 'https://sandbox-api-d.squadco.com'
}

app.post('/api/subscribe/initiate', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const { uid, origin } = req.body as { uid: string; origin?: string }
    if (!uid || uid !== decoded.uid || !decoded.email) { res.status(403).json({ error: 'Account ownership could not be verified' }); return }

    const key = process.env.SQUAD_SECRET_KEY
    if (!key) { res.status(500).json({ error: 'SQUAD_SECRET_KEY not configured' }); return }

    // Check if user was referred for discount eligibility
    const profileSnap = await getFirestore(getAdminApp()).doc(`users/${decoded.uid}/profile/main`).get()
    const referredBy = Boolean(profileSnap.exists && profileSnap.data()?.referredBy)
    const price = calculatePrice(referredBy)

    const ref = `koru_sub_${uid}_${Date.now()}`

    // Build callback URL — trust origin only for known safe patterns
    const safeOrigin =
      origin &&
      (origin === 'https://koru.com.ng' || /^https:\/\/[\w-]+(\.[\w-]+)*\.replit\.dev$/.test(origin))
        ? origin
        : (process.env.APP_URL ?? 'https://koru.com.ng')
    const callbackUrl = `${safeOrigin}/payment/return`

    const squadRes = await fetch(`${squadBase()}/transaction/initiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: decoded.email,
        amount: price.amount,
        currency: 'NGN',
        initiate_type: 'inline', // required for Squad to return checkout_url
        transaction_ref: ref,
        callback_url: callbackUrl,
        pass_charge: false,
      }),
    })

    const data = await squadRes.json()

    // Squad returns checkout_url in data.data; if absent, construct it from the ref
    const isProd = process.env.SQUAD_ENV === 'prod'
    const checkoutUrl: string =
      data?.data?.checkout_url ??
      (isProd ? `https://pay.squadco.com/${ref}` : `https://sandbox-pay.squadco.com/${ref}`)

    // Squad sandbox returns { success: true }, prod returns { status: 200 }
    const ok = data?.success === true || data?.status === 200
    if (!ok) {
      console.error('[Koru] Squad initiate failed:', JSON.stringify(data))
      res.status(502).json({ error: data?.message ?? 'Could not create payment session' })
      return
    }

    res.json({ checkout_url: checkoutUrl, ref })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/subscribe/initiate error:', msg)
    res.status(500).json({ error: msg })
  }
})

app.post('/api/subscribe/verify', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const { ref } = req.body as { ref: string }
    if (!ref || !ref.startsWith(`koru_sub_${decoded.uid}_`)) { res.status(403).json({ error: 'Payment ownership could not be verified' }); return }

    const key = process.env.SQUAD_SECRET_KEY
    if (!key) { res.status(500).json({ error: 'SQUAD_SECRET_KEY not configured' }); return }

    const response = await fetch(`${squadBase()}/transaction/verify/${ref}`, {
      headers: { 'Authorization': `Bearer ${key}` },
    })
    const data = await response.json()

    const verified =
      data?.status === 200 &&
      (data?.data?.transaction_status === 'Success' || data?.data?.transaction_status === 'success')

    res.json({ verified, raw: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/subscribe/verify error:', msg)
    res.status(500).json({ error: msg })
  }
})

app.post('/api/subscribe/activate', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const { ref } = req.body as { ref: string }
    if (!ref || !ref.startsWith(`koru_sub_${decoded.uid}_`)) {
      res.status(403).json({ error: 'Payment ownership could not be verified' }); return
    }

    const key = process.env.SQUAD_SECRET_KEY
    if (!key) { res.status(500).json({ error: 'SQUAD_SECRET_KEY not configured' }); return }
    const response = await fetch(`${squadBase()}/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    const data = await response.json()
    const verified =
      data?.status === 200 &&
      (data?.data?.transaction_status === 'Success' || data?.data?.transaction_status === 'success')
    if (!verified) { res.status(402).json({ error: 'Payment could not be verified' }); return }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await getFirestore(getAdminApp()).doc(`users/${decoded.uid}/subscription/main`).set({
      active: true,
      expiresAt,
      squadRef: ref,
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    res.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/subscribe/activate error:', msg)
    res.status(msg === 'Authentication required' ? 401 : 500).json({ error: msg })
  }
})

// ── Invite and earn ───────────────────────────────────────────────────────────
app.post('/api/referrals/ensure-code', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const firestore = getFirestore(getAdminApp())
    const profileRef = firestore.doc(`users/${decoded.uid}/profile/main`)

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = inviteCode()
      const codeRef = firestore.doc(`inviteCodes/${candidate}`)
      const result = await firestore.runTransaction(async transaction => {
        const [profileSnap, codeSnap] = await Promise.all([
          transaction.get(profileRef),
          transaction.get(codeRef),
        ])
        const profile = profileSnap.data() ?? {}
        if (typeof profile.inviteCode === 'string' && profile.inviteCode) {
          return {
            inviteCode: profile.inviteCode,
            referralCount: Number(profile.referralCount ?? 0),
            referralRewardGranted: Boolean(profile.referralRewardGranted),
          }
        }
        if (codeSnap.exists) return null
        transaction.set(codeRef, { uid: decoded.uid, createdAt: new Date() })
        transaction.set(profileRef, {
          inviteCode: candidate,
          referralCount: 0,
          referralRewardGranted: false,
          updatedAt: new Date(),
        }, { merge: true })
        return { inviteCode: candidate, referralCount: 0, referralRewardGranted: false }
      })
      if (result) {
        res.json({ ...result, rewardDays: 7 })
        return
      }
    }
    res.status(503).json({ error: 'Could not create an invite code. Please try again.' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/referrals/ensure-code error:', msg)
    res.status(msg === 'Authentication required' ? 401 : 500).json({ error: msg })
  }
})

app.post('/api/referrals/claim', async (req, res) => {
  try {
    const decoded = await getAuthenticatedUser(req)
    const code = safeInviteCode((req.body as { inviteCode?: string }).inviteCode)
    if (code.length < 6) { res.status(400).json({ error: 'Enter a valid invite code.' }); return }

    const firestore = getFirestore(getAdminApp())
    const codeRef = firestore.doc(`inviteCodes/${code}`)
    const inviteeProfileRef = firestore.doc(`users/${decoded.uid}/profile/main`)
    const result = await firestore.runTransaction(async transaction => {
      const codeSnap = await transaction.get(codeRef)
      if (!codeSnap.exists) throw new Error('That invite code is not valid.')
      const ownerUid = String(codeSnap.data()?.uid ?? '')
      if (!ownerUid || ownerUid === decoded.uid) throw new Error('You cannot use your own invite code.')

      const inviterProfileRef = firestore.doc(`users/${ownerUid}/profile/main`)
      const actualReferralRef = firestore.doc(`users/${ownerUid}/referrals/${decoded.uid}`)
      const subscriptionRef = firestore.doc(`users/${ownerUid}/subscription/main`)
      const [inviteeProfile, referral, inviterProfile, subscription] = await Promise.all([
        transaction.get(inviteeProfileRef),
        transaction.get(actualReferralRef),
        transaction.get(inviterProfileRef),
        transaction.get(subscriptionRef),
      ])
      if (inviteeProfile.data()?.referredBy) throw new Error('An invite code has already been applied to this account.')
      if (referral.exists) return { rewardGranted: false, ownerUid: '', referralCount: 0 }

      const profile = inviterProfile.data() ?? {}
      const count = Number(profile.referralCount ?? 0) + 1
      const rewardGranted = Boolean(profile.referralRewardGranted) || count >= 10
      transaction.set(actualReferralRef, {
        invitedUid: decoded.uid,
        inviteCode: code,
        createdAt: new Date(),
      })
      transaction.set(inviteeProfileRef, {
        referredBy: ownerUid,
        referredAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date(),
      }, { merge: true })
      transaction.set(inviterProfileRef, {
        referralCount: count,
        referralRewardGranted: rewardGranted,
        updatedAt: new Date(),
      }, { merge: true })

      if (rewardGranted && !profile.referralRewardGranted) {
        const currentExpiry = subscription.data()?.expiresAt?.toDate?.() as Date | undefined
        const startsAt = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date()
        const expiresAt = new Date(startsAt)
        expiresAt.setDate(expiresAt.getDate() + 7)
        transaction.set(subscriptionRef, {
          active: true,
          expiresAt: Timestamp.fromDate(expiresAt),
          squadRef: 'referral-reward',
          activatedAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true })
      }
      return { rewardGranted: rewardGranted && !profile.referralRewardGranted, ownerUid, referralCount: count }
    })

    // Alert the inviter that their code was used
    if (result.ownerUid) {
      void notifyInviter(result.ownerUid, result.referralCount, result.rewardGranted)
    }

    res.json({ ok: true, rewardGranted: result.rewardGranted })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('valid') || msg.includes('own') || msg.includes('already') ? 400 : msg === 'Authentication required' ? 401 : 500
    res.status(status).json({ error: msg })
  }
})

// ── Admin: list all users ─────────────────────────────────────────────────────
const ADMIN_EMAIL = 'pauladamu600@gmail.com'

app.get('/api/admin/users', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid Authorization header' }); return
    }
    const idToken = authHeader.slice(7)
    const adminApp = getAdminApp()
    const decoded = await getAuth(adminApp).verifyIdToken(idToken)
    if (decoded.email !== ADMIN_EMAIL) {
      res.status(403).json({ error: 'Forbidden' }); return
    }

    const auth = getAuth(adminApp)
    const firestore = getFirestore(adminApp)

    // List all Auth users (paginate up to 1000)
    const allUsers: Awaited<ReturnType<typeof auth.listUsers>>['users'] = []
    let pageToken: string | undefined
    do {
      const result = await auth.listUsers(1000, pageToken)
      allUsers.push(...result.users)
      pageToken = result.pageToken
    } while (pageToken)

    // Fetch Firestore data for each user in parallel
    const enriched = await Promise.all(
      allUsers.map(async (u) => {
        const uid = u.uid
        const [profileSnap, subSnap, quizSnap] = await Promise.all([
          firestore.doc(`users/${uid}/profile/main`).get(),
          firestore.doc(`users/${uid}/subscription/main`).get(),
          firestore.collection(`users/${uid}/quizResults`).count().get(),
        ])

        const profile = profileSnap.exists ? profileSnap.data() : null
        const sub = subSnap.exists ? subSnap.data() : null

        return {
          uid,
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          createdAt: u.metadata.creationTime ?? '',
          lastSignIn: u.metadata.lastSignInTime ?? '',
          profile: profile
            ? {
                onboardingComplete: !!profile.onboardingComplete,
                focusAreas: profile.focusAreas ?? [],
                ageRange: profile.ageRange ?? '',
                streak: profile.streak ?? 0,
                lastActive: profile.lastActive ?? '',
                emailOptIn: !!profile.emailOptIn,
              }
            : null,
          subscription: sub
            ? {
                active: !!sub.active,
                expiresAt: sub.expiresAt?.toDate?.()?.toISOString() ?? null,
              }
            : null,
          quizCount: quizSnap.data().count ?? 0,
        }
      })
    )

    // Sort newest first
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(enriched)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/admin/users error:', msg)
    res.status(500).json({ error: msg })
  }
})

// ── Admin: verify password (never exposes the secret to the client) ───────────
// ── Admin: grant Pro to a user ────────────────────────────────────────────────
app.post('/api/admin/grant-pro', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return }
    const decoded = await getAuth(getAdminApp()).verifyIdToken(authHeader.slice(7))
    if (decoded.email !== ADMIN_EMAIL) { res.status(403).json({ error: 'Forbidden' }); return }

    const { uid, days } = req.body as { uid: string; days: number }
    if (!uid || !days || days < 1) { res.status(400).json({ error: 'uid and days (≥1) required' }); return }

    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    const firestore = getFirestore(getAdminApp())
    await firestore.doc(`users/${uid}/subscription/main`).set({
      active: true,
      expiresAt,
      grantedByAdmin: true,
      grantedAt: new Date(),
    }, { merge: true })

    res.json({ ok: true, expiresAt: expiresAt.toISOString() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/admin/grant-pro error:', msg)
    res.status(500).json({ error: msg })
  }
})

// ── Admin: revoke Pro from a user ─────────────────────────────────────────────
app.post('/api/admin/revoke-pro', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ error: 'Unauthorized' }); return }
    const decoded = await getAuth(getAdminApp()).verifyIdToken(authHeader.slice(7))
    if (decoded.email !== ADMIN_EMAIL) { res.status(403).json({ error: 'Forbidden' }); return }

    const { uid } = req.body as { uid: string }
    if (!uid) { res.status(400).json({ error: 'uid required' }); return }

    const firestore = getFirestore(getAdminApp())
    await firestore.doc(`users/${uid}/subscription/main`).set({
      active: false,
      revokedByAdmin: true,
      revokedAt: new Date(),
    }, { merge: true })

    res.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/admin/revoke-pro error:', msg)
    res.status(500).json({ error: msg })
  }
})

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body as { password?: string }
  const adminKey = process.env.ADMIN_PASSWORD
  if (!adminKey || !password || password !== adminKey) {
    res.status(401).json({ error: 'Unauthorized' }); return
  }
  res.json({ ok: true })
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => console.log(`[Koru API] Running on port ${PORT}`))

// ── Daily push scheduler ─────────────────────────────────────────────────────
// Enabled only in the production environment so local development never sends
// real notifications. The scheduler is intentionally in-process to avoid a
// paid Cloud Functions dependency; the production web process must stay running.
const DAILY_PUSH_HOUR = 9
if (process.env.PUSH_SCHEDULE_ENABLED === 'true') {
  setInterval(() => { void maybeSendDailyPush() }, 60_000)
  void maybeSendDailyPush()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getReflectionPrompt(resultTitle?: string): string {
  const prompts = [
    'What is one thing you did this week that felt genuinely like you?',
    'What would you do differently if you knew you could not fail?',
    'Who made you feel most like yourself recently — and why?',
    'What have you been putting off that you actually want to do?',
    'What does "a good life" look like for you right now?',
    'What is something you believe that most people around you do not?',
    'When did you last feel fully present? What were you doing?',
    'What is one small thing you could do this week to invest in yourself?',
    'What part of your life feels most aligned with who you are becoming?',
    'If you stripped away what everyone expected of you, what would remain?',
  ]
  if (resultTitle) {
    return `As ${resultTitle}, here's your prompt for the week: ${prompts[Math.floor(Math.random() * prompts.length)]}`
  }
  return prompts[Math.floor(Math.random() * prompts.length)]
}

function getLagosDateParts(date = new Date()): { dateKey: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour),
  }
}

function getDailyPushPrompt(dateKey: string): string {
  const prompts = [
    'What is one small choice you can make today that feels true to you?',
    'What deserves more of your attention today — and what can wait?',
    'What are you learning about yourself in this season of life?',
    'What would make today feel quietly meaningful?',
    'Where could you give yourself more patience today?',
    'What is one thing you can let go of before the day begins?',
    'What part of your life is asking to be nurtured right now?',
  ]
  const seed = [...dateKey].reduce((total, character) => total + character.charCodeAt(0), 0)
  return prompts[seed % prompts.length]
}

async function maybeSendDailyPush(): Promise<void> {
  const { dateKey, hour } = getLagosDateParts()
  if (hour < DAILY_PUSH_HOUR) return

  try {
    const firestore = getFirestore(getAdminApp())
    const runRef = firestore.doc('system/dailyPush')
    const claimed = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(runRef)
      if (snapshot.data()?.lastAttemptedDate === dateKey) return false
      transaction.set(runRef, {
        lastAttemptedDate: dateKey,
        lastAttemptedAt: new Date(),
      }, { merge: true })
      return true
    })
    if (!claimed) return

    const profileSnapshot = await firestore
      .collectionGroup('profile')
      .where('pushNotificationsEnabled', '==', true)
      .get()

    const recipients = profileSnapshot.docs.flatMap((profileDoc) => {
      const data = profileDoc.data()
      const token = typeof data.pushToken === 'string' ? data.pushToken : ''
      return token ? [{ profileDoc, token }] : []
    })

    if (!recipients.length) {
      console.log(`[Koru] Daily push ${dateKey}: no opted-in devices`)
      return
    }

    const appUrl = process.env.APP_URL ?? 'https://koru.com.ng'
    const prompt = getDailyPushPrompt(dateKey)
    const messaging = getMessaging(getAdminApp())
    let sent = 0
    let removed = 0

    for (let start = 0; start < recipients.length; start += 500) {
      const batch = recipients.slice(start, start + 500)
      const result = await messaging.sendEachForMulticast({
        tokens: batch.map(({ token }) => token),
        notification: {
          title: 'A moment for yourself 🌿',
          body: prompt,
        },
        data: {
          url: '/home',
          date: dateKey,
        },
        webpush: {
          fcmOptions: { link: `${appUrl}/home` },
          notification: {
            icon: `${appUrl}/apple-touch-icon.png`,
            badge: `${appUrl}/favicon.svg`,
            tag: 'koru-daily-reflection',
          },
        },
      })

      sent += result.successCount
      for (let index = 0; index < result.responses.length; index += 1) {
        const response = result.responses[index]
        const code = response.error?.code
        if (response.success || !code?.includes('registration-token-not-registered') && !code?.includes('invalid-registration-token')) continue

        await batch[index].profileDoc.ref.update({
          pushToken: FieldValue.delete(),
          pushNotificationsEnabled: false,
          updatedAt: new Date(),
        })
        removed += 1
      }
    }

    console.log(`[Koru] Daily push ${dateKey}: sent=${sent}, removed=${removed}`)
  } catch (err) {
    console.error('[Koru] Daily push failed:', err instanceof Error ? err.message : err)
  }
}

function buildReminderEmail(name: string, prompt: string): string {
  const safeName = escapeHtml(name)
  const safePrompt = escapeHtml(prompt)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FBF9F5;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF9F5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="padding-bottom:32px;text-align:center">
          <div style="width:44px;height:44px;background:#1B3B2B;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:44px">🌿</div>
          <p style="margin:8px 0 0;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;color:#1B3B2B;font-size:16px;letter-spacing:-0.3px">Koru</p>
        </td></tr>
        <tr><td style="background:#fff;border-radius:20px;padding:36px 32px;border:1px solid rgba(162,191,166,0.3)">
          <p style="margin:0 0 8px;color:#A2BFA6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Weekly Reflection</p>
           <h1 style="margin:0 0 16px;color:#1B3B2B;font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:700;line-height:1.3">Hey ${safeName} 👋</h1>
          <p style="margin:0 0 24px;color:#4a6a58;font-size:15px;line-height:1.6">Here's your reflection prompt for this week:</p>
          <blockquote style="margin:0 0 28px;padding:20px 24px;background:rgba(162,191,166,0.12);border-left:3px solid #A2BFA6;border-radius:0 12px 12px 0">
             <p style="margin:0;color:#1B3B2B;font-size:16px;font-weight:600;line-height:1.5;font-style:italic">${safePrompt}</p>
          </blockquote>
          <p style="margin:0 0 28px;color:#7a9a86;font-size:14px;line-height:1.6">Take a few minutes in your journal, on a walk, or just sitting quietly. There are no right answers — only honest ones.</p>
          <a href="${process.env.APP_URL ?? 'https://getkoru.app'}/home" style="display:inline-block;padding:14px 28px;background:#1B3B2B;color:#fff;text-decoration:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px">Open Koru →</a>
        </td></tr>
        <tr><td style="padding:24px 0;text-align:center">
          <p style="margin:0;color:#A2BFA6;font-size:12px">You're receiving this because you opted in to weekly prompts.</p>
          <p style="margin:4px 0 0;color:#A2BFA6;font-size:12px">Manage preferences in your <a href="${process.env.APP_URL ?? 'https://getkoru.app'}/profile" style="color:#7a9a86">profile settings</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function buildWelcomeEmail(name: string): string {
  const safeName = escapeHtml(name)
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FBF9F5;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF9F5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="padding-bottom:32px;text-align:center">
          <div style="width:44px;height:44px;background:#1B3B2B;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:44px">🌿</div>
          <p style="margin:8px 0 0;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;color:#1B3B2B;font-size:16px">Koru</p>
        </td></tr>
        <tr><td style="background:#fff;border-radius:20px;padding:36px 32px;border:1px solid rgba(162,191,166,0.3)">
           <h1 style="margin:0 0 12px;color:#1B3B2B;font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:700">Welcome, ${safeName} 🌱</h1>
          <p style="margin:0 0 20px;color:#4a6a58;font-size:15px;line-height:1.65">We're glad you're here. Koru is your private space to think clearly, understand yourself better, and navigate what comes next.</p>
          <p style="margin:0 0 28px;color:#4a6a58;font-size:15px;line-height:1.65">Start with a quiz — they take less than 5 minutes and the results might just surprise you.</p>
          <a href="${process.env.APP_URL ?? 'https://getkoru.app'}/home" style="display:inline-block;padding:14px 28px;background:#1B3B2B;color:#fff;text-decoration:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px">Go to my dashboard →</a>
        </td></tr>
        <tr><td style="padding:24px 0;text-align:center">
          <p style="margin:0;color:#A2BFA6;font-size:12px">Questions? Reply to this email — we read every one.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
