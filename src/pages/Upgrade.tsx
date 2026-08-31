import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSubscription } from '../context/SubscriptionContext'
import { getPricing, validatePromoCode, type Pricing } from '../firebase'
import { resetFunnelTracking, trackUpgradePageView, trackUpgradeScroll, trackPriceSeen, trackCtaClick, trackBounce } from '../utils/funnelEvents'
import KoruLogo from '../components/KoruLogo'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function Upgrade() {
  const { user } = useAuth()
  const { isDark, c } = useTheme()
  const { isPro, isExpired, daysLeft } = useSubscription()

  const [initiating, setInitiating] = useState(false)
  const [error, setError] = useState('')
  const [pricing, setPricing] = useState<Pricing | null>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoChecking, setPromoChecking] = useState(false)
  const [promoApplied, setPromoApplied] = useState('')

  useEffect(() => {
    if (!user) return
    getPricing().then(setPricing).catch(() => {})
    // Funnel: track page view
    resetFunnelTracking()
    trackUpgradePageView()
    // Funnel: track bounce on unmount if no CTA click
    return () => trackBounce()
  }, [user])

  // Funnel: track scroll depth
  useEffect(() => {
    const onScroll = () => trackUpgradeScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Funnel: track price seen (when price enters viewport)
  useEffect(() => {
    const el = priceRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) trackPriceSeen() },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [pricing])

  async function handleApplyPromo() {
    if (!user || !promoInput.trim()) return
    setPromoChecking(true)
    setError('')
    try {
      const result = await validatePromoCode(promoInput)
      if (result.valid) {
        setPromoApplied(promoInput.trim().toUpperCase())
        const newPricing = await getPricing(promoInput.trim().toUpperCase())
        setPricing(newPricing)
      } else {
        setError(result.error ?? 'Invalid promo code.')
        setPromoApplied('')
        const resetPricing = await getPricing()
        setPricing(resetPricing)
      }
    } catch {
      setError('Could not validate promo code.')
    } finally {
      setPromoChecking(false)
    }
  }

  async function handleSubscribe() {
    if (!user?.email) return
    trackCtaClick(pricing?.finalAmount)
    setInitiating(true)
    setError('')

    try {
      const res = await fetch('/api/subscribe/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify({ uid: user.uid, email: user.email, origin: window.location.origin, ...(promoApplied ? { promoCode: promoApplied } : {}) }),
      })
      const data = await res.json()
      if (!res.ok || !data.checkout_url) {
        setError(data.error ?? 'Could not start payment. Please try again.')
        setInitiating(false)
        return
      }
      // Store ref in sessionStorage so PaymentReturn can verify even if URL params differ
      sessionStorage.setItem('koru-payment-ref', data.ref)
      sessionStorage.setItem('koru-payment-uid', user.uid)
      // Redirect to Squad-hosted checkout — works from any domain, no CDN widget needed
      window.location.href = data.checkout_url
    } catch {
      setError('Something went wrong. Please try again.')
      setInitiating(false)
    }
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
          <KoruLogo size={22} tone={isDark ? 'paper' : 'ink'} wordmarkSize={15} />
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
          <div ref={priceRef} className="flex items-end gap-2 mb-2">
            {pricing && pricing.discountPercent > 0 ? (
              <>
                <span className="text-4xl font-bold" style={{ fontFamily: F, color: c.forest }}>
                  ₦{pricing.finalAmount.toLocaleString()}
                </span>
                <span className="text-lg mb-1.5 line-through" style={{ fontFamily: I, color: c.muted }}>
                  ₦{pricing.baseAmount.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold" style={{ fontFamily: F, color: c.forest }}>₦2,500</span>
            )}
            <span className="text-sm mb-1.5" style={{ fontFamily: I, color: c.muted }}>/month</span>
          </div>
          {pricing && pricing.discountPercent > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-6" style={{ background: 'rgba(162,191,166,0.2)' }}>
              <span className="text-xs font-bold" style={{ fontFamily: I, color: '#3a6b4a' }}>
                {pricing.discountPercent}% OFF — {pricing.discountReason}
              </span>
            </div>
          )}

          {/* Features */}
          <ul className="flex flex-col gap-3.5 mb-8">
            {[
              { emoji: '🚫', text: 'No ads — ever. A completely clean experience.' },
              { emoji: '🔒', text: 'Full access to all 18+ intimacy & sex quizzes' },
              { emoji: '🧭', text: 'Relationship, boundary & mindset diagnostics' },
              { emoji: '📊', text: 'Complete results for every quiz — no more teasers' },
              { emoji: '🔗', text: 'Attachment style deep-dive' },
              { emoji: '🔥', text: 'Desire style & what truly turns you on' },
              { emoji: '💬', text: 'How you communicate about sex & intimacy' },
              { emoji: '✨', text: 'All future Pro quizzes included automatically' },
            ].map(({ emoji, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-base mt-0.5 flex-shrink-0">{emoji}</span>
                <span className="text-sm leading-snug" style={{ fontFamily: I, color: c.body }}>{text}</span>
              </li>
            ))}
          </ul>

          {/* Promo code */}
          {!isPro && (
            <div className="mb-6">
              {promoApplied ? (
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: 'rgba(162,191,166,0.15)', border: '1px solid rgba(162,191,166,0.3)' }}>
                  <span className="text-sm font-semibold" style={{ fontFamily: I, color: '#3a6b4a' }}>
                    ✓ Promo "{promoApplied}" applied — {pricing?.discountPercent}% off
                  </span>
                  <button
                    onClick={async () => {
                      setPromoApplied('')
                      setPromoInput('')
                      const resetPricing = await getPricing()
                      setPricing(resetPricing)
                    }}
                    className="text-xs transition-opacity hover:opacity-60"
                    style={{ fontFamily: I, color: c.muted }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Promo code"
                    className="flex-1 py-2.5 px-4 rounded-2xl text-sm outline-none uppercase"
                    style={{ fontFamily: I, background: c.surface, border: `1.5px solid ${c.cardBorder}`, color: c.forest }}
                  />
                  <button
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || promoChecking}
                    className="px-4 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ fontFamily: F, background: '#1B3B2B' }}
                  >
                    {promoChecking ? '…' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
          )}

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
                {initiating ? 'Opening payment…' : `Resubscribe for ₦${pricing?.finalAmount.toLocaleString() ?? '2,500'}/month →`}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={initiating}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{ fontFamily: F, background: '#1B3B2B' }}
            >
              {initiating ? 'Opening payment…' : `Subscribe for ₦${pricing?.finalAmount.toLocaleString() ?? '2,500'}/month →`}
            </button>
          )}

          {error && (
            <p className="text-center text-xs mt-3" style={{ fontFamily: I, color: '#E07A5F' }}>{error}</p>
          )}
        </div>

        {/* One-time unlock alternative */}
        <div
          className="rounded-2xl p-5 mb-6 text-center"
          style={{ background: c.surface, border: `1.5px solid ${c.cardBorder}` }}
        >
          <p className="text-sm font-semibold mb-1" style={{ fontFamily: F, color: c.forest }}>
            Just want one report?
          </p>
          <p className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>
            Unlock a single deep-dive report for{' '}
            <strong style={{ color: c.forest }}>₦{pricing?.unlockAmount.toLocaleString() ?? '1,000'}</strong> — yours forever, no subscription.
            Available directly on each quiz result page.
          </p>
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
