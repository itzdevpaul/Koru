import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getClarityMetrics, markClarityCardSeen, type ClarityMetrics } from '../firebase'
import { generateClarityDeltaImage, shareOrDownloadImage } from '../utils/shareImage'
import KoruLogo from '../components/KoruLogo'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

const plus = (n: number) => (n >= 0 ? '+' : '')

export default function ClarityCardPage() {
  const { user } = useAuth()
  const { isDark, c } = useTheme()
  const navigate = useNavigate()

  const [metrics, setMetrics] = useState<ClarityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [shared, setShared] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  useEffect(() => {
    if (!user) return
    getClarityMetrics(user.uid)
      .then(m => {
        setMetrics(m)
        if (m.hasEnoughData) {
          markClarityCardSeen(user.uid)
          // also dismiss banner in localStorage
          localStorage.setItem('koru-clarity-dismissed', new Date().toISOString().slice(0, 7))
        }
      })
      .finally(() => setLoading(false))
  }, [user])

  async function handleShare() {
    if (!metrics || sharing) return
    setSharing(true)
    setShareMsg('')
    try {
      const blob = await generateClarityDeltaImage({
        monthName: metrics.monthName,
        moodDelta: metrics.moodDelta,
        energyDelta: metrics.energyDelta,
        overallStart: metrics.overallStart,
        overallEnd: metrics.overallEnd,
        checkInCount: metrics.checkInCount,
      })
      const outcome = await shareOrDownloadImage(blob, 'koru-clarity-snapshot.png', 'My Koru Growth Snapshot')
      if (outcome === 'downloaded') { setShared(true); setTimeout(() => setShared(false), 3000) }
      else if (outcome === 'shared') { setShareMsg('Shared!'); setTimeout(() => setShareMsg(''), 2500) }
      else { setShareMsg('Unable to save — try again.'); setTimeout(() => setShareMsg(''), 3000) }
    } catch {
      setShareMsg('Something went wrong.')
      setTimeout(() => setShareMsg(''), 3000)
    } finally {
      setSharing(false)
    }
  }

  // ── Loading ──
  if (loading || subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'rgba(162,191,166,0.3)', borderTopColor: '#1B3B2B' }} />
      </div>
    )
  }

  // ── Pro gate: Clarity Delta is a Pro feature ──
  if (!isPro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: c.bg }}>
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{ background: c.card, border: `1.5px solid ${c.cardBorder}`, boxShadow: '0 8px 40px rgba(27,59,43,0.1)' }}
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: 'rgba(162,191,166,0.2)' }}>
            📊
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: F, color: c.forest }}>
            30-Day Clarity Delta
          </h2>
          <p className="text-sm mb-2" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
            See how your mood, energy, and perspective have shifted over the month — full trend analytics that reveal your growth.
          </p>
          <p className="text-sm mb-7" style={{ fontFamily: I, color: c.muted, lineHeight: 1.65 }}>
            This is a Koru Pro feature. Upgrade to unlock your complete Clarity Delta.
          </p>
          <Link
            to="/upgrade"
            className="block w-full py-3.5 rounded-2xl text-sm font-semibold text-white text-center mb-3 transition-opacity hover:opacity-90"
            style={{ fontFamily: F, background: '#1B3B2B' }}
          >
            Upgrade to Pro →
          </Link>
          <button
            onClick={() => navigate('/home')}
            className="text-sm transition-opacity hover:opacity-60"
            style={{ fontFamily: I, color: c.muted }}
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  // ── Not enough data ──
  if (!metrics?.hasEnoughData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-5" style={{ background: c.bg }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
          style={{ background: 'rgba(162,191,166,0.2)' }}>🌱</div>
        <h1 className="text-2xl font-bold text-center" style={{ fontFamily: F, color: c.forest }}>
          Your card is growing
        </h1>
        <p className="text-sm text-center max-w-sm" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
          Your Clarity Card unlocks after 7 check-ins within 30 days.
          {metrics && metrics.checkInCount > 0 && (
            <> You've done <strong>{metrics.checkInCount}</strong> — keep going!</>
          )}
        </p>
        <div className="w-full max-w-xs">
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(27,59,43,0.1)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, ((metrics?.checkInCount ?? 0) / 7) * 100)}%`, background: '#A2BFA6' }}
            />
          </div>
          <p className="text-xs text-center mt-2" style={{ fontFamily: I, color: c.muted }}>
            {metrics?.checkInCount ?? 0} / 7 check-ins
          </p>
        </div>
        <button
          onClick={() => navigate('/home')}
          className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
          style={{ fontFamily: F, background: '#1B3B2B' }}
        >
          Back to home →
        </button>
      </div>
    )
  }

  const m = metrics!

  // ── Metric colour helpers ──
  const metricBg   = (n: number) => n >= 0 ? 'rgba(162,191,166,0.2)' : 'rgba(224,122,95,0.12)'
  const metricCol  = (n: number) => n >= 0 ? '#1B3B2B' : '#c0513a'

  const moodNote = m.moodDelta >= 20
    ? `A ${m.moodDelta}% lift in emotional grounding — you're showing up for yourself consistently.`
    : m.moodDelta >= 0
    ? "Steady and growing — your emotional grounding improved this month."
    : "A tough month, but you kept checking in. That's the real work."

  const energyNote = m.energyDelta >= 20
    ? `Your mental sharpness increased by ${m.energyDelta}% — clearer head, sharper decisions.`
    : m.energyDelta >= 0
    ? "Energy stable and building — your focus is clearer than when you started."
    : "Energy dipped this month. Your body was signalling something. Rest is growth too."

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      {/* Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-8 h-14"
        style={{ borderBottom: `1px solid ${c.navBorder}` }}
      >
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: I, color: c.muted }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <KoruLogo size={22} tone={isDark ? 'paper' : 'ink'} wordmarkSize={15} />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-10 pb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-center mb-6"
          style={{ fontFamily: I, color: c.sage }}>
          30-Day Transformation
        </p>

        {/* ── The Card ── */}
        <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 24px 60px rgba(27,59,43,0.14)' }}>

          {/* Card header — dark forest */}
          <div className="px-7 pt-8 pb-7" style={{ background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ fontFamily: I, color: '#A2BFA6' }}>
              Growth Snapshot
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-2"
              style={{ fontFamily: F, color: '#fff' }}>
              Your {m.monthName} Snapshot 🌿
            </h1>
            <p className="text-sm" style={{ fontFamily: I, color: 'rgba(255,255,255,0.55)' }}>
              Based on {m.checkInCount} check-in{m.checkInCount !== 1 ? 's' : ''} this month
            </p>
          </div>

          {/* Card body — white */}
          <div className="px-7 py-7 flex flex-col gap-5" style={{ background: '#fff' }}>

            {/* Boundary Confidence */}
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base mb-1" style={{ fontFamily: F, color: '#1B3B2B' }}>
                  Boundary Confidence
                </p>
                <p className="text-xs leading-relaxed" style={{ fontFamily: I, color: '#7a9a86' }}>
                  {moodNote}
                </p>
              </div>
              <div
                className="flex-shrink-0 text-xl font-bold px-3 py-2 rounded-2xl"
                style={{ fontFamily: F, color: metricCol(m.moodDelta), background: metricBg(m.moodDelta) }}
              >
                {plus(m.moodDelta)}{m.moodDelta}%
              </div>
            </div>

            <div style={{ height: 1, background: '#f0ede6' }} />

            {/* Decision Clarity */}
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base mb-1" style={{ fontFamily: F, color: '#1B3B2B' }}>
                  Decision Clarity
                </p>
                <p className="text-xs leading-relaxed" style={{ fontFamily: I, color: '#7a9a86' }}>
                  {energyNote}
                </p>
              </div>
              <div
                className="flex-shrink-0 text-xl font-bold px-3 py-2 rounded-2xl"
                style={{ fontFamily: F, color: metricCol(m.energyDelta), background: metricBg(m.energyDelta) }}
              >
                {plus(m.energyDelta)}{m.energyDelta}%
              </div>
            </div>

            <div style={{ height: 1, background: '#f0ede6' }} />

            {/* Overall shift */}
            <div className="rounded-2xl px-5 py-4" style={{ background: 'rgba(27,59,43,0.05)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ fontFamily: I, color: '#A2BFA6' }}>
                Overall Shift
              </p>
              {m.overallStart === m.overallEnd ? (
                <p className="text-sm font-semibold" style={{ fontFamily: F, color: '#1B3B2B' }}>
                  Holding steady at "{m.overallEnd}" ✦
                </p>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm" style={{ fontFamily: I, color: '#9ab5a0' }}>
                    "{m.overallStart}"
                  </span>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
                    <path d="M1 5h14M10 1l4 4-4 4" stroke="#A2BFA6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-sm font-bold" style={{ fontFamily: F, color: '#1B3B2B' }}>
                    "{m.overallEnd}"
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card footer */}
          <div className="px-7 py-3.5 text-center" style={{ background: '#f8f6f1' }}>
            <p className="text-xs" style={{ fontFamily: I, color: '#c0c8bf' }}>
              koru.com.ng · Koru Self-Discovery
            </p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleShare}
            disabled={sharing}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            style={{ fontFamily: F, background: '#1B3B2B' }}
          >
            {sharing ? 'Creating image…' : shared ? '✓ Saved!' : '🌿 Share my snapshot'}
          </button>
          {shareMsg && (
            <p className="text-center text-xs" style={{ fontFamily: "'Inter', sans-serif", color: c.muted }}>
              {shareMsg}
            </p>
          )}
          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 rounded-2xl text-sm transition-opacity hover:opacity-60"
            style={{ fontFamily: I, color: c.muted }}
          >
            Back to home
          </button>
        </div>

        {/* ── Re-examine note ── */}
        <p className="text-center text-xs mt-6 leading-relaxed" style={{ fontFamily: I, color: c.muted }}>
          This snapshot compares your first 7 check-ins to your most recent 7.
          Keep checking in daily — your next snapshot gets richer every time.
        </p>
      </main>
    </div>
  )
}
