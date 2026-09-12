import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const features = [
  { id: 'archetype', eyebrow: 'Self-discovery', title: 'Life-Stage Archetype Quiz', description: 'A conversational quiz that helps you name the season you are in and choose a practical next step.', action: 'Start the quiz', href: '/quiz/life-stage-archetype', status: 'Available', tone: 'forest' },
  { id: 'mood', eyebrow: 'Pattern noticing', title: 'Mood-to-Insight Tracker', description: 'Track emotional weather across life areas and notice patterns without turning feelings into a diagnosis.', action: 'Open tracker', href: '/mood-insights', status: 'Available', tone: 'sage' },
  { id: 'boundaries', eyebrow: 'Coming soon', title: 'Boundary Scripts', description: 'Find clear, kind words for difficult conversations at work, home, and in relationships.', action: 'Coming soon', href: '#boundaries', status: 'Coming soon', tone: 'muted' },
  { id: 'workbooks', eyebrow: 'Coming soon', title: 'Clarity Workbooks', description: 'Downloadable reflection guides for moments when you want to think without a signal, login, or screen.', action: 'Coming soon', href: '#workbooks', status: 'Coming soon', tone: 'muted' },
]

export default function Roadmap() {
  const { c } = useTheme()
  return <main className="min-h-screen px-5 py-8 md:px-10" style={{ background: c.bg, color: c.forest }}>
    <div className="mx-auto max-w-6xl">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-5">
        <div>
          <Link to="/home" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-80" style={{ color: c.forest, background: c.card, border: `1px solid ${c.cardBorder}` }}><span aria-hidden="true">←</span> Back to Koru home</Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: c.muted }}>The Koru roadmap</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl" style={{ fontFamily: 'Georgia, serif' }}>More ways to find your next clear step.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7" style={{ color: c.body }}>Available tools are ready to use now. The ideas below are a transparent backlog, not promises that every feature is already live.</p>
        </div>
        <Link to="/assistant" className="rounded-2xl border px-4 py-3 text-sm font-bold transition-opacity hover:opacity-80" style={{ background: c.surface, borderColor: c.cardBorder, color: c.forest }}>Talk it through</Link>
      </header>

      <section aria-label="Roadmap overview" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(feature => <a key={feature.id} href={feature.href} className="group flex min-h-64 flex-col justify-between rounded-3xl p-6 transition-transform hover:-translate-y-1" style={{ background: feature.tone === 'forest' ? c.forest : feature.tone === 'sage' ? c.surface : c.card, color: feature.tone === 'forest' ? '#fff' : c.forest, border: `1px solid ${c.cardBorder}`, boxShadow: c.shadow }}>
          <div>
            <div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{feature.eyebrow}</span><span className="text-xs opacity-70">{feature.status}</span></div>
            <h2 className="mt-8 text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 opacity-80">{feature.description}</p>
          </div>
          <span className="mt-8 text-sm font-bold">{feature.action} <span aria-hidden="true">→</span></span>
        </a>)}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <article id="boundaries" className="scroll-mt-8 rounded-3xl p-7" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}><p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: c.muted }}>Boundary Scripts</p><h2 className="mt-3 text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Words for the moment before you go quiet.</h2><p className="mt-3 text-sm leading-6" style={{ color: c.body }}>Start with a situation, choose the tone you need, and adapt a script that protects your time without turning the conversation into a fight.</p><div className="mt-5 flex flex-wrap gap-2">{['Saying no', 'Workload', 'Family', 'Relationships'].map(item => <span key={item} className="rounded-full px-3 py-2 text-xs font-semibold" style={{ background: c.tag, color: c.tagText }}>{item}</span>)}</div></article>
        <article id="workbooks" className="scroll-mt-8 rounded-3xl p-7" style={{ background: c.surface, border: `1px solid ${c.cardBorder}` }}><p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: c.muted }}>Offline Clarity Workbooks</p><h2 className="mt-3 text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Take the reflection with you.</h2><p className="mt-3 text-sm leading-6" style={{ color: c.body }}>Save a focused workbook before you travel or step away from your connection. Use it for a decision, a transition, or a reset.</p><button className="mt-5 rounded-xl px-4 py-2 text-sm font-bold" style={{ background: c.forest, color: '#fff' }}>Download a workbook</button></article>
        <article id="archetype" className="scroll-mt-8 rounded-3xl p-7" style={{ background: c.card, border: `1px solid ${c.cardBorder}` }}><p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: c.muted }}>Life-Stage Archetype Quiz</p><h2 className="mt-3 text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Name the season you are navigating.</h2><p className="mt-3 text-sm leading-6" style={{ color: c.body }}>A guided quiz maps your current questions into a practical 14-day route, so self-understanding becomes movement.</p><Link to="/quiz/life-stage-archetype" className="mt-5 inline-block rounded-xl px-4 py-2 text-sm font-bold" style={{ background: c.surface, border: `1px solid ${c.cardBorder}`, color: c.forest }}>Start the quiz</Link></article>
        <article id="mood" className="scroll-mt-8 rounded-3xl p-7" style={{ background: c.surface, border: `1px solid ${c.cardBorder}` }}><p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: c.muted }}>Mood-to-Insight Tracker</p><h2 className="mt-3 text-2xl font-bold" style={{ fontFamily: 'Georgia, serif' }}>Notice your emotional weather.</h2><p className="mt-3 text-sm leading-6" style={{ color: c.body }}>Log how you feel across work, relationships, body, money, and home. Koru helps you notice repeated conditions without diagnosing you.</p><Link to="/mood-insights" className="mt-5 inline-block rounded-xl px-4 py-2 text-sm font-bold" style={{ background: c.surface, border: `1px solid ${c.cardBorder}`, color: c.forest }}>Open tracker</Link></article>
      </section>
    </div>
  </main>
}
