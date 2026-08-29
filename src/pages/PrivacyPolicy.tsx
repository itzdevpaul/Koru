import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import KoruLogo from '../components/KoruLogo'

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Privacy Policy – Koru'
  }, [])

  return (
    <div
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      className="min-h-screen bg-[#FBF9F5] text-[#1B3B2B] overflow-x-hidden"
    >
      {/* Background blob */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          className="absolute -top-32 -right-32 w-[min(500px,100vw)] h-[min(500px,100vw)] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #A2BFA6 0%, transparent 70%)' }}
        />
      </div>

      {/* Nav */}
      <header role="banner">
        <nav
          aria-label="Main navigation"
          className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-4xl mx-auto"
        >
          <Link to="/" aria-label="Back to Koru home" className="flex items-center gap-2.5 no-underline">
            <KoruLogo size={36} wordmarkSize={18} />
          </Link>

          <Link
            to="/"
            className="text-sm font-medium px-4 py-2 rounded-full border transition-all duration-200 hover:bg-[#1B3B2B] hover:text-[#FBF9F5]"
            style={{
              borderColor: '#1B3B2B',
              color: '#1B3B2B',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ← Back to Home
          </Link>
        </nav>
      </header>

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-20 sm:pb-28">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
            style={{
              background: 'rgba(162,191,166,0.25)',
              border: '1px solid rgba(162,191,166,0.5)',
              color: '#3a6b4a',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            🔒 Last updated: July 27, 2026
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4"
            style={{ color: '#1B3B2B' }}
          >
            Privacy Policy
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
          >
            At Koru, your privacy is not an afterthought — it's a core design principle.
            This policy explains what we collect, why, and how we protect it.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-14">
          <Section title="1. Who We Are">
            <p>
              Koru ("<strong>Koru</strong>", "we", "us", or "our") is a digital self-discovery
              and personal development platform operated from Nigeria and accessible at{' '}
              <a href="https://koru.com.ng" className="underline hover:text-[#3a6b4a]">koru.com.ng</a>.
              We provide interactive assessments, personality insights, and career-matching
              guidance tools to help users navigate life, career, and personal growth decisions.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <SubSection title="2.1 Information You Provide">
              <ul>
                <li><strong>Account email address:</strong> When you create an account, we collect your email address to authenticate you and send relevant updates.</li>
                <li><strong>Assessment responses:</strong> When you complete assessments, your answers are processed to generate your personalised report. You may complete assessments anonymously — a name is never required.</li>
              </ul>
            </SubSection>
            <SubSection title="2.2 Information Collected Automatically">
              <ul>
                <li><strong>Browser metadata:</strong> We log your browser's user-agent string to help us optimise compatibility.</li>
                <li><strong>Usage data:</strong> Standard web analytics data (page views, session duration, referral source) may be collected to improve the product.</li>
              </ul>
            </SubSection>
            <SubSection title="2.3 Information We Do Not Collect">
              <p>We do not require your full name, home address, phone number, national ID, or government-issued identification at any point.</p>
            </SubSection>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To authenticate your account and send you product updates.</li>
              <li>To generate your personalised self-discovery report (assessment responses).</li>
              <li>To improve the performance, compatibility, and experience of Koru.</li>
              <li>To comply with applicable law where required.</li>
            </ul>
            <p className="mt-4">
              We will <strong>never</strong> sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </Section>

          <Section title="4. Data Storage & Security">
            <p>
              Your data is stored in Google Firebase Firestore, hosted on Google Cloud
              infrastructure with industry-standard encryption at rest (AES-256) and in transit
              (TLS 1.2+). Google Cloud's security certifications include ISO 27001, SOC 2/3,
              and GDPR compliance frameworks.
            </p>
            <p className="mt-3">
              We apply the principle of least privilege — only authorised personnel
              can access stored data, and access is logged and audited.
            </p>
          </Section>

          <Section title="5. Anonymity Options">
            <p>
              Users can take assessments without providing any identifying information beyond
              their account email. Anonymous sessions are not linked to any email address
              unless you choose to save or share your results.
            </p>
          </Section>

          <Section title="6. Cookies & Tracking">
            <p>
              Our site uses no third-party advertising or tracking cookies. We may use
              essential cookies to maintain session state and first-party analytics to understand
              aggregate usage patterns. We do not use cross-site tracking technologies.
            </p>
          </Section>

          <Section title="7. Third-Party Services">
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Google Firebase / Firestore</strong> — data storage and backend infrastructure. Governed by <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#3a6b4a]">Google's Privacy Policy</a>.</li>
              <li><strong>Google Fonts</strong> — font delivery. May log a request to Google's servers when the page loads.</li>
            </ul>
            <p className="mt-3">We do not integrate Facebook Pixel, Google Ads, or any advertising networks at this time.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Correct</strong> inaccurate data.</li>
              <li><strong>Delete</strong> your data ("right to be forgotten").</li>
              <li><strong>Withdraw consent</strong> at any time (e.g. unsubscribe from updates).</li>
              <li><strong>Object</strong> to certain types of processing.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:privacy@koru.com.ng" className="underline hover:text-[#3a6b4a]">privacy@koru.com.ng</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="9. Data Retention">
            <p>
              Your account data is retained for as long as your account is active. You may
              request deletion of your data at any time. If you delete your account, your
              personal information is removed within 90 days unless retention is required by
              applicable law.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              Koru's tools are designed for users aged 13 and above. We do not knowingly
              collect personal information from children under 13. If you believe a child
              under 13 has submitted data, please contact us at{' '}
              <a href="mailto:privacy@koru.com.ng" className="underline hover:text-[#3a6b4a]">privacy@koru.com.ng</a>{' '}
              and we will delete it promptly.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy as the product evolves. When we do, we will
              revise the "last updated" date at the top of this page and, where changes are
              material, notify users by email.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              Questions or concerns about this policy? Reach us at:
            </p>
            <div
              className="mt-4 p-5 rounded-2xl"
              style={{
                background: 'rgba(162,191,166,0.12)',
                border: '1px solid rgba(162,191,166,0.35)',
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#1B3B2B' }}>
                <strong>Koru</strong><br />
                Email: <a href="mailto:privacy@koru.com.ng" className="underline hover:text-[#3a6b4a]">privacy@koru.com.ng</a><br />
                Website: <a href="https://koru.com.ng" className="underline hover:text-[#3a6b4a]">koru.com.ng</a>
              </p>
            </div>
          </Section>
        </div>
      </main>

      <PageFooter />
    </div>
  )
}

/* ── Shared sub-components ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-xl sm:text-2xl font-bold mb-4"
        style={{ color: '#1B3B2B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h2>
      <div
        className="space-y-3 text-[15px] sm:text-base leading-relaxed"
        style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
      >
        {children}
      </div>
      <hr className="mt-10 sm:mt-14" style={{ borderColor: 'rgba(162,191,166,0.3)' }} />
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3
        className="text-base font-semibold mb-2"
        style={{ color: '#1B3B2B', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

function PageFooter() {
  return (
    <footer
      role="contentinfo"
      className="relative z-10 py-8 px-4 sm:px-6"
      style={{ borderTop: '1px solid rgba(162,191,166,0.3)' }}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <KoruLogo size={28} wordmarkSize={14} />
        </Link>
        <p className="text-xs" style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}>
          © {new Date().getFullYear()} Koru. All rights reserved.
        </p>
        <nav className="flex items-center gap-4" aria-label="Footer links">
          <Link to="/privacy-policy" className="text-xs hover:text-[#1B3B2B] transition-colors" style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}>Privacy Policy</Link>
          <Link to="/terms-of-service" className="text-xs hover:text-[#1B3B2B] transition-colors" style={{ fontFamily: "'Inter', sans-serif", color: '#7a9a86' }}>Terms of Service</Link>
        </nav>
      </div>
    </footer>
  )
}
