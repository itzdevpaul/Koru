import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSubscription } from '../context/SubscriptionContext'
import { saveQuizResult } from '../firebase'
import { getQuizById, scoreQuiz, type QuizResultType } from '../data/quizzes'

type Phase = 'intro' | 'question' | 'result'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Quiz() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { isDark, c } = useTheme()
  const { isPro, loading: subLoading } = useSubscription()
  const navigate = useNavigate()
  const quiz = id ? getQuizById(id) : undefined

  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResultType | null>(null)
  const [animating, setAnimating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: c.bg }}>
        <p style={{ fontFamily: I, color: c.muted }}>Quiz not found.</p>
        <Link to="/home" className="text-sm font-semibold" style={{ color: c.forest, fontFamily: F }}>← Back to home</Link>
      </div>
    )
  }

  // ── Paywall gate for mature quizzes ────────────────────────────────────────
  if (quiz.mature && !subLoading && !isPro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{ background: c.bg }}>
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center"
          style={{ background: c.card, border: `1.5px solid rgba(224,122,95,0.25)`, boxShadow: '0 8px 40px rgba(27,59,43,0.1)' }}
        >
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-5" style={{ background: 'rgba(224,122,95,0.12)' }}>
            🔒
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: F, color: c.forest }}>Koru Pro required</h2>
          <p className="text-sm mb-2" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
            <strong style={{ color: c.forest }}>{quiz.title}</strong> is an 18+ quiz available to Pro subscribers.
          </p>
          <p className="text-sm mb-7" style={{ fontFamily: I, color: c.muted, lineHeight: 1.65 }}>
            Upgrade for ₦2,500/month and get full access to all intimacy & relationship quizzes.
          </p>
          <Link
            to="/upgrade"
            className="block w-full py-3.5 rounded-2xl text-sm font-semibold text-white text-center mb-3 transition-opacity hover:opacity-90"
            style={{ fontFamily: F, background: '#1B3B2B' }}
          >
            Upgrade to Pro →
          </Link>
          <Link
            to="/home"
            className="block text-sm transition-opacity hover:opacity-60"
            style={{ fontFamily: I, color: c.muted }}
          >
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQ]
  const progress = phase === 'result' ? 100 : (currentQ / quiz.questions.length) * 100

  function handleStart() {
    setPhase('question')
    setCurrentQ(0)
    setSelected(null)
  }

  function handleSelect(optionId: string) {
    if (animating) return
    setSelected(optionId)
  }

  function handleNext() {
    if (!selected || animating) return
    const newAnswers = { ...answers, [question.id]: selected }
    setAnswers(newAnswers)
    setAnimating(true)

    setTimeout(() => {
      if (currentQ < quiz.questions.length - 1) {
        setCurrentQ(q => q + 1)
        setSelected(null)
        setAnimating(false)
      } else {
        const finalResult = scoreQuiz(quiz, newAnswers)
        setResult(finalResult)
        setPhase('result')
        setAnimating(false)
        if (user) {
          setSaving(true)
          saveQuizResult(user.uid, {
            quizId: quiz.id,
            quizTitle: quiz.title,
            resultTypeId: finalResult.id,
            resultTitle: finalResult.title,
            resultEmoji: finalResult.emoji,
          }).finally(() => setSaving(false))
        }
      }
    }, 300)
  }

  async function handleShare() {
    if (!result) return
    const text = `I just took "${quiz.title}" on Koru and got ${result.emoji} ${result.title} — "${result.tagline}" Try it at getkoru.app`

    if (navigator.share) {
      try {
        await navigator.share({ title: result.title, text })
        return
      } catch {
        // user cancelled — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setShareMsg('Copied to clipboard!')
    } catch {
      setShareMsg('Unable to copy — try manually.')
    }
    setTimeout(() => setShareMsg(''), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: c.bg, transition: 'background 0.25s' }}>
      {/* Header */}
      <header
        className="flex items-center justify-between px-5 sm:px-8 h-14 flex-shrink-0"
        style={{ borderBottom: `1px solid ${c.navBorder}` }}
      >
        <Link
          to="/home"
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: I, color: c.muted }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Home
        </Link>

        {phase === 'question' && (
          <div className="flex-1 mx-6">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: c.surface }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #1B3B2B, #A2BFA6)' }}
              />
            </div>
          </div>
        )}

        {phase === 'question' && (
          <span className="text-xs font-medium flex-shrink-0" style={{ fontFamily: I, color: c.sage }}>
            {currentQ + 1} / {quiz.questions.length}
          </span>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">

          {/* ── Intro ── */}
          {phase === 'intro' && (
            <div className="text-center animate-fade-up">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: c.surface }}>
                {quiz.emoji}
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4" style={{ fontFamily: I, background: c.tag, color: c.tagText }}>
                {quiz.category}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: F, color: c.forest }}>{quiz.title}</h1>
              <p className="text-sm mb-3 max-w-sm mx-auto" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>{quiz.description}</p>
              <p className="text-xs mb-10" style={{ fontFamily: I, color: c.sage }}>{quiz.questions.length} questions · ~{quiz.estimatedMinutes} min</p>
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ fontFamily: F, background: '#1B3B2B' }}
              >
                Start quiz →
              </button>
            </div>
          )}

          {/* ── Question ── */}
          {phase === 'question' && question && (
            <div className="transition-opacity duration-300" style={{ opacity: animating ? 0 : 1 }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-8 text-center leading-snug" style={{ fontFamily: F, color: c.forest }}>
                {question.text}
              </h2>

              <div className="flex flex-col gap-3 mb-8">
                {question.options.map(opt => {
                  const isSelected = selected === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 hover:shadow-sm active:scale-[0.99]"
                      style={{
                        background: isSelected ? c.surface : c.card,
                        border: isSelected ? `2px solid ${c.forest}` : `1.5px solid ${c.cardBorder}`,
                        backdropFilter: 'blur(12px)',
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                        style={{
                          background: isSelected ? '#1B3B2B' : 'transparent',
                          border: isSelected ? '2px solid #1B3B2B' : `1.5px solid ${c.sage}`,
                        }}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full" style={{ background: '#FBF9F5' }} />}
                      </div>
                      <span className="text-sm leading-snug" style={{ fontFamily: I, color: c.forest }}>{opt.text}</span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={handleNext}
                disabled={!selected || animating}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                style={{ fontFamily: F, background: '#1B3B2B' }}
              >
                {currentQ < quiz.questions.length - 1 ? 'Next →' : 'See my result →'}
              </button>
            </div>
          )}

          {/* ── Result ── */}
          {phase === 'result' && result && (
            <div className="animate-fade-up">
              {/* Result card */}
              <div
                className="rounded-3xl p-7 sm:p-9 mb-6 text-center"
                style={{
                  background: `linear-gradient(135deg, ${result.tagBg.replace(')', ', 0.5)').replace('rgba', 'rgba')} 0%, ${c.card} 100%)`,
                  border: `1px solid ${c.cardBorder}`,
                  boxShadow: '0 8px 40px rgba(27,59,43,0.08)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5" style={{ background: result.tagBg }}>
                  {result.emoji}
                </div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ fontFamily: I, color: '#A2BFA6' }}>Your result</p>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: F, color: c.forest }}>{result.title}</h2>
                <p className="text-base font-semibold mb-5" style={{ fontFamily: F, color: result.color }}>{result.tagline}</p>
                <div className="h-px mb-5" style={{ background: c.cardBorder }} />

                {/* Free-user teaser: blur description + traits for non-mature quizzes */}
                {!isPro && !quiz.mature ? (
                  <div className="relative">
                    {/* Blurred preview */}
                    <div style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none', opacity: 0.6 }}>
                      <p className="text-sm leading-relaxed mb-6 text-left" style={{ fontFamily: I, color: c.body }}>{result.description}</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {result.traits.map(trait => (
                          <span key={trait} className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ fontFamily: I, background: result.tagBg, color: result.color }}>{trait}</span>
                        ))}
                      </div>
                    </div>
                    {/* Upgrade overlay */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-4"
                      style={{ background: isDark ? 'rgba(30,42,36,0.88)' : 'rgba(251,249,245,0.88)', backdropFilter: 'blur(4px)' }}
                    >
                      <span className="text-2xl mb-2">⭐</span>
                      <p className="text-sm font-bold mb-1 text-center" style={{ fontFamily: F, color: c.forest }}>Full result — Koru Pro only</p>
                      <p className="text-xs text-center mb-4" style={{ fontFamily: I, color: c.body, lineHeight: 1.55 }}>
                        Upgrade to read your complete description and personality traits.
                      </p>
                      <Link
                        to="/upgrade"
                        className="px-5 py-2.5 rounded-2xl text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ fontFamily: F, background: '#1B3B2B' }}
                      >
                        Upgrade to Pro →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed mb-6 text-left" style={{ fontFamily: I, color: c.body }}>{result.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.traits.map(trait => (
                        <span
                          key={trait}
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ fontFamily: I, background: result.tagBg, color: result.color }}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {saving && (
                <p className="text-center text-xs mb-4" style={{ fontFamily: I, color: '#A2BFA6' }}>Saving your result…</p>
              )}

              {/* Share */}
              <button
                onClick={handleShare}
                className="w-full py-3 rounded-2xl text-sm font-semibold mb-3 transition-all duration-200 hover:opacity-80 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ fontFamily: F, background: c.surface, color: c.forest, border: `1.5px solid ${c.cardBorder}` }}
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <path d="M10.5 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4.5 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 8.5l3-1.5M9 9l-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Share my result
              </button>
              {shareMsg && (
                <p className="text-center text-xs mb-3" style={{ fontFamily: I, color: c.muted }}>{shareMsg}</p>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/home"
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white text-center transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{ fontFamily: F, background: '#1B3B2B' }}
                >
                  Back to dashboard
                </Link>
                <button
                  onClick={() => {
                    setPhase('intro')
                    setCurrentQ(0)
                    setAnswers({})
                    setSelected(null)
                    setResult(null)
                  }}
                  className="flex-1 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
                  style={{ fontFamily: F, background: c.buttonSecBg, color: c.buttonSecText, border: c.buttonSecBorder }}
                >
                  Retake quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
