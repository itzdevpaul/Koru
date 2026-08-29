import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logOut } from '../firebase'

const IDLE_TIMEOUT = 15 * 60 * 1000  // 15 minutes
const WARNING_TIMEOUT = 14 * 60 * 1000 // warning at 14 minutes
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove', 'keydown', 'click', 'touchstart', 'scroll',
]

/**
 * Auto-logout on inactivity. Signs the user out after 15 minutes of no
 * interaction, protecting them if they hand their unlocked phone to a friend.
 * Only active for authenticated users.
 */
export default function IdleTimer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningShown = useRef(false)

  useEffect(() => {
    if (!user) return

    function signOutIdle() {
      void logOut().finally(() => navigate('/signin', { replace: true }))
    }

    function showWarning() {
      if (warningShown.current) return
      warningShown.current = true
      // Lightweight in-page toast
      const toast = document.createElement('div')
      toast.dataset.koruIdle = 'true'
      toast.style.cssText = [
        'position:fixed', 'bottom:24px', 'left:50%', 'transform:translateX(-50%)',
        'background:#1B3B2B', 'color:#FBF9F5', 'padding:14px 24px', 'border-radius:16px',
        'font-family:Inter,sans-serif', 'font-size:14px', 'font-weight:600',
        'z-index:9999', 'box-shadow:0 8px 32px rgba(0,0,0,0.2)',
        'max-width:90vw', 'text-align:center',
      ].join(';')
      toast.textContent = "You'll be signed out in 1 minute due to inactivity. Tap anywhere to stay."
      document.body.appendChild(toast)

      // Remove on any interaction
      const removeToast = () => {
        toast.remove()
        warningShown.current = false
        resetTimers()
      }
      ACTIVITY_EVENTS.forEach(evt => window.addEventListener(evt, removeToast, { once: true, passive: true }))
      setTimeout(() => toast.remove(), 60_000)
    }

    function resetTimers() {
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (warningTimer.current) clearTimeout(warningTimer.current)
      warningTimer.current = setTimeout(showWarning, WARNING_TIMEOUT)
      idleTimer.current = setTimeout(signOutIdle, IDLE_TIMEOUT)
    }

    // Reset on any user activity
    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, resetTimers, { passive: true }),
    )
    resetTimers()

    return () => {
      ACTIVITY_EVENTS.forEach(evt =>
        window.removeEventListener(evt, resetTimers),
      )
      if (idleTimer.current) clearTimeout(idleTimer.current)
      if (warningTimer.current) clearTimeout(warningTimer.current)
      document.querySelector('[data-koru-idle]')?.remove()
    }
  }, [user, navigate])

  return null
}
