import express from 'express'
import { Resend } from 'resend'
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

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
    const { to, name, resultTitle } = req.body as { to: string; name: string; resultTitle?: string }
    if (!to || !name) { res.status(400).json({ error: 'to and name are required' }); return }

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
    const { to, name } = req.body as { to: string; name: string }
    if (!to || !name) { res.status(400).json({ error: 'to and name are required' }); return }

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
    ? 'https://api.squad.africa'
    : 'https://sandbox-api-d.squadco.com'
}

app.post('/api/subscribe/initiate', async (req, res) => {
  try {
    const { uid } = req.body as { uid: string }
    if (!uid) { res.status(400).json({ error: 'uid required' }); return }
    // Generate a unique transaction ref — the inline widget uses this directly
    const ref = `koru_sub_${uid}_${Date.now()}`
    res.json({ ref })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/subscribe/initiate error:', msg)
    res.status(500).json({ error: msg })
  }
})

app.post('/api/subscribe/verify', async (req, res) => {
  try {
    const { ref } = req.body as { ref: string; uid: string }
    if (!ref) { res.status(400).json({ error: 'ref required' }); return }

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

// ── Admin: list all users ─────────────────────────────────────────────────────
app.get('/api/admin/users', async (req, res) => {
  try {
    const adminKey = process.env.ADMIN_PASSWORD
    if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
      res.status(401).json({ error: 'Unauthorized' }); return
    }

    const admin = getAdminApp()
    const auth = getAuth(admin)
    const firestore = getFirestore(admin)

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

function buildReminderEmail(name: string, prompt: string): string {
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
          <h1 style="margin:0 0 16px;color:#1B3B2B;font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:700;line-height:1.3">Hey ${name} 👋</h1>
          <p style="margin:0 0 24px;color:#4a6a58;font-size:15px;line-height:1.6">Here's your reflection prompt for this week:</p>
          <blockquote style="margin:0 0 28px;padding:20px 24px;background:rgba(162,191,166,0.12);border-left:3px solid #A2BFA6;border-radius:0 12px 12px 0">
            <p style="margin:0;color:#1B3B2B;font-size:16px;font-weight:600;line-height:1.5;font-style:italic">${prompt}</p>
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
          <h1 style="margin:0 0 12px;color:#1B3B2B;font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:700">Welcome, ${name} 🌱</h1>
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
