import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

/** Shown when a free user hits a 3-day check-in streak — triggers upgrade at a moment of joy. */
export default function StreakUpgradePrompt({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const { c } = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-sm rounded-3xl p-7 text-center animate-fade-up"
        style={{ background: c.card, border: `1.5px solid ${c.cardBorder}`, boxShadow: '0 12px 60px rgba(27,59,43,0.2)' }}
      >
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: 'rgba(224,122,95,0.12)' }}>
          🔥
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ fontFamily: F, color: c.forest }}>
          {streak} days in a row!
        </h2>
        <p className="text-sm mb-1" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
          You're building real clarity. That's not an accident — it's a habit.
        </p>
        <p className="text-sm mb-6" style={{ fontFamily: I, color: c.muted, lineHeight: 1.65 }}>
          With Koru Pro, you'd see exactly how your mood, energy, and perspective have shifted over the month — your full 30-Day Clarity Delta.
        </p>

        <Link
          to="/upgrade"
          onClick={onDismiss}
          className="block w-full py-3.5 rounded-2xl text-sm font-semibold text-white text-center mb-3 transition-opacity hover:opacity-90"
          style={{ fontFamily: F, background: '#1B3B2B' }}
        >
          Unlock my Clarity Delta →
        </Link>
        <button
          onClick={onDismiss}
          className="text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: I, color: c.muted }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
