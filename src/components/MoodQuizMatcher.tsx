import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { quizzes } from '../data/quizzes'
import type { SavedQuizResult, MoodMatch } from '../firebase'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

interface FeelingOption {
  id: string
  label: string
  emoji: string
  quizIds: string[]
  tagline: string
}

const FEELINGS: FeelingOption[] = [
  {
    id: 'crossroads',
    label: 'At a crossroads',
    emoji: '🤔',
    quizIds: ['thinking-style', 'what-drives-you'],
    tagline: 'Get clarity on how you decide and what fuels you',
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    emoji: '😵',
    quizIds: ['energy-source', 'conflict-style'],
    tagline: 'Understand where you recharge and how you handle pressure',
  },
  {
    id: 'relationship',
    label: 'Relationship stuff',
    emoji: '💛',
    quizIds: ['love-language', 'attachment-style'],
    tagline: 'See how you connect and what you need from others',
  },
  {
    id: 'stuck',
    label: 'Feeling stuck',
    emoji: '🌀',
    quizIds: ['what-drives-you', 'perspective-shift'],
    tagline: 'Find the thread that pulls you forward',
  },
  {
    id: 'grow',
    label: 'Ready to grow',
    emoji: '🌱',
    quizIds: ['boundary-strength', 'thinking-style'],
    tagline: 'Build on what you already know about yourself',
  },
  {
    id: 'purpose',
    label: 'Chasing purpose',
    emoji: '✨',
    quizIds: ['what-drives-you', 'energy-source'],
    tagline: 'Connect what drives you to how you move through the world',
  },
  {
    id: 'conflict',
    label: 'In a tough situation',
    emoji: '⚡',
    quizIds: ['conflict-style', 'boundary-strength'],
    tagline: 'Understand how you navigate tension and protect what matters',
  },
]

interface Props {
  results: SavedQuizResult[]
  moodMatchHistory?: MoodMatch[]
}

export default function MoodQuizMatcher({ results, moodMatchHistory = [] }: Props) {
  const { c, isDark } = useTheme()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const completedIds = new Set(results.map(r => r.quizId))

  // Build a set of {feelingId-quizId} pairs that have been completed via the matcher
  const matchedPairs = new Set(moodMatchHistory.map(m => `${m.feelingId}-${m.quizId}`))
  const matchedQuizIds = new Set(moodMatchHistory.map(m => m.quizId))

  const feeling = FEELINGS.find(f => f.id === selected)
  const recommendedQuizzes = feeling
    ? feeling.quizIds.map(id => quizzes.find(q => q.id === id)).filter(Boolean)
    : []

  function handleQuizClick(feelingId: string, quizId: string, locked: boolean) {
    if (locked) {
      navigate('/upgrade')
      return
    }
    // Store pending match so Quiz.tsx can record it on completion
    sessionStorage.setItem('koru-mood-pending', JSON.stringify({ feelingId, quizId }))
    navigate(`/quiz/${quizId}`)
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: F, color: c.forest }}>
            Find the right quiz
          </h2>
          <p className="text-xs mt-0.5" style={{ fontFamily: I, color: c.muted }}>
            How are you feeling right now?
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-xs transition-opacity hover:opacity-50"
          style={{ fontFamily: I, color: c.muted }}
        >
          Browse all ↓
        </button>
      </div>

      {/* Feeling chips — horizontally scrollable */}
      <div
        className="flex gap-2 pb-1 mb-5"
        style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {FEELINGS.map(f => {
          const isSelected = selected === f.id
          // Show "tried this" indicator if any quiz from this feeling was matched
          const triedThis = f.quizIds.some(qid => matchedQuizIds.has(qid))
          return (
            <button
              key={f.id}
              onClick={() => setSelected(isSelected ? null : f.id)}
              className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl flex-shrink-0 transition-all duration-200 active:scale-95 relative"
              style={{
                background: isSelected
                  ? '#1B3B2B'
                  : isDark ? 'rgba(255,255,255,0.06)' : c.surface,
                border: `1.5px solid ${isSelected ? '#1B3B2B' : 'transparent'}`,
                minWidth: 90,
              }}
            >
              {triedThis && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#A2BFA6' }}
                  title="You've tried a quiz from this path before"
                />
              )}
              <span className="text-xl">{f.emoji}</span>
              <span
                className="text-[11px] font-semibold text-center leading-tight"
                style={{
                  fontFamily: I,
                  color: isSelected ? '#fff' : c.muted,
                  maxWidth: 80,
                }}
              >
                {f.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Recommended quizzes */}
      {feeling && recommendedQuizzes.length > 0 && (
        <div className="animate-fade-up">
          <p className="text-xs font-semibold mb-3" style={{ fontFamily: I, color: c.sage }}>
            {feeling.tagline}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendedQuizzes.map(quiz => {
              if (!quiz) return null
              const done = completedIds.has(quiz.id)
              const myResult = results.find(r => r.quizId === quiz.id)
              const locked = quiz.pro || quiz.mature
              const triedViaMatcher = matchedPairs.has(`${feeling.id}-${quiz.id}`)

              return (
                <button
                  key={quiz.id}
                  onClick={() => handleQuizClick(feeling.id, quiz.id, !!locked)}
                  className="group rounded-3xl p-6 flex flex-col gap-3 text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    background: c.card,
                    border: `1.5px solid rgba(162,191,166,0.35)`,
                    boxShadow: c.shadow,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
                      style={{ background: c.surface }}
                    >
                      {quiz.emoji}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      {locked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(27,59,43,0.1)', color: '#1B3B2B', fontFamily: I }}>
                          Pro
                        </span>
                      )}
                      {done && !locked && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(162,191,166,0.25)', color: '#3a6b4a', fontFamily: I }}>
                          ✓ Done
                        </span>
                      )}
                      {triedViaMatcher && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(162,191,166,0.15)', color: c.sage, fontFamily: I }}>
                          Tried via matcher
                        </span>
                      )}
                      {!done && !locked && !triedViaMatcher && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(162,191,166,0.2)', color: c.sage, fontFamily: I }}>
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="font-bold text-base mb-1" style={{ fontFamily: F, color: c.forest }}>
                      {quiz.title}
                    </p>
                    <p className="text-sm leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                      {done && myResult
                        ? `Your result: ${myResult.resultEmoji} ${myResult.resultTitle}`
                        : quiz.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <span className="text-xs font-semibold" style={{ fontFamily: F, color: c.forest }}>
                      {locked ? 'Upgrade to unlock →' : done ? 'Retake' : 'Take quiz'}
                    </span>
                    {!locked && (
                      <span style={{ color: c.forest, fontSize: 12 }} aria-hidden="true">→</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
