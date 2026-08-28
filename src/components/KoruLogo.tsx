/**
 * KoruLogo — Pathfinder K brand mark.
 *
 * Renders the folded-path "K" icon from the Koru Pathfinder brand kit as inline
 * SVG (crisp at every size, theme-aware) with an optional "Koru" serif wordmark
 * and "MAKE ROOM TO KNOW" tagline.
 *
 * @tone  'ink'   — deep-ink icon for light/paper backgrounds (#27342F + coral)
 *        'paper' — paper icon for dark/ink backgrounds  (#F4F0E7 + saffron)
 */

type KoruLogoProps = {
  tone?: 'ink' | 'paper'
  size?: number
  showWordmark?: boolean
  wordmarkSize?: number
  showTagline?: boolean
  className?: string
}

export default function KoruLogo({
  tone = 'ink',
  size = 32,
  showWordmark = true,
  wordmarkSize,
  showTagline = false,
  className = '',
}: KoruLogoProps) {
  const stroke = tone === 'ink' ? '#27342F' : '#F4F0E7'
  const accent = tone === 'ink' ? '#DD684F' : '#E3B64E'
  const wordmarkColor = stroke
  const taglineColor = accent
  const wmSize = wordmarkSize ?? Math.round(size * 0.82)

  return (
    <span className={`inline-flex items-center gap-2 ${className}`} aria-label="Koru">
      {/* Pathfinder K icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M43 18V142" stroke={stroke} strokeWidth="14" strokeLinecap="square" />
        <path
          d="M43 80C58 80 66 70 74 51C81 33 91 20 107 20C120 20 127 28 126 39C125 52 113 59 98 66L76 76C62 82 59 95 66 108C73 121 91 130 108 122C119 117 125 108 126 97"
          stroke={stroke}
          strokeWidth="14"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path d="M43 80L107 139" stroke={stroke} strokeWidth="14" strokeLinecap="square" />
        <path d="M43 80L78 48" stroke={accent} strokeWidth="4" strokeLinecap="square" />
        <circle cx="43" cy="80" r="4.5" fill={accent} />
      </svg>

      {showWordmark && (
        <span className="inline-flex flex-col" style={{ lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: wmSize,
              fontWeight: 500,
              letterSpacing: '-0.04em',
              color: wordmarkColor,
            }}
          >
            Koru
          </span>
          {showTagline && (
            <span
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: Math.max(8, Math.round(wmSize * 0.14)),
                fontWeight: 700,
                letterSpacing: '0.28em',
                color: taglineColor,
                marginTop: 2,
              }}
            >
              MAKE ROOM TO KNOW
            </span>
          )}
        </span>
      )}
    </span>
  )
}
