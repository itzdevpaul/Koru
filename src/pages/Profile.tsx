import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import {
  getUserProfile,
  updateUserProfile,
  getQuizResults,
  sendReminderEmail,
  type UserProfile,
  type SavedQuizResult,
} from '../firebase'

const FOCUS_OPTIONS = [
  { id: 'career', emoji: '🧭', label: 'Career & Hobbies' },
  { id: 'relationships', emoji: '💬', label: 'Relationships' },
  { id: 'identity', emoji: '🌱', label: 'Identity & Growth' },
]

const AGE_RANGES = ['Under 18', '18–24', '25–34', '35+', 'Prefer not to say']

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Profile() {
  const { user } = useAuth()
  const { isDark, toggleTheme, c } = useTheme()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [results, setResults] = useState<SavedQuizResult[]>([])
  const [loading, setLoading] = useState(true)

  const [displayName, setDisplayName] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [ageRange, setAgeRange] = useState('')
  const [emailOptIn, setEmailOptIn] = useState(false)

  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([getUserProfile(user.uid), getQuizResults(user.uid)]).then(
      ([p, r]) => {
        if (p) {
          setProfile(p)
          setDisplayName(p.displayName || user.displayName || '')
          setFocusAreas(p.focusAreas || [])
          setAgeRange(p.ageRange || '')
          setEmailOptIn(p.emailOptIn ?? false)
        }
        setResults(r)
        setLoading(false)
      },
    )
  }, [user])

  function toggleFocus(id: string) {
    setFocusAreas(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  async function handleSave() {
    if (!user || !profile) return
    setSaving(true)
    await updateUserProfile(user.uid, {
      displayName,
      focusAreas: focusAreas.length ? focusAreas : profile.focusAreas,
      ageRange: ageRange || profile.ageRange,
      emailOptIn,
    })
    setSaving(false)
    setSavedMsg('Saved!')
    setTimeout(() => setSavedMsg(''), 2500)
  }

  async function handleSendPrompt() {
    if (!user?.email) return
    setSendingEmail(true)
    const topResult = results[0]
    const ok = await sendReminderEmail(user.email, displayName || 'there', topResult?.resultTitle)
    setSendingEmail(false)
    setEmailMsg(ok ? '✓ Prompt sent to your inbox!' : 'Could not send — check your email settings.')
    setTimeout(() => setEmailMsg(''), 4000)
  }

  const initials = (displayName || user?.email || '?')[0].toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: c.cardBorder, borderTopColor: c.forest }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: c.bg, transition: 'background 0.25s' }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-5 sm:px-8 h-16"
        style={{ background: c.bgGlass, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${c.navBorder}` }}
      >
        <Link
          to="/home"
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: I, color: c.muted }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dashboard
        </Link>

        <span className="text-sm font-bold" style={{ fontFamily: F, color: c.forest }}>Profile</span>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:opacity-80"
          style={{ background: c.surface }}
          aria-label="Toggle dark mode"
        >
          <span style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-5 sm:px-8 pt-10 pb-24">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold mb-3"
            style={{ background: '#1B3B2B', color: '#FBF9F5', fontFamily: F }}
          >
            {initials}
          </div>
          <p className="text-base font-semibold" style={{ fontFamily: F, color: c.forest }}>{displayName || user?.email}</p>
          <p className="text-xs mt-1" style={{ fontFamily: I, color: c.muted }}>{user?.email}</p>
          {(profile?.streak ?? 0) > 0 && (
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full" style={{ background: c.surface }}>
              <span>🔥</span>
              <span className="text-xs font-semibold" style={{ fontFamily: I, color: c.forest }}>
                {profile?.streak} day{profile?.streak === 1 ? '' : 's'} streak
              </span>
            </div>
          )}
        </div>

        {/* Display Name */}
        <section className="mb-6">
          <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ fontFamily: I, color: c.muted }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              background: c.input,
              border: `1.5px solid ${c.inputBorder}`,
              color: c.inputText,
              fontFamily: I,
            }}
            placeholder="Your name"
          />
        </section>

        {/* Focus Areas */}
        <section className="mb-6">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ fontFamily: I, color: c.muted }}>
            Focus Areas
          </label>
          <div className="flex flex-col gap-2">
            {FOCUS_OPTIONS.map(opt => {
              const selected = focusAreas.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleFocus(opt.id)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all duration-150 hover:opacity-90"
                  style={{
                    background: selected ? c.surface : c.card,
                    border: selected ? `2px solid ${c.forest}` : `1.5px solid ${c.cardBorder}`,
                  }}
                >
                  <span style={{ fontSize: 18 }}>{opt.emoji}</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: F, color: c.forest }}>{opt.label}</span>
                  <div
                    className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                    style={{
                      background: selected ? c.forest : 'transparent',
                      border: selected ? `2px solid ${c.forest}` : `1.5px solid ${c.sage}`,
                    }}
                  >
                    {selected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#FBF9F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Age Range */}
        <section className="mb-6">
          <label className="block text-xs font-semibold mb-3 uppercase tracking-wider" style={{ fontFamily: I, color: c.muted }}>
            Age Range
          </label>
          <div className="flex flex-wrap gap-2">
            {AGE_RANGES.map(range => {
              const sel = ageRange === range
              return (
                <button
                  key={range}
                  onClick={() => setAgeRange(sel ? '' : range)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150"
                  style={{
                    fontFamily: F,
                    background: sel ? '#1B3B2B' : c.card,
                    color: sel ? '#FBF9F5' : c.forest,
                    border: sel ? '2px solid #1B3B2B' : `1.5px solid ${c.cardBorder}`,
                  }}
                >
                  {range}
                </button>
              )
            })}
          </div>
        </section>

        {/* Email Reminders */}
        <section
          className="mb-6 p-5 rounded-3xl"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1" style={{ fontFamily: F, color: c.forest }}>
                Weekly reflection prompts
              </p>
              <p className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                A short, thoughtful question delivered to {user?.email} every week. Unsubscribe any time.
              </p>
            </div>
            <button
              onClick={() => setEmailOptIn(v => !v)}
              className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
              style={{ background: emailOptIn ? '#1B3B2B' : c.surface }}
              aria-label="Toggle email reminders"
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-200"
                style={{
                  background: '#fff',
                  transform: emailOptIn ? 'translateX(20px)' : 'translateX(0)',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
              />
            </button>
          </div>

          {emailOptIn && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${c.cardBorder}` }}>
              <button
                onClick={handleSendPrompt}
                disabled={sendingEmail}
                className="text-xs font-semibold transition-opacity hover:opacity-70 disabled:opacity-50"
                style={{ fontFamily: F, color: '#1B3B2B' }}
              >
                {sendingEmail ? 'Sending…' : 'Send me a prompt now →'}
              </button>
              {emailMsg && (
                <p className="text-xs mt-2" style={{ fontFamily: I, color: c.body }}>{emailMsg}</p>
              )}
            </div>
          )}
        </section>

        {/* Appearance */}
        <section
          className="mb-6 p-5 rounded-3xl flex items-center justify-between"
          style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
        >
          <div>
            <p className="font-semibold text-sm" style={{ fontFamily: F, color: c.forest }}>Appearance</p>
            <p className="text-xs mt-0.5" style={{ fontFamily: I, color: c.body }}>{isDark ? 'Dark mode' : 'Light mode'}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: c.surface, color: c.forest, fontFamily: F }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        </section>

        {/* Quiz Results */}
        {results.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-bold mb-4" style={{ fontFamily: F, color: c.forest }}>Your quiz results</h2>
            <div className="flex flex-col gap-3">
              {results.map(r => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-4 rounded-2xl"
                  style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: c.surface }}>
                    {r.resultEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ fontFamily: F, color: c.forest }}>{r.resultTitle}</p>
                    <p className="text-xs truncate" style={{ fontFamily: I, color: c.muted }}>{r.quizTitle}</p>
                  </div>
                  <Link
                    to={`/quiz/${r.quizId}`}
                    className="text-xs font-semibold flex-shrink-0 hover:opacity-60 transition-opacity"
                    style={{ fontFamily: F, color: c.forest }}
                  >
                    Retake →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          style={{ fontFamily: F, background: '#1B3B2B' }}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              Saving…
            </span>
          ) : savedMsg ? savedMsg : 'Save changes'}
        </button>

        <button
          onClick={() => navigate('/home')}
          className="w-full mt-3 py-3 text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: I, color: c.muted }}
        >
          ← Back to dashboard
        </button>
      </main>
    </div>
  )
}
