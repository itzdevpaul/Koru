import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { resetPassword } from '../firebase'
import KoruLogo from '../components/KoruLogo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await resetPassword(email)
    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'linear-gradient(160deg, #FBF9F5 0%, #EEF4EF 100%)' }}
    >
      <Link to="/" className="mb-10 group transition-transform duration-200 group-hover:scale-105">
        <KoruLogo size={36} />
      </Link>

      <div
        className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(162,191,166,0.35)',
          boxShadow: '0 8px 40px rgba(27,59,43,0.08)',
        }}
      >
        {sent ? (
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(162,191,166,0.15)' }}
            >
              ✉️
            </div>
            <div>
              <h1
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
              >
                Check your inbox
              </h1>
              <p
                className="text-sm"
                style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86', lineHeight: 1.6 }}
              >
                We sent a password reset link to <strong style={{ color: '#1B3B2B' }}>{email}</strong>. Check your spam folder if you don't see it.
              </p>
            </div>
            <Link
              to="/signin"
              className="text-sm font-semibold mt-2 transition-opacity hover:opacity-70"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              ← Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              Reset password
            </h1>
            <p
              className="text-sm mb-8"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold"
                  style={{ fontFamily: "'Inter', sans-serif", color: '#1B3B2B' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full py-3 px-4 rounded-2xl text-sm outline-none transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: 'rgba(162,191,166,0.1)',
                    border: '1.5px solid rgba(162,191,166,0.3)',
                    color: '#1B3B2B',
                  }}
                  onFocus={e => {
                    e.target.style.border = '1.5px solid #A2BFA6'
                    e.target.style.background = 'rgba(162,191,166,0.15)'
                  }}
                  onBlur={e => {
                    e.target.style.border = '1.5px solid rgba(162,191,166,0.3)'
                    e.target.style.background = 'rgba(162,191,166,0.1)'
                  }}
                />
              </div>

              {error && (
                <div
                  className="py-3 px-4 rounded-2xl text-sm"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    background: 'rgba(224,122,95,0.1)',
                    color: '#c0513a',
                    border: '1px solid rgba(224,122,95,0.25)',
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 mt-1"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: '#1B3B2B',
                  color: '#fff',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                    Sending…
                  </span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <p
              className="text-center text-sm mt-6"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              <Link
                to="/signin"
                className="font-semibold transition-colors hover:opacity-70"
                style={{ color: '#1B3B2B' }}
              >
                ← Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
