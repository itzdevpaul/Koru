import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSubscription } from '../context/SubscriptionContext'
import { activateSubscription } from '../firebase'

declare global {
  interface Window {
    squad: new (config: {
      key: string
      email: string
      amount: number
      currency_code: string
      transaction_ref: string
      onclose?: () => void
      oncomplete?: (resp: { transaction_ref: string; [k: string]: unknown }) => void
    }) => { setup: () => void; open: () => void }
  }
}

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Upgrade() {
  const { user } = useAuth()
  const { c } = useTheme()
  const { isPro, isExpired, daysLeft, refresh } = useSubscription()
  const navigate = useNavigate()

  const [initiating, setInitiating] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubscribe() {
    if (!user?.email) return
    setInitiating(true)
    setError('')

    try {
      // 1 — Get a transaction ref from the server
      const res = await fetch('/api/subscribe/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid }),
      })
      const { ref, error: initErr } = await res.json()
      if (initErr || !ref) { setError(initErr ?? 'Could not start payment.'); return }

      // 2 — Open Squad inline widget
      const publicKey = import.meta.env.VITE_SQUAD_PUBLIC_KEY as string
      // Squad CDN may expose the constructor as window.squad (lowercase) or window.Squad (uppercase)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SquadCtor = window.squad ?? (window as any).Squad ?? (window as any).SquadPay
      if (!publicKey || !SquadCtor) {
        setError('Payment widget not available. Please refresh and try again.')
        return
      }

      const widgetParams = {
        key: publicKey,
        email: user.email,
        amount: 250000, // ₦2,500 in kobo
        currency_code: 'NGN',
        transaction_ref: ref,
        environment: 'production',
      }
      console.log('[Koru] Squad widget params:', JSON.stringify({ ...widgetParams, key: publicKey.slice(0, 10) + '…' }))

      let widget: { setup: () => void; open: () => void }
      try {
        widget = new SquadCtor({
          ...widgetParams,
          onclose: () => { setInitiating(false) },
          oncomplete: async (resp) => {
            const txRef = resp.transaction_ref ?? ref
            setInitiating(false)
            setVerifying(true)
            try {
              const vRes = await fetch('/api/subscribe/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ref: txRef, uid: user.uid }),
              })
              const vData = await vRes.json()
              if (vData.verified) {
                await activateSubscription(user.uid, txRef)
                await refresh()
                setSuccess(true)
                setTimeout(() => navigate('/home'), 2500)
              } else {
                setError('Payment could not be verified. Contact support if you were charged.')
              }
            } catch {
              setError('Verification failed. Please try again.')
            } finally {
              setVerifying(false)
            }
          },
        })
      } catch (err) {
        const detail = err && typeof err === 'object' ? JSON.stringify(err) : String(err)
        console.error('[Koru] Squad constructor failed:', detail)
        setError('Could not initialise payment. This is likely a domain or key issue — check Squad dashboard.')
        setInitiating(false)
        return
      }

      try {
        widget.setup()
        widget.open()
      } catch (err) {
        const detail = err && typeof err === 'object' ? JSON.stringify(err) : String(err)
        console.error('[Koru] Squad setup/open failed:', detail)
        setError('Payment widget failed to open. Please try again.')
        setInitiating(false)
      }
    } catch (err) {
      console.error('[Koru] handleSubscribe error:', err)
      setError('Something went wrong. Please try again.')
      setInitiating(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: c.bg }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse" style={{ background: c.surface }}>🔄</div>
        <p className="text-sm font-medium" style={{ fontFamily: I, color: c.muted }}>Verifying your payment…</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: c.bg }}>
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl" style={{ background: 'rgba(162,191,166,0.25)' }}>✅</div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: F, color: c.forest }}>You're all set!</h1>
        <p className="text-sm" style={{ fontFamily: I, color: c.muted }}>Redirecting you to the dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      {/* Nav */}
      <header
        className="flex items-center justify-between px-5 sm:px-8 h-14"
        style={{ borderBottom: `1px solid ${c.navBorder}` }}
      >
        <Link
          to="/home"
          className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-60"
          style={{ fontFamily: I, color: c.muted }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm" style={{ background: '#1B3B2B' }}>🌿</div>
          <span className="text-sm font-bold" style={{ fontFamily: F, color: c.forest }}>Koru</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-14">
        {/* Hero */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(224,122,95,0.12)', color: '#E07A5F' }}
          >
            <span className="text-xs font-bold" style={{ fontFamily: I, letterSpacing: '0.05em' }}>KORU PRO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4" style={{ fontFamily: F, color: c.forest }}>
            Go deeper with Koru Pro
          </h1>
          <p className="text-base" style={{ fontFamily: I, color: c.body, lineHeight: 1.65 }}>
            Unlock full insights and exclusive 18+ relationship and intimacy quizzes.
          </p>
        </div>

        {/* Pricing card */}
        <div
          className="rounded-3xl p-7 sm:p-8 mb-6"
          style={{
            background: c.card,
            border: `1.5px solid ${c.cardBorder}`,
            boxShadow: '0 8px 40px rgba(27,59,43,0.08)',
          }}
        >
          {/* Price */}
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-bold" style={{ fontFamily: F, color: c.forest }}>₦2,500</span>
            <span className="text-sm mb-1.5" style={{ fontFamily: I, color: c.muted }}>/month</span>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-3.5 mb-8">
            {[
              { emoji: '🔒', text: 'Full access to all 18+ intimacy & sex quizzes' },
              { emoji: '📊', text: 'Complete results for every quiz — no more teasers' },
              { emoji: '🔗', text: 'Attachment style deep-dive' },
              { emoji: '🔥', text: 'Desire style & what truly turns you on' },
              { emoji: '💬', text: 'How you communicate about sex & intimacy' },
              { emoji: '✨', text: 'All future 18+ quizzes included automatically' },
            ].map(({ emoji, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-base mt-0.5 flex-shrink-0">{emoji}</span>
                <span className="text-sm leading-snug" style={{ fontFamily: I, color: c.body }}>{text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {isPro ? (
            <div className="flex flex-col gap-2">
              <div
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-center"
                style={{ fontFamily: F, background: 'rgba(162,191,166,0.25)', color: '#3a6b4a' }}
              >
                ✓ You are on Koru Pro
              </div>
              {daysLeft !== null && (
                <p className="text-center text-xs" style={{ fontFamily: I, color: c.muted }}>
                  {daysLeft} day{daysLeft === 1 ? '' : 's'} remaining — you'll receive a renewal reminder soon
                </p>
              )}
            </div>
          ) : isExpired ? (
            <div className="flex flex-col gap-2.5">
              <div
                className="w-full py-2.5 rounded-2xl text-xs font-semibold text-center"
                style={{ fontFamily: I, background: 'rgba(224,122,95,0.12)', color: '#c0513a' }}
              >
                ⚠️ Your subscription ended — you've lost access to 18+ quizzes
              </div>
              <button
                onClick={handleSubscribe}
                disabled={initiating}
                className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ fontFamily: F, background: '#1B3B2B' }}
              >
                {initiating ? 'Opening payment…' : 'Resubscribe for ₦2,500/month →'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={initiating}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ fontFamily: F, background: '#1B3B2B' }}
            >
              {initiating ? 'Opening payment…' : 'Subscribe for ₦2,500/month →'}
            </button>
          )}

          {error && (
            <p className="text-center text-xs mt-3" style={{ fontFamily: I, color: '#E07A5F' }}>{error}</p>
          )}
        </div>

        {/* Fine print */}
        <p className="text-center text-xs" style={{ fontFamily: I, color: c.muted, lineHeight: 1.7 }}>
          Billed monthly. Cancel any time by contacting{' '}
          <a href="mailto:hello@koru.com.ng" style={{ color: c.sage }}>hello@koru.com.ng</a>.
          Payments are processed securely via Squad.
        </p>
      </main>
    </div>
  )
}
