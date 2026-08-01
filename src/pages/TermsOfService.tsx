import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Terms of Service – Koru'
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
        <div
          className="absolute bottom-0 left-0 w-[min(400px,80vw)] h-[min(400px,80vw)] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #E07A5F 0%, transparent 70%)' }}
        />
      </div>

      {/* Nav */}
      <header role="banner">
        <nav
          aria-label="Main navigation"
          className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-4xl mx-auto"
        >
          <Link to="/" aria-label="Back to Koru home" className="flex items-center gap-2.5 no-underline">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1B3B2B 0%, #2a5240 100%)' }}
              aria-hidden="true"
            >
              🌿
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: '#1B3B2B' }}
            >
              Koru
            </span>
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
            📄 Last updated: July 27, 2026
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4"
            style={{ color: '#1B3B2B' }}
          >
            Terms of Service
          </h1>
          <p
            className="text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ fontFamily: "'Inter', sans-serif", color: '#4a6a58' }}
          >
            Please read these terms carefully before using Koru. By joining our waitlist
            or using our platform, you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-10 sm:space-y-14">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Koru's website at{' '}
              <a href="https://koru.com.ng" className="underline hover:text-[#3a6b4a]">koru.com.ng</a>{' '}
              (the "<strong>Site</strong>"), joining our waitlist, or using any Koru services
              (collectively the "<strong>Services</strong>"), you agree to be bound by these
              Terms of Service ("<strong>Terms</strong>") and our{' '}
              <Link to="/privacy-policy" className="underline hover:text-[#3a6b4a]">Privacy Policy</Link>.
            </p>
            <p>
              If you do not agree to these Terms, please do not use the Services.
            </p>
          </Section>

          <Section title="2. About Koru">
            <p>
              Koru is a digital self-discovery and personal development platform that provides
              interactive assessments, personality insights, and career-matching guidance. Users
              may pay a micro-fee to unlock comprehensive premium reports and personalised
              developmental roadmaps.
            </p>
            <p>
              Koru's Services are intended for personal, non-commercial use. The information
              and insights provided are for educational and guidance purposes only and do not
              constitute professional psychological, medical, legal, or career advice.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <p>
              To use Koru's Services, you must be at least 13 years of age. If you are under
              18, you confirm that you have obtained the consent of a parent or legal guardian
              to use the Services.
            </p>
            <p>
              By using Koru, you represent and warrant that your use complies with all
              applicable laws and regulations in your jurisdiction.
            </p>
          </Section>

          <Section title="4. Waitlist">
            <p>
              By joining the Koru waitlist, you provide your email address and consent to
              receive a launch notification and relevant product updates from Koru. You may
              unsubscribe at any time by clicking the unsubscribe link in any email or by
              contacting us at{' '}
              <a href="mailto:hello@koru.com.ng" className="underline hover:text-[#3a6b4a]">hello@koru.com.ng</a>.
            </p>
            <p>
              Joining the waitlist does not guarantee access to Koru at any particular time,
              nor does it create any contractual obligation on Koru's part to launch the
              Services by a specific date.
            </p>
          </Section>

          <Section title="5. Use of the Services">
            <SubSection title="5.1 Permitted Use">
              <p>You may use the Services for your own personal, non-commercial self-discovery and development purposes.</p>
            </SubSection>
            <SubSection title="5.2 Prohibited Conduct">
              <p>You agree not to:</p>
              <ul>
                <li>Use the Services for any unlawful, harmful, or fraudulent purpose.</li>
                <li>Attempt to reverse-engineer, copy, scrape, or resell any part of the Services.</li>
                <li>Submit false, misleading, or fraudulent information.</li>
                <li>Interfere with or disrupt the Services or servers connected to the Services.</li>
                <li>Use automated means (bots, scrapers, crawlers) to access the Services without prior written consent.</li>
                <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              </ul>
            </SubSection>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              All content on the Site and within the Services — including text, graphics,
              assessments, reports, logos, and software — is owned by or licensed to Koru and
              protected by Nigerian and international intellectual property laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, create derivative works of, publicly
              display, or otherwise exploit any Koru content without our express prior written
              permission.
            </p>
            <p>
              Your personalised assessment results and reports are generated for your personal
              use. Koru retains the right to use anonymised, aggregated data derived from
              assessments to improve the Services.
            </p>
          </Section>

          <Section title="7. Payments & Premium Reports">
            <p>
              Certain features — including comprehensive reports and personalised roadmaps —
              will require payment of a micro-fee at the time of access. Payment details,
              pricing, and refund policies will be communicated clearly before any charge is
              made.
            </p>
            <p>
              All fees are non-refundable once a premium report has been generated and delivered,
              except where required by applicable law or where Koru, at its sole discretion,
              determines a refund is appropriate.
            </p>
          </Section>

          <Section title="8. Disclaimers">
            <p>
              The Services and all content are provided on an "<strong>as is</strong>" and
              "<strong>as available</strong>" basis without warranties of any kind, express or
              implied.
            </p>
            <p>
              Koru does not warrant that the Services will be uninterrupted, error-free, or
              free of harmful components. Assessment results and insights are based on
              self-reported data and established psychometric frameworks — they are intended
              as a guide, not a definitive diagnosis or professional recommendation.
            </p>
            <p>
              <strong>Koru is not a substitute for professional psychological, medical,
              career, or legal advice.</strong> If you are in crisis or require urgent support,
              please contact a qualified professional or a crisis helpline.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, Koru and its directors,
              employees, and affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of or
              inability to use the Services.
            </p>
            <p>
              Koru's total liability for any claim arising under these Terms shall not exceed
              the amount you paid to Koru in the twelve months preceding the claim, or NGN 5,000,
              whichever is greater.
            </p>
          </Section>

          <Section title="10. Third-Party Links">
            <p>
              The Services may contain links to third-party websites or services. These links
              are provided for your convenience only. Koru does not endorse and is not
              responsible for the content, privacy practices, or terms of any third-party
              site.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              We reserve the right to suspend or terminate your access to the Services at any
              time, without notice, if you violate these Terms or engage in conduct we determine
              is harmful to other users or to Koru.
            </p>
            <p>
              You may stop using the Services at any time. To remove your data, please
              contact{' '}
              <a href="mailto:privacy@koru.com.ng" className="underline hover:text-[#3a6b4a]">privacy@koru.com.ng</a>.
            </p>
          </Section>

          <Section title="12. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the
              Federal Republic of Nigeria. Any dispute arising from these Terms shall be
              subject to the exclusive jurisdiction of the courts of Nigeria, without regard
              to conflict of law provisions.
            </p>
          </Section>

          <Section title="13. Changes to These Terms">
            <p>
              We may update these Terms from time to time. When we do, we will revise the
              "last updated" date above. Continued use of the Services after changes are
              posted constitutes your acceptance of the revised Terms. For material changes,
              we will provide reasonable notice via email or a prominent notice on the Site.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>Questions about these Terms? Get in touch:</p>
            <div
              className="mt-4 p-5 rounded-2xl"
              style={{
                background: 'rgba(162,191,166,0.12)',
                border: '1px solid rgba(162,191,166,0.35)',
              }}
            >
              <p style={{ fontFamily: "'Inter', sans-serif", color: '#1B3B2B' }}>
                <strong>Koru</strong><br />
                Email: <a href="mailto:hello@koru.com.ng" className="underline hover:text-[#3a6b4a]">hello@koru.com.ng</a><br />
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
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: '#1B3B2B' }} aria-hidden="true">🌿</div>
          <span className="text-base font-bold" style={{ color: '#1B3B2B' }}>Koru</span>
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
