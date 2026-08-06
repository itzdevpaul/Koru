import { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { generateFutureSelfImage, shareOrDownloadImage } from '../utils/shareImage'
import type { SavedQuizResult } from '../firebase'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

interface Props {
  mode: 'surface' | 'prompt'
  intention?: string
  intentionDate?: string
  results?: SavedQuizResult[]
  streak?: number
  onDismiss: () => void
  onSaveNew: (text: string) => Promise<void>
  onMarkSurfaced?: () => void
}

export default function FutureSelfCard({
  mode,
  intention,
  intentionDate,
  results = [],
  streak = 0,
  onDismiss,
  onSaveNew,
  onMarkSurfaced,
}: Props) {
  const { c, isDark } = useTheme()
  const [phase, setPhase] = useState<'view' | 'write'>('view')
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareMsg, setShareMsg] = useState('')

  async function handleSave() {
    if (!text.trim()) return
    setSaving(true)
    await onSaveNew(text.trim())
    setSaving(false)
  }

  async function handleShare() {
    if (!intention || sharing) return
    setSharing(true)
    setShareMsg('')
    try {
      const blob = await generateFutureSelfImage({
        intention,
        intentionDate: intentionDate ?? 'a while ago',
        results: results.slice(0, 4).map(r => ({ emoji: r.resultEmoji, title: r.resultTitle })),
        streak,
      })
      const outcome = await shareOrDownloadImage(blob, 'koru-future-self.png', 'My Koru Future Self check-in')
      if (outcome === 'downloaded') { setShareMsg('Image saved!') }
      else if (outcome === 'error') { setShareMsg('Unable to save — try again.') }
      setTimeout(() => setShareMsg(''), 3000)
    } catch {
      setShareMsg('Something went wrong.')
      setTimeout(() => setShareMsg(''), 3000)
    } finally {
      setSharing(false)
    }
  }

  // ── Prompt mode ───────────────────────────────────────────────────────────
  if (mode === 'prompt') {
    return (
      <section className="mb-8 animate-fade-up">
        <div
          className="rounded-3xl p-6"
          style={{
            background: isDark
              ? 'rgba(27,59,43,0.14)'
              : 'linear-gradient(135deg, rgba(27,59,43,0.05) 0%, rgba(162,191,166,0.1) 100%)',
            border: `1.5px solid rgba(162,191,166,0.3)`,
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🔮</span>
              <div>
                <p className="text-sm font-bold" style={{ fontFamily: F, color: c.forest }}>
                  A letter to your future self
                </p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ fontFamily: I, color: c.body }}>
                  What do you want for yourself 3 months from now?
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 transition-opacity hover:opacity-40"
              style={{ color: c.muted, lineHeight: 1 }}
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I want to feel more settled in my career, have one honest conversation I've been avoiding…"
            maxLength={500}
            rows={3}
            className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none mb-3"
            style={{
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.7)',
              border: `1.5px solid rgba(162,191,166,0.3)`,
              fontFamily: I,
              color: c.forest,
              lineHeight: 1.65,
            }}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={!text.trim() || saving}
              className="py-2.5 px-5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              style={{ fontFamily: F, background: '#1B3B2B' }}
            >
              {saving ? 'Sealing…' : 'Seal it for 3 months →'}
            </button>
            <button
              onClick={onDismiss}
              className="text-sm transition-opacity hover:opacity-60"
              style={{ fontFamily: I, color: c.muted }}
            >
              Maybe later
            </button>
          </div>
          <p className="text-xs mt-3" style={{ fontFamily: I, color: c.muted }}>
            We'll surface this in 90 days, next to who you are then.
          </p>
        </div>
      </section>
    )
  }

  // ── Surface mode ──────────────────────────────────────────────────────────
  return (
    <section className="mb-8 animate-fade-up">
      <div
        className="rounded-3xl overflow-hidden"
        style={{ border: `1.5px solid rgba(162,191,166,0.4)`, boxShadow: `0 8px 32px rgba(27,59,43,0.08)` }}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ fontFamily: I, color: '#A2BFA6' }}>
                Future Self Check-in · {intentionDate}
              </p>
              <p className="text-sm font-semibold leading-relaxed" style={{ fontFamily: F, color: 'rgba(255,255,255,0.9)' }}>
                You wrote this to yourself:
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-50"
              style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1 }}
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <blockquote
            className="mt-3 px-4 py-3 rounded-2xl text-sm leading-relaxed italic"
            style={{ fontFamily: I, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.07)', borderLeft: '3px solid #A2BFA6' }}
          >
            "{intention}"
          </blockquote>
        </div>

        {/* Body */}
        <div className="px-6 py-5" style={{ background: isDark ? 'rgba(27,59,43,0.18)' : '#fff' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ fontFamily: I, color: c.sage }}>
            Who you are now
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {streak > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(162,191,166,0.2)', color: c.forest, fontFamily: I }}>
                🔥 {streak}-day streak
              </span>
            )}
            {results.slice(0, 3).map(r => (
              <span key={r.id} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: c.surface, color: c.body, fontFamily: I }}>
                {r.resultEmoji} {r.resultTitle}
              </span>
            ))}
            {results.length === 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: c.surface, color: c.muted, fontFamily: I }}>
                Take a quiz to see your profile →
              </span>
            )}
          </div>

          {phase === 'view' && (
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold transition-all duration-200 hover:opacity-80 active:scale-95 disabled:opacity-50"
                style={{ fontFamily: F, background: c.surface, color: c.forest, border: `1.5px solid ${c.cardBorder}` }}
              >
                {sharing ? (
                  <>
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" strokeLinecap="round" />
                    </svg>
                    Creating image…
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 15 15" fill="none">
                      <path d="M10.5 2.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM4.5 6.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm6 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM6 8.5l3-1.5M9 9l-3 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    Save as image
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setPhase('write')
                  onMarkSurfaced?.()
                }}
                className="py-2 px-4 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ fontFamily: F, background: '#1B3B2B' }}
              >
                Write a new one →
              </button>
              <button
                onClick={() => {
                  onMarkSurfaced?.()
                  onDismiss()
                }}
                className="text-xs transition-opacity hover:opacity-60"
                style={{ fontFamily: I, color: c.muted }}
              >
                Reflect quietly
              </button>
            </div>
          )}

          {shareMsg && (
            <p className="text-xs mt-2" style={{ fontFamily: I, color: c.muted }}>{shareMsg}</p>
          )}

          {phase === 'write' && (
            <div>
              <p className="text-sm font-semibold mb-2" style={{ fontFamily: F, color: c.forest }}>
                What do you want for yourself 3 months from now?
              </p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Write to the person you're still becoming…"
                maxLength={500}
                rows={3}
                className="w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none mb-3"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : c.surface,
                  border: `1.5px solid ${c.cardBorder}`,
                  fontFamily: I,
                  color: c.forest,
                  lineHeight: 1.65,
                }}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={!text.trim() || saving}
                  className="py-2.5 px-5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                  style={{ fontFamily: F, background: '#1B3B2B' }}
                >
                  {saving ? 'Sealing…' : 'Seal it for 3 months →'}
                </button>
                <button
                  onClick={onDismiss}
                  className="text-sm transition-opacity hover:opacity-60"
                  style={{ fontFamily: I, color: c.muted }}
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
