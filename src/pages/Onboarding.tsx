import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveUserProfile, getUserProfile } from '../firebase'
import KoruLoader from '../components/KoruLoader'
import KoruLogo from '../components/KoruLogo'

const FOCUS_OPTIONS = [
  { id: 'career', emoji: '🧭', label: 'Career & Hobbies', body: 'Find work and pursuits that actually fit you.' },
  { id: 'relationships', emoji: '💬', label: 'Relationships', body: 'Understand yourself and others better.' },
  { id: 'identity', emoji: '🌱', label: 'Identity & Growth', body: "Explore your values and who you're becoming." },
]

const AGE_RANGES = ['Under 18', '18–24', '25–34', '35+', 'Prefer not to say']

type Step = 'welcome' | 'focus' | 'age' | 'done'

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('welcome')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [ageRange, setAgeRange] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'

  // Skip onboarding if already complete
  useEffect(() => {
    if (!user) return
    getUserProfile(user.uid).then(profile => {
      if (profile?.onboardingComplete) {
        navigate('/home', { replace: true })
      } else {
        setChecking(false)
      }
    })
  }, [user, navigate])

  function toggleFocus(id: string) {
    setFocusAreas(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  async function handleFinish() {
    if (!user) return
    setSaving(true)
    await saveUserProfile(user.uid, {
      displayName: user.displayName ?? '',
      focusAreas: focusAreas.length ? focusAreas : ['career', 'relationships', 'identity'],
      ageRange: ageRange || 'Prefer not to say',
      onboardingComplete: true,
    })
    setSaving(false)
    setStep('done')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FBF9F5' }}>
        <KoruLoader label="Checking your progress…" />
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #FBF9F5 0%, #EEF4EF 100%)' }}
    >
      {/* Progress dots */}
      {step !== 'done' && (
        <div className="flex items-center gap-2 mb-10">
          {(['welcome', 'focus', 'age'] as Step[]).map((s, i) => (
            <div
              key={s}
              className="rounded-full transition-all duration-300"
              style={{
                width: step === s ? 24 : 8,
                height: 8,
                background: step === s ? '#1B3B2B' : 'rgba(162,191,166,0.4)',
              }}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* ── Step: Welcome ── */}
        {step === 'welcome' && (
          <div className="text-center animate-fade-up">
            <div className="mx-auto mb-6 w-fit">
              <KoruLogo size={48} showWordmark={false} />
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              Hey, {firstName} 👋
            </h1>
            <p
              className="text-base mb-8 max-w-sm mx-auto"
              style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58', lineHeight: 1.65 }}
            >
              Let's take 30 seconds to personalise your Koru experience. We'll point you to what matters most for you.
            </p>
            <button
              onClick={() => setStep('focus')}
              className="px-8 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#1B3B2B' }}
            >
              Let's go →
            </button>
            <p className="mt-4 text-xs" style={{ fontFamily: "'Inter', sans-serif", color: '#A2BFA6' }}>
              Takes about 30 seconds
            </p>
          </div>
        )}

        {/* ── Step: Focus Areas ── */}
        {step === 'focus' && (
          <div className="animate-fade-up">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              What do you want to explore?
            </h2>
            <p
              className="text-sm mb-8 text-center"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              Pick as many as you like — you can always change this later.
            </p>

            <div className="flex flex-col gap-3 mb-8">
              {FOCUS_OPTIONS.map(opt => {
                const selected = focusAreas.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleFocus(opt.id)}
                    className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 hover:shadow-md active:scale-[0.99]"
                    style={{
                      background: selected ? 'rgba(27,59,43,0.06)' : 'rgba(255,255,255,0.8)',
                      border: selected ? '2px solid #1B3B2B' : '1.5px solid rgba(162,191,166,0.35)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: selected ? 'rgba(27,59,43,0.1)' : 'rgba(162,191,166,0.2)' }}
                    >
                      {opt.emoji}
                    </div>
                    <div className="flex-1">
                      <p
                        className="font-semibold text-sm mb-0.5"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
                      >
                        {opt.label}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
                      >
                        {opt.body}
                      </p>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                      style={{
                        background: selected ? '#1B3B2B' : 'transparent',
                        border: selected ? '2px solid #1B3B2B' : '1.5px solid rgba(162,191,166,0.5)',
                      }}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 5l2 2 4-4" stroke="#FBF9F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setStep('age')}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#1B3B2B' }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step: Age Range ── */}
        {step === 'age' && (
          <div className="animate-fade-up">
            <h2
              className="text-2xl sm:text-3xl font-bold mb-2 text-center"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              How old are you?
            </h2>
            <p
              className="text-sm mb-8 text-center"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              Helps us tailor your experience. Completely optional.
            </p>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {AGE_RANGES.map(range => {
                const selected = ageRange === range
                return (
                  <button
                    key={range}
                    onClick={() => setAgeRange(selected ? '' : range)}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:shadow-sm active:scale-95"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: selected ? '#1B3B2B' : 'rgba(255,255,255,0.8)',
                      color: selected ? '#FBF9F5' : '#1B3B2B',
                      border: selected ? '2px solid #1B3B2B' : '1.5px solid rgba(162,191,166,0.4)',
                    }}
                  >
                    {range}
                  </button>
                )
              })}
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#1B3B2B' }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  Saving…
                </span>
              ) : (
                'Finish setup →'
              )}
            </button>

            <button
              onClick={() => setStep('focus')}
              className="w-full mt-3 py-2.5 text-sm transition-opacity hover:opacity-60"
              style={{ fontFamily: "'Inter', sans-serif", color: '#A2BFA6' }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div className="text-center animate-fade-up">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ background: 'rgba(162,191,166,0.2)' }}
            >
              🎉
            </div>
            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              You're all set!
            </h2>
            <p
              className="text-base mb-10 max-w-sm mx-auto"
              style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58', lineHeight: 1.65 }}
            >
              Your dashboard is ready. Start with a quiz to discover something new about yourself.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="px-8 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#1B3B2B' }}
            >
              Go to my dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
