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
    const { user } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(user, { displayName })
    return { user }
  } catch (err: unknown) {
    return { error: formatAuthError(err) }
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User } | { error: string }> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
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
  lastActive?: string       // ISO date string YYYY-MM-DD
  emailOptIn?: boolean
  lastReminderSent?: string // ISO date string YYYY-MM-DD
}

export async function saveUserProfile(uid: string, data: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'profile', 'main'), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function updateUserProfile(uid: string, partial: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid, 'profile', 'main'), {
    ...partial,
    updatedAt: serverTimestamp(),
  })
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'profile', 'main'))
  if (!snap.exists()) return null
  return snap.data() as UserProfile
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
  await addDoc(collection(db, 'users', uid, 'quizResults'), {
    ...result,
    completedAt: serverTimestamp(),
  })
}

export async function getQuizResults(uid: string): Promise<SavedQuizResult[]> {
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

export async function sendReminderEmail(to: string, name: string, resultTitle?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/send-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, name, resultTitle }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/send-welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, name }),
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
  const snap = await getDoc(doc(db, 'users', uid, 'subscription', 'main'))
  if (!snap.exists()) return null
  return snap.data() as Subscription
}

export async function activateSubscription(uid: string, squadRef: string): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)
  await setDoc(doc(db, 'users', uid, 'subscription', 'main'), {
    active: true,
    expiresAt: Timestamp.fromDate(expiresAt),
    squadRef,
    activatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
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
  const dateKey = todayISO()
  const ref = doc(db, 'users', uid, 'checkins', dateKey)
  const existing = await getDoc(ref)
  if (existing.exists()) {
    await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
  } else {
    await setDoc(ref, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  }
}

export async function getTodayCheckIn(uid: string): Promise<CheckIn | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'checkins', todayISO()))
  if (!snap.exists()) return null
  return snap.data() as CheckIn
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
