import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSubscription } from '../context/SubscriptionContext'
import { logOut, getQuizResults, updateStreak, getUserProfile, updateUserProfile, sendReminderEmail, sendWeeklyWrapUp, saveCheckIn, getTodayCheckIn, getTodayPrompt, MOOD_OPTIONS, getActiveAd, saveIntention, markIntentionSurfaced, getRecentCheckIns, getRecentMoodMatches, type SavedQuizResult, type CheckIn, type MoodKey, type Ad, type UserProfile, type MoodMatch } from '../firebase'
import { generateCheckInShareImage, shareOrDownloadImage } from '../utils/shareImage'
import { quizzes, insightCombinations } from '../data/quizzes'
import AdModal from '../components/AdModal'
import PatternMirrorCard from '../components/PatternMirrorCard'
import MoodQuizMatcher from '../components/MoodQuizMatcher'
import FutureSelfCard from '../components/FutureSelfCard'
import { analyzePatterns, getSeenPatternIds, markPatternsSeen } from '../utils/patternMirror'
import KoruLogo from '../components/KoruLogo'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Home() {
  const { user } = useAuth()
  const { isDark, toggleTheme, c } = useTheme()
  const { isPro, isExpired, daysLeft, loading: subLoading } = useSubscription()
  const navigate = useNavigate()

  const [signingOut, setSigningOut] = useState(false)
  const [results, setResults] = useState<SavedQuizResult[]>([])
  const [loadingResults, setLoadingResults] = useState(true)
  const [streak, setStreak] = useState(0)
  const [expiryDismissed, setExpiryDismissed] = useState(false)
  const [showStreakPrompt, setShowStreakPrompt] = useState(false)

  // ── Ad modal ──
  const [activeAd, setActiveAd] = useState<Ad | null>(null)
  const [adDismissed, setAdDismissed] = useState(() => !!sessionStorage.getItem('koru-ad-seen'))

  // ── Clarity Card trigger ──
  const currentMonth = new Date().toISOString().slice(0, 7)
  const dismissedMonth = typeof window !== 'undefined' ? localStorage.getItem('koru-clarity-dismissed') : null
  const accountAgeMs = user?.metadata?.creationTime ? Date.now() - new Date(user.metadata.creationTime).getTime() : 0
  const accountAge30Plus = accountAgeMs >= 30 * 24 * 60 * 60 * 1000
  const [clarityDismissed, setClarityDismissed] = useState(dismissedMonth === currentMonth)
  const showClarityBanner = accountAge30Plus && !clarityDismissed

  // ── Check-in state ──
  const todayPrompt = getTodayPrompt()
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null)
  const [loadingCheckIn, setLoadingCheckIn] = useState(true)
  const [editingCheckIn, setEditingCheckIn] = useState(false)
  const [checkInMood, setCheckInMood] = useState<MoodKey | null>(null)
  const [checkInEnergy, setCheckInEnergy] = useState(0)
  const [checkInReflection, setCheckInReflection] = useState('')
  const [checkInSaving, setCheckInSaving] = useState(false)
  const [checkInSharing, setCheckInSharing] = useState(false)
  const [checkInShareMsg, setCheckInShareMsg] = useState('')
  const [showFriendNudge, setShowFriendNudge] = useState(false)
  const [nudgeCopied, setNudgeCopied] = useState(false)

  // ── Future self / intentions ──
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showFutureSelf, setShowFutureSelf] = useState(false)
  const [futureSelfDismissed, setFutureSelfDismissed] = useState(false)
  const [showIntentionPrompt, setShowIntentionPrompt] = useState(false)
  const [intentionPromptDismissed, setIntentionPromptDismissed] = useState(
    () => !!sessionStorage.getItem('koru-intention-dismissed'),
  )

  // ── Pattern mirror ──
  const [patternCheckIns, setPatternCheckIns] = useState<Array<CheckIn & { date: string }>>([])

  // ── Mood-to-quiz match history ──
  const [moodMatches, setMoodMatches] = useState<MoodMatch[]>([])

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  useEffect(() => {
    if (!user) return
    getQuizResults(user.uid)
      .then(setResults)
      .finally(() => setLoadingResults(false))
    updateStreak(user.uid).then(setStreak)
    getTodayCheckIn(user.uid)
      .then(setTodayCheckIn)
      .finally(() => setLoadingCheckIn(false))
    // Fetch ad for free users only, once per session
    if (!isPro && !adDismissed) {
      getActiveAd().then(ad => { if (ad) setActiveAd(ad) }).catch(() => {})
    }
    // Load profile for future self / intention logic
    getUserProfile(user.uid).then(p => {
      setProfile(p)
      if (p?.currentIntention && p.intentionSetAt && !p.intentionSurfacedAt) {
        const daysSince = (Date.now() - new Date(p.intentionSetAt).getTime()) / 86_400_000
        if (daysSince >= 90) setShowFutureSelf(true)
      }
    }).catch(() => {})
    // Load recent check-ins for pattern mirror (14 for trend detection)
    getRecentCheckIns(user.uid, 14).then(setPatternCheckIns).catch(() => {})
    // Load mood match history for the quiz matcher
    getRecentMoodMatches(user.uid, 30).then(setMoodMatches).catch(() => {})
  }, [user])

  // ── Weekly reminder: fire once on mount if opted in and 7+ days since last send ──
  // On Sundays, send the weekly wrap-up instead of the regular reminder.
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
      const dayOfWeek = new Date().getDay() // 0 = Sunday
      if (dayOfWeek === 0) {
        // Sunday — send the weekly wrap-up email
        const ok = await sendWeeklyWrapUp(user.email!, profile.displayName || 'there')
        if (ok) {
          await updateUserProfile(user.uid, { lastReminderSent: today })
        }
      } else {
        // Other days — send the regular reflection prompt
        const topResult = (await getQuizResults(user.uid))[0]
        const ok = await sendReminderEmail(user.email!, profile.displayName || 'there', topResult?.resultTitle)
        if (ok) {
          await updateUserProfile(user.uid, { lastReminderSent: today })
        }
      }
    })
  }, [user])

  async function handleSignOut() {
    setSigningOut(true)
    await logOut()
    navigate('/signin')
  }

  function isMeaningfulCheckIn(mood: MoodKey, energy: number, reflection: string): boolean {
    return (
      mood === 'thriving' || mood === 'good' ||
      energy >= 4 ||
      reflection.trim().length >= 20
    )
  }

  async function handleSaveCheckIn() {
    if (!user || !checkInMood || checkInEnergy === 0) return
    const isNew = !todayCheckIn  // distinguish first save vs edit
    setCheckInSaving(true)
    await saveCheckIn(user.uid, {
      mood: checkInMood,
      energy: checkInEnergy,
      reflection: checkInReflection.trim(),
      prompt: todayPrompt,
    })
    setTodayCheckIn({ mood: checkInMood, energy: checkInEnergy, reflection: checkInReflection.trim(), prompt: todayPrompt })
    setEditingCheckIn(false)
    setCheckInSaving(false)

    // Show friend nudge only on first save of a meaningful session (once per day)
    const dismissed = sessionStorage.getItem('koru-friend-nudge-dismissed')
    if (isNew && !dismissed && isMeaningfulCheckIn(checkInMood, checkInEnergy, checkInReflection.trim())) {
      setShowFriendNudge(true)
    }

    // Show intention prompt after first meaningful save if no active intention
    if (isNew && isMeaningfulCheckIn(checkInMood, checkInEnergy, checkInReflection.trim())) {
      const intentDism = sessionStorage.getItem('koru-intention-dismissed')
      if (!intentDism && (!profile?.currentIntention || !!profile?.intentionSurfacedAt)) {
        setShowIntentionPrompt(true)
      }
    }
  }

  function handleDismissNudge() {
    setShowFriendNudge(false)
    sessionStorage.setItem('koru-friend-nudge-dismissed', '1')
  }

  async function handleNudgeShare() {
    const link = `https://koru.com.ng/signup?ref=${user?.uid?.slice(0, 8) ?? ''}`
    const text = `I've been using Koru to check in with myself — you should try it. ${link}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Join me on Koru', text }); return } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(link)
      setNudgeCopied(true)
      setTimeout(() => setNudgeCopied(false), 2500)
    } catch { /* ignore */ }
  }

  async function handleNudgeCopy() {
    const link = `https://koru.com.ng/signup?ref=${user?.uid?.slice(0, 8) ?? ''}`
    try {
      await navigator.clipboard.writeText(link)
      setNudgeCopied(true)
      setTimeout(() => setNudgeCopied(false), 2500)
    } catch { /* ignore */ }
  }

  function startEditCheckIn(existing?: CheckIn) {
    setCheckInMood(existing?.mood ?? null)
    setCheckInEnergy(existing?.energy ?? 0)
    setCheckInReflection(existing?.reflection ?? '')
    setEditingCheckIn(true)
  }

  async function handleShareCheckIn(checkIn: CheckIn) {
    setCheckInSharing(true)
    setCheckInShareMsg('')
    try {
      const moodOpt = MOOD_OPTIONS.find(m => m.key === checkIn.mood)
      const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', month: 'long', day: 'numeric' })
      const handle = user?.displayName || user?.email?.split('@')[0] || 'you'
      const blob = await generateCheckInShareImage({
        moodKey: checkIn.mood,
        moodEmoji: moodOpt?.emoji ?? '🙂',
        moodLabel: moodOpt?.label ?? checkIn.mood,
        energy: checkIn.energy,
        reflection: checkIn.reflection,
        date: today,
        streak,
        recentCheckIns: patternCheckIns.map(c => ({ date: c.date, moodKey: c.mood, energy: c.energy })),
        handle,
      })
      const outcome = await shareOrDownloadImage(blob, 'koru-checkin.png', 'My Koru daily check-in')
      if (outcome === 'downloaded') setCheckInShareMsg('Image saved!')
      else if (outcome === 'error') setCheckInShareMsg('Unable to save — try again.')
    } catch {
      setCheckInShareMsg('Unable to generate image.')
    } finally {
      setCheckInSharing(false)
      setTimeout(() => setCheckInShareMsg(''), 3500)
    }
  }

  const completedIds = new Set(results.map(r => r.quizId))

  // ── Insight card ─────────────────────────────────────────────────────────
  const thinkingResult = results.find(r => r.quizId === 'thinking-style')
  const drivesResult = results.find(r => r.quizId === 'what-drives-you')
  const insight = thinkingResult && drivesResult
    ? insightCombinations[`${thinkingResult.resultTypeId}-${drivesResult.resultTypeId}`]
    : null

  function handleAdDismiss() {
    sessionStorage.setItem('koru-ad-seen', '1')
    setAdDismissed(true)
  }

  async function handleSaveIntention(text: string) {
    if (!user) return
    await saveIntention(user.uid, text)
    setProfile(prev => prev
      ? { ...prev, currentIntention: text, intentionSetAt: new Date().toISOString().slice(0, 10), intentionSurfacedAt: undefined }
      : prev,
    )
    setShowIntentionPrompt(false)
    setShowFutureSelf(false)
    sessionStorage.setItem('koru-intention-dismissed', '1')
    setIntentionPromptDismissed(true)
  }

  async function handleMarkSurfaced() {
    if (!user) return
    await markIntentionSurfaced(user.uid).catch(() => {})
    setProfile(prev => prev
      ? { ...prev, intentionSurfacedAt: new Date().toISOString().slice(0, 10) }
      : prev,
    )
  }

  function formatIntentionAge(dateStr: string): string {
    const days = (Date.now() - new Date(dateStr).getTime()) / 86_400_000
    const months = Math.round(days / 30)
    return months >= 2 ? `${months} months ago` : 'about 3 months ago'
  }

  const allPatternObs = analyzePatterns(patternCheckIns)
  const patternObservations = allPatternObs.filter(o => !getSeenPatternIds().includes(o.id))

  // ── Streak upgrade prompt: triggers at 3-day streak for free users (after sub state loads) ──
  useEffect(() => {
    if (streak >= 3 && !isPro && !subLoading && !sessionStorage.getItem('koru-streak-prompt-seen')) {
      setShowStreakPrompt(true)
    }
  }, [streak, isPro, subLoading])

  return (
    <div className="min-h-screen" style={{ background: c.bg, transition: 'background 0.25s' }}>
      {/* Ad modal — free users only, once per session */}
      {activeAd && !adDismissed && !isPro && (
        <AdModal ad={activeAd} onDismiss={handleAdDismiss} />
      )}
      {/* Nav — centered wordmark with check-in action (left) and calm utility (right) */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 h-14 sm:h-16 relative"
        style={{ background: c.bgGlass, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${c.navBorder}` }}
      >
        {/* Left: thoughtful check-in / create action */}
        <button
          onClick={() => document.getElementById('daily-check-in')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-2xl transition-all hover:opacity-80 active:scale-95"
          style={{ background: c.surface }}
          aria-label="Check in"
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M11.5 2.5a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 1 0-3Z" stroke={c.forest} strokeWidth="1.3" />
            <path d="M4.5 9a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" stroke={c.forest} strokeWidth="1.3" />
            <path d="M5.5 9.5l4-4" stroke={c.forest} strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span className="text-xs font-semibold hidden sm:block" style={{ fontFamily: F, color: c.forest }}>Check in</span>
        </button>

        {/* Center: Koru wordmark */}
        <span className="absolute left-1/2 -translate-x-1/2 pointer-events-none">
          <KoruLogo size={22} tone={isDark ? 'paper' : 'ink'} wordmarkSize={18} />
        </span>

        {/* Right: calmer utility */}
        <div className="flex items-center gap-2">
          {/* Streak badge (desktop only) */}
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
            className="flex items-center gap-2 py-1.5 px-2.5 sm:px-3 rounded-2xl transition-opacity hover:opacity-80"
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

        {/* ── Future self check-in ── */}
        {showFutureSelf && !futureSelfDismissed && profile?.currentIntention && (
          <FutureSelfCard
            mode="surface"
            intention={profile.currentIntention}
            intentionDate={profile.intentionSetAt ? formatIntentionAge(profile.intentionSetAt) : 'a while ago'}
            results={results}
            streak={streak}
            onDismiss={() => setFutureSelfDismissed(true)}
            onSaveNew={handleSaveIntention}
            onMarkSurfaced={handleMarkSurfaced}
          />
        )}

        {/* ── Clarity Card banner (30-day milestone) ── */}
        {showClarityBanner && (
          <div
            className="flex items-start gap-4 px-5 py-4 rounded-2xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(27,59,43,0.07) 0%, rgba(162,191,166,0.12) 100%)',
              border: `1.5px solid rgba(162,191,166,0.4)`,
            }}
          >
            <div className="text-2xl flex-shrink-0 mt-0.5">🌿</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold mb-0.5" style={{ fontFamily: F, color: c.forest }}>
                Your 30-Day Snapshot is ready
              </p>
              <p className="text-xs leading-relaxed mb-3" style={{ fontFamily: I, color: c.body }}>
                See how your mood, energy, and clarity have shifted since you started — and share it.
              </p>
              <Link
                to="/clarity-card"
                className="inline-block text-xs font-bold py-2 px-4 rounded-xl text-white transition-opacity hover:opacity-80"
                style={{ fontFamily: F, background: '#1B3B2B' }}
              >
                View my Clarity Card →
              </Link>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('koru-clarity-dismissed', currentMonth)
                setClarityDismissed(true)
              }}
              className="flex-shrink-0 transition-opacity hover:opacity-40 mt-0.5"
              style={{ color: c.muted, fontSize: 18, lineHeight: 1 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* ── Daily check-in ── */}
        {!loadingCheckIn && (
          <section id="daily-check-in" className="mb-10">
            {todayCheckIn && !editingCheckIn ? (
              // ── Completed state ──
              <div
                className="rounded-3xl p-6"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: I, color: c.sage }}>
                    Today's check-in ✓
                  </p>
                  <button
                    onClick={() => startEditCheckIn(todayCheckIn)}
                    className="text-xs font-semibold transition-opacity hover:opacity-60"
                    style={{ fontFamily: I, color: c.muted }}
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{MOOD_OPTIONS.find(m => m.key === todayCheckIn.mood)?.emoji}</span>
                    <span className="text-sm font-semibold" style={{ fontFamily: F, color: c.forest }}>
                      {MOOD_OPTIONS.find(m => m.key === todayCheckIn.mood)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(n => (
                      <div
                        key={n}
                        className="w-2 h-2 rounded-full"
                        style={{ background: n <= todayCheckIn.energy ? '#1B3B2B' : 'rgba(27,59,43,0.15)' }}
                      />
                    ))}
                    <span className="text-xs ml-1" style={{ fontFamily: I, color: c.muted }}>energy</span>
                  </div>
                </div>
                {todayCheckIn.reflection && (
                  <p className="text-sm mt-3 leading-relaxed line-clamp-2" style={{ fontFamily: I, color: c.body }}>
                    "{todayCheckIn.reflection}"
                  </p>
                )}
                {/* Share button */}
                <button
                  onClick={() => handleShareCheckIn(todayCheckIn)}
                  disabled={checkInSharing}
                  className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-60 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: I, color: c.muted }}
                >
                  {checkInSharing ? (
                    <>
                      <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                      </svg>
                      Creating image…
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                        <path d="M10.5 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4.5 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 8.5l3-1.5M9 9l-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      Share check-in
                    </>
                  )}
                </button>
                {checkInShareMsg && (
                  <p className="text-xs mt-1" style={{ fontFamily: I, color: c.muted }}>{checkInShareMsg}</p>
                )}
              </div>
            ) : (
              // ── Form state ──
              <div
                className="rounded-3xl p-6"
                style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
              >
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ fontFamily: I, color: c.sage }}>
                  Daily check-in
                </p>

                {/* Mood */}
                <div className="mb-5">
                  <p className="text-sm font-semibold mb-3" style={{ fontFamily: F, color: c.forest }}>How are you feeling?</p>
                  <div className="flex gap-2 flex-wrap">
                    {MOOD_OPTIONS.map(m => (
                      <button
                        key={m.key}
                        onClick={() => setCheckInMood(m.key)}
                        className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all duration-150"
                        style={{
                          background: checkInMood === m.key ? '#1B3B2B' : c.surface,
                          border: `1.5px solid ${checkInMood === m.key ? '#1B3B2B' : 'transparent'}`,
                        }}
                      >
                        <span className="text-xl">{m.emoji}</span>
                        <span className="text-[10px] font-semibold" style={{ fontFamily: I, color: checkInMood === m.key ? '#fff' : c.muted }}>
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy */}
                <div className="mb-5">
                  <p className="text-sm font-semibold mb-3" style={{ fontFamily: F, color: c.forest }}>Energy level</p>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setCheckInEnergy(n)}
                        className="flex flex-col items-center gap-1.5 transition-all duration-150"
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                          style={{
                            background: n <= checkInEnergy ? '#1B3B2B' : c.surface,
                            color: n <= checkInEnergy ? '#fff' : c.muted,
                            fontFamily: I,
                          }}
                        >
                          {n}
                        </div>
                      </button>
                    ))}
                    <span className="text-xs ml-1" style={{ fontFamily: I, color: c.muted }}>
                      {checkInEnergy === 0 ? 'tap to rate' : checkInEnergy <= 2 ? 'drained' : checkInEnergy === 3 ? 'moderate' : checkInEnergy === 4 ? 'energised' : 'fully charged'}
                    </span>
                  </div>
                </div>

                {/* Reflection */}
                <div className="mb-5">
                  <p className="text-sm font-semibold mb-1" style={{ fontFamily: F, color: c.forest }}>{todayPrompt}</p>
                  <textarea
                    value={checkInReflection}
                    onChange={e => setCheckInReflection(e.target.value)}
                    placeholder="Write anything — or leave it blank…"
                    maxLength={1000}
                    rows={3}
                    className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none transition-all"
                    style={{
                      background: c.surface,
                      border: `1.5px solid ${c.cardBorder}`,
                      fontFamily: I,
                      color: c.forest,
                      lineHeight: 1.65,
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveCheckIn}
                    disabled={!checkInMood || checkInEnergy === 0 || checkInSaving}
                    className="py-2.5 px-5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                    style={{ fontFamily: F, background: '#1B3B2B' }}
                  >
                    {checkInSaving ? 'Saving…' : todayCheckIn ? 'Update' : 'Save check-in'}
                  </button>
                  {editingCheckIn && (
                    <button
                      onClick={() => setEditingCheckIn(false)}
                      className="text-sm transition-opacity hover:opacity-60"
                      style={{ fontFamily: I, color: c.muted }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Bring a friend nudge ────────────────────────────────────────── */}
        {showFriendNudge && (
          <section className="mb-6 animate-fade-up">
            <div
              className="rounded-3xl px-5 py-4"
              style={{
                background: isDark
                  ? 'rgba(162,191,166,0.09)'
                  : 'rgba(162,191,166,0.14)',
                border: `1px solid rgba(162,191,166,0.28)`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Text + actions */}
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0 mt-0.5">🌱</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug mb-0.5" style={{ fontFamily: F, color: c.forest }}>
                      Know someone who needs this?
                    </p>
                    <p className="text-xs leading-relaxed mb-3" style={{ fontFamily: I, color: c.body }}>
                      You just had a real check-in. The people who'd benefit most never think to look for something like Koru — until a friend sends it.
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Primary: copy link */}
                      <button
                        onClick={handleNudgeCopy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.97]"
                        style={{
                          background: nudgeCopied ? 'rgba(162,191,166,0.35)' : '#1B3B2B',
                          color: nudgeCopied ? c.forest : '#FBF9F5',
                          fontFamily: F,
                        }}
                      >
                        {nudgeCopied ? (
                          <>
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg width="11" height="11" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                              <rect x="3" y="1" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                              <rect x="1" y="3" width="9" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill={isDark ? '#1B3B2B' : '#1B3B2B'}/>
                            </svg>
                            Copy invite link
                          </>
                        )}
                      </button>

                      {/* Secondary: native share */}
                      {typeof navigator !== 'undefined' && 'share' in navigator && (
                        <button
                          onClick={handleNudgeShare}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-70"
                          style={{ fontFamily: I, color: c.muted, background: 'transparent' }}
                        >
                          <svg width="11" height="11" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                            <path d="M10.5 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4.5 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 8.5l3-1.5M9 9l-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                          </svg>
                          Share
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dismiss */}
                <button
                  onClick={handleDismissNudge}
                  className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-40"
                  style={{ color: c.muted, lineHeight: 1 }}
                  aria-label="Dismiss"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Intention prompt (after meaningful check-in) ── */}
        {showIntentionPrompt && !intentionPromptDismissed && !showFriendNudge && (
          <FutureSelfCard
            mode="prompt"
            onDismiss={() => {
              setShowIntentionPrompt(false)
              sessionStorage.setItem('koru-intention-dismissed', '1')
              setIntentionPromptDismissed(true)
            }}
            onSaveNew={handleSaveIntention}
          />
        )}

        {/* ── Pattern mirror ── */}
        {patternObservations.length > 0 && (
          <PatternMirrorCard
            observations={patternObservations}
            onDismiss={() => markPatternsSeen(patternObservations.map(o => o.id))}
          />
        )}

        {/* ── Growth card (Pro only) ── */}
        {isPro && results.length > 0 && (
          <section className="mb-10">
            <div
              className="rounded-3xl p-6 sm:p-8"
              style={{
                background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)',
                border: '1px solid rgba(162,191,166,0.2)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ fontFamily: I, color: '#A2BFA6' }}>
                Your growth profile ✦ Pro
              </p>

              {/* Quiz completion */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ fontFamily: F, color: '#fff' }}>
                    {results.length} of {quizzes.length} quizzes complete
                  </span>
                  <span className="text-xs" style={{ fontFamily: I, color: '#A2BFA6' }}>
                    {Math.round((results.length / quizzes.length) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((results.length / quizzes.length) * 100)}%`, background: '#A2BFA6' }}
                  />
                </div>
              </div>

              {/* Result tags */}
              <div className="flex flex-wrap gap-2 mb-5">
                {results.slice(0, 4).map(r => (
                  <span
                    key={r.id}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'rgba(162,191,166,0.18)', color: '#c8deca', fontFamily: I }}
                  >
                    {r.resultEmoji} {r.resultTitle}
                  </span>
                ))}
              </div>

              {/* Insight line */}
              <p className="text-sm leading-relaxed" style={{ fontFamily: I, color: 'rgba(255,255,255,0.72)' }}>
                {results.length >= 3
                  ? `You've built a meaningful self-portrait across ${results.length} quizzes. Your results reveal patterns worth exploring further.`
                  : `Complete more quizzes to unlock a deeper picture of who you are and how you work best.`}
              </p>

              {streak >= 3 && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm">🔥</span>
                  <span className="text-xs font-semibold" style={{ fontFamily: I, color: '#A2BFA6' }}>
                    {streak}-day streak — consistency is your superpower.
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Insight card ── */}
        {insight && thinkingResult && drivesResult && (
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

        {/* ── Mood-to-quiz matcher ── */}
        <MoodQuizMatcher results={results} moodMatchHistory={moodMatches} />

        {/* ── Quizzes ── */}
        <section className="mb-12">
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: F, color: c.forest }}>Discover yourself</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.filter(q => !q.mature && !q.pro).map(quiz => {
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

        {/* ── Pro: Relationships & Mindset ── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: F, color: c.forest }}>Relationships &amp; mindset</h2>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(27,59,43,0.1)', color: '#1B3B2B', fontFamily: I, letterSpacing: '0.05em' }}
            >
              Pro
            </span>
          </div>

          {!isPro && (
            <Link
              to="/upgrade"
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mb-4 transition-opacity hover:opacity-80"
              style={{ background: 'rgba(27,59,43,0.07)', border: '1.5px solid rgba(27,59,43,0.15)', textDecoration: 'none' }}
            >
              <span className="text-xl">⭐</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ fontFamily: F, color: '#1B3B2B' }}>Unlock with Koru Pro</p>
                <p className="text-xs" style={{ fontFamily: I, color: '#4a6a58' }}>₦2,500/month — relationship diagnostics, boundary tools &amp; mindset quizzes</p>
              </div>
              <span className="text-xs font-bold flex-shrink-0" style={{ fontFamily: F, color: '#1B3B2B' }}>Upgrade →</span>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.filter(q => q.pro && !q.mature).map(quiz => {
              const done = completedIds.has(quiz.id)
              const myResult = results.find(r => r.quizId === quiz.id)
              const locked = !isPro

              const cardContent = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: c.surface, filter: locked ? 'grayscale(0.3)' : 'none' }}
                    >
                      {locked ? '🔒' : quiz.emoji}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(27,59,43,0.1)', color: '#1B3B2B', fontFamily: I }}>
                        Pro
                      </span>
                      {locked ? null : done ? (
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
                    <span className="text-xs font-semibold" style={{ fontFamily: F, color: locked ? '#1B3B2B' : c.forest }}>
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
                    border: `1.5px solid rgba(27,59,43,0.12)`,
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.filter(q => q.mature).map(quiz => {
              const done = completedIds.has(quiz.id)
              const myResult = results.find(r => r.quizId === quiz.id)
              const locked = false

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
