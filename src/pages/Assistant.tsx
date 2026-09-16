import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

type Message = { role: 'user' | 'assistant'; content: string }

function cleanAssistantText(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/^#{1,6}\s*/gm, '').replace(/^\s*[-•]\s*/gm, '').replace(/\n{3,}/g, '\n\n').trim()
}

export default function Assistant() {
  const { user } = useAuth()
  const { c } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<number, 'helpful' | 'not-helpful'>>({})
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  async function copyMessage(content: string, index: number) {
    await navigator.clipboard?.writeText(content)
    setCopiedIndex(index)
    window.setTimeout(() => setCopiedIndex(null), 1800)
  }

  async function send(event: FormEvent, retryText?: string) {
    event.preventDefault()
    const text = (retryText ?? input).trim()
    if (!text || loading) return
    if (!navigator.onLine) {
      setError('You are offline. Reconnect before sending this message.')
      setLastFailedMessage(text)
      return
    }

    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setError('')
    setLoading(true)
    try {
      const token = await user?.getIdToken()
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messages: next }),
      })
      const data = await response.json() as { message?: string; error?: string }
      if (!response.ok) throw new Error(data.error ?? 'The assistant is unavailable.')
      setLastFailedMessage(null)
      setMessages(current => [...current, { role: 'assistant', content: cleanAssistantText(data.message ?? '') }])
    } catch (err) {
      setLastFailedMessage(text)
      setError(err instanceof Error ? err.message : 'The assistant is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="min-h-screen px-5 py-8 md:px-10" style={{ background: c.bg, color: c.forest }}>
    <div className="mx-auto flex max-w-3xl flex-col" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <header className="mb-8"><Link to="/home" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:opacity-80" style={{ color: c.forest, background: c.card, border: `1px solid ${c.cardBorder}` }}><span aria-hidden="true">←</span> Back to Koru home</Link><p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: c.forest }}>Koru assistant</p><h1 className="mt-2 text-4xl font-bold">Think it through.</h1><p className="mt-3 max-w-xl leading-7" style={{ color: c.muted }}>Tell me what happened. I&apos;ll help you see the situation clearly and offer a few paths without choosing for you.</p><p className="mt-3 text-xs" style={{ color: c.muted }}>This is reflection support, not therapy or emergency care. If you are in immediate danger, call 112.</p></header>
      <section className="flex flex-1 flex-col rounded-3xl p-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
        <div className="flex-1 space-y-4 overflow-y-auto pb-5">
          {messages.length === 0 && <div className="rounded-2xl p-5" style={{ background: c.bg, color: c.muted }}><p className="font-semibold" style={{ color: c.forest }}>Start with the facts.</p><p className="mt-2 text-sm leading-6">What happened, and what do you need most right now: clarity, a next step, or simply somewhere to say it?</p></div>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl p-4 leading-7 ${message.role === 'user' ? 'ml-auto' : ''}`} style={{ background: message.role === 'user' ? c.forest : c.bg, color: message.role === 'user' ? '#fff' : c.forest }}><p>{message.content}</p>{message.role === 'assistant' && <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: c.cardBorder }}><button type="button" onClick={() => void copyMessage(message.content, index)} className="rounded-lg border px-2 py-1 text-xs font-semibold" style={{ color: c.forest, borderColor: c.cardBorder }}>{copiedIndex === index ? 'Copied' : 'Copy'}</button><button type="button" onClick={() => setFeedback(current => ({ ...current, [index]: 'helpful' }))} className="rounded-lg border px-2 py-1 text-xs" style={{ color: c.forest, borderColor: c.cardBorder }}>{feedback[index] === 'helpful' ? 'Thanks' : 'Helpful'}</button><button type="button" onClick={() => setFeedback(current => ({ ...current, [index]: 'not-helpful' }))} className="rounded-lg border px-2 py-1 text-xs" style={{ color: c.muted, borderColor: c.cardBorder }}>{feedback[index] === 'not-helpful' ? 'Noted' : 'Not helpful'}</button></div>}</div>)}
          {loading && <div className="rounded-2xl p-4" style={{ background: c.bg, color: c.muted }}>Thinking through that…</div>}
        </div>
        {messages.length === 0 && <div className="mb-3 flex flex-wrap gap-2"><button type="button" onClick={() => setInput('I need help understanding what I am feeling.')} className="rounded-xl border px-3 py-2 text-xs font-semibold" style={{ color: c.forest, borderColor: c.cardBorder }}>Understand my feelings</button><button type="button" onClick={() => setInput('Help me think through my next step.')} className="rounded-xl border px-3 py-2 text-xs font-semibold" style={{ color: c.forest, borderColor: c.cardBorder }}>Find a next step</button></div>}
        {error && <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm" style={{ color: '#8F3D3D', background: '#FCE8E6' }}><span>{error}</span>{lastFailedMessage && <button type="button" onClick={event => void send(event, lastFailedMessage)} className="rounded-xl px-3 py-2 font-semibold" style={{ background: c.forest, color: c.bg }}>Try again</button>}</div>}
        <form onSubmit={send} className="flex gap-3 border-t pt-4" aria-label="Send a message to Koru assistant" style={{ borderColor: c.cardBorder }}><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); void send(event) } }} rows={2} maxLength={4000} placeholder="What happened?" aria-label="Your message" className="min-w-0 flex-1 resize-none rounded-2xl border px-4 py-3 outline-none" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /><button type="submit" disabled={loading || !input.trim()} className="self-end rounded-2xl px-5 py-3 font-semibold disabled:opacity-50" style={{ background: c.forest, color: '#fff' }}>Send</button></form>
      </section>
    </div>
  </main>
}
