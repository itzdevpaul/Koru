import { Link } from 'react-router-dom'
import KoruLogo from '../components/KoruLogo'

export default function About() {
  return (
    <main className="min-h-screen bg-[#FBF9F5] px-5 py-8 text-[#1B3B2B] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/" aria-label="Koru home"><KoruLogo size={42} /></Link>
        <p className="mt-16 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B8F71]">About Koru</p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">A clearer way to understand yourself and move forward.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#53665A]">Koru is a digital self discovery and personal development platform for people navigating important choices about identity, work, relationships, and what comes next.</p>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {['Understand your patterns', 'Make clearer decisions', 'Keep growing with intention'].map((title) => <section key={title} className="rounded-3xl border border-[#DCE5DE] bg-white p-5"><h2 className="text-lg font-bold">{title}</h2><p className="mt-3 text-sm leading-6 text-[#66756A]">Koru combines science backed assessments, reflection, and practical guidance in one calm space.</p></section>)}
        </div>
        <section className="mt-12 rounded-3xl bg-[#1B3B2B] p-7 text-[#FBF9F5]">
          <h2 className="text-2xl font-bold">Built in Nigeria</h2>
          <p className="mt-3 leading-7 text-[#C6D8C8]">Koru was founded and developed by Paul Adamu in Nigeria and launched on August 4, 2026.</p>
          <p className="mt-4 text-sm text-[#C6D8C8]">Contact: <a className="underline" href="mailto:pauladamu600@gmail.com">pauladamu600@gmail.com</a></p>
          <p className="mt-2 text-sm text-[#C6D8C8]"><a className="underline" href="https://linkedin.com/in/paul-adamu-67bb46324" target="_blank" rel="noreferrer">Connect with Paul Adamu on LinkedIn</a></p>
        </section>
        <nav className="mt-10 flex flex-wrap gap-4 text-sm font-semibold"><Link to="/faq">Frequently asked questions</Link><Link to="/pricing">Pricing</Link><Link to="/privacy-policy">Privacy</Link><Link to="/">Back to Koru</Link></nav>
      </div>
    </main>
  )
}
