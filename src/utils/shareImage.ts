// Canvas-based shareable image generator for Koru

const FOREST = '#1B3B2B'
const CREAM  = '#FBF9F5'
const SAGE   = '#A2BFA6'
const BODY   = '#4A6358'

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS  = "'Plus Jakarta Sans', 'Inter', sans-serif"
const BODY_SANS = "'Inter', sans-serif"

// ── Self-discovery (result card) palette ────────────────────────────────────
const BEIGE    = '#F5F3ED'
const INK      = '#2D2D2A'
const STONE    = '#8B8983'
const CORE_BG  = '#2D322E'
const ROSE     = '#D49B90'
const CORAL    = '#E5735F'
const SAGE_FILL = '#B7C7B6'
const SAGE_LINE = '#7FB386'

// ── Daily ritual (check-in card) palette ─────────────────────────────────────
const NIGHT        = '#0f1311'
const FOREST_DARK  = '#1a201c'
const FOREST_CARD  = '#242b27'
const RITUAL_SAGE  = '#7a9184'
const RITUAL_MUTED = '#8b948f'
const RITUAL_OFF   = '#f2f2f2'
const MOOD_GREEN   = '#7d9e8b'
const ENERGY_GOLD  = '#c9a55c'
const STREAK_ORANGE = '#d17b5f'

const MOOD_PCT: Record<string, number> = {
  rough: 20, low: 40, okay: 60, good: 80, thriving: 100,
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x,     y + r)
  ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

// ── Shared drawing helpers ───────────────────────────────────────────────────

// Deterministic 5–18 percentile from a seed string (stable per result title).
function hashPercentile(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0
  return 5 + (h % 14)
}

// Pathfinder "K" brand mark drawn as crisp canvas strokes.
function drawKMark(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, size: number, color: string, accent: string,
) {
  const sw = size * 0.16
  ctx.strokeStyle = color
  ctx.lineWidth = sw
  ctx.lineCap = 'square'
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + size); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, y + size * 0.5); ctx.lineTo(x + size * 0.82, y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x, y + size * 0.5); ctx.lineTo(x + size * 0.82, y + size); ctx.stroke()
  ctx.fillStyle = accent
  ctx.beginPath(); ctx.arc(x, y + size * 0.5, sw * 0.55, 0, Math.PI * 2); ctx.fill()
}

// Pentagon radar chart for the trait profile.
function drawRadar(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, R: number,
  axes: { label: string; value: number }[],
  o: { line: string; fill: string; node: string; labelColor: string; valueColor: string; gridColor: string },
) {
  const n = axes.length
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const pt = (i: number, r: number) => ({ x: cx + r * Math.cos(ang(i)), y: cy + r * Math.sin(ang(i)) })

  ctx.strokeStyle = o.gridColor
  ctx.lineWidth = 1
  for (const f of [0.33, 0.66, 1]) {
    ctx.beginPath()
    for (let i = 0; i < n; i++) {
      const p = pt(i, R * f)
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
    }
    ctx.closePath(); ctx.stroke()
  }
  for (let i = 0; i < n; i++) {
    const p = pt(i, R)
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke()
  }

  ctx.beginPath()
  for (let i = 0; i < n; i++) {
    const v = Math.max(10, Math.min(100, axes[i].value)) / 100
    const p = pt(i, R * v)
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
  }
  ctx.closePath()
  ctx.fillStyle = o.fill; ctx.fill()
  ctx.strokeStyle = o.line; ctx.lineWidth = 2.5; ctx.stroke()

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  for (let i = 0; i < n; i++) {
    const v = Math.max(10, Math.min(100, axes[i].value)) / 100
    const p = pt(i, R * v)
    ctx.fillStyle = o.node
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill()
    const inner = pt(i, Math.max(0, R * v - 28))
    ctx.fillStyle = o.valueColor
    ctx.font = `600 22px ${SANS}`
    ctx.fillText(String(Math.round(axes[i].value)), inner.x, inner.y)
  }
  for (let i = 0; i < n; i++) {
    const p = pt(i, R + 36)
    ctx.fillStyle = o.labelColor
    ctx.font = `500 22px ${SANS}`
    ctx.fillText(axes[i].label, p.x, p.y)
  }
}

// Circular progress meter for the ritual card.
function drawMeter(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, R: number,
  pct: number, color: string, label: string,
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 14
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke()
  ctx.strokeStyle = color
  ctx.lineWidth = 14; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + (Math.max(0, Math.min(100, pct)) / 100) * Math.PI * 2); ctx.stroke()
  ctx.lineCap = 'butt'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `bold 40px ${SERIF}`
  ctx.fillText(`${Math.round(pct)}%`, cx, cy - 6)
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `500 18px ${SANS}`
  ctx.fillText('avg', cx, cy + 26)
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `600 16px ${SANS}`
  ctx.fillText(label, cx, cy + R + 32)
}

// ── Quiz result card (1080×1350) — Self-Discovery Insight ─────────────────────
export async function generateQuizShareImage(data: {
  emoji: string
  title: string
  tagline: string
  quizTitle: string
  traits: string[]
  scores: Record<string, number>
  resultTypes: { id: string; title: string }[]
  handle?: string
}): Promise<Blob> {
  await document.fonts.ready

  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'

  // Background
  ctx.fillStyle = BEIGE
  ctx.fillRect(0, 0, W, H)
  const g = ctx.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.7)
  g.addColorStop(0, 'rgba(183,199,182,0.18)')
  g.addColorStop(1, 'rgba(245,243,237,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)

  const pad = 72
  const cardW = W - pad * 2

  // K mark
  drawKMark(ctx, W - pad - 30, 92, 30, INK, CORAL)

  // Breadcrumb + title
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillStyle = STONE
  ctx.font = `600 24px ${SANS}`
  ctx.fillText('— SELF-DISCOVERY', pad, 108)
  ctx.fillStyle = INK
  ctx.font = `500 46px ${SANS}`
  ctx.fillText('Your Koru Insight', pad, 166)

  // ── Core driver card (dark) ──
  let y = 218
  const coreH = 224
  ctx.fillStyle = CORE_BG
  roundRect(ctx, pad, y, cardW, coreH, 32); ctx.fill()

  const pct = hashPercentile(data.title)
  const badgeText = `TOP ${pct}%`
  ctx.font = `700 22px ${SANS}`
  const badgeW = ctx.measureText(badgeText).width + 44
  ctx.fillStyle = ROSE
  roundRect(ctx, pad + 40, y + 38, badgeW, 48, 24); ctx.fill()
  ctx.fillStyle = '#fff'; ctx.textAlign = 'center'
  ctx.fillText(badgeText, pad + 40 + badgeW / 2, y + 62)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#D1D1CF'
  ctx.font = `600 20px ${SANS}`
  ctx.fillText('• CORE DRIVER', pad + 40, y + 112)

  ctx.fillStyle = '#fff'
  ctx.font = `bold 54px ${SERIF}`
  ctx.fillText(data.title, pad + 40, y + 168)

  const barY = y + coreH - 42
  ctx.fillStyle = 'rgba(212,155,144,0.25)'
  roundRect(ctx, pad + 40, barY, cardW * 0.5, 6, 3); ctx.fill()
  ctx.fillStyle = ROSE
  roundRect(ctx, pad + 40, barY, cardW * 0.5 * (pct / 18), 6, 3); ctx.fill()
  ctx.fillStyle = '#D1D1CF'
  ctx.font = `italic 400 20px ${BODY_SANS}`
  ctx.textAlign = 'right'
  ctx.fillText('globally ranked', pad + cardW - 40, barY - 8)
  ctx.textAlign = 'left'

  // ── Trait profile ──
  y = y + coreH + 54
  ctx.fillStyle = STONE
  ctx.font = `600 22px ${SANS}`
  ctx.textAlign = 'center'
  ctx.fillText('— TRAIT PROFILE —', W / 2, y)

  const maxScore = Math.max(1, ...Object.values(data.scores))
  const axes = data.resultTypes.map(rt => ({
    label: rt.title.replace(/^The /, ''),
    value: Math.round(((data.scores[rt.id] ?? 0) / maxScore) * 92),
  }))
  drawRadar(ctx, W / 2, y + 210, 150, axes, {
    line: SAGE_LINE, fill: 'rgba(183,199,182,0.40)', node: SAGE_LINE,
    labelColor: STONE, valueColor: INK, gridColor: 'rgba(139,137,131,0.25)',
  })

  // ── Insight bullets ──
  let by = y + 420
  ctx.fillStyle = 'rgba(139,137,131,0.07)'
  roundRect(ctx, pad, by, cardW, 158, 24); ctx.fill()
  const bulletColors = ['#D96F65', '#7FB386', '#E3B657']
  const traits = data.traits.slice(0, 3)
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  traits.forEach((t, i) => {
    const ry = by + 38 + i * 42
    ctx.fillStyle = bulletColors[i % 3]
    ctx.beginPath(); ctx.arc(pad + 36, ry, 7, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = INK
    ctx.font = `500 26px ${BODY_SANS}`
    ctx.fillText(t, pad + 60, ry)
  })

  // ── CTA card ──
  let cY = by + 188
  const ctaH = 128
  ctx.fillStyle = CORAL
  roundRect(ctx, pad, cY, cardW, ctaH, 28); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `400 24px ${BODY_SANS}`
  ctx.fillText('Ready to go deeper?', pad + 40, cY + 46)
  ctx.fillStyle = '#fff'
  ctx.font = `bold 34px ${SANS}`
  ctx.fillText('Take the quiz on Koru', pad + 40, cY + 86)
  // arrow button
  const btnR = 30
  const btnX = pad + cardW - 40 - btnR * 2
  const btnCY = cY + ctaH / 2
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(btnX + btnR, btnCY, btnR, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = CORAL; ctx.lineWidth = 3; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(btnX + btnR - 9, btnCY); ctx.lineTo(btnX + btnR + 9, btnCY); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(btnX + btnR + 1, btnCY - 8); ctx.lineTo(btnX + btnR + 9, btnCY); ctx.lineTo(btnX + btnR + 1, btnCY + 8); ctx.stroke()

  // ── Footer ──
  ctx.fillStyle = STONE
  ctx.font = `500 22px ${SANS}`
  ctx.textAlign = 'left'
  ctx.fillText(`@${data.handle || 'yourhandle'}`, pad, H - 54)
  ctx.textAlign = 'right'
  ctx.fillText('koru.app', W - pad, H - 54)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}

// ── Daily check-in card (1080×1350) — Daily Ritual ───────────────────────────
export async function generateCheckInShareImage(data: {
  moodKey: string
  moodEmoji: string
  moodLabel: string
  energy: number
  reflection?: string
  date?: string
  streak?: number
  recentCheckIns?: Array<{ date: string; moodKey: string; energy: number }>
  handle?: string
}): Promise<Blob> {
  await document.fonts.ready

  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'

  // Outer dark + inner card
  ctx.fillStyle = NIGHT
  ctx.fillRect(0, 0, W, H)
  const pad = 40
  const cardX = pad, cardY = pad, cardW = W - pad * 2, cardH = H - pad * 2
  ctx.fillStyle = FOREST_DARK
  roundRect(ctx, cardX, cardY, cardW, cardH, 44); ctx.fill()

  const inner = cardX + 56
  const right = cardX + cardW - 56
  const rowW = right - inner

  const moodDesc: Record<string, string> = {
    rough: 'Heavy & Tender', low: 'Quiet & Low', okay: 'Steady & Okay',
    good: 'Calm & Grounded', thriving: 'Bright & Thriving',
  }
  const energyLabels = ['', 'Drained & Low', 'Tired & Steady', 'Steady & Present', 'High & Focused', 'Charged & Alive']

  let y = cardY + 70

  // K mark
  drawKMark(ctx, right - 30, y - 24, 30, RITUAL_OFF, STREAK_ORANGE)

  // Label + heading + date
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
  ctx.fillStyle = RITUAL_SAGE
  ctx.font = `600 22px ${SANS}`
  ctx.fillText('— DAILY RITUAL', inner, y)
  y += 54
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `bold 50px ${SERIF}`
  ctx.fillText('My Daily Koru Check-in', inner, y)
  y += 50
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `400 24px ${BODY_SANS}`
  if (data.date) ctx.fillText(data.date, inner, y)
  y += 56

  // ── Interaction rows ──
  function rowCard(ry: number, h: number) {
    ctx.fillStyle = FOREST_CARD
    roundRect(ctx, inner, ry, rowW, h, 22); ctx.fill()
  }

  // Mood
  const moodH = 124
  rowCard(y, moodH)
  ctx.font = `40px serif`
  ctx.fillText(data.moodEmoji, inner + 30, y + moodH / 2)
  ctx.fillStyle = RITUAL_SAGE
  ctx.font = `600 18px ${SANS}`
  ctx.fillText('MOOD', inner + 96, y + 40)
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `500 30px ${SANS}`
  ctx.fillText(moodDesc[data.moodKey] ?? data.moodLabel, inner + 96, y + 78)
  ctx.textAlign = 'right'
  ctx.font = `500 28px ${SANS}`
  ctx.fillText(`${MOOD_PCT[data.moodKey] ?? 60}/100`, right - 30, y + moodH / 2)
  ctx.textAlign = 'left'
  y += moodH + 16

  // Energy
  const energyH = 124
  rowCard(y, energyH)
  ctx.font = `38px serif`
  ctx.fillText('⚡', inner + 30, y + energyH / 2)
  ctx.fillStyle = RITUAL_SAGE
  ctx.font = `600 18px ${SANS}`
  ctx.fillText('ENERGY LEVEL', inner + 96, y + 40)
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `500 30px ${SANS}`
  ctx.fillText(energyLabels[data.energy] ?? `${data.energy}/5`, inner + 96, y + 78)
  ctx.textAlign = 'right'
  ctx.font = `500 28px ${SANS}`
  ctx.fillText(`${data.energy}/5`, right - 30, y + energyH / 2)
  ctx.textAlign = 'left'
  // mini energy bars
  const barBaseY = y + energyH - 22
  for (let i = 0; i < 5; i++) {
    const bx = inner + 96 + i * 16
    ctx.fillStyle = i < data.energy ? ENERGY_GOLD : 'rgba(255,255,255,0.12)'
    roundRect(ctx, bx, barBaseY - (i < data.energy ? 8 - i * 1.2 : 0), 9, 14 + (i < data.energy ? i * 2 : 0), 4); ctx.fill()
  }
  y += energyH + 16

  // Gratitude
  const gratH = 124
  rowCard(y, gratH)
  ctx.font = `36px serif`
  ctx.fillText('💡', inner + 30, y + gratH / 2)
  ctx.fillStyle = RITUAL_SAGE
  ctx.font = `600 18px ${SANS}`
  ctx.fillText('GRATITUDE', inner + 96, y + 40)
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `400 26px ${BODY_SANS}`
  const grat = (data.reflection || '—').trim()
  const gratLines = wrapText(ctx, grat, rowW - 130).slice(0, 2)
  gratLines.forEach((ln, i) => ctx.fillText(ln, inner + 96, y + 78 + i * 32))
  if (gratLines.length === 0) ctx.fillText('—', inner + 96, y + 78)
  y += gratH + 20

  // ── Streak card ──
  const streakH = 116
  ctx.fillStyle = 'rgba(217,108,86,0.10)'
  roundRect(ctx, inner, y, rowW, streakH, 22); ctx.fill()
  ctx.font = `40px serif`
  ctx.fillText('🔥', inner + 30, y + streakH / 2)
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `bold 32px ${SANS}`
  ctx.fillText(`${data.streak ?? 0}-Day Streak`, inner + 96, y + 48)
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `400 22px ${BODY_SANS}`
  ctx.fillText('Awareness practice active', inner + 96, y + 82)
  ctx.textAlign = 'right'
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `600 16px ${SANS}`
  ctx.fillText('30-DAY GOAL', right - 30, y + 44)
  ctx.fillStyle = RITUAL_OFF
  ctx.font = `bold 38px ${SERIF}`
  ctx.fillText('30', right - 30, y + 80)
  ctx.textAlign = 'left'
  y += streakH + 24

  // ── 7-day trends ──
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `600 20px ${SANS}`
  ctx.fillText('7-DAY TRENDS', inner, y)
  // legend
  ctx.textAlign = 'right'
  ctx.font = `500 18px ${BODY_SANS}`
  let legX = right
  ctx.fillStyle = RITUAL_MUTED
  ctx.fillText('Energy', legX, y); legX -= ctx.measureText('Energy').width + 14
  ctx.fillStyle = ENERGY_GOLD
  roundRect(ctx, legX, y - 8, 14, 14, 3); ctx.fill(); legX -= 24
  ctx.fillStyle = RITUAL_MUTED
  ctx.fillText('Mood', legX, y); legX -= ctx.measureText('Mood').width + 14
  ctx.fillStyle = MOOD_GREEN
  roundRect(ctx, legX, y - 8, 14, 14, 3); ctx.fill()
  ctx.textAlign = 'left'

  // build last-7-days map
  const ciMap = new Map<string, { moodKey: string; energy: number }>()
  for (const c of data.recentCheckIns ?? []) ciMap.set(c.date, { moodKey: c.moodKey, energy: c.energy })
  const days: { label: string; mood: number; energy: number; isToday: boolean }[] = []
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const c = ciMap.get(key)
    days.push({
      label: dayNames[d.getDay()],
      mood: c ? (MOOD_PCT[c.moodKey] ?? 60) : 0,
      energy: c ? c.energy * 20 : 0,
      isToday: i === 0,
    })
  }

  const chartTop = y + 36
  const chartH = 130
  const colW = rowW / 7
  const maxBar = chartH - 24
  days.forEach((dd, i) => {
    const cx = inner + colW * i + colW / 2
    const barW = 18
    // mood bar
    const mh = (dd.mood / 100) * maxBar
    ctx.fillStyle = dd.mood > 0 ? (dd.isToday ? MOOD_GREEN : 'rgba(125,158,139,0.55)') : 'rgba(255,255,255,0.06)'
    roundRect(ctx, cx - barW - 3, chartTop + chartH - mh - 20, barW, Math.max(mh, 4), 5); ctx.fill()
    // energy bar
    const eh = (dd.energy / 100) * maxBar
    ctx.fillStyle = dd.energy > 0 ? (dd.isToday ? ENERGY_GOLD : 'rgba(201,165,92,0.55)') : 'rgba(255,255,255,0.06)'
    roundRect(ctx, cx + 3, chartTop + chartH - eh - 20, barW, Math.max(eh, 4), 5); ctx.fill()
    // label
    ctx.fillStyle = dd.isToday ? RITUAL_OFF : RITUAL_MUTED
    ctx.font = `600 16px ${SANS}`
    ctx.textAlign = 'center'
    ctx.fillText(dd.label, cx, chartTop + chartH + 2)
  })
  ctx.textAlign = 'left'
  y = chartTop + chartH + 36

  // ── Circular meters ──
  const recent = (data.recentCheckIns ?? []).filter(c => MOOD_PCT[c.moodKey] != null)
  const moodAvg = recent.length
    ? recent.reduce((s, c) => s + (MOOD_PCT[c.moodKey] ?? 60), 0) / recent.length
    : (MOOD_PCT[data.moodKey] ?? 60)
  const energyAvg = recent.length
    ? recent.reduce((s, c) => s + c.energy * 20, 0) / recent.length
    : data.energy * 20
  const streakPct = Math.min(100, Math.round(((data.streak ?? 0) / 30) * 100))

  const meterR = 62
  const gap = rowW / 3
  const centers = [inner + gap / 2, inner + gap + gap / 2, inner + gap * 2 + gap / 2]
  const meters: [number, string, string][] = [
    [moodAvg, MOOD_GREEN, 'MOOD'],
    [energyAvg, ENERGY_GOLD, 'ENERGY'],
    [streakPct, STREAK_ORANGE, 'STREAK'],
  ]
  meters.forEach(([val, col, label], i) => {
    drawMeter(ctx, centers[i], y + meterR, meterR, val, col, label)
  })
  y += meterR * 2 + 64

  // ── Footer ──
  ctx.fillStyle = RITUAL_MUTED
  ctx.font = `500 20px ${SANS}`
  ctx.textAlign = 'left'
  ctx.fillText(`@${data.handle || 'yourhandle'}`, inner, H - 50)
  ctx.textAlign = 'right'
  ctx.fillText('koru.app', right, H - 50)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}

// ── Clarity Delta snapshot card (1080×1350 portrait) ─────────────────────────
export async function generateClarityDeltaImage(data: {
  monthName: string
  moodDelta: number
  energyDelta: number
  overallStart: string
  overallEnd: string
  checkInCount: number
}): Promise<Blob> {
  await document.fonts.ready

  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const plus = (n: number) => (n >= 0 ? '+' : '')

  // ── Background: dark forest header (top 45%) + cream body ──────────────────

  // Header gradient
  const headerH = H * 0.46
  const hGrad = ctx.createLinearGradient(0, 0, W, headerH)
  hGrad.addColorStop(0, '#1B3B2B')
  hGrad.addColorStop(1, '#2a5240')
  ctx.fillStyle = hGrad
  ctx.fillRect(0, 0, W, headerH)

  // Radial glow in header
  const glow = ctx.createRadialGradient(W * 0.75, H * 0.12, 0, W * 0.75, H * 0.12, W * 0.7)
  glow.addColorStop(0, 'rgba(162,191,166,0.18)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, headerH)

  // Body background (cream)
  ctx.fillStyle = CREAM
  ctx.fillRect(0, headerH, W, H - headerH)

  // Subtle bottom glow on body
  const bodyGlow = ctx.createRadialGradient(W * 0.15, H * 0.85, 0, W * 0.15, H * 0.85, W * 0.55)
  bodyGlow.addColorStop(0, 'rgba(162,191,166,0.14)')
  bodyGlow.addColorStop(1, 'rgba(251,249,245,0)')
  ctx.fillStyle = bodyGlow
  ctx.fillRect(0, headerH, W, H - headerH)

  // Outer border
  ctx.strokeStyle = 'rgba(162,191,166,0.25)'
  ctx.lineWidth = 3
  roundRect(ctx, 40, 40, W - 80, H - 80, 56)
  ctx.stroke()

  // ── Header content ────────────────────────────────────────────────────────

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  // Label
  ctx.fillStyle = SAGE
  ctx.font = `600 28px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('GROWTH SNAPSHOT · KORU', 90, 110)

  // Title
  ctx.fillStyle = '#fff'
  ctx.font = `bold 72px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText(`Your ${data.monthName}`, 90, 240)
  ctx.fillText('Snapshot 🌿', 90, 330)

  // Subtext
  ctx.fillStyle = 'rgba(255,255,255,0.50)'
  ctx.font = `400 30px "Inter", sans-serif`
  ctx.fillText(`Based on ${data.checkInCount} check-in${data.checkInCount !== 1 ? 's' : ''}`, 90, 408)

  // ── Divider between header and body ──────────────────────────────────────
  ctx.strokeStyle = 'rgba(162,191,166,0.18)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(90, headerH)
  ctx.lineTo(W - 90, headerH)
  ctx.stroke()

  // ── Body: metrics ─────────────────────────────────────────────────────────

  const bodyTop = headerH + 64
  const colL = 90
  const colR = W - 90

  // Helper: draw one metric row
  function drawMetric(label: string, note: string, delta: number, y: number) {
    const positive = delta >= 0
    const chipBg  = positive ? 'rgba(162,191,166,0.22)' : 'rgba(224,122,95,0.14)'
    const chipCol = positive ? FOREST : '#c0513a'
    const chipText = `${plus(delta)}${delta}%`

    // Chip (right side)
    ctx.font = `bold 48px "Plus Jakarta Sans", "Inter", sans-serif`
    const chipW = ctx.measureText(chipText).width + 56
    const chipH = 80
    const chipX = colR - chipW
    const chipY = y - chipH / 2

    ctx.fillStyle = chipBg
    roundRect(ctx, chipX, chipY, chipW, chipH, 24)
    ctx.fill()

    ctx.fillStyle = chipCol
    ctx.textAlign = 'center'
    ctx.fillText(chipText, chipX + chipW / 2, y)

    // Label (left side)
    ctx.textAlign = 'left'
    ctx.fillStyle = FOREST
    ctx.font = `bold 42px "Plus Jakarta Sans", "Inter", sans-serif`
    ctx.fillText(label, colL, y - 22)

    // Note
    ctx.fillStyle = BODY
    ctx.font = `400 28px "Inter", sans-serif`
    const noteLines = wrapText(ctx, note, chipX - colL - 48)
    noteLines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, colL, y + 18 + i * 38)
    })
  }

  // Metric 1: Boundary Confidence (mood delta)
  const moodNote = data.moodDelta >= 20
    ? `A ${data.moodDelta}% lift in emotional grounding.`
    : data.moodDelta >= 0
    ? 'Steady and growing this month.'
    : 'A tough month — but you kept showing up.'
  drawMetric('Boundary Confidence', moodNote, data.moodDelta, bodyTop + 80)

  // Divider
  ctx.strokeStyle = 'rgba(27,59,43,0.10)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(colL, bodyTop + 190)
  ctx.lineTo(colR, bodyTop + 190)
  ctx.stroke()

  // Metric 2: Decision Clarity (energy delta)
  const energyNote = data.energyDelta >= 20
    ? `Mental sharpness up ${data.energyDelta}% — clearer head.`
    : data.energyDelta >= 0
    ? 'Energy stable and building.'
    : 'Energy dipped — rest is growth too.'
  drawMetric('Decision Clarity', energyNote, data.energyDelta, bodyTop + 330)

  // Divider
  ctx.strokeStyle = 'rgba(27,59,43,0.10)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(colL, bodyTop + 440)
  ctx.lineTo(colR, bodyTop + 440)
  ctx.stroke()

  // ── Overall shift ─────────────────────────────────────────────────────────
  const shiftY = bodyTop + 490

  ctx.textAlign = 'left'
  ctx.fillStyle = SAGE
  ctx.font = `600 24px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('OVERALL SHIFT', colL, shiftY)

  if (data.overallStart === data.overallEnd) {
    ctx.fillStyle = FOREST
    ctx.font = `bold 36px "Plus Jakarta Sans", "Inter", sans-serif`
    ctx.fillText(`Holding steady at "${data.overallEnd}" ✦`, colL, shiftY + 60)
  } else {
    ctx.fillStyle = 'rgba(27,59,43,0.55)'
    ctx.font = `400 34px "Inter", sans-serif`
    ctx.fillText(`"${data.overallStart}"`, colL, shiftY + 60)

    // Arrow
    const arrowX = colL + ctx.measureText(`"${data.overallStart}"`).width + 28
    ctx.strokeStyle = SAGE
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(arrowX, shiftY + 60)
    ctx.lineTo(arrowX + 64, shiftY + 60)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(arrowX + 46, shiftY + 50)
    ctx.lineTo(arrowX + 64, shiftY + 60)
    ctx.lineTo(arrowX + 46, shiftY + 70)
    ctx.stroke()

    ctx.fillStyle = FOREST
    ctx.font = `bold 36px "Plus Jakarta Sans", "Inter", sans-serif`
    ctx.fillText(`"${data.overallEnd}"`, arrowX + 84, shiftY + 60)
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(27,59,43,0.30)'
  ctx.font = `500 26px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('koru.com.ng · Self-Discovery', W / 2, H - 80)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}

// ── Future Self card (1080×1350 portrait) ────────────────────────────────────
export async function generateFutureSelfImage(data: {
  intention: string
  intentionDate: string
  results: { emoji: string; title: string }[]
  streak: number
}): Promise<Blob> {
  await document.fonts.ready

  const W = 1080
  const H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  const headerH = H * 0.50

  // ── Header: dark forest ────────────────────────────────────────────────────
  const hGrad = ctx.createLinearGradient(0, 0, W, headerH)
  hGrad.addColorStop(0, '#1B3B2B')
  hGrad.addColorStop(1, '#243d2f')
  ctx.fillStyle = hGrad
  ctx.fillRect(0, 0, W, headerH)

  // Radial glow
  const glow = ctx.createRadialGradient(W * 0.2, H * 0.08, 0, W * 0.2, H * 0.08, W * 0.65)
  glow.addColorStop(0, 'rgba(162,191,166,0.16)')
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, headerH)

  // ── Body: cream ────────────────────────────────────────────────────────────
  ctx.fillStyle = CREAM
  ctx.fillRect(0, headerH, W, H - headerH)

  // Body subtle glow
  const bodyGlow = ctx.createRadialGradient(W * 0.85, H * 0.82, 0, W * 0.85, H * 0.82, W * 0.5)
  bodyGlow.addColorStop(0, 'rgba(162,191,166,0.14)')
  bodyGlow.addColorStop(1, 'rgba(251,249,245,0)')
  ctx.fillStyle = bodyGlow
  ctx.fillRect(0, headerH, W, H - headerH)

  // Outer border
  ctx.strokeStyle = 'rgba(162,191,166,0.2)'
  ctx.lineWidth = 3
  roundRect(ctx, 40, 40, W - 80, H - 80, 56)
  ctx.stroke()

  // ── Header content ─────────────────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  // Label
  ctx.fillStyle = SAGE
  ctx.font = `600 26px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('FUTURE SELF CHECK-IN · KORU', 90, 108)

  // Date badge
  ctx.fillStyle = 'rgba(162,191,166,0.18)'
  roundRect(ctx, 90, 140, ctx.measureText(data.intentionDate).width + 40, 48, 14)
  ctx.fill()
  ctx.fillStyle = 'rgba(162,191,166,0.9)'
  ctx.font = `500 24px "Inter", sans-serif`
  ctx.fillText(data.intentionDate, 110, 164)

  // "You wrote this to yourself:"
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.font = `400 30px "Inter", sans-serif`
  ctx.fillText('You wrote this to yourself:', 90, 240)

  // Intention quote block
  const quoteX = 90
  const quoteY = 280
  const quoteW = W - 180
  const maxQuoteH = 340

  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  roundRect(ctx, quoteX, quoteY, quoteW, maxQuoteH, 28)
  ctx.fill()
  ctx.strokeStyle = 'rgba(162,191,166,0.3)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(quoteX, quoteY + 28)
  ctx.lineTo(quoteX, quoteY + maxQuoteH - 28)
  ctx.stroke()

  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.font = `italic 400 34px "Inter", sans-serif`
  const quotedText = `"${data.intention}"`
  const quoteLines = wrapText(ctx, quotedText, quoteW - 60)
  const lineH = 50
  const totalTextH = quoteLines.length * lineH
  const quoteTextTop = quoteY + (maxQuoteH - totalTextH) / 2

  quoteLines.slice(0, 6).forEach((line, i) => {
    ctx.fillText(line, quoteX + 36, quoteTextTop + lineH * i + lineH / 2)
  })

  // ── Body content ──────────────────────────────────────────────────────────
  const bodyTop = headerH + 56
  ctx.textAlign = 'left'

  // "Who you are now" label
  ctx.fillStyle = SAGE
  ctx.font = `600 24px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('WHO YOU ARE NOW', 90, bodyTop)

  // Result tags
  let tagX = 90
  const tagY = bodyTop + 52
  const tagH = 68

  const tagsToShow = data.results.slice(0, 4)
  if (tagsToShow.length === 0) {
    ctx.fillStyle = 'rgba(27,59,43,0.35)'
    ctx.font = `400 28px "Inter", sans-serif`
    ctx.fillText('No quiz results yet', tagX, tagY + tagH / 2)
  } else {
    for (const r of tagsToShow) {
      const label = `${r.emoji} ${r.title}`
      ctx.font = `500 26px "Inter", sans-serif`
      const tagW = ctx.measureText(label).width + 44

      if (tagX + tagW > W - 90) {
        tagX = 90
      }

      ctx.fillStyle = 'rgba(27,59,43,0.07)'
      roundRect(ctx, tagX, tagY, tagW, tagH, 20)
      ctx.fill()
      ctx.strokeStyle = 'rgba(27,59,43,0.12)'
      ctx.lineWidth = 1.5
      roundRect(ctx, tagX, tagY, tagW, tagH, 20)
      ctx.stroke()

      ctx.fillStyle = FOREST
      ctx.fillText(label, tagX + 22, tagY + tagH / 2)
      tagX += tagW + 14
    }
  }

  // Streak badge (if any)
  if (data.streak > 0) {
    const streakY = tagY + tagH + 32
    ctx.fillStyle = 'rgba(27,59,43,0.06)'
    const streakLabel = `🔥 ${data.streak}-day streak`
    ctx.font = `600 26px "Inter", sans-serif`
    const sW = ctx.measureText(streakLabel).width + 40
    roundRect(ctx, 90, streakY, sW, 60, 18)
    ctx.fill()
    ctx.fillStyle = FOREST
    ctx.fillText(streakLabel, 110, streakY + 30)
  }

  // ── Divider ────────────────────────────────────────────────────────────────
  const divY = H - 130
  ctx.strokeStyle = 'rgba(27,59,43,0.10)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(90, divY)
  ctx.lineTo(W - 90, divY)
  ctx.stroke()

  // ── Footer ────────────────────────────────────────────────────────────────
  ctx.textAlign = 'center'
  ctx.fillStyle = 'rgba(27,59,43,0.30)'
  ctx.font = `500 26px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('koru.com.ng · Self-Discovery', W / 2, H - 74)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}

// ── Share or download helper ──────────────────────────────────────────────────
export async function shareOrDownloadImage(
  blob: Blob,
  filename: string,
  shareTitle?: string,
): Promise<'shared' | 'downloaded' | 'error'> {
  const file = new File([blob], filename, { type: 'image/png' })

  // Try Web Share API with file support (mobile-first)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: shareTitle ?? 'Koru' })
      return 'shared'
    } catch {
      // user cancelled — fall through to download
    }
  }

  // Desktop fallback: trigger download
  try {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return 'downloaded'
  } catch {
    return 'error'
  }
}
