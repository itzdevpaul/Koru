import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { auth, googleProvider, signOut, onAuthStateChanged, getAllAds, saveAd, toggleAdActive, deleteAd, getAdminPromos, createAdminPromo, toggleAdminPromo, deleteAdminPromo, type Ad, type PromoCode } from '../firebase'
import { signInWithPopup, type User } from 'firebase/auth'
import KoruLogo from '../components/KoruLogo'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

const ADMIN_EMAIL = 'pauladamu600@gmail.com'

interface AdminUser {
  uid: string
  email: string
  displayName: string
  createdAt: string
  lastSignIn: string
  profile: {
    onboardingComplete: boolean
    focusAreas: string[]
    ageRange: string
    streak: number
    lastActive: string
    emailOptIn: boolean
  } | null
  subscription: {
    active: boolean
    expiresAt: string | null
  } | null
  quizCount: number
}

interface Stats {
  total: number
  pro: number
  onboarded: number
  quizzesTotal: number
}

export default function Admin() {
  const { c, isDark, toggleTheme } = useTheme()
  const [adminUser, setAdminUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signInError, setSignInError] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)

  const [activeTab, setActiveTab] = useState<'users' | 'promos' | 'ads'>('users')

  // Users tab
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pro' | 'free'>('all')
  const [expandedUid, setExpandedUid] = useState<string | null>(null)
  const [grantingUid, setGrantingUid] = useState<string | null>(null)
  const [grantDays, setGrantDays] = useState(30)
  const [grantLoading, setGrantLoading] = useState(false)
  const [grantMsg, setGrantMsg] = useState<{ uid: string; text: string; ok: boolean } | null>(null)

  // Promos tab
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [promosLoading, setPromosLoading] = useState(false)
  const [promosError, setPromosError] = useState('')
  const [promoForm, setPromoForm] = useState({ code: '', discountPercent: 10, expiresAt: '' })
  const [promoSaving, setPromoSaving] = useState(false)
  const [promoMsg, setPromoMsg] = useState('')

  // Ads tab
  const [ads, setAds] = useState<Ad[]>([])
  const [adsLoading, setAdsLoading] = useState(false)
  const [adsError, setAdsError] = useState('')
  const [adForm, setAdForm] = useState({ imageBase64: '', title: '', description: '', ctaText: 'Learn More', ctaLink: '' })
  const [adSaving, setAdSaving] = useState(false)
  const [adFormError, setAdFormError] = useState('')

  // Listen for Firebase auth state — auto-restores session on page reload
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setAdminUser(user)
      } else if (user) {
        // Signed in but not the admin email — sign out immediately
        signOut(auth)
        setAdminUser(null)
        setSignInError(`Access denied. This dashboard is restricted to ${ADMIN_EMAIL}.`)
      } else {
        setAdminUser(null)
      }
      setAuthLoading(false)
    })
    return unsub
  }, [])

  async function handleGoogleSignIn() {
    setSignInLoading(true)
    setSignInError('')
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user.email !== ADMIN_EMAIL) {
        await signOut(auth)
        setSignInError(`Access denied. Only ${ADMIN_EMAIL} can access this dashboard.`)
      }
      // onAuthStateChanged will handle setting adminUser if email matches
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign-in failed'
      if (!msg.includes('popup-closed')) {
        setSignInError('Sign-in failed. Please try again.')
      }
    } finally {
      setSignInLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut(auth)
    setAdminUser(null)
    setUsers([])
  }

  async function handleGrantPro(uid: string) {
    if (!adminUser) return
    setGrantLoading(true)
    setGrantMsg(null)
    try {
      const token = await adminUser.getIdToken()
      const r = await fetch('/api/admin/grant-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid, days: grantDays }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error ?? `Server error ${r.status}`)
      // Update local state so the row reflects the change immediately
      setUsers(prev => prev.map(u =>
        u.uid === uid
          ? { ...u, subscription: { active: true, expiresAt: data.expiresAt } }
          : u
      ))
      setGrantMsg({ uid, text: `✓ Pro granted until ${new Date(data.expiresAt).toLocaleDateString()}`, ok: true })
      setGrantingUid(null)
    } catch (err) {
      setGrantMsg({ uid, text: err instanceof Error ? err.message : 'Failed', ok: false })
    } finally {
      setGrantLoading(false)
    }
  }

  async function handleRevokePro(uid: string) {
    if (!adminUser || !confirm('Revoke Pro access for this user?')) return
    setGrantLoading(true)
    setGrantMsg(null)
    try {
      const token = await adminUser.getIdToken()
      const r = await fetch('/api/admin/revoke-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid }),
      })
      if (!r.ok) { const d = await r.json(); throw new Error(d.error ?? `Server error ${r.status}`) }
      setUsers(prev => prev.map(u =>
        u.uid === uid
          ? { ...u, subscription: { active: false, expiresAt: null } }
          : u
      ))
      setGrantMsg({ uid, text: '✓ Pro revoked', ok: true })
    } catch (err) {
      setGrantMsg({ uid, text: err instanceof Error ? err.message : 'Failed', ok: false })
    } finally {
      setGrantLoading(false)
    }
  }

  // Fetch users whenever admin session is established
  useEffect(() => {
    if (!adminUser) return
    setLoading(true)
    setError('')

    adminUser.getIdToken().then(token =>
      fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
    )
      .then(r => {
        if (!r.ok) throw new Error(`Server error ${r.status}`)
        return r.json()
      })
      .then((data: AdminUser[]) => setUsers(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [adminUser])

  // Fetch promos when promos tab is opened
  useEffect(() => {
    if (!adminUser || activeTab !== 'promos') return
    fetchPromos()
  }, [adminUser, activeTab])

  async function fetchPromos() {
    if (!adminUser) return
    setPromosLoading(true)
    setPromosError('')
    try {
      const token = await adminUser.getIdToken()
      const data = await getAdminPromos(token)
      setPromos(data)
    } catch (err) {
      setPromosError(err instanceof Error ? err.message : 'Failed to load promo codes')
    } finally {
      setPromosLoading(false)
    }
  }

  async function handleCreatePromo() {
    if (!adminUser) return
    setPromoSaving(true)
    setPromoMsg('')
    try {
      const token = await adminUser.getIdToken()
      await createAdminPromo(token, promoForm.code, promoForm.discountPercent, promoForm.expiresAt)
      setPromoMsg(`✓ Promo code "${promoForm.code.toUpperCase()}" created`)
      setPromoForm({ code: '', discountPercent: 10, expiresAt: '' })
      await fetchPromos()
    } catch (err) {
      setPromoMsg(err instanceof Error ? err.message : 'Failed to create promo code')
    } finally {
      setPromoSaving(false)
      setTimeout(() => setPromoMsg(''), 4000)
    }
  }

  async function handleTogglePromo(code: string) {
    if (!adminUser) return
    try {
      const token = await adminUser.getIdToken()
      await toggleAdminPromo(token, code)
      await fetchPromos()
    } catch (err) {
      setPromosError(err instanceof Error ? err.message : 'Failed to toggle promo code')
    }
  }

  async function handleDeletePromo(code: string) {
    if (!adminUser || !confirm(`Delete promo code "${code}"?`)) return
    try {
      const token = await adminUser.getIdToken()
      await deleteAdminPromo(token, code)
      await fetchPromos()
    } catch (err) {
      setPromosError(err instanceof Error ? err.message : 'Failed to delete promo code')
    }
  }

  const stats = useMemo<Stats>(() => ({
    total: users.length,
    pro: users.filter(u => u.subscription?.active).length,
    onboarded: users.filter(u => u.profile?.onboardingComplete).length,
    quizzesTotal: users.reduce((s, u) => s + u.quizCount, 0),
  }), [users])

  const filtered = useMemo(() => {
    let list = users
    if (filter === 'pro') list = list.filter(u => u.subscription?.active)
    if (filter === 'free') list = list.filter(u => !u.subscription?.active)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        u.uid.includes(q)
      )
    }
    return list
  }, [users, filter, search])

  // ── Loading auth state ──────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(162,191,166,0.3)', borderTopColor: '#1B3B2B' }} />
      </div>
    )
  }

  // ── Google sign-in gate ─────────────────────────────────────────────────────
  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: c.bgGradient }}>
        <div
          className="w-full max-w-sm rounded-3xl p-8"
          style={{ background: c.card, border: `1.5px solid ${c.cardBorder}`, boxShadow: '0 8px 40px rgba(27,59,43,0.1)' }}
        >
          <div className="flex items-center gap-2.5 mb-8">
            <KoruLogo size={30} wordmarkSize={16} />
            <span className="font-bold text-sm" style={{ fontFamily: F, color: c.forest }}>Admin</span>
          </div>

          <h1 className="text-xl font-bold mb-1" style={{ fontFamily: F, color: c.forest }}>Sign in</h1>
          <p className="text-xs mb-8" style={{ fontFamily: I, color: c.muted }}>Admin access only. Use your authorised Google account.</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={signInLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: F, background: '#1B3B2B', color: '#fff' }}
          >
            {signInLoading ? (
              <span className="w-4 h-4 rounded-full border-2 animate-spin inline-block" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {signInLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {signInError && (
            <p className="text-xs mt-4 text-center" style={{ color: '#E07A5F', fontFamily: I }}>{signInError}</p>
          )}
        </div>
      </div>
    )
  }

  // ── Admin dashboard ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: c.bg }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-8 h-14"
        style={{ background: c.bgGlass, borderBottom: `1px solid ${c.navBorder}`, backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <KoruLogo size={22} wordmarkSize={15} />
          <span className="font-bold text-sm" style={{ fontFamily: F, color: c.forest }}>Admin</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ fontFamily: I, background: 'rgba(224,122,95,0.12)', color: '#E07A5F' }}>Private</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs" style={{ fontFamily: I, color: c.muted }}>{adminUser.email}</span>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-base transition-opacity hover:opacity-60"
            style={{ background: c.surface }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link to="/home" className="text-xs font-medium transition-opacity hover:opacity-60" style={{ fontFamily: I, color: c.muted }}>
            ← App
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium transition-opacity hover:opacity-60"
            style={{ fontFamily: I, color: c.muted }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">

        {/* Tab navigation */}
        <div className="flex gap-2 mb-6">
          {(['users', 'promos', 'ads'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
              style={{
                fontFamily: F,
                background: activeTab === tab ? '#1B3B2B' : c.surface,
                color: activeTab === tab ? '#fff' : c.body,
              }}
            >
              {tab === 'promos' ? 'Promo Codes' : tab}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
        <>
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total users', value: stats.total, emoji: '👥' },
            { label: 'Pro subscribers', value: stats.pro, emoji: '⭐' },
            { label: 'Onboarded', value: stats.onboarded, emoji: '✅' },
            { label: 'Quizzes taken', value: stats.quizzesTotal, emoji: '📊' },
          ].map(({ label, value, emoji }) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}
            >
              <p className="text-xl mb-1">{emoji}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: F, color: c.forest }}>{loading ? '—' : value}</p>
              <p className="text-xs mt-0.5" style={{ fontFamily: I, color: c.muted }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by name, email or UID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 py-2.5 px-4 rounded-2xl text-sm outline-none"
            style={{ fontFamily: I, background: c.input, border: `1.5px solid ${c.inputBorder}`, color: c.inputText }}
          />
          <div className="flex gap-2">
            {(['all', 'pro', 'free'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  fontFamily: F,
                  background: filter === f ? '#1B3B2B' : c.surface,
                  color: filter === f ? '#fff' : c.body,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl px-5 py-4 mb-5 text-sm" style={{ background: 'rgba(224,122,95,0.1)', color: '#E07A5F', fontFamily: I, border: '1px solid rgba(224,122,95,0.2)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(162,191,166,0.3)', borderTopColor: '#1B3B2B' }} />
            <p className="text-sm" style={{ fontFamily: I, color: c.muted }}>Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm" style={{ fontFamily: I, color: c.muted }}>No users found.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${c.cardBorder}` }}>
            {/* Table head */}
            <div
              className="hidden sm:grid text-xs font-semibold uppercase tracking-wide px-5 py-3"
              style={{
                fontFamily: I,
                color: c.muted,
                background: c.surface,
                letterSpacing: '0.06em',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr',
              }}
            >
              <span>User</span>
              <span>Email</span>
              <span>Joined</span>
              <span>Status</span>
              <span>Onboarding</span>
              <span>Streak</span>
              <span>Quizzes</span>
            </div>

            {filtered.map((user, i) => (
              <div key={user.uid}>
                {/* Row */}
                <button
                  onClick={() => setExpandedUid(expandedUid === user.uid ? null : user.uid)}
                  className="w-full text-left px-5 py-4 transition-colors"
                  style={{
                    background: expandedUid === user.uid ? c.surface : (i % 2 === 0 ? c.card : 'transparent'),
                    borderTop: i === 0 ? 'none' : `1px solid ${c.cardBorder}`,
                  }}
                >
                  <div
                    className="grid items-center gap-3"
                    style={{ gridTemplateColumns: '1fr auto' }}
                  >
                    {/* Mobile layout */}
                    <div className="sm:hidden flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Avatar name={user.displayName || user.email} />
                        <span className="text-sm font-semibold" style={{ fontFamily: F, color: c.forest }}>
                          {user.displayName || '—'}
                        </span>
                        <SubBadge active={!!user.subscription?.active} />
                      </div>
                      <p className="text-xs ml-9" style={{ fontFamily: I, color: c.muted }}>{user.email}</p>
                    </div>

                    {/* Desktop grid */}
                    <div
                      className="hidden sm:grid items-center gap-3"
                      style={{ gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 0.8fr 0.8fr' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={user.displayName || user.email} />
                        <span className="text-sm font-semibold truncate" style={{ fontFamily: F, color: c.forest }}>
                          {user.displayName || '—'}
                        </span>
                      </div>
                      <span className="text-xs truncate" style={{ fontFamily: I, color: c.body }}>{user.email}</span>
                      <span className="text-xs" style={{ fontFamily: I, color: c.muted }}>{fmtDate(user.createdAt)}</span>
                      <SubBadge active={!!user.subscription?.active} />
                      <span className="text-xs" style={{ fontFamily: I, color: user.profile?.onboardingComplete ? '#3a6b4a' : c.muted }}>
                        {user.profile?.onboardingComplete ? '✓ Done' : '—'}
                      </span>
                      <span className="text-xs font-medium" style={{ fontFamily: I, color: c.body }}>
                        {user.profile?.streak ? `🔥 ${user.profile.streak}` : '—'}
                      </span>
                      <span className="text-xs font-medium" style={{ fontFamily: I, color: c.body }}>{user.quizCount}</span>
                    </div>

                    <span className="text-xs" style={{ color: c.muted }}>{expandedUid === user.uid ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedUid === user.uid && (
                  <div
                    className="px-5 pb-5 pt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(27,59,43,0.03)', borderTop: `1px dashed ${c.cardBorder}` }}
                  >
                    <DetailCard title="Account" c={c}>
                      <Row label="UID" value={<code className="text-xs break-all" style={{ color: c.muted }}>{user.uid}</code>} />
                      <Row label="Joined" value={fmtDateFull(user.createdAt)} />
                      <Row label="Last sign-in" value={fmtDateFull(user.lastSignIn)} />
                      <Row label="Email opt-in" value={user.profile?.emailOptIn ? 'Yes' : 'No'} />
                    </DetailCard>

                    <DetailCard title="Profile" c={c}>
                      <Row label="Age range" value={user.profile?.ageRange || '—'} />
                      <Row label="Focus areas" value={user.profile?.focusAreas?.join(', ') || '—'} />
                      <Row label="Last active" value={user.profile?.lastActive || '—'} />
                      <Row label="Streak" value={user.profile?.streak ? `${user.profile.streak} days` : '—'} />
                    </DetailCard>

                    <DetailCard title="Subscription" c={c}>
                      <Row label="Status" value={user.subscription?.active ? '⭐ Pro' : 'Free'} />
                      <Row label="Expires" value={user.subscription?.expiresAt ? fmtDateFull(user.subscription.expiresAt) : '—'} />
                      <Row label="Quizzes taken" value={String(user.quizCount)} />

                      {/* ── Grant / Revoke Pro ── */}
                      <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${c.cardBorder}` }}>
                        {grantingUid === user.uid ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-semibold" style={{ fontFamily: F, color: c.forest }}>Grant Pro for:</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {[7, 30, 90, 365].map(d => (
                                <button
                                  key={d}
                                  onClick={() => setGrantDays(d)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                                  style={{
                                    background: grantDays === d ? '#1B3B2B' : c.surface,
                                    color: grantDays === d ? '#fff' : c.forest,
                                    fontFamily: I,
                                  }}
                                >
                                  {d === 365 ? '1 yr' : `${d}d`}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleGrantPro(user.uid)}
                                disabled={grantLoading}
                                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity disabled:opacity-50"
                                style={{ background: '#1B3B2B', color: '#fff', fontFamily: F }}
                              >
                                {grantLoading ? 'Saving…' : 'Confirm'}
                              </button>
                              <button
                                onClick={() => { setGrantingUid(null); setGrantMsg(null) }}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-60"
                                style={{ background: c.surface, color: c.muted, fontFamily: I }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setGrantingUid(user.uid); setGrantDays(30); setGrantMsg(null) }}
                              className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                              style={{ background: '#1B3B2B', color: '#fff', fontFamily: F }}
                            >
                              {user.subscription?.active ? 'Extend Pro' : 'Grant Pro'}
                            </button>
                            {user.subscription?.active && (
                              <button
                                onClick={() => handleRevokePro(user.uid)}
                                disabled={grantLoading}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                                style={{ background: 'rgba(224,122,95,0.12)', color: '#E07A5F', fontFamily: F }}
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        )}
                        {grantMsg?.uid === user.uid && (
                          <p className="text-xs mt-2" style={{ fontFamily: I, color: grantMsg.ok ? '#1B3B2B' : '#E07A5F' }}>
                            {grantMsg.text}
                          </p>
                        )}
                      </div>
                    </DetailCard>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs mt-6" style={{ fontFamily: I, color: c.muted }}>
          {filtered.length} of {users.length} users shown
        </p>
        </>
        )}

        {/* ── Promo Codes tab ── */}
        {activeTab === 'promos' && (
          <div>
            {/* Create form */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ fontFamily: I, color: c.muted, letterSpacing: '0.08em' }}>Create Promo Code</p>
              <div className="grid sm:grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ fontFamily: I, color: c.body }}>Code</label>
                  <input
                    type="text"
                    value={promoForm.code}
                    onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER25"
                    className="w-full py-2.5 px-4 rounded-2xl text-sm outline-none uppercase"
                    style={{ fontFamily: I, background: c.surface, border: `1.5px solid ${c.cardBorder}`, color: c.forest }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ fontFamily: I, color: c.body }}>Discount %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={promoForm.discountPercent}
                    onChange={e => setPromoForm({ ...promoForm, discountPercent: Number(e.target.value) })}
                    className="w-full py-2.5 px-4 rounded-2xl text-sm outline-none"
                    style={{ fontFamily: I, background: c.surface, border: `1.5px solid ${c.cardBorder}`, color: c.forest }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1 block" style={{ fontFamily: I, color: c.body }}>Expiration date</label>
                  <input
                    type="date"
                    value={promoForm.expiresAt}
                    onChange={e => setPromoForm({ ...promoForm, expiresAt: e.target.value })}
                    className="w-full py-2.5 px-4 rounded-2xl text-sm outline-none"
                    style={{ fontFamily: I, background: c.surface, border: `1.5px solid ${c.cardBorder}`, color: c.forest }}
                  />
                </div>
              </div>
              <button
                onClick={handleCreatePromo}
                disabled={!promoForm.code || !promoForm.expiresAt || promoSaving}
                className="py-2.5 px-5 rounded-2xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ fontFamily: F, background: '#1B3B2B' }}
              >
                {promoSaving ? 'Creating…' : 'Create promo code'}
              </button>
              {promoMsg && (
                <p className="text-xs mt-3" style={{ fontFamily: I, color: promoMsg.startsWith('✓') ? '#1B3B2B' : '#E07A5F' }}>{promoMsg}</p>
              )}
            </div>

            {/* Error */}
            {promosError && (
              <div className="rounded-2xl px-5 py-4 mb-5 text-sm" style={{ background: 'rgba(224,122,95,0.1)', color: '#E07A5F', fontFamily: I }}>
                ⚠️ {promosError}
              </div>
            )}

            {/* Promo list */}
            {promosLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(162,191,166,0.3)', borderTopColor: '#1B3B2B' }} />
                <p className="text-sm" style={{ fontFamily: I, color: c.muted }}>Loading promo codes…</p>
              </div>
            ) : promos.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-3xl mb-3">🎫</p>
                <p className="text-sm" style={{ fontFamily: I, color: c.muted }}>No promo codes yet. Create one above.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {promos.map(p => {
                  const isExpired = p.expiresAt ? new Date(p.expiresAt) < new Date() : false
                  return (
                    <div key={p.code} className="rounded-2xl p-5" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold" style={{ fontFamily: F, color: c.forest }}>{p.code}</p>
                          <p className="text-xs" style={{ fontFamily: I, color: c.muted }}>
                            {p.discountPercent}% off
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: p.active && !isExpired ? 'rgba(162,191,166,0.25)' : 'rgba(224,122,95,0.12)',
                            color: p.active && !isExpired ? '#3a6b4a' : '#E07A5F',
                            fontFamily: I,
                          }}
                        >
                          {isExpired ? 'Expired' : p.active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      <p className="text-xs mb-4" style={{ fontFamily: I, color: c.muted }}>
                        Expires: {p.expiresAt ? fmtDateFull(p.expiresAt) : '—'}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTogglePromo(p.code)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                          style={{ background: c.surface, color: c.forest, fontFamily: F }}
                        >
                          {p.active ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeletePromo(p.code)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                          style={{ background: 'rgba(224,122,95,0.12)', color: '#E07A5F', fontFamily: F }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Ads tab placeholder ── */}
        {activeTab === 'ads' && (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📢</p>
            <p className="text-sm" style={{ fontFamily: I, color: c.muted }}>Ad management coming soon.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
  const colors = ['#1B3B2B', '#2d5a3d', '#3a6b4a', '#4a7a58', '#2a4a38']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div
      className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
      style={{ background: color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {initials || '?'}
    </div>
  )
}

function SubBadge({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{
        fontFamily: "'Inter', sans-serif",
        background: active ? 'rgba(224,122,95,0.12)' : 'rgba(162,191,166,0.15)',
        color: active ? '#E07A5F' : '#7a9a86',
      }}
    >
      {active ? '⭐ Pro' : 'Free'}
    </span>
  )
}

function DetailCard({ title, children, c }: { title: string; children: React.ReactNode; c: ReturnType<typeof useTheme>['c'] }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}>
      <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ fontFamily: I, color: c.muted, letterSpacing: '0.08em' }}>{title}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs flex-shrink-0" style={{ fontFamily: I, color: '#7a9a86' }}>{label}</span>
      <span className="text-xs font-medium text-right" style={{ fontFamily: I, color: '#1B3B2B' }}>{value}</span>
    </div>
  )
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateFull(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
