import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function OfflineStatus() {
  const { user } = useAuth()
  const { c } = useTheme()
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => { const on = () => setOnline(true); const off = () => setOnline(false); window.addEventListener('online', on); window.addEventListener('offline', off); return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) } }, [])
  if (online) return null
  return <div role="status" className="fixed inset-x-0 top-0 z-50 px-4 py-2 text-center text-xs font-semibold" style={{ background: c.forest, color: '#fff' }}>{user ? 'You are offline. Your Koru changes will sync when you reconnect.' : 'You need a connection to sign in or create a Koru account.'}</div>
}
