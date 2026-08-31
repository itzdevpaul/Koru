import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSubscription } from '../context/SubscriptionContext'
import { saveQuizResult, saveMoodMatch, initiateReportUnlock } from '../firebase'
import { getQuizById, scoreQuiz, type QuizResultType } from '../data/quizzes'
import { getDeepReport } from '../data/deepReports'
import { generateQuizShareImage, shareOrDownloadImage } from '../utils/shareImage'

type Phase = 'intro' | 'question' | 'result'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Quiz() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { isDark, c } = useTheme()
  const { hasReportAccess, loading: subLoading } = useSubscription()
  const quiz = id ? getQuizById(id) : undefined

  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<QuizResultType | null>(null)
  const [animating, setAnimating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [sharingImage, setSharingImage] = useState(false)
  const [unlocking, setUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')

  if (!quiz) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: c.bg }}>
        <p style={{ fontFamily: I, color: c.muted }}>Quiz not found.</p>
        <Link to="/home" className="text-sm font-semibold" style={{ color: c.forest, fontFamily: F }}>← Back to home</Link>
      </div>
    )
  }

  // Wait for subscription state before deciding access — but never block the quiz
  const canAccessReport = !subLoading && hasReportAccess(quiz.id)

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
      const q_ = quiz!
      if (currentQ < q_.questions.length - 1) {
        setCurrentQ(q => q + 1)
        setSelected(null)
        setAnimating(false)
      } else {
        const finalResult = scoreQuiz(q_, newAnswers)
        setResult(finalResult)
        setPhase('result')
        setAnimating(false)
        if (user) {
          setSaving(true)
          saveQuizResult(user.uid, {
            quizId: q_.id,
            quizTitle: q_.title,
            resultTypeId: finalResult.id,
            resultTitle: finalResult.title,
            resultEmoji: finalResult.emoji,
          }).then(() => {
            const pending = sessionStorage.getItem('koru-mood-pending')
            if (pending) {
              try {
                const { feelingId, quizId } = JSON.parse(pending) as { feelingId: string; quizId: string }
                if (quizId === q_.id) {
                  sessionStorage.removeItem('koru-mood-pending')
                  saveMoodMatch(user!.uid, feelingId, quizId).catch(() => {})
                }
              } catch { /* ignore malformed session data */ }
            }
          }).finally(() => setSaving(false))
        }
      }
    }, 300)
  }

  async function handleShare() {
    if (!result || !quiz) return
    setSharingImage(true)
    setShareMsg('')
    try {
      // Compute full score breakdown across all result types for the trait radar
      const totals: Record<string, number> = {}
      quiz.results.forEach(r => { totals[r.id] = 0 })
      for (const [qid, oid] of Object.entries(answers)) {
        const q = quiz.questions.find(qx => qx.id === qid)
        const opt = q?.options.find(o => o.id === oid)
        if (opt) for (const [rid, s] of Object.entries(opt.scores)) totals[rid] = (totals[rid] ?? 0) + s
      }
      const handle = user?.displayName || user?.email?.split('@')[0] || 'you'
      const blob = await generateQuizShareImage({
        emoji: result.emoji,
        title: result.title,
        tagline: result.tagline,
        quizTitle: quiz.title,
        traits: result.traits,
        scores: totals,
        resultTypes: quiz.results.map(r => ({ id: r.id, title: r.title })),
        handle,
      })
      const outcome = await shareOrDownloadImage(blob, `koru-${quiz.id}-result.png`, `My Koru result: ${result.title}`)
      if (outcome === 'downloaded') setShareMsg('Image saved!')
      else if (outcome === 'error') setShareMsg('Unable to save — try again.')
    } catch {
      setShareMsg('Unable to generate image.')
    } finally {
      setSharingImage(false)
      setTimeout(() => setShareMsg(''), 3500)
    }
  }

  async function handleUnlock() {
    if (!user) return
    setUnlocking(true)
    setUnlockError('')
    try {
      const { checkout_url, ref } = await initiateReportUnlock(quiz!.id)
      sessionStorage.setItem('koru-payment-ref', ref)
      sessionStorage.setItem('koru-payment-uid', user.uid)
      sessionStorage.setItem('koru-payment-type', 'unlock')
      sessionStorage.setItem('koru-unlock-quiz', quiz!.id)
      window.location.href = checkout_url
    } catch (err) {
      setUnlockError(err instanceof Error ? err.message : 'Could not start payment. Please try again.')
      setUnlocking(false)
    }
  }

  const deepReport = result ? getDeepReport(quiz.id, result.id) : null

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
              {/* Result card — teaser (always visible) */}
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

                {/* ── Deep report: full access (Pro or one-time unlocked) ── */}
                {canAccessReport ? (
                  <div className="text-left">
                    {/* Description */}
                    <p className="text-sm leading-relaxed mb-6" style={{ fontFamily: I, color: c.body }}>{result.description}</p>

                    {/* Traits */}
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
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

                    {/* Deep-dive report */}
                    {deepReport && (
                      <>
                        <div className="rounded-2xl p-5 mb-5" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(27,59,43,0.04)' }}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: I, color: c.sage }}>
                            📖 Deep-dive report
                          </p>
                          {deepReport.deepDive.map((para, i) => (
                            <p key={i} className="text-sm leading-relaxed mb-3 last:mb-0" style={{ fontFamily: I, color: c.body }}>
                              {para}
                            </p>
                          ))}
                        </div>

                        {/* Action plan */}
                        <div className="rounded-2xl p-5" style={{ background: isDark ? 'rgba(224,122,95,0.06)' : 'rgba(224,122,95,0.05)' }}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: I, color: '#E07A5F' }}>
                            ✦ Your action plan
                          </p>
                          <div className="flex flex-col gap-4">
                            {deepReport.actionPlan.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div
                                  className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: '#E07A5F', color: '#fff', fontFamily: F }}
                                >
                                  {i + 1}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold mb-0.5" style={{ fontFamily: F, color: c.forest }}>{step.title}</p>
                                  <p className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>{step.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* ── Paywall: teaser + unlock CTA ── */
                  <div className="text-left">
                    {/* Preview snippet (first 2 sentences — not blurred, creates curiosity gap) */}
                    <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: I, color: c.body }}>
                      {result.description.split('. ').slice(0, 2).join('. ')}...
                    </p>

                    {/* What's inside the deep report */}
                    <div
                      className="rounded-2xl p-5 mb-5"
                      style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(27,59,43,0.04)' }}
                    >
                      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: I, color: c.sage }}>
                        ✦ Unlock your full report
                      </p>
                      <ul className="flex flex-col gap-2.5">
                        <li className="flex items-start gap-2.5">
                          <span className="text-sm flex-shrink-0">📖</span>
                          <span className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                            <strong style={{ color: c.forest }}>Deep-dive analysis</strong> — a multi-paragraph breakdown of what your result really means for your life and relationships
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-sm flex-shrink-0">✦</span>
                          <span className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                            <strong style={{ color: c.forest }}>Personalised action plan</strong> — 3 concrete, practical steps to turn this insight into real change
                          </span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-sm flex-shrink-0">🏷️</span>
                          <span className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                            <strong style={{ color: c.forest }}>Your full trait profile</strong> — the complete picture of your strengths and growth edges
                          </span>
                        </li>
                      </ul>
                    </div>

                    {/* One-time unlock CTA */}
                    <button
                      onClick={handleUnlock}
                      disabled={unlocking}
                      className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mb-3"
                      style={{ fontFamily: F, background: '#E07A5F' }}
                    >
                      {unlocking ? 'Opening payment…' : 'Unlock this report — ₦1,000'}
                    </button>
                    {unlockError && (
                      <p className="text-center text-xs mb-3" style={{ fontFamily: I, color: '#E07A5F' }}>{unlockError}</p>
                    )}

                    {/* Or go Pro */}
                    <Link
                      to="/upgrade"
                      className="block w-full py-3.5 rounded-2xl text-sm font-semibold text-center transition-all duration-200 hover:opacity-80 active:scale-[0.98] mb-2"
                      style={{ fontFamily: F, background: c.surface, color: c.forest, border: `1.5px solid ${c.cardBorder}` }}
                    >
                      Get all reports with Pro — from ₦1,000/mo →
                    </Link>
                    <p className="text-center text-xs" style={{ fontFamily: I, color: c.muted }}>
                      One-time unlock is yours forever. Pro unlocks <strong>every</strong> report + the 30-Day Clarity Delta.
                    </p>
                  </div>
                )}
              </div>

              {saving && (
                <p className="text-center text-xs mb-4" style={{ fontFamily: I, color: '#A2BFA6' }}>Saving your result…</p>
              )}

              {/* Share — generates a shareable image */}
              <button
                onClick={handleShare}
                disabled={sharingImage}
                className="w-full py-3 rounded-2xl text-sm font-semibold mb-3 transition-all duration-200 hover:opacity-80 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: F, background: c.surface, color: c.forest, border: `1.5px solid ${c.cardBorder}` }}
              >
                {sharingImage ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                    </svg>
                    Creating image…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                      <path d="M10.5 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4.5 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 8.5l3-1.5M9 9l-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    Share my result
                  </>
                )}
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
