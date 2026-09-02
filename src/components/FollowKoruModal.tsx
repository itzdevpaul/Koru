import KoruLogo from './KoruLogo'

type FollowKoruModalProps = {
  onCancel: () => void
  cancelCooldown: number
}

export default function FollowKoruModal({ onCancel, cancelCooldown }: FollowKoruModalProps) {
  const canCancel = cancelCooldown === 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#27342F]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="follow-koru-title">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-[#F4F0E7] shadow-2xl">
        <div className="flex items-center justify-between bg-[#1B3B2B] px-5 py-3">
          <span className="rounded-full bg-[#F4F0E7]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F4F0E7]">A note from Koru</span>
          <button type="button" onClick={onCancel} disabled={!canCancel} className="rounded-full bg-[#F4F0E7]/20 px-3 py-1 text-xs font-semibold text-[#F4F0E7] transition-opacity disabled:cursor-not-allowed disabled:opacity-50" aria-label={canCancel ? 'Close' : `Close available in ${cancelCooldown} seconds`}>
            {canCancel ? 'Close' : `Wait ${cancelCooldown}s`}
          </button>
        </div>
        <div className="px-7 pb-7 pt-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#E3B64E]/20">
            <KoruLogo size={52} showWordmark={false} tone="ink" />
          </div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#DD684F]">Make room to know</p>
          <h2 id="follow-koru-title" className="mb-3 text-3xl font-bold leading-tight text-[#27342F]">Keep growing with Koru.</h2>
          <p className="mb-7 text-sm leading-6 text-[#4A6358]">Follow Koru on X for thoughtful prompts, honest conversations, and small reminders to come back to yourself.</p>
          <a href="https://x.com/theofficialkoru" target="_blank" rel="noopener noreferrer" className="block w-full rounded-2xl bg-[#1B3B2B] py-3.5 text-sm font-bold text-[#F4F0E7] transition-transform hover:-translate-y-0.5">Follow @theofficialkoru on X</a>
          <button type="button" onClick={onCancel} disabled={!canCancel} className="mt-4 text-xs font-semibold text-[#7A9A86] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:no-underline">{canCancel ? 'Maybe later' : `Maybe later in ${cancelCooldown}s`}</button>
        </div>
      </div>
    </div>
  )
}
