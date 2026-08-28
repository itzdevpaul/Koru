type KoruLoaderProps = {
  label?: string
  compact?: boolean
}

export default function KoruLoader({ label, compact = false }: KoruLoaderProps) {
  const size = compact ? 22 : 40

  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status" aria-live="polite">
      <span
        style={{
          width: size,
          height: size,
          borderRadius: '9999px',
          border: `${compact ? 2 : 3}px solid #A2BFA6`,
          borderTopColor: '#1B3B2B',
          display: 'inline-block',
          animation: 'spin 0.9s linear infinite',
        }}
      />
      {label && (
        <p
          style={{
            color: '#1B3B2B',
            fontFamily: "'Inter', sans-serif",
            fontSize: compact ? 12 : 14,
          }}
        >
          {label}
        </p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
