import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSubscription } from '../context/SubscriptionContext'
import { logOut, getQuizResults, updateStreak, getUserProfile, updateUserProfile, sendReminderEmail, type SavedQuizResult } from '../firebase'
import { quizzes, insightCombinations } from '../data/quizzes'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Home() {
  const { user } = useAuth()
  const { isDark, toggleTheme, c } = useTheme()
  const { isPro, isExpired, daysLeft } = useSubscription()
  const navigate = useNavigate()

  const [signingOut, setSigningOut] = useState(false)
  const [results, setResults] = useState<SavedQuizResult[]>([])
  const [loadingResults, setLoadingResults] = useState(true)
  const [streak, setStreak] = useState(0)
  const [expiryDismissed, setExpiryDismissed] = useState(false)

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  useEffect(() => {
    if (!user) return
    getQuizResults(user.uid)
      .then(setResults)
      .finally(() => setLoadingResults(false))
    updateStreak(user.uid).then(setStreak)
  }, [user])

  // ── Weekly reminder: fire once on mount if opted in and 7+ days since last send ──
  useEffect(() => {
    if (!user?.email) return
    getUserProfile(user.uid).then(async (profile) => {
      if (!profile?.emailOptIn) return
      const today = new Date().toISOString().slice(0, 10)
      if (profile.lastReminderSent) {
        const last = new Date(profile.lastReminderSent)
        const diffDays = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)
        if (diffDays < 7) return
      }
      const topResult = (await getQuizResults(user.uid))[0]
      const ok = await sendReminderEmail(user.email!, profile.displayName || 'there', topResult?.resultTitle)
      if (ok) {
        await updateUserProfile(user.uid, { lastReminderSent: today })
      }
    })
  }, [user])

  async function handleSignOut() {
    setSigningOut(true)
    await logOut()
    navigate('/signin')
  }

  const completedIds = new Set(results.map(r => r.quizId))

  // ── Insight card ─────────────────────────────────────────────────────────
  const thinkingResult = results.find(r => r.quizId === 'thinking-style')
  const drivesResult = results.find(r => r.quizId === 'what-drives-you')
  const insight = thinkingResult && drivesResult
    ? insightCombinations[`${thinkingResult.resultTypeId}-${drivesResult.resultTypeId}`]
    : null

  return (
    <div className="min-h-screen" style={{ background: c.bg, transition: 'background 0.25s' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 h-16"
        style={{ background: c.bgGlass, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${c.navBorder}` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: '#1B3B2B' }}>
            🌿
          </div>
          <span className="text-base font-bold tracking-tight" style={{ fontFamily: F, color: c.forest }}>Koru</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          {streak > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: c.surface }}>
              <span style={{ fontSize: 13 }}>🔥</span>
              <span className="text-xs font-semibold" style={{ fontFamily: I, color: c.forest }}>{streak}</span>
            </div>
          )}

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: c.surface }}
            aria-label="Toggle dark mode"
          >
            <span style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</span>
          </button>

          {/* Profile link */}
          <Link
            to="/profile"
            className="flex items-center gap-2 py-1.5 px-3 rounded-2xl transition-opacity hover:opacity-80"
            style={{ background: c.surface, textDecoration: 'none' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: '#1B3B2B', color: '#fff', fontFamily: F }}
            >
              {(user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()}
            </div>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ fontFamily: I, color: c.forest, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {user?.displayName ?? user?.email}
            </span>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="py-1.5 px-3.5 rounded-2xl text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-50"
            style={{ fontFamily: F, background: c.surface, color: c.forest }}
          >
            {signingOut ? '…' : 'Sign out'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-12 pb-24">

        {/* ── Expiry warning banner ── */}
        {isPro && daysLeft !== null && daysLeft <= 3 && !expiryDismissed && (
          <div
            className="flex items-start gap-3 px-5 py-4 rounded-2xl mb-8"
            style={{ background: 'rgba(224,122,95,0.10)', border: '1.5px solid rgba(224,122,95,0.25)' }}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">⏰</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ fontFamily: F, color: '#c0513a' }}>
                Your Pro access expires in {daysLeft} day{daysLeft === 1 ? '' : 's'}
              </p>
              <p className="text-xs mt-0.5" style={{ fontFamily: I, color: '#d06a50' }}>
                Renew now to keep access to all 18+ quizzes without interruption.
              </p>
              <Link
                to="/upgrade"
                className="inline-block mt-2 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ fontFamily: F, color: '#E07A5F' }}
              >
                Renew Pro →
              </Link>
            </div>
            <button
              onClick={() => setExpiryDismissed(true)}
              className="flex-shrink-0 transition-opacity hover:opacity-50"
              style={{ color: '#d06a50', fontSize: 18, lineHeight: 1 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Subscription expired banner ── */}
        {isExpired && (
          <Link
            to="/upgrade"
            className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-8 transition-opacity hover:opacity-80"
            style={{ background: 'rgba(224,122,95,0.08)', border: '1.5px solid rgba(224,122,95,0.2)', textDecoration: 'none' }}
          >
            <span className="text-xl">⭐</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ fontFamily: F, color: '#c0513a' }}>Your Pro subscription has ended</p>
              <p className="text-xs" style={{ fontFamily: I, color: '#d06a50' }}>Resubscribe to restore access to all 18+ quizzes</p>
            </div>
            <span className="text-xs font-bold flex-shrink-0" style={{ fontFamily: F, color: '#E07A5F' }}>Renew →</span>
          </Link>
        )}

        {/* Greeting */}
        <div className="mb-10">
          {streak > 1 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3" style={{ background: c.surface }}>
              <span style={{ fontSize: 14 }}>🔥</span>
              <span className="text-xs font-semibold" style={{ fontFamily: I, color: c.forest }}>
                {streak} day streak — keep it up!
              </span>
            </div>
          )}
          <p className="text-sm font-medium mb-2" style={{ fontFamily: I, color: c.sage }}>Good to see you 👋</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ fontFamily: F, color: c.forest }}>
            Hey, {firstName}.
          </h1>
          <p className="text-base mt-3 max-w-md" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
            Koru is your space to think clearly, know yourself better, and navigate what comes next.
          </p>
        </div>

        {/* ── Insight card ── */}
        {insight && (
          <section className="mb-10">
            <div
              className="rounded-3xl p-6 sm:p-8"
              style={{
                background: `linear-gradient(135deg, rgba(27,59,43,0.07) 0%, rgba(162,191,166,0.12) 100%)`,
                border: `1px solid ${c.cardBorder}`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ fontFamily: I, color: c.sage }}>
                Your profile insight ✦
              </p>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: F, color: c.forest }}>
                {insight.headline}
              </h3>
              <p className="text-sm leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                {insight.body}
              </p>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: c.surface, color: c.body, fontFamily: I }}>
                  {thinkingResult.resultEmoji} {thinkingResult.resultTitle}
                </span>
                <span style={{ color: c.muted, fontSize: 12 }}>+</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: c.surface, color: c.body, fontFamily: I }}>
                  {drivesResult.resultEmoji} {drivesResult.resultTitle}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* ── Quizzes ── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: F, color: c.forest }}>Discover yourself</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.filter(q => !q.mature).map(quiz => {
              const done = completedIds.has(quiz.id)
              const myResult = results.find(r => r.quizId === quiz.id)
              return (
                <Link
                  key={quiz.id}
                  to={`/quiz/${quiz.id}`}
                  className="group rounded-3xl p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    background: c.card,
                    border: `1px solid ${c.cardBorder}`,
                    boxShadow: c.shadow,
                    textDecoration: 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: c.surface }}
                    >
                      {quiz.emoji}
                    </div>
                    {done ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(162,191,166,0.25)', color: '#3a6b4a', fontFamily: I }}>
                        ✓ Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: c.surface, color: c.muted, fontFamily: I }}>
                        ~{quiz.estimatedMinutes} min
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-base mb-1" style={{ fontFamily: F, color: c.forest }}>{quiz.title}</p>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                      {done && myResult ? `Your result: ${myResult.resultEmoji} ${myResult.resultTitle}` : quiz.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <span className="text-xs font-semibold" style={{ fontFamily: F, color: c.forest }}>{done ? 'Retake' : 'Take quiz'}</span>
                    <span style={{ color: c.forest, fontSize: 12 }} aria-hidden="true">→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── 18+ Quizzes ── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: F, color: c.forest }}>Sex &amp; intimacy</h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(224,122,95,0.15)', color: '#E07A5F', fontFamily: I, letterSpacing: '0.05em' }}
            >
              18+
            </span>
          </div>

          {/* Pro upsell banner for free users */}
          {!isPro && (
            <Link
              to="/upgrade"
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-4 transition-opacity hover:opacity-80"
              style={{ background: 'rgba(224,122,95,0.10)', border: '1.5px solid rgba(224,122,95,0.25)', textDecoration: 'none' }}
            >
              <span className="text-xl">⭐</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ fontFamily: F, color: '#c0513a' }}>Unlock with Koru Pro</p>
                <p className="text-xs" style={{ fontFamily: I, color: '#d06a50' }}>₦2,500/month — full access to all 18+ quizzes</p>
              </div>
              <span className="text-xs font-bold flex-shrink-0" style={{ fontFamily: F, color: '#E07A5F' }}>Upgrade →</span>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.filter(q => q.mature).map(quiz => {
              const done = completedIds.has(quiz.id)
              const myResult = results.find(r => r.quizId === quiz.id)
              const locked = !isPro

              const cardContent = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: c.surface, filter: locked ? 'grayscale(0.4)' : 'none' }}
                    >
                      {locked ? '🔒' : quiz.emoji}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(224,122,95,0.15)', color: '#E07A5F', fontFamily: I }}>
                        18+
                      </span>
                      {locked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(224,122,95,0.15)', color: '#E07A5F', fontFamily: I }}>
                          Pro
                        </span>
                      ) : done ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(162,191,166,0.25)', color: '#3a6b4a', fontFamily: I }}>
                          ✓ Done
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.surface, color: c.muted, fontFamily: I }}>
                          ~{quiz.estimatedMinutes} min
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-bold text-base mb-1" style={{ fontFamily: F, color: locked ? c.muted : c.forest }}>{quiz.title}</p>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                      {locked
                        ? 'Upgrade to Koru Pro to unlock this quiz.'
                        : done && myResult ? `Your result: ${myResult.resultEmoji} ${myResult.resultTitle}` : quiz.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <span className="text-xs font-semibold" style={{ fontFamily: F, color: locked ? '#E07A5F' : c.forest }}>
                      {locked ? 'Upgrade to unlock →' : done ? 'Retake' : 'Take quiz'}
                    </span>
                    {!locked && <span style={{ color: c.forest, fontSize: 12 }} aria-hidden="true">→</span>}
                  </div>
                </>
              )

              return locked ? (
                <Link
                  key={quiz.id}
                  to="/upgrade"
                  className="rounded-3xl p-6 flex flex-col gap-3"
                  style={{
                    background: c.card,
                    border: `1.5px solid rgba(224,122,95,0.2)`,
                    boxShadow: c.shadow,
                    textDecoration: 'none',
                    opacity: 0.85,
                  }}
                >
                  {cardContent}
                </Link>
              ) : (
                <Link
                  key={quiz.id}
                  to={`/quiz/${quiz.id}`}
                  className="group rounded-3xl p-6 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    background: c.card,
                    border: `1px solid ${c.cardBorder}`,
                    boxShadow: c.shadow,
                    textDecoration: 'none',
                  }}
                >
                  {cardContent}
                </Link>
              )
            })}
          </div>
        </section>

        {/* ── Your Results ── */}
        {!loadingResults && results.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: F, color: c.forest }}>Your results</h2>
              <Link to="/profile" className="text-xs font-semibold transition-opacity hover:opacity-60" style={{ fontFamily: F, color: c.muted }}>
                View all →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {results.slice(0, 5).map(result => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-4 rounded-2xl"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: c.surface }}>
                    {result.resultEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ fontFamily: F, color: c.forest }}>{result.resultTitle}</p>
                    <p className="text-xs truncate" style={{ fontFamily: I, color: c.muted }}>{result.quizTitle}</p>
                  </div>
                  <Link
                    to={`/quiz/${result.quizId}`}
                    className="text-xs font-semibold flex-shrink-0 transition-opacity hover:opacity-60"
                    style={{ fontFamily: F, color: c.forest }}
                  >
                    Retake →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Journal teaser ── */}
        <div
          className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5"
          style={{ background: `linear-gradient(135deg, ${c.surface} 0%, rgba(162,191,166,0.1) 100%)`, border: `1px solid ${c.cardBorder}` }}
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: c.surface }}>
            🗒️
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg mb-1" style={{ fontFamily: F, color: c.forest }}>Journal — coming soon</p>
            <p className="text-sm" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
              Your private space for daily reflection, guided by your quiz results.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
