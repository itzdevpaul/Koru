import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp, signInWithGoogle, sendWelcomeEmail, claimInviteCode } from '../firebase'

export default function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState(() => new URLSearchParams(window.location.search).get('ref')?.toUpperCase() ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const result = await signUp(email, password, name.trim())
    setLoading(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      if (inviteCode.trim()) {
        const claim = await claimInviteCode(inviteCode)
        if ('error' in claim) setError(claim.error)
      }
      sendWelcomeEmail(result.user.email ?? email, name.trim())
      navigate('/onboarding')
    }
  }

  async function handleGoogle() {
    setError('')
    setGoogleLoading(true)
    const result = await signInWithGoogle()
    setGoogleLoading(false)
    if ('error' in result) {
      if (result.error !== 'Sign-in cancelled.') setError(result.error)
    } else {
      const displayName = result.user.displayName ?? result.user.email ?? 'there'
      if (inviteCode.trim()) {
        const claim = await claimInviteCode(inviteCode)
        if ('error' in claim) setError(claim.error)
      }
      sendWelcomeEmail(result.user.email ?? '', displayName)
      navigate('/onboarding')
    }
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColor = ['transparent', '#E07A5F', '#e8c560', '#A2BFA6'][passwordStrength]
  const strengthLabel = ['', 'Too short', 'Fair', 'Strong'][passwordStrength]

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: 'linear-gradient(160deg, #FBF9F5 0%, #EEF4EF 100%)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 mb-10 group">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-105"
          style={{ background: '#1B3B2B' }}
        >
          🌿
        </div>
        <span
          className="text-xl font-bold tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
        >
          Koru
        </span>
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-[420px] rounded-3xl p-8 sm:p-10"
        style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(162,191,166,0.35)',
          boxShadow: '0 8px 40px rgba(27,59,43,0.08)',
        }}
      >
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
        >
          Create your account
        </h1>
        <p
          className="text-sm mb-8"
          style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
        >
          Start your self-discovery journey today.
        </p>

        {/* Google */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl text-sm font-semibold mb-5 transition-all duration-200 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            background: '#fff',
            color: '#1B3B2B',
            border: '1.5px solid rgba(162,191,166,0.5)',
          }}
        >
          {googleLoading ? (
            <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#A2BFA6', borderTopColor: '#1B3B2B' }} />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: 'rgba(162,191,166,0.35)' }} />
          <span className="text-xs" style={{ fontFamily: "'Inter', sans-serif", color: '#A2BFA6' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'rgba(162,191,166,0.35)' }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-xs font-semibold"
              style={{ fontFamily: "'Inter', sans-serif", color: '#1B3B2B' }}
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Ada Obi"
              value={name}
              onChange={e => setName(e.target.value)}
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

          {/* Email */}
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

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold"
              style={{ fontFamily: "'Inter', sans-serif", color: '#1B3B2B' }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full py-3 px-4 pr-11 rounded-2xl text-sm outline-none transition-all duration-200"
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
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ color: '#7a9a86' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: i <= passwordStrength ? strengthColor : 'rgba(162,191,166,0.25)' }}
                    />
                  ))}
                </div>
                <span className="text-xs" style={{ fontFamily: "'Inter', sans-serif", color: strengthColor, minWidth: 48 }}>
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          {/* Invite code */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="invite-code"
              className="text-xs font-semibold"
              style={{ fontFamily: "'Inter', sans-serif", color: '#1B3B2B' }}
            >
              Invite code <span style={{ color: '#A2BFA6', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="invite-code"
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.replace(/[^a-z0-9]/gi, '').slice(0, 12).toUpperCase())}
              placeholder="e.g. KORU7X2P"
              maxLength={12}
              autoComplete="off"
              className="w-full py-3 px-4 rounded-2xl text-sm outline-none uppercase tracking-widest"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: 'rgba(162,191,166,0.1)',
                border: '1.5px solid rgba(162,191,166,0.3)',
                color: '#1B3B2B',
              }}
            />
            <p className="text-[11px]" style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}>
              Enter a friend’s code so they get credit for your signup.
            </p>
          </div>

          {/* Error */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || googleLoading}
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
                Creating account…
              </span>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Terms */}
        <p
          className="text-center text-xs mt-4 leading-relaxed"
          style={{ fontFamily: "'Inter', sans-serif", color: '#A2BFA6' }}
        >
          By signing up you agree to our{' '}
          <Link to="/terms-of-service" className="underline underline-offset-2 hover:opacity-70" style={{ color: '#7a9a86' }}>
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="underline underline-offset-2 hover:opacity-70" style={{ color: '#7a9a86' }}>
            Privacy Policy
          </Link>.
        </p>

        {/* Footer */}
        <p
          className="text-center text-sm mt-5"
          style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
        >
          Already have an account?{' '}
          <Link
            to="/signin"
            className="font-semibold transition-colors hover:opacity-70"
            style={{ color: '#1B3B2B' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}
