import { useEffect, useState } from 'react'
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
  const { c, isDark } = useTheme()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    const stored = window.localStorage.getItem('koru-recent-pages')
    setRecent(stored ? JSON.parse(stored) : [])
  }, [location.pathname])

  useEffect(() => {
    if (location.pathname === '/' || location.pathname.startsWith('/sign') || location.pathname.startsWith('/onboarding')) return
    const next = [location.pathname, ...recent.filter(path => path !== location.pathname)].slice(0, 4)
    setRecent(next)
    window.localStorage.setItem('koru-recent-pages', JSON.stringify(next))
  }, [location.pathname])

  if (location.pathname === '/' || location.pathname.startsWith('/sign') || location.pathname.startsWith('/onboarding')) return null
  const results = searchable.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
  return <>
    {open && <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-4" role="dialog" aria-modal="true" aria-label="Search Koru">
      <div className="w-full rounded-3xl p-4 shadow-2xl" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
        <div className="flex items-center gap-2"><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Koru" aria-label="Search Koru" className="min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm" style={{ background: c.bg, color: c.forest, borderColor: c.cardBorder }} /><button onClick={() => setOpen(false)} className="rounded-xl border px-3 py-3 text-sm" style={{ color: c.forest, borderColor: c.cardBorder }}>Close</button></div>
        {recent.length > 0 && !query && <div className="mt-4"><p className="px-1 text-xs font-semibold uppercase tracking-wider" style={{ color: c.muted }}>Recent</p><div className="mt-2 grid gap-2">{recent.map(path => { const item = searchable.find(entry => entry.path === path); return item ? <Link key={`recent-${path}`} onClick={() => setOpen(false)} to={item.path} className="rounded-xl p-3 text-sm" style={{ background: c.bg, color: c.forest }}>{item.title}</Link> : null })}</div></div>}
        <div className="mt-3 grid gap-2">{results.map(item => <Link key={item.path} onClick={() => setOpen(false)} to={item.path} className="rounded-xl p-3 text-sm font-semibold" style={{ background: c.bg, color: c.forest }}>{item.title}</Link>)}</div>
        {!results.length && <p className="p-3 text-sm" style={{ color: c.muted }}>No matching tools yet.</p>}
      </div>
    </div>}
    <p className="sr-only" aria-live="polite">Current page: {location.pathname.replace('/', '') || 'home'}</p>
    <nav data-mobile-nav aria-label="Primary navigation" className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl px-2 py-2 shadow-xl backdrop-blur-xl md:hidden" style={{ background: isDark ? 'rgba(20, 43, 31, 0.96)' : 'rgba(255, 255, 255, 0.96)', border: `1px solid ${c.cardBorder}`, paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}>
      {items.map(item => <Link key={item.path} to={item.path} aria-current={location.pathname === item.path ? 'page' : undefined} className="rounded-xl px-2 py-2 text-center text-[11px] font-semibold transition-colors" style={{ color: location.pathname === item.path ? c.forest : c.muted, background: location.pathname === item.path ? c.surface : 'transparent' }}>{item.label}</Link>)}
      <button onClick={() => setOpen(true)} aria-label="Search Koru" className="rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors" style={{ color: c.forest, background: open ? c.surface : 'transparent' }}>Search</button>
    </nav>
  </>
}
