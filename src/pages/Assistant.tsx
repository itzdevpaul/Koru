import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

type Message = { role: 'user' | 'assistant'; content: string }

export default function Assistant() {
  const { user } = useAuth()
  const { c } = useTheme()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function send(event: FormEvent) {
    event.preventDefault()
    const text = input.trim()
    if (!text || loading) return
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
      setMessages(current => [...current, { role: 'assistant', content: data.message ?? '' }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The assistant is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="min-h-screen px-5 py-8 md:px-10" style={{ background: c.bg, color: c.forest }}>
    <div className="mx-auto flex max-w-3xl flex-col" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <header className="mb-8"><Link to="/home" style={{ color: c.muted }}>Back home</Link><p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: c.forest }}>Koru assistant</p><h1 className="mt-2 text-4xl font-bold">Think it through.</h1><p className="mt-3 max-w-xl leading-7" style={{ color: c.muted }}>Tell me what happened. I&apos;ll help you see the situation clearly and offer a few paths without choosing for you.</p><p className="mt-3 text-xs" style={{ color: c.muted }}>This is reflection support, not therapy or emergency care. If you are in immediate danger, call 112.</p></header>
      <section className="flex flex-1 flex-col rounded-3xl p-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
        <div className="flex-1 space-y-4 overflow-y-auto pb-5">
          {messages.length === 0 && <div className="rounded-2xl p-5" style={{ background: c.bg, color: c.muted }}>Tell me what happened — take your time, I want the actual picture, not just the headline.</div>}
          {messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[88%] rounded-2xl p-4 leading-7 ${message.role === 'user' ? 'ml-auto' : ''}`} style={{ background: message.role === 'user' ? c.forest : c.bg, color: message.role === 'user' ? '#fff' : c.forest }}>{message.content}</div>)}
          {loading && <div className="rounded-2xl p-4" style={{ background: c.bg, color: c.muted }}>Thinking through that…</div>}
        </div>
        {error && <p className="mb-3 text-sm" style={{ color: '#B54747' }}>{error}</p>}
        <form onSubmit={send} className="flex gap-3 border-t pt-4" style={{ borderColor: c.cardBorder }}><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); void send(event) } }} rows={2} maxLength={4000} placeholder="What happened?" className="min-w-0 flex-1 resize-none rounded-2xl border px-4 py-3 outline-none" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /><button type="submit" disabled={loading || !input.trim()} className="self-end rounded-2xl px-5 py-3 font-semibold disabled:opacity-50" style={{ background: c.forest, color: '#fff' }}>Send</button></form>
      </section>
    </div>
  </main>
}
