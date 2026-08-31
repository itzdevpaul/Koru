interface RadarDatum {
  label: string
  start: number   // 0–5
  end: number     // 0–5
}

/**
 * Lightweight SVG radar chart comparing Day 1 vs Day 30 across multiple axes.
 * No external charting library — pure SVG.
 */
export default function RadarChart({ data, size = 240 }: { data: RadarDatum[]; size?: number }) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  const axes = data.length
  const levels = 5

  // Convert (axisIndex, value 0-5) to (x, y)
  function point(axisIndex: number, value: number) {
    const angle = (Math.PI * 2 * axisIndex) / axes - Math.PI / 2
    const r = (value / levels) * radius
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  }

  function polygon(values: number[]) {
    return values.map((v, i) => {
      const p = point(i, v)
      return `${p.x},${p.y}`
    }).join(' ')
  }

  const startValues = data.map(d => d.start)
  const endValues = data.map(d => d.end)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {/* Grid rings */}
      {Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * radius
        const pts = Array.from({ length: axes }, (_, j) => {
          const angle = (Math.PI * 2 * j) / axes - Math.PI / 2
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(' ')
        return <polygon key={i} points={pts} fill="none" stroke="#e8e5de" strokeWidth={0.8} />
      })}

      {/* Axis lines */}
      {data.map((_, i) => {
        const p = point(i, levels)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e8e5de" strokeWidth={0.8} />
      })}

      {/* Start polygon (Day 1) */}
      <polygon
        points={polygon(startValues)}
        fill="rgba(162,191,166,0.15)"
        stroke="#A2BFA6"
        strokeWidth={2}
        strokeDasharray="4 3"
      />

      {/* End polygon (Day 30) */}
      <polygon
        points={polygon(endValues)}
        fill="rgba(27,59,43,0.12)"
        stroke="#1B3B2B"
        strokeWidth={2}
      />

      {/* Axis labels */}
      {data.map((d, i) => {
        const p = point(i, levels + 0.8)
        return (
          <text
            key={d.label}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontWeight={600}
            fill="#7a9a86"
            fontFamily="'Inter', sans-serif"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}
