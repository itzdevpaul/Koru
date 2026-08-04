import type { Ad } from '../firebase'

interface AdModalProps {
  ad: Ad
  onDismiss: () => void
}

export default function AdModal({ ad, onDismiss }: AdModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#FBF9F5' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-7 h-7 rounded-full"
          style={{ background: 'rgba(27,59,43,0.12)', color: '#1B3B2B' }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Image */}
        {ad.imageBase64 && (
          <img
            src={ad.imageBase64}
            alt={ad.title}
            className="w-full object-cover"
            style={{ maxHeight: 200 }}
          />
        )}

        {/* Content */}
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#A2BFA6' }}>
            Sponsored
          </p>
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#1B3B2B' }}>
            {ad.title}
          </h3>
          <p className="text-sm mb-4" style={{ color: '#4A6358' }}>
            {ad.description}
          </p>
          <a
            href={ad.ctaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#1B3B2B', color: '#FBF9F5' }}
          >
            {ad.ctaText}
          </a>
        </div>
      </div>
    </div>
  )
}
