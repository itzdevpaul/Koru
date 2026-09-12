import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const items = [
  { label: 'Home', path: '/home' },
  { label: 'Journal', path: '/journal' },
  { label: 'Quizzes', path: '/roadmap' },
  { label: 'Support', path: '/assistant' },
  { label: 'Profile', path: '/profile' },
]

const searchable = [
  { title: 'Life-Stage Archetype Quiz', path: '/quiz/life-stage-archetype' },
  { title: 'Mood-to-Insight Tracker', path: '/mood-insights' },
  { title: 'Private Journal', path: '/journal' },
  { title: 'Reflection Assistant', path: '/assistant' },
  { title: 'Roadmap', path: '/roadmap' },
]

export default function MobileNavigation() {
  const { c } = useTheme()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  if (location.pathname === '/' || location.pathname.startsWith('/sign') || location.pathname.startsWith('/onboarding')) return null
  const results = searchable.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
  return <>
    {open && <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-4" role="dialog" aria-modal="true" aria-label="Search Koru">
      <div className="w-full rounded-3xl p-4 shadow-2xl" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
        <div className="flex items-center gap-2"><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Koru" aria-label="Search Koru" className="min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm" style={{ background: c.bg, color: c.forest, borderColor: c.cardBorder }} /><button onClick={() => setOpen(false)} className="rounded-xl border px-3 py-3 text-sm" style={{ color: c.forest, borderColor: c.cardBorder }}>Close</button></div>
        <div className="mt-3 grid gap-2">{results.map(item => <Link key={item.path} onClick={() => setOpen(false)} to={item.path} className="rounded-xl p-3 text-sm font-semibold" style={{ background: c.bg, color: c.forest }}>{item.title}</Link>)}</div>
        {!results.length && <p className="p-3 text-sm" style={{ color: c.muted }}>No matching tools yet.</p>}
      </div>
    </div>}
    <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2 shadow-xl md:hidden" style={{ background: c.card, border: `1px solid ${c.cardBorder}`, paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
      {items.map(item => <Link key={item.path} to={item.path} className="rounded-xl px-2 py-2 text-center text-[11px] font-semibold" style={{ color: location.pathname === item.path ? c.forest : c.muted }}>{item.label}</Link>)}
      <button onClick={() => setOpen(true)} aria-label="Search Koru" className="rounded-xl px-2 py-2 text-[11px] font-semibold" style={{ color: c.forest }}>Search</button>
    </div>
  </>
}
