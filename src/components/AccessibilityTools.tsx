import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'

export default function AccessibilityTools() {
  const { c } = useTheme()
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [largeText, setLargeText] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setLargeText(window.localStorage.getItem('koru-large-text') === 'true')
    setReducedMotion(window.localStorage.getItem('koru-reduced-motion') === 'true')
    setReady(true)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.largeText = String(largeText)
    document.documentElement.dataset.reducedMotion = String(reducedMotion)
    if (!ready) return
    window.localStorage.setItem('koru-large-text', String(largeText))
    window.localStorage.setItem('koru-reduced-motion', String(reducedMotion))
  }, [largeText, reducedMotion])

  if (!ready) return null

  return <div className="fixed bottom-24 left-4 z-40 md:bottom-5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
    {open && <div className="mb-2 w-56 rounded-2xl p-4 shadow-lg" style={{ background: c.card, border: `1px solid ${c.cardBorder}`, color: c.forest }}>
      <p className="text-sm font-bold">Reading preferences</p>
      <label className="mt-3 flex items-center justify-between gap-3 text-xs"><span>Larger text</span><input type="checkbox" checked={largeText} onChange={event => setLargeText(event.target.checked)} /></label>
      <label className="mt-3 flex items-center justify-between gap-3 text-xs"><span>Reduce motion</span><input type="checkbox" checked={reducedMotion} onChange={event => setReducedMotion(event.target.checked)} /></label>
    </div>}
    <button type="button" aria-expanded={open} aria-label="Open reading preferences" onClick={() => setOpen(value => !value)} className="rounded-full px-4 py-3 text-xs font-bold shadow-lg" style={{ background: c.forest, color: c.bg }}>Aa</button>
  </div>
}
