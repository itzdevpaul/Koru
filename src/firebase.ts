import { initializeApp, getApps } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  getDocs,
  orderBy,
  serverTimestamp,
  Timestamp,
  addDoc,
  where,
  documentId,
  deleteDoc,
  deleteField,
  limit,
} from 'firebase/firestore'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
} from 'firebase/messaging'
import { sanitizeDisplayName, sanitizeEmail, sanitizeHttpUrl, sanitizeInviteCode, sanitizeText } from './utils/sanitize'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

if (import.meta.env.DEV) {
  const missing = Object.entries(firebaseConfig)
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length) console.warn('[Koru] Missing Firebase env vars:', missing)
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export type { User }
export { onAuthStateChanged, signOut, sendPasswordResetEmail }

// ── Auth helpers ────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  displayName: string,
): Promise<{ user: User } | { error: string }> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, sanitizeEmail(email), password)
    await updateProfile(user, { displayName: sanitizeDisplayName(displayName) })
    return { user }
  } catch (err: unknown) {
    return { error: formatAuthError(err) }
  }
}

function assertOwnUid(uid: string): void {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('You can only access your own Koru data.')
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User } | { error: string }> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, sanitizeEmail(email), password)
    return { user }
  } catch (err: unknown) {
    return { error: formatAuthError(err) }
  }
}

export async function signInWithGoogle(): Promise<{ user: User } | { error: string }> {
  try {
    const { user } = await signInWithPopup(auth, googleProvider)
    return { user }
  } catch (err: unknown) {
    return { error: formatAuthError(err) }
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth)
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email)
    return {}
  } catch (err: unknown) {
    return { error: formatAuthError(err) }
  }
}

function formatAuthError(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code
    switch (code) {
      case 'auth/email-already-in-use': return 'An account with this email already exists.'
      case 'auth/invalid-email': return 'Please enter a valid email address.'
      case 'auth/weak-password': return 'Password must be at least 6 characters.'
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Incorrect email or password.'
      case 'auth/too-many-requests': return 'Too many attempts. Please try again later.'
      case 'auth/popup-closed-by-user': return 'Sign-in cancelled.'
      default: return 'Something went wrong. Please try again.'
    }
  }
  return 'Something went wrong. Please try again.'
}

// ── User Profile ────────────────────────────────────────────────────────────

export interface UserProfile {
  displayName: string
  focusAreas: string[]
  ageRange: string
  onboardingComplete: boolean
  streak?: number
  lastActive?: string          // ISO date string YYYY-MM-DD
  emailOptIn?: boolean
  lastReminderSent?: string    // ISO date string YYYY-MM-DD
  pushNotificationsEnabled?: boolean
  pushToken?: string
  lastClarityCardSeen?: string // ISO month string YYYY-MM
  // Future self intentions
  currentIntention?: string    // text the user wrote to their future self
  intentionSetAt?: string      // ISO date YYYY-MM-DD when intention was written
  intentionSurfacedAt?: string // ISO date YYYY-MM-DD when it was shown back to them
  inviteCode?: string
  referralCount?: number
  referralRewardGranted?: boolean
  referredBy?: string
  referredAt?: string
}

export async function saveUserProfile(uid: string, data: UserProfile): Promise<void> {
  assertOwnUid(uid)
  await setDoc(doc(db, 'users', uid, 'profile', 'main'), {
    ...sanitizeProfile(data),
    updatedAt: serverTimestamp(),
  })
}

export async function updateUserProfile(uid: string, partial: Partial<UserProfile>): Promise<void> {
  assertOwnUid(uid)
  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
    ...sanitizeProfile(partial),
    updatedAt: serverTimestamp(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  assertOwnUid(uid)
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

function sanitizeProfile(data: Partial<UserProfile>): Partial<UserProfile> {
  const safe = { ...data }
  if ('displayName' in safe) safe.displayName = sanitizeDisplayName(safe.displayName)
  if ('focusAreas' in safe) safe.focusAreas = (safe.focusAreas ?? []).map(value => sanitizeText(value, 40)).slice(0, 10)
  if ('ageRange' in safe) safe.ageRange = sanitizeText(safe.ageRange, 40)
  if ('currentIntention' in safe) safe.currentIntention = sanitizeText(safe.currentIntention, 500)
  if ('inviteCode' in safe) safe.inviteCode = sanitizeInviteCode(safe.inviteCode)
  // Referral totals, rewards, and ownership links are server-managed.
  delete safe.referralCount
  delete safe.referralRewardGranted
  delete safe.referredBy
  delete safe.referredAt
  return safe
}

// ── Browser push notifications ──────────────────────────────────────────────

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return false
  }
  return isMessagingSupported().catch(() => false)
}

export async function enablePushNotifications(
  uid: string,
): Promise<{ ok: true } | { error: string }> {
  assertOwnUid(uid)
  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string
    if (!vapidKey) return { error: 'Push notifications are not configured yet.' }
    if (!(await isPushSupported())) return { error: 'This browser does not support push notifications.' }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return { error: 'Notification permission was not granted.' }

    const registration = await navigator.serviceWorker.register('/sw.js')
    const token = await getToken(getMessaging(app), {
      vapidKey,
      serviceWorkerRegistration: registration,
    })
    if (!token) return { error: 'Could not register this device for notifications.' }

    await updateUserProfile(uid, {
      pushNotificationsEnabled: true,
      pushToken: token,
    })
    return { ok: true }
  } catch (err) {
    console.error('[Koru] Push notification setup failed:', err)
    return { error: 'Could not enable notifications. Please try again.' }
  }
}

export async function disablePushNotifications(uid: string): Promise<void> {
  assertOwnUid(uid)
  try {
    if (await isPushSupported()) await deleteToken(getMessaging(app))
  } catch (err) {
    console.warn('[Koru] Could not remove the browser push token:', err)
  }

  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
    pushNotificationsEnabled: false,
    pushToken: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

// ── Streak tracking ─────────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

/** Call once on home page mount. Returns the current streak count. */
export async function updateStreak(uid: string): Promise<number> {
  assertOwnUid(uid)
  const profile = await getUserProfile(uid)
  if (!profile) return 1

  const today = todayISO()
  const yesterday = yesterdayISO()
  const lastActive = profile.lastActive ?? ''

  let newStreak: number
  if (lastActive === today) {
    // Already counted today
    return profile.streak ?? 1
  } else if (lastActive === yesterday) {
    newStreak = (profile.streak ?? 1) + 1
  } else {
    newStreak = 1
  }

  try {
    await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
      streak: newStreak,
      lastActive: today,
      updatedAt: serverTimestamp(),
    })
  } catch {
    // Fail silently — streak update is non-critical
  }
  return newStreak
}

// ── Quiz Results ────────────────────────────────────────────────────────────

export interface QuizResult {
  quizId: string
  quizTitle: string
  resultTypeId: string
  resultTitle: string
  resultEmoji: string
}

export interface SavedQuizResult extends QuizResult {
  id: string
  completedAt: Timestamp | null
}

export async function saveQuizResult(uid: string, result: QuizResult): Promise<void> {
  assertOwnUid(uid)
  await addDoc(collection(db, 'users', uid, 'quizResults'), {
    quizId: sanitizeText(result.quizId, 100),
    quizTitle: sanitizeText(result.quizTitle, 160),
    resultTypeId: sanitizeText(result.resultTypeId, 100),
    resultTitle: sanitizeText(result.resultTitle, 160),
    resultEmoji: sanitizeText(result.resultEmoji, 16),
    completedAt: serverTimestamp(),
  })
}

export async function getQuizResults(uid: string): Promise<SavedQuizResult[]> {
  assertOwnUid(uid)
  const q = query(
    collection(db, 'users', uid, 'quizResults'),
    orderBy('completedAt', 'desc'),
  )
  const snap = await withTimeout(getDocs(q), 10_000)
  return snap.docs.map(d => ({
    id: d.id,
    quizId: d.data().quizId ?? '',
    quizTitle: d.data().quizTitle ?? '',
    resultTypeId: d.data().resultTypeId ?? '',
    resultTitle: d.data().resultTitle ?? '',
    resultEmoji: d.data().resultEmoji ?? '',
    completedAt: d.data().completedAt ?? null,
  }))
}

// ── Resend API helpers ──────────────────────────────────────────────────────

const API_BASE = '/api'

async function authenticatedApi(path: string, body?: unknown): Promise<Response> {
  if (!auth.currentUser) throw new Error('You must be signed in.')
  const token = await auth.currentUser.getIdToken()
  return fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

export interface ReferralStatus {
  inviteCode: string
  referralCount: number
  referralRewardGranted: boolean
  rewardDays: number
}

export async function ensureInviteCode(): Promise<ReferralStatus> {
  const response = await authenticatedApi('/referrals/ensure-code')
  const data = await response.json() as Partial<ReferralStatus> & { error?: string }
  if (!response.ok || !data.inviteCode) throw new Error(data.error ?? 'Invite code unavailable.')
  return {
    inviteCode: sanitizeInviteCode(data.inviteCode),
    referralCount: Number(data.referralCount ?? 0),
    referralRewardGranted: Boolean(data.referralRewardGranted),
    rewardDays: Number(data.rewardDays ?? 7),
  }
}

export async function claimInviteCode(code: string): Promise<{ ok: true; rewardGranted: boolean } | { error: string }> {
  const response = await authenticatedApi('/referrals/claim', { inviteCode: sanitizeInviteCode(code) })
  const data = await response.json() as { ok?: true; rewardGranted?: boolean; error?: string }
  if (!response.ok) return { error: data.error ?? 'Invite code could not be applied.' }
  return { ok: true, rewardGranted: Boolean(data.rewardGranted) }
}

export async function sendReminderEmail(to: string, name: string, resultTitle?: string): Promise<boolean> {
  try {
    const res = await authenticatedApi('/send-reminder', {
      to: sanitizeEmail(to),
      name: sanitizeDisplayName(name),
      resultTitle: resultTitle ? sanitizeText(resultTitle, 160) : undefined,
    })
    return res.ok
  } catch {
    return false
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    await authenticatedApi('/send-welcome', {
      to: sanitizeEmail(to),
      name: sanitizeDisplayName(name),
    })
  } catch {
    // Non-critical — fire and forget
  }
}

// ── Subscription ────────────────────────────────────────────────────────────

export interface Subscription {
  active: boolean
  expiresAt: Timestamp | null
  squadRef: string
  activatedAt: Timestamp | null
}

export async function getSubscription(uid: string): Promise<Subscription | null> {
  assertOwnUid(uid)
  const snap = await getDoc(doc(db, 'users', uid, 'subscription', 'main'))
  if (!snap.exists()) return null
  return snap.data() as Subscription
}

export async function activateSubscription(uid: string, squadRef: string): Promise<void> {
  assertOwnUid(uid)
  const token = await auth.currentUser!.getIdToken()
  const response = await fetch('/api/subscribe/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ref: sanitizeText(squadRef, 120) }),
  })
  if (!response.ok) throw new Error('Subscription could not be activated.')
}

// ── One-time report unlocks ──────────────────────────────────────────────────

export async function getUnlockedReports(uid: string): Promise<string[]> {
  assertOwnUid(uid)
  const snap = await withTimeout(getDocs(collection(db, 'users', uid, 'unlocks')), 8_000)
  return snap.docs.map(d => d.id)
}

export async function initiateReportUnlock(quizId: string): Promise<{ checkout_url: string; ref: string }> {
  const response = await authenticatedApi('/unlock/initiate', { quizId: sanitizeText(quizId, 100) })
  const data = await response.json() as { checkout_url?: string; ref?: string; error?: string }
  if (!response.ok || !data.checkout_url) throw new Error(data.error ?? 'Could not start payment.')
  return { checkout_url: data.checkout_url, ref: data.ref ?? '' }
}

export async function activateReportUnlock(ref: string): Promise<void> {
  const response = await authenticatedApi('/unlock/activate', { ref: sanitizeText(ref, 120) })
  if (!response.ok) throw new Error('Report unlock could not be activated.')
}

// ── Pricing (discounts for referrals & anniversary) ──────────────────────────

export interface Pricing {
  baseAmount: number       // in naira
  discountPercent: number
  finalAmount: number      // in naira
  discountReason: string
  unlockAmount: number    // one-time report unlock price in naira
}

export async function getPricing(): Promise<Pricing> {
  const response = await authenticatedApi('/subscribe/price')
  const data = await response.json() as Partial<Pricing> & { error?: string }
  if (!response.ok) throw new Error(data.error ?? 'Could not fetch pricing.')
  return {
    baseAmount: Number(data.baseAmount ?? 2500),
    discountPercent: Number(data.discountPercent ?? 0),
    finalAmount: Number(data.finalAmount ?? 2500),
    discountReason: String(data.discountReason ?? ''),
    unlockAmount: Number(data.unlockAmount ?? 1000),
  }
}

// ── Notifications (referral alerts etc.) ─────────────────────────────────────

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string
  referralCount?: number
  rewardGranted?: boolean
  read: boolean
  createdAt: Timestamp | null
}

export async function getNotifications(uid: string): Promise<AppNotification[]> {
  assertOwnUid(uid)
  const q = query(
    collection(db, 'users', uid, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(20),
  )
  const snap = await withTimeout(getDocs(q), 10_000)
  return snap.docs.map(d => ({
    id: d.id,
    type: d.data().type ?? '',
    title: d.data().title ?? '',
    message: d.data().message ?? '',
    referralCount: d.data().referralCount,
    rewardGranted: d.data().rewardGranted,
    read: d.data().read ?? false,
    createdAt: d.data().createdAt ?? null,
  }))
}

export async function markNotificationRead(uid: string, id: string): Promise<void> {
  assertOwnUid(uid)
  await updateDoc(doc(db, 'users', uid, 'notifications', id), { read: true })
}

// ── Check-ins ────────────────────────────────────────────────────────────────

export type MoodKey = 'thriving' | 'good' | 'okay' | 'low' | 'rough'

export interface CheckIn {
  mood: MoodKey
  energy: number      // 1–5
  reflection: string  // free text response to the daily prompt
  prompt: string      // the prompt that was shown
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export const MOOD_OPTIONS: { key: MoodKey; emoji: string; label: string }[] = [
  { key: 'rough',    emoji: '😞', label: 'Rough'     },
  { key: 'low',      emoji: '😔', label: 'Low'       },
  { key: 'okay',     emoji: '😐', label: 'Okay'      },
  { key: 'good',     emoji: '😊', label: 'Good'      },
  { key: 'thriving', emoji: '🌟', label: 'Thriving'  },
]

const DAILY_PROMPTS = [
  "What felt most like you today?",
  "What's one thing you're carrying right now?",
  "What would make today feel like a win?",
  "What are you looking forward to?",
  "What's draining you most right now?",
  "What are you grateful for today?",
  "What's one thing you want to let go of?",
  "When did you last feel fully present?",
  "What would you do differently if you knew you couldn't fail?",
  "What part of your life feels most aligned with who you're becoming?",
]

export function getTodayPrompt(): string {
  const start = new Date(new Date().getFullYear(), 0, 0).getTime()
  const dayOfYear = Math.floor((Date.now() - start) / 86_400_000)
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length]
}

export async function saveCheckIn(
  uid: string,
  data: Pick<CheckIn, 'mood' | 'energy' | 'reflection' | 'prompt'>,
): Promise<void> {
  assertOwnUid(uid)
  const safeData = {
    ...data,
    reflection: sanitizeText(data.reflection, 1000),
    prompt: sanitizeText(data.prompt, 300),
  }
  const dateKey = todayISO()
  const ref = doc(db, 'users', uid, 'checkins', dateKey)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { ...safeData, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, { ...safeData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }
}

export async function getTodayCheckIn(uid: string): Promise<CheckIn | null> {
  assertOwnUid(uid)
  const snap = await getDoc(doc(db, 'users', uid, 'checkins', todayISO()))
  if (!snap.exists()) return null
  return snap.data() as CheckIn
}

// ── Future self intentions ───────────────────────────────────────────────────

export async function saveIntention(uid: string, text: string): Promise<void> {
  assertOwnUid(uid)
  const today = todayISO()
  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
    currentIntention: sanitizeText(text, 500),
    intentionSetAt: today,
    intentionSurfacedAt: deleteField(),
    updatedAt: serverTimestamp(),
  })
}

export async function markIntentionSurfaced(uid: string): Promise<void> {
  assertOwnUid(uid)
  const today = todayISO()
  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
    intentionSurfacedAt: today,
    updatedAt: serverTimestamp(),
  })
}

// ── Recent check-ins (for pattern mirror) ────────────────────────────────────

export async function getRecentCheckIns(
  uid: string,
  n = 5,
): Promise<Array<CheckIn & { date: string }>> {
  assertOwnUid(uid)
  const snap = await withTimeout(
    getDocs(
      query(
        collection(db, 'users', uid, 'checkins'),
        orderBy(documentId(), 'desc'),
        limit(n),
      ),
    ),
    8_000,
  )
  return snap.docs.map(d => ({ date: d.id, ...(d.data() as CheckIn) }))
}

// ── Clarity Card (month-end transformation) ──────────────────────────────────

const MOOD_SCORES: Record<MoodKey, number> = {
  rough: 1, low: 2, okay: 3, good: 4, thriving: 5,
}

function clarityLabel(combined: number): string {
  // combined = mood(1-5) + energy(1-5) = 2–10
  if (combined < 4)  return 'Overwhelmed & Guessing'
  if (combined < 6)  return 'Unsettled & Searching'
  if (combined < 7)  return 'Finding Your Footing'
  if (combined < 9)  return 'Grounded & Direct'
  return 'Thriving & Clear'
}

export interface ClarityMetrics {
  monthName: string
  moodDelta: number      // % change (can be negative)
  energyDelta: number    // % change
  moodStart: number      // avg mood first period (1-5)
  moodEnd: number        // avg mood recent period (1-5)
  energyStart: number
  energyEnd: number
  overallStart: string   // shift label
  overallEnd: string
  checkInCount: number
  hasEnoughData: boolean // requires ≥7 check-ins
}

export async function getClarityMetrics(uid: string): Promise<ClarityMetrics> {
  assertOwnUid(uid)
  const monthName = new Date().toLocaleString('en', { month: 'long' })

  // Query check-ins from last 30 days using doc-ID range (YYYY-MM-DD strings sort correctly)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startDate = thirtyDaysAgo.toISOString().split('T')[0]
  const endDate = todayISO()

  const q = query(
    collection(db, 'users', uid, 'checkins'),
    where(documentId(), '>=', startDate),
    where(documentId(), '<=', endDate),
  )
  const snap = await withTimeout(getDocs(q), 10_000)

  // Sort by doc ID (date) ascending
  const checkIns = snap.docs
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(d => d.data() as CheckIn)

  const checkInCount = checkIns.length
  const hasEnoughData = checkInCount >= 7

  if (!hasEnoughData) {
    return {
      monthName, moodDelta: 0, energyDelta: 0,
      moodStart: 0, moodEnd: 0, energyStart: 0, energyEnd: 0,
      overallStart: 'Unsettled & Searching', overallEnd: 'Finding Your Footing',
      checkInCount, hasEnoughData: false,
    }
  }

  const first = checkIns.slice(0, 7)
  const last  = checkIns.slice(-7)

  const avgMood   = (arr: CheckIn[]) => arr.reduce((s, c) => s + MOOD_SCORES[c.mood], 0) / arr.length
  const avgEnergy = (arr: CheckIn[]) => arr.reduce((s, c) => s + c.energy, 0) / arr.length
  const pct = (start: number, end: number) =>
    start > 0 ? Math.round(((end - start) / start) * 100) : 0

  const moodStart   = avgMood(first)
  const moodEnd     = avgMood(last)
  const energyStart = avgEnergy(first)
  const energyEnd   = avgEnergy(last)

  return {
    monthName,
    moodDelta:    pct(moodStart, moodEnd),
    energyDelta:  pct(energyStart, energyEnd),
    moodStart, moodEnd, energyStart, energyEnd,
    overallStart: clarityLabel(moodStart + energyStart),
    overallEnd:   clarityLabel(moodEnd + energyEnd),
    checkInCount,
    hasEnoughData: true,
  }
}

export async function markClarityCardSeen(uid: string): Promise<void> {
  assertOwnUid(uid)
  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  try {
    await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
      lastClarityCardSeen: month,
      updatedAt: serverTimestamp(),
    })
  } catch { /* non-critical */ }
}

// ── Mood-to-quiz match history ───────────────────────────────────────────────

export interface MoodMatch {
  feelingId: string
  quizId: string
  completedAt: Timestamp | null
}

export async function saveMoodMatch(uid: string, feelingId: string, quizId: string): Promise<void> {
  assertOwnUid(uid)
  await addDoc(collection(db, 'users', uid, 'moodMatches'), {
    feelingId: sanitizeText(feelingId, 80),
    quizId: sanitizeText(quizId, 100),
    completedAt: serverTimestamp(),
  })
}

export async function getRecentMoodMatches(uid: string, n = 20): Promise<MoodMatch[]> {
  assertOwnUid(uid)
  const snap = await withTimeout(
    getDocs(
      query(collection(db, 'users', uid, 'moodMatches'), orderBy('completedAt', 'desc'), limit(n)),
    ),
    8_000,
  )
  return snap.docs.map(d => d.data() as MoodMatch)
}

// ── Waitlist (legacy) ───────────────────────────────────────────────────────

export type WaitlistResult =
  | { success: true; duplicate: false; referralCode: string }
  | { success: true; duplicate: true }
  | { success: false; error: string }

export interface WaitlistEntry {
  id: string
  email: string
  createdAt: Timestamp | null
  source: string
  domain: string
  userAgent: string
  referralCode: string
  referredBy?: string
}

// ── Ads ──────────────────────────────────────────────────────────────────────

export interface Ad {
  id?: string
  imageBase64: string
  title: string
  description: string
  ctaText: string
  ctaLink: string
  active: boolean
  createdAt: Timestamp | null
}

export async function saveAd(ad: Omit<Ad, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, 'ads'), { ...ad, createdAt: serverTimestamp() })
  return ref.id
}

export async function getAllAds(): Promise<Ad[]> {
  const snap = await getDocs(query(collection(db, 'ads'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Ad))
}

export async function getActiveAd(): Promise<Ad | null> {
  const snap = await getDocs(
    query(collection(db, 'ads'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(1))
  )
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as Ad
}

export async function toggleAdActive(id: string, active: boolean): Promise<void> {
  await updateDoc(doc(db, 'ads', id), { active })
}

export async function deleteAd(id: string): Promise<void> {
  await deleteDoc(doc(db, 'ads', id))
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    promise.then(
      v => { clearTimeout(timer); resolve(v) },
      e => { clearTimeout(timer); reject(e) },
    )
  })
}

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const q = query(collection(db, 'waitlist'), orderBy('createdAt', 'desc'))
  const snapshot = await withTimeout(getDocs(q), 15_000)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    email: doc.data().email ?? '',
    createdAt: doc.data().createdAt ?? null,
    source: doc.data().source ?? '',
    domain: doc.data().domain ?? '',
    userAgent: doc.data().userAgent ?? '',
    referralCode: doc.data().referralCode ?? '',
    referredBy: doc.data().referredBy,
  }))
}
