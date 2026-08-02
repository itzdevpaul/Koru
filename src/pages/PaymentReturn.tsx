import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { activateSubscription } from '../firebase'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function PaymentReturn() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verify() {
      // Squad redirects back with transaction_ref or squadRef in the URL.
      // Fall back to sessionStorage in case URL params differ.
      const ref =
        searchParams.get('transaction_ref') ??
        searchParams.get('squadRef') ??
        sessionStorage.getItem('koru-payment-ref')

      const uid = user?.uid ?? sessionStorage.getItem('koru-payment-uid')

      if (!ref || !uid) {
        setStatus('error')
        setMessage('Payment reference not found. If you were charged, contact hello@koru.com.ng.')
        return
      }

      try {
        const res = await fetch('/api/subscribe/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ref, uid }),
        })
        const data = await res.json()

        if (data.verified) {
          await activateSubscription(uid, ref)
          sessionStorage.removeItem('koru-payment-ref')
          sessionStorage.removeItem('koru-payment-uid')
          setStatus('success')
          setTimeout(() => navigate('/home'), 2500)
        } else {
          setStatus('error')
          setMessage('Payment could not be verified. If you were charged, contact hello@koru.com.ng.')
        }
      } catch {
        setStatus('error')
        setMessage('Verification failed. Please contact hello@koru.com.ng.')
      }
    }

    verify()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FBF9F5' }}>
        <div className="w-12 h-12 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(162,191,166,0.3)', borderTopColor: '#1B3B2B' }} />
        <p className="text-sm font-medium" style={{ fontFamily: I, color: '#7a9a86' }}>Verifying your payment…</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#FBF9F5' }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl" style={{ background: 'rgba(162,191,166,0.25)' }}>✅</div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: F, color: '#1B3B2B' }}>You're all set!</h1>
        <p className="text-sm" style={{ fontFamily: I, color: '#7a9a86' }}>Redirecting you to the dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4" style={{ background: '#FBF9F5' }}>
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl" style={{ background: 'rgba(224,122,95,0.12)' }}>⚠️</div>
      <h1 className="text-xl font-bold text-center" style={{ fontFamily: F, color: '#1B3B2B' }}>Payment verification failed</h1>
      <p className="text-sm text-center max-w-sm" style={{ fontFamily: I, color: '#7a9a86', lineHeight: 1.65 }}>{message}</p>
      <Link
        to="/upgrade"
        className="px-6 py-3 rounded-2xl text-sm font-semibold text-white"
        style={{ fontFamily: F, background: '#1B3B2B' }}
      >
        Try again →
      </Link>
    </div>
  )
}
