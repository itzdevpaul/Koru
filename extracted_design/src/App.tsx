import { useState } from 'react'

export default function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [focused, setFocused] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
    }
  }

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-[#FBF9F5] text-[#1B3B2B] overflow-x-hidden"
    >
      {/* Organic background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #A2BFA6 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 -left-60 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #E07A5F 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #A2BFA6 0%, transparent 70%)' }}
        />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          {/* Koru fern logo mark */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm"
            style={{ background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)' }}
          >
            🌿
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
          >
            Koru
          </span>
        </div>

        <a
          href="#trust"
          className="text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200"
          style={{
            borderColor: '#1B3B2B',
            color: '#1B3B2B',
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = '#1B3B2B'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#FBF9F5'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLAnchorElement).style.color = '#1B3B2B'
          }}
        >
          Why Koru?
        </a>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        {/* Eyebrow */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-up"
          style={{
            background: 'rgba(162, 191, 166, 0.25)',
            border: '1px solid rgba(162, 191, 166, 0.5)',
            color: '#3a6b4a',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          🌿 Coming soon: Your guide to figuring it all out.
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-fade-up delay-100"
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
          className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12 animate-fade-up delay-200"
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

        {/* Waitlist form */}
        <div className="animate-fade-up delay-300 max-w-xl mx-auto">
          {!submitted ? (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl shadow-lg"
                style={{
                  background: 'rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(162, 191, 166, 0.4)',
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3.5 rounded-xl text-base bg-transparent outline-none transition-all duration-200"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#1B3B2B',
                    border: focused
                      ? '1.5px solid #A2BFA6'
                      : '1.5px solid rgba(162, 191, 166, 0.3)',
                  }}
                />
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-xl text-sm font-semibold text-[#FBF9F5] transition-all duration-200 whitespace-nowrap shadow-sm"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)',
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'linear-gradient(135deg, #2a5240 0%, #3a6b4a 100%)')
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLButtonElement).style.background =
                      'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)')
                  }
                >
                  Join the Waitlist →
                </button>
              </form>
              <p
                className="mt-4 text-sm"
                style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
              >
                Join 500+ others getting early access. No spam, ever.
              </p>
            </>
          ) : (
            <div
              className="py-6 px-8 rounded-2xl text-center"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(162, 191, 166, 0.4)',
              }}
            >
              <div className="text-3xl mb-3">🌱</div>
              <p
                className="text-lg font-semibold"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
              >
                You're on the list!
              </p>
              <p
                className="text-sm mt-1"
                style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
              >
                We'll reach out to {email} when Koru launches.
              </p>
            </div>
          )}
        </div>

        {/* Abstract path illustration */}
        <div className="mt-20 flex justify-center opacity-30 animate-fade-up delay-500">
          <svg width="480" height="48" viewBox="0 0 480 48" fill="none" aria-hidden>
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

      {/* ─── Value Proposition Cards ─── */}
      <section id="trust" className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
          >
            Three areas. One clear path forward.
          </h2>
          <p
            className="text-base max-w-lg mx-auto"
            style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
          >
            Koru meets you wherever you are — no pressure, no judgment, just
            thoughtful guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* ─── Trust & Safety ─── */}
      <section
        className="relative z-10 py-24 px-6"
        style={{
          background:
            'linear-gradient(160deg, #1B3B2B 0%, #2a5240 50%, #1e4433 100%)',
        }}
      >
        {/* Decorative blobs inside the dark section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
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
            className="text-4xl md:text-5xl font-bold text-[#FBF9F5] mb-6 leading-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Your journey is personal.
          </h2>

          <p
            className="text-lg leading-relaxed mb-12"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: 'rgba(251,249,245,0.75)',
            }}
          >
            Koru is designed as a safe space. We prioritize user privacy, offer
            full anonymity options, and will{' '}
            <span style={{ color: '#A2BFA6', fontWeight: 500 }}>never</span> sell
            your data. Take quizzes without fear of judgment — what you share
            stays with you.
          </p>

          {/* Trust pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: '🛡️', title: 'Full Anonymity', body: 'No name required. Ever.' },
              { emoji: '🚫', title: 'Zero Data Sales', body: 'Your insights are yours alone.' },
              { emoji: '🔐', title: 'Encrypted Storage', body: 'Secured by industry standards.' },
            ].map(p => (
              <div
                key={p.title}
                className="p-5 rounded-2xl text-left"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(162, 191, 166, 0.2)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                <div className="text-2xl mb-3">{p.emoji}</div>
                <p
                  className="text-sm font-semibold text-[#FBF9F5] mb-1"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {p.title}
                </p>
                <p
                  className="text-xs"
                  style={{ fontFamily: "'Inter', sans-serif", color: 'rgba(251,249,245,0.55)' }}
                >
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="relative z-10 py-10 px-6"
        style={{ borderTop: '1px solid rgba(162, 191, 166, 0.3)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: '#1B3B2B' }}
            >
              🌿
            </div>
            <span
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}
            >
              Koru
            </span>
          </div>

          <p
            className="text-xs text-center"
            style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
          >
            © 2025 Koru. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {['Privacy Policy', 'Terms of Service'].map(link => (
              <a
                key={link}
                href="#"
                className="text-xs transition-colors duration-150"
                style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#1B3B2B')}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = '#7a9a86')}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

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
    <div
      className="p-7 rounded-3xl cursor-default transition-all duration-300"
      style={{
        background: hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: hovered
          ? `1px solid rgba(162, 191, 166, 0.6)`
          : `1px solid rgba(162, 191, 166, 0.3)`,
        boxShadow: hovered
          ? '0 20px 48px rgba(27,59,43,0.12)'
          : '0 4px 24px rgba(27,59,43,0.06)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Emoji badge */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform duration-200"
        style={{
          background: tagColor,
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {emoji}
      </div>

      {/* Label chip */}
      <div
        className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4"
        style={{
          background: tagColor,
          color: tagTextColor,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </div>

      <p
        className="text-[15px] leading-relaxed mb-5"
        style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
      >
        {body}
      </p>

      <div className="flex items-center gap-1.5">
        <span
          className="text-xs font-semibold"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color,
          }}
        >
          {highlight}
        </span>
        <span style={{ color, fontSize: '12px' }}>→</span>
      </div>
    </div>
  )
}
