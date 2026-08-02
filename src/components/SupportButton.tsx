const I = "'Inter', sans-serif"

export default function SupportButton() {
  return (
    <a
      href="mailto:support@koru.com.ng?subject=Support%20Request"
      aria-label="Contact support"
      title="Email support"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        padding: '9px 15px 9px 12px',
        background: '#fff',
        border: '1.5px solid rgba(27,59,43,0.13)',
        borderRadius: 999,
        boxShadow: '0 4px 20px rgba(27,59,43,0.10)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s, transform 0.18s',
        fontFamily: I,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.boxShadow = '0 6px 28px rgba(27,59,43,0.18)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.boxShadow = '0 4px 20px rgba(27,59,43,0.10)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>💬</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#1B3B2B', whiteSpace: 'nowrap' }}>
        Support
      </span>
    </a>
  )
}
