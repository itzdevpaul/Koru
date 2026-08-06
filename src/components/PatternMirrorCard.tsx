import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import type { PatternObservation } from '../utils/patternMirror'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

interface Props {
  observations: PatternObservation[]
}

export default function PatternMirrorCard({ observations }: Props) {
  const { c, isDark } = useTheme()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || observations.length === 0) return null

  return (
    <section className="mb-8 animate-fade-up">
      <div
        className="rounded-3xl p-6"
        style={{
          background: isDark ? 'rgba(27,59,43,0.18)' : 'rgba(27,59,43,0.04)',
          border: `1.5px solid rgba(162,191,166,0.25)`,
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: 'rgba(162,191,166,0.2)' }}
            >
              🪞
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: I, color: c.sage }}>
                Pattern Mirror
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 transition-opacity hover:opacity-40 mt-0.5"
            style={{ color: c.muted, lineHeight: 1 }}
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Observations */}
        <div className="flex flex-col gap-3">
          {observations.map(obs => (
            <div
              key={obs.id}
              className="flex items-start gap-3 px-4 py-3 rounded-2xl"
              style={{
                background: obs.type === 'positive'
                  ? 'rgba(162,191,166,0.12)'
                  : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(27,59,43,0.04)',
                borderLeft: `3px solid ${obs.type === 'positive' ? '#A2BFA6' : 'rgba(162,191,166,0.4)'}`,
              }}
            >
              <span className="flex-shrink-0 text-sm mt-0.5">
                {obs.type === 'positive' ? '✨' : '💭'}
              </span>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: I, color: c.body }}
              >
                {obs.message}
              </p>
            </div>
          ))}
        </div>

        <p
          className="text-xs mt-4 leading-relaxed"
          style={{ fontFamily: I, color: c.muted }}
        >
          Based on your recent reflections — descriptive only, never diagnostic.
        </p>
      </div>
    </section>
  )
}
