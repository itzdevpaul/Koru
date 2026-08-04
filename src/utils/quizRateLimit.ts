// Quiz rate limiting for free users

const KEY        = 'koru-quiz-window'
const WINDOW_MS  = 12 * 60 * 60 * 1000   // 12 hours
export const FREE_QUIZ_LIMIT = 3          // quizzes per window

interface Window_ {
  count: number
  start: number
}

function getWindow(): Window_ {
  const now = Date.now()
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const w = JSON.parse(raw) as Window_
      if (now - w.start < WINDOW_MS) return w
    }
  } catch { /* ignore */ }
  return { count: 0, start: now }
}

/** Returns how many quizzes have been completed in the current 12-h window. */
export function getCompletedThisWindow(): number {
  return getWindow().count
}

/** Returns ms remaining until the window resets. */
export function msUntilReset(): number {
  const w = getWindow()
  return Math.max(0, WINDOW_MS - (Date.now() - w.start))
}

/** Formats remaining time as "Xh Ym". */
export function formatTimeRemaining(): string {
  const ms = msUntilReset()
  const h  = Math.floor(ms / (1000 * 60 * 60))
  const m  = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Returns true if the user can start (and complete) another quiz. */
export function canTakeQuiz(): boolean {
  return getWindow().count < FREE_QUIZ_LIMIT
}

/** Call when a quiz is successfully completed (result phase entered). */
export function recordQuizCompletion(): void {
  const w = getWindow()
  localStorage.setItem(KEY, JSON.stringify({ count: w.count + 1, start: w.start }))
}
