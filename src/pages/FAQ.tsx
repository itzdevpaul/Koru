import { Link } from 'react-router-dom'

const questions = [
  ['What is Koru?', 'Koru is a digital self discovery and personal development platform that helps you understand yourself, make clearer decisions, and grow with intention.'],
  ['Who is Koru for?', 'Koru is for individuals moving through life changes, career questions, identity questions, relationship decisions, and personal growth.'],
  ['What does Koru include?', 'Koru includes science backed assessments, personality and self discovery insights, career guidance, personal growth roadmaps, daily check ins, journaling, mood insights, an assistant, and shareable reports.'],
  ['Is Koru free to use?', 'You can take quizzes and receive a free teaser result. Deeper reports are available through Koru Pro or a one time report unlock.'],
  ['Is Koru worth it?', 'Koru is designed for people who want more than a quick quiz result. It brings assessment, reflection, guidance, and practical next steps together so you can return to your progress over time.'],
  ['How much does Koru cost?', 'Koru Pro costs ₦2,500 per month. New subscribers receive an introductory first month price of ₦1,000. A single deep report can be unlocked for ₦1,000 without a subscription.'],
  ['What is the refund policy?', 'Refund requests must be made within 48 hours of the purchase. Contact Koru support with your account email and payment details so the request can be reviewed.'],
  ['Is Koru a replacement for professional care?', 'No. Koru is a self development and reflection tool. It does not replace medical, mental health, legal, financial, or career advice from a qualified professional.'],
]

export default function FAQ() {
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) }
  return <><script type="application/ld+json">{JSON.stringify(faqSchema)}</script><main className="min-h-screen bg-[#FBF9F5] px-5 py-8 text-[#1B3B2B] sm:px-8"><div className="mx-auto max-w-3xl"><Link to="/" className="text-sm font-semibold">← Back to Koru</Link><p className="mt-16 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B8F71]">Koru FAQ</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">Clear answers for clear decisions.</h1><p className="mt-6 text-lg leading-8 text-[#53665A]">Learn what Koru does, who it is for, what it costs, and how your access works.</p><div className="mt-10 space-y-4">{questions.map(([question, answer]) => <details key={question} className="rounded-2xl border border-[#DCE5DE] bg-white p-5"><summary className="cursor-pointer text-lg font-bold">{question}</summary><p className="mt-4 leading-7 text-[#66756A]">{answer}</p></details>)}</div><nav className="mt-10 flex flex-wrap gap-4 text-sm font-semibold"><Link to="/about">About Koru</Link><Link to="/pricing">Pricing</Link><Link to="/signup">Create an account</Link></nav></div></main></>
}
