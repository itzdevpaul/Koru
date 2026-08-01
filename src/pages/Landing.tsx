import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ─────────────────────────────────────────
   Landing Page
───────────────────────────────────────── */
export default function Landing() {
  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-[#FBF9F5] text-[#1B3B2B] overflow-x-hidden"
    >
      {/* ── Skip to content ── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-[#1B3B2B] focus:text-[#FBF9F5] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to content
      </a>

      {/* ── Organic background blobs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -right-32 w-[min(600px,100vw)] h-[min(600px,100vw)] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A2BFA6 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 -left-48 w-[min(500px,80vw)] h-[min(500px,80vw)] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #E07A5F 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[min(400px,70vw)] h-[min(400px,70vw)] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A2BFA6 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Navigation ── */}
      <header role="banner">
        <nav
          aria-label="Main navigation"
          className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-6xl mx-auto"
        >
          <Link to="/" aria-label="Koru home" className="flex items-center gap-2.5 no-underline">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)' }}
              aria-hidden="true"
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

          <div className="flex items-center gap-3">
            <a
              href="#why-koru"
              className="text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 hover:bg-[rgba(27,59,43,0.06)]"
              style={{
                color: '#1B3B2B',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Why Koru?
            </a>
            <Link
              to="/signin"
              className="text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 hover:bg-[#1B3B2B] hover:text-[#FBF9F5]"
              style={{
                borderColor: '#1B3B2B',
                color: '#1B3B2B',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <main id="main-content">
        <section
          aria-labelledby="hero-heading"
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 text-center"
        >
          {/* Eyebrow badge */}
          <div
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 animate-fade-up"
            style={{
              background: 'rgba(162, 191, 166, 0.25)',
              border: '1px solid rgba(162, 191, 166, 0.5)',
              color: '#3a6b4a',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            🌿 Your guide to figuring it all out.
          </div>

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-4xl xs:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-5 sm:mb-6 animate-fade-up delay-100"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
          >
            Navigate your life
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #1B3B2B 0%, #A2BFA6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              decisions with clarity.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-12 animate-fade-up delay-200"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: '#4a6a58',
              fontWeight: 400,
            }}
          >
            Unpack thoughts on career paths, personal identity, relationships, and
            hobbies through science-backed insights. Private, safe, and
            judgment-free.
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-300 flex flex-col items-center gap-4">
            <div
              className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl shadow-lg"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(162, 191, 166, 0.4)',
              }}
            >
              <Link
                to="/signup"
                className="px-7 sm:px-10 py-3 sm:py-3.5 rounded-xl text-sm font-semibold text-[#FBF9F5] transition-all duration-200 hover:opacity-90 active:scale-95 shadow-sm flex items-center justify-center gap-2"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)',
                  minWidth: '200px',
                }}
              >
                Get started →
              </Link>
              <Link
                to="/signin"
                className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-[rgba(27,59,43,0.06)] active:scale-95 flex items-center justify-center"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  color: '#1B3B2B',
                }}
              >
                Sign in
              </Link>
            </div>

            <p
              className="text-xs sm:text-sm"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              Free to join. No credit card required.
            </p>
          </div>

          {/* Decorative path */}
          <div className="mt-14 sm:mt-20 flex justify-center opacity-30 animate-fade-up delay-500" aria-hidden="true">
            <svg width="min(480px, 90vw)" height="48" viewBox="0 0 480 48" fill="none" role="presentation">
              <path
                d="M0 24 C60 8, 120 40, 180 24 S300 8, 360 24 S420 40, 480 24"
                stroke="#A2BFA6"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                fill="none"
              />
              <circle cx="0" cy="24" r="3" fill="#A2BFA6" />
              <circle cx="480" cy="24" r="4" fill="#1B3B2B" />
            </svg>
          </div>
        </section>

        {/* ── Value Proposition Cards ── */}
        <section
          id="why-koru"
          aria-labelledby="cards-heading"
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-28"
        >
          <div className="text-center mb-10 sm:mb-14">
            <h2
              id="cards-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              Three areas. One clear path forward.
            </h2>
            <p
              className="text-sm sm:text-base max-w-lg mx-auto"
              style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
            >
              Koru meets you wherever you are — no pressure, no judgment, just
              thoughtful guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <Card
              emoji="🧭"
              label="Career & Hobbies"
              color="#1B3B2B"
              tagColor="rgba(162,191,166,0.3)"
              tagTextColor="#3a6b4a"
              body="Discover aptitudes that go far beyond school grades. Connect your genuine interests to careers and hobbies that will feel fulfilling for years to come."
              highlight="Find your direction"
            />
            <Card
              emoji="💬"
              label="Relationships & Boundaries"
              color="#E07A5F"
              tagColor="rgba(224,122,95,0.15)"
              tagTextColor="#c05a3a"
              body="Understand healthy communication, consent, and navigating first-time experiences — with age-appropriate, science-backed context you can actually trust."
              highlight="Grow with confidence"
            />
            <Card
              emoji="🌱"
              label="Identity & Personal Growth"
              color="#1B3B2B"
              tagColor="rgba(162,191,166,0.3)"
              tagTextColor="#3a6b4a"
              body="Explore your values, understand how you think, and track how your perspective evolves over time. Your identity is a journey, not a destination."
              highlight="Know yourself better"
            />
          </div>
        </section>

        {/* ── Trust & Safety ── */}
        <section
          aria-labelledby="trust-heading"
          className="relative z-10 py-16 sm:py-24 px-4 sm:px-6"
          style={{
            background: 'linear-gradient(160deg, #1B3B2B 0%, #2a5240 50%, #1e4433 100%)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div
              className="absolute -top-20 right-1/4 w-72 h-72 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #A2BFA6 0%, transparent 70%)' }}
            />
            <div
              className="absolute bottom-0 left-10 w-64 h-64 rounded-full opacity-10"
              style={{ background: 'radial-gradient(circle, #E07A5F 0%, transparent 70%)' }}
            />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <div
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8"
              style={{
                background: 'rgba(162, 191, 166, 0.15)',
                border: '1px solid rgba(162, 191, 166, 0.3)',
                color: '#A2BFA6',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              🔒 Built for your privacy
            </div>

            <h2
              id="trust-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#FBF9F5] mb-4 sm:mb-6 leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Your journey is personal.
            </h2>

            <p
              className="text-base sm:text-lg leading-relaxed mb-8 sm:mb-12"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(251,249,245,0.75)',
              }}
            >
              Koru is designed as a safe space. We prioritize user privacy, offer
              full anonymity options, and will{' '}
              <strong style={{ color: '#A2BFA6', fontWeight: 500 }}>never</strong> sell
              your data. Take quizzes without fear of judgment — what you share
              stays with you.
            </p>

            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 sm:gap-4">
              {[
                { emoji: '🛡️', title: 'Full Anonymity', body: 'No name required. Ever.' },
                { emoji: '🚫', title: 'Zero Data Sales', body: 'Your insights are yours alone.' },
                { emoji: '🔐', title: 'Encrypted Storage', body: 'Secured by industry standards.' },
              ].map(p => (
                <article
                  key={p.title}
                  className="p-4 sm:p-5 rounded-2xl text-left"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(162, 191, 166, 0.2)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="text-xl sm:text-2xl mb-2 sm:mb-3" aria-hidden="true">{p.emoji}</div>
                  <p className="text-sm font-semibold text-[#FBF9F5] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {p.title}
                  </p>
                  <p className="text-xs" style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(251,249,245,0.55)' }}>
                    {p.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Second CTA ── */}
        <section
          aria-labelledby="cta-heading"
          className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center"
        >
          <h2
            id="cta-heading"
            className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
          >
            Ready to find your clarity?
          </h2>
          <p
            className="text-sm sm:text-base mb-6 sm:mb-8"
            style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
          >
            Create your free account and start your self-discovery journey today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold text-[#FBF9F5] transition-all duration-200 hover:opacity-90 active:scale-95 shadow-md"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)',
              }}
            >
              Get started →
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold transition-all duration-200 hover:bg-[rgba(27,59,43,0.06)] active:scale-95"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: '#1B3B2B',
                border: '1px solid rgba(27,59,43,0.2)',
              }}
            >
              Sign in
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer
        role="contentinfo"
        className="relative z-10 py-8 sm:py-10 px-4 sm:px-6"
        style={{ borderTop: '1px solid rgba(162, 191, 166, 0.3)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
          <Link to="/" aria-label="Koru home" className="flex items-center gap-2 no-underline">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: '#1B3B2B' }}
              aria-hidden="true"
            >
              🌿
            </div>
            <span
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              Koru
            </span>
          </Link>

          <p
            className="text-xs text-center order-last sm:order-none"
            style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
          >
            © {new Date().getFullYear()} Koru. All rights reserved.{' '}
            <span className="hidden sm:inline">·</span>{' '}
            <a
              href="https://koru.com.ng"
              className="hover:text-[#1B3B2B] transition-colors"
              style={{ color: '#7a9a86' }}
            >
              koru.com.ng
            </a>
          </p>

          <nav aria-label="Footer links" className="flex items-center gap-4 sm:gap-5">
            <Link
              to="/privacy-policy"
              className="text-xs transition-colors duration-150 hover:text-[#1B3B2B]"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-xs transition-colors duration-150 hover:text-[#1B3B2B]"
              style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

/* ── Card component ── */
interface CardProps {
  emoji: string
  label: string
  color: string
  tagColor: string
  tagTextColor: string
  body: string
  highlight: string
}

function Card({ emoji, label, color, tagColor, tagTextColor, body, highlight }: CardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <article
      className="p-6 sm:p-7 rounded-3xl transition-all duration-300"
      style={{
        background: hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: hovered
          ? '1px solid rgba(162, 191, 166, 0.6)'
          : '1px solid rgba(162, 191, 166, 0.3)',
        boxShadow: hovered
          ? '0 20px 48px rgba(27,59,43,0.12)'
          : '0 4px 24px rgba(27,59,43,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-5 transition-transform duration-200"
        style={{ background: tagColor, transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
        aria-hidden="true"
      >
        {emoji}
      </div>

      <div
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 sm:mb-4"
        style={{ background: tagColor, color: tagTextColor, fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </div>

      <p
        className="text-sm sm:text-[15px] leading-relaxed mb-4 sm:mb-5"
        style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
      >
        {body}
      </p>

      <div className="flex items-center gap-1.5">
        <span
          className="text-xs font-semibold"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color }}
        >
          {highlight}
        </span>
        <span style={{ color, fontSize: '12px' }} aria-hidden="true">→</span>
      </div>
    </article>
  )
}
