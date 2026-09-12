import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { decryptText, encryptText, isEncrypted, type EncryptedPayload } from '../utils/crypto'
import { db } from '../firebase'
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, Timestamp, updateDoc } from 'firebase/firestore'

type JournalEntry = { id: string; title: string; content: string; createdAt: string; linkedQuizId?: string; linkedCheckInDate?: string; linkedIntention?: string }

export default function Journal() {
  const { user } = useAuth()
  const { c } = useTheme()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkedQuizId, setLinkedQuizId] = useState('')
  const [linkedCheckInDate, setLinkedCheckInDate] = useState('')
  const [linkedIntention, setLinkedIntention] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [message, setMessage] = useState('')
  const [insightError, setInsightError] = useState('')
  const [lastInsightEntry, setLastInsightEntry] = useState<JournalEntry | null>(null)
  const [recording, setRecording] = useState(false)
  const [voiceUrl, setVoiceUrl] = useState('')
  const [draftReady, setDraftReady] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const voiceChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (!user) return
    const draft = window.localStorage.getItem(`koru-journal-draft-${user.uid}`)
    if (draft) {
      try {
        const saved = JSON.parse(draft) as { title?: string; content?: string; linkedQuizId?: string; linkedCheckInDate?: string; linkedIntention?: string }
        setTitle(saved.title ?? '')
        setContent(saved.content ?? '')
        setLinkedQuizId(saved.linkedQuizId ?? '')
        setLinkedCheckInDate(saved.linkedCheckInDate ?? '')
        setLinkedIntention(saved.linkedIntention ?? '')
        setDraftReady(true)
      } catch { window.localStorage.removeItem(`koru-journal-draft-${user.uid}`) }
    }
    getDocs(query(collection(db, 'users', user.uid, 'journal'), orderBy('createdAt', 'desc'))).then(async snapshot => {
      const loaded = await Promise.all(snapshot.docs.map(async item => {
        const data = item.data()
        let text = String(data.content ?? '')
        if (isEncrypted(data.contentEnc)) text = (await decryptText(data.contentEnc as EncryptedPayload, user.uid)) ?? ''
        return { id: item.id, title: String(data.title ?? 'Untitled reflection'), content: text, createdAt: data.createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(), linkedQuizId: data.linkedQuizId, linkedCheckInDate: data.linkedCheckInDate, linkedIntention: data.linkedIntention }
      }))
      setEntries(loaded)
      setLoading(false)
    }).catch(() => { setMessage('Your journal could not be loaded.'); setLoading(false) })
  }, [user])

  useEffect(() => {
    if (!user || (!title && !content && !linkedQuizId && !linkedCheckInDate && !linkedIntention)) return
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(`koru-journal-draft-${user.uid}`, JSON.stringify({ title, content, linkedQuizId, linkedCheckInDate, linkedIntention }))
      setDraftReady(true)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [user, title, content, linkedQuizId, linkedCheckInDate, linkedIntention])

  async function toggleVoiceNote() {
    if (recording) {
      recorderRef.current?.stop()
      setRecording(false)
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || !('MediaRecorder' in window)) {
      setMessage('Voice notes are not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      voiceChunksRef.current = []
      recorder.ondataavailable = event => { if (event.data.size) voiceChunksRef.current.push(event.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
        const blob = new Blob(voiceChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        setVoiceUrl(current => { if (current) URL.revokeObjectURL(current); return URL.createObjectURL(blob) })
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setMessage('Recording locally. Stop when you are done, then listen back before saving.')
    } catch {
      setMessage('Microphone access was not granted.')
    }
  }

  async function saveEntry() {
    if (!user || !content.trim() || saving) return
    setSaving(true); setMessage('')
    try {
      const contentEnc = await encryptText(content.trim().slice(0, 5000), user.uid)
      if (!contentEnc) throw new Error('Secure storage is unavailable in this browser.')
      const data = { title: title.trim().slice(0, 120) || 'Untitled reflection', contentEnc, linkedQuizId: linkedQuizId.trim().slice(0, 120), linkedCheckInDate: linkedCheckInDate.trim().slice(0, 20), linkedIntention: linkedIntention.trim().slice(0, 300), createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
      const ref = await addDoc(collection(db, 'users', user.uid, 'journal'), data)
      setEntries(current => [{ id: ref.id, title: data.title, content: content.trim().slice(0, 5000), createdAt: new Date().toISOString(), linkedQuizId: data.linkedQuizId, linkedCheckInDate: data.linkedCheckInDate, linkedIntention: data.linkedIntention }, ...current])
      setTitle(''); setContent(''); setLinkedQuizId(''); setLinkedCheckInDate(''); setLinkedIntention(''); setDraftReady(false); window.localStorage.removeItem(`koru-journal-draft-${user.uid}`); setMessage('Saved privately on this account.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save your reflection.') } finally { setSaving(false) }
  }

  async function removeEntry(id: string) {
    if (!user || !window.confirm('Delete this journal entry permanently?')) return
    await deleteDoc(doc(db, 'users', user.uid, 'journal', id))
    setEntries(current => current.filter(entry => entry.id !== id))
    if (selectedId === id) { setSelectedId(null); setInsight('') }
  }

  async function analyzeEntry(entry: JournalEntry) {
    if (analyzing) return
    setAnalyzing(true); setInsight(''); setInsightError(''); setLastInsightEntry(entry)
    try {
      const token = await user?.getIdToken()
      const response = await fetch('/api/journal/insight', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ title: entry.title, content: entry.content, linkedQuizId: entry.linkedQuizId, linkedCheckInDate: entry.linkedCheckInDate, linkedIntention: entry.linkedIntention }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Insight unavailable.')
      setInsight(data.insight)
    } catch (error) { setInsight(''); setInsightError(error instanceof Error ? error.message : 'Journal insights are temporarily unavailable.'); } finally { setAnalyzing(false) }
  }

  if (loading) return <div className="min-h-screen grid place-items-center" style={{ background: c.bg, color: c.forest }}>Loading your journal…</div>
  return <main className="min-h-screen px-5 py-8 md:px-10" style={{ background: c.bg, color: c.forest }}>
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 flex items-start justify-between gap-4"><div><Link to="/home" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80" style={{ color: c.forest, background: c.card, border: `1px solid ${c.cardBorder}` }}><span aria-hidden="true">←</span> Back to Koru home</Link><p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: c.forest }}>Private journal</p><h1 className="mt-2 text-4xl font-bold" style={{ color: c.forest }}>Hear yourself clearly.</h1><p className="mt-3 max-w-xl leading-7" style={{ color: c.muted }}>Write freely, connect a reflection to what you are learning, and ask Koru for an optional pattern summary only when you choose.</p></div><div className="rounded-2xl px-4 py-3 text-right text-xs" style={{ background: c.card, color: c.muted }}>Encrypted at rest<br /><strong style={{ color: c.forest }}>Private by default</strong></div></header>
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl p-6" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}><h2 className="text-xl font-bold">New reflection</h2><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give this reflection a title" className="mt-5 w-full rounded-xl border px-4 py-3 outline-none" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /><textarea value={content} onChange={e => setContent(e.target.value.slice(0, 5000))} maxLength={5000} placeholder="What is present for you today?" rows={9} className="mt-3 w-full resize-y rounded-xl border px-4 py-3 leading-6 outline-none" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /><div className="mt-1 flex justify-between text-xs" style={{ color: c.muted }}><span>{draftReady ? 'Draft saved on this device' : 'Draft not saved yet'}</span><span>{content.length}/5000</span></div><div className="mt-3 flex flex-wrap items-center gap-3"><button type="button" onClick={toggleVoiceNote} className="rounded-xl border px-3 py-2 text-sm font-semibold" style={{ borderColor: c.cardBorder, color: c.forest }}>{recording ? 'Stop voice note' : 'Record voice note'}</button>{voiceUrl && <audio controls src={voiceUrl} className="h-9" aria-label="Recorded voice note" />}<span className="text-xs" style={{ color: c.muted }}>Audio is kept in this session only.</span></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><input value={linkedQuizId} onChange={e => setLinkedQuizId(e.target.value)} placeholder="Quiz or result" className="rounded-xl border px-3 py-2 text-sm" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /><input value={linkedCheckInDate} onChange={e => setLinkedCheckInDate(e.target.value)} placeholder="Check-in date" className="rounded-xl border px-3 py-2 text-sm" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /><input value={linkedIntention} onChange={e => setLinkedIntention(e.target.value)} placeholder="Future-self intention" className="rounded-xl border px-3 py-2 text-sm" style={{ background: c.bg, borderColor: c.cardBorder, color: c.forest }} /></div><button onClick={saveEntry} disabled={saving || !content.trim()} className="mt-5 rounded-xl px-5 py-3 font-semibold disabled:opacity-50" style={{ background: c.forest, color: '#fff' }}>{saving ? 'Saving…' : 'Save privately'}</button>{message && <p className="mt-3 text-sm" style={{ color: c.muted }}>{message}</p>}</div>
        <div><h2 className="mb-3 text-xl font-bold">Your reflections</h2>{entries.length === 0 ? <div className="rounded-3xl p-6" style={{ background: c.card, color: c.muted }}>Your first page is waiting. Start with one honest sentence.</div> : <div className="space-y-3">{entries.map(entry => <article key={entry.id} className="rounded-2xl p-5" style={{ background: c.card, border: `1px solid ${selectedId === entry.id ? c.forest : c.cardBorder}` }}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{entry.title}</h3><time className="text-xs" style={{ color: c.muted }}>{new Date(entry.createdAt).toLocaleDateString()}</time></div><button onClick={() => removeEntry(entry.id)} className="text-xs" style={{ color: c.muted }}>Delete</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6" style={{ color: c.muted }}>{entry.content}</p>{(entry.linkedQuizId || entry.linkedCheckInDate || entry.linkedIntention) && <p className="mt-3 text-xs" style={{ color: c.forest }}>Linked: {[entry.linkedQuizId, entry.linkedCheckInDate, entry.linkedIntention].filter(Boolean).join(' · ')}</p>}<button onClick={() => { setSelectedId(entry.id); void analyzeEntry(entry) }} disabled={analyzing} className="mt-4 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: c.cardBorder, color: c.forest }}>{analyzing && selectedId === entry.id ? 'Reflecting…' : insightError && selectedId === entry.id ? 'Try insight again' : 'Analyze this entry'}</button>{selectedId === entry.id && insight && <div className="mt-4 rounded-2xl p-4 text-sm leading-6" style={{ background: c.bg, color: c.forest }}><strong>Optional Koru insight</strong><p className="mt-2 whitespace-pre-wrap">{insight}</p></div>}{selectedId === entry.id && insightError && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 text-sm" style={{ background: '#FCE8E6', color: '#8F3D3D' }}><span>{insightError}</span><button type="button" onClick={() => analyzeEntry(lastInsightEntry ?? entry)} className="rounded-xl px-3 py-2 font-semibold" style={{ background: c.forest, color: '#fff' }}>Try again</button></div>}</article>)}</div>}</div>
      </section>
    </div>
  </main>
}
