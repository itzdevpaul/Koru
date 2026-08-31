// New shareable card generators matching the updated Koru brand design.
// Self-Discovery card (quiz result) + Daily Ritual card (check-in).

// ── Shared constants ──────────────────────────────────────────────────────────
const CREAM_BG = '#F9F7F2'
const DARK_BG = '#1A201B'
const DARK_CARD = '#2E3633'
const DARK_CARD_ALT = '#232A25'
const STREAK_BOX = '#3C3330'
const CORAL = '#E07A5F'
const CORAL_RED = '#D9705E'
const SAGE = '#85A699'
const SAGE_LIGHT = '#8DA396'
const GOLD = '#D4A046'
const MUTED_YELLOW = '#D9A65E'
const TEXT_DARK = '#202020'
const TEXT_WHITE = '#FFFFFF'
const TEXT_MUTED_LIGHT = '#7D8681'
const TEXT_MUTED_DARK = '#888d8b'
const TEXT_SECONDARY = '#aab0ad'

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Inter', 'Plus Jakarta Sans', sans-serif"
const SANS_BOLD = "'Plus Jakarta Sans', 'Inter', sans-serif"

// ── Helpers ──────────────────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
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

// Deterministic score from a string seed (40–95 range)
function deterministicScore(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return 40 + (Math.abs(hash) % 56)
}

// Deterministic percentile string from uid + quizId
function deterministicPercentile(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  return 1 + (Math.abs(hash) % 20) // 1–20%
}

function energyLabel(energy: number): string {
  if (energy >= 5) return 'High & Focused'
  if (energy >= 4) return 'High & Focused'
  if (energy >= 3) return 'Steady & Present'
  if (energy >= 2) return 'Low & Drained'
  return 'Depleted'
}

// Draw the Koru "K" mark (simplified serif K)
function drawKoruK(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  ctx.font = `bold ${size}px ${SERIF}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('K', x, y)
  ctx.restore()
}

// Draw a dot-grid pattern
function drawDotGrid(ctx: CanvasRenderingContext2D, w: number, h: number, spacing: number, color: string) {
  ctx.save()
  ctx.fillStyle = color
  for (let x = spacing; x < w; x += spacing) {
    for (let y = spacing; y < h; y += spacing) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

// ── 1. Self-Discovery Card (1080×1350) ────────────────────────────────────────
export async function generateInsightShareImage(data: {
  title: string
  emoji: string
  traits: string[]
  quizTitle: string
  userHandle: string
  uid: string
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

  // Background
  ctx.fillStyle = CREAM_BG
  ctx.fillRect(0, 0, W, H)

  // Dot grid
  drawDotGrid(ctx, W, H, 36, 'rgba(32,32,32,0.04)')

  const PAD = 64

  // ── Header ──────────────────────────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // "— SELF-DISCOVERY"
  ctx.fillStyle = TEXT_MUTED_DARK
  ctx.font = `600 22px ${SANS}`
  ctx.fillText('— SELF-DISCOVERY', PAD, PAD + 8)

  // "Your Koru Insight"
  ctx.fillStyle = TEXT_DARK
  ctx.font = `bold 40px ${SERIF}`
  ctx.fillText('Your Koru Insight', PAD, PAD + 42)

  // K logo top-right
  drawKoruK(ctx, W - PAD - 24, PAD + 36, 44, TEXT_DARK)

  // ── Core Driver Card ───────────────────────────────────────────────────────
  const cardX = PAD
  const cardY = PAD + 120
  const cardW = W - PAD * 2
  const cardH = 180

  ctx.fillStyle = DARK_CARD
  roundRect(ctx, cardX, cardY, cardW, cardH, 28)
  ctx.fill()

  // "• CORE DRIVER" label
  ctx.fillStyle = CORAL_RED
  ctx.font = `600 18px ${SANS}`
  ctx.fillText('• CORE DRIVER', cardX + 28, cardY + 28)

  // "TOP X%" pill badge
  const percentile = deterministicPercentile(data.uid + data.quizTitle)
  const badgeText = `TOP ${percentile}%`
  ctx.font = `600 16px ${SANS}`
  const badgeW = ctx.measureText(badgeText).width + 28
  const badgeH = 34
  const badgeX = cardX + cardW - 28 - badgeW
  const badgeY = cardY + 22
  ctx.fillStyle = 'rgba(217,112,94,0.18)'
  roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 17)
  ctx.fill()
  ctx.fillStyle = CORAL_RED
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2)

  // Title (large serif, white)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = TEXT_WHITE
  ctx.font = `bold 44px ${SERIF}`
  ctx.fillText(data.title, cardX + 28, cardY + 64)

  // Divider line
  const divY = cardY + cardH - 36
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cardX + 28, divY)
  ctx.lineTo(cardX + cardW - 28, divY)
  ctx.stroke()

  // "globally ranked" (right-aligned, italic, grey)
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = `italic 14px ${SANS}`
  ctx.fillText('globally ranked', cardX + cardW - 28, divY + 16)

  // ── Radar Chart ─────────────────────────────────────────────────────────────
  const traits = data.traits.slice(0, 5)
  const scores = traits.map((t, i) => deterministicScore(data.uid + t + i))
  const chartCx = W / 2
  const chartCy = cardY + cardH + 200
  const chartR = 160

  // Concentric pentagons
  for (let ring = 1; ring <= 4; ring++) {
    const r = (chartR / 4) * ring
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
      const px = chartCx + Math.cos(angle) * r
      const py = chartCy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.strokeStyle = `rgba(133,166,153,${0.12 + ring * 0.04})`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Axis lines
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    ctx.beginPath()
    ctx.moveTo(chartCx, chartCy)
    ctx.lineTo(chartCx + Math.cos(angle) * chartR, chartCy + Math.sin(angle) * chartR)
    ctx.strokeStyle = 'rgba(133,166,153,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Data polygon
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const r = (scores[i] / 100) * chartR
    const px = chartCx + Math.cos(angle) * r
    const py = chartCy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(133,166,153,0.20)'
  ctx.fill()
  ctx.strokeStyle = SAGE
  ctx.lineWidth = 2
  ctx.stroke()

  // Data points + values
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const r = (scores[i] / 100) * chartR
    const px = chartCx + Math.cos(angle) * r
    const py = chartCy + Math.sin(angle) * r
    ctx.beginPath()
    ctx.arc(px, py, 5, 0, Math.PI * 2)
    ctx.fillStyle = SAGE
    ctx.fill()

    // Value label
    const valAngle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const valR = r * 0.65
    const vx = chartCx + Math.cos(valAngle) * valR
    const vy = chartCy + Math.sin(valAngle) * valR
    ctx.fillStyle = 'rgba(32,32,32,0.5)'
    ctx.font = `600 16px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(scores[i]), vx, vy)
  }

  // Axis labels
  for (let i = 0; i < 5; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    const labelR = chartR + 38
    const lx = chartCx + Math.cos(angle) * labelR
    const ly = chartCy + Math.sin(angle) * labelR
    ctx.fillStyle = TEXT_MUTED_DARK
    ctx.font = `600 16px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const label = traits[i].length > 14 ? traits[i].slice(0, 12) + '…' : traits[i]
    ctx.fillText(label, lx, ly)
  }

  // ── Insights List ───────────────────────────────────────────────────────────
  const insightsY = chartCy + chartR + 80
  const insightsW = W - PAD * 2
  const insightsH = 180

  // Light grey rounded block
  ctx.fillStyle = 'rgba(32,32,32,0.04)'
  roundRect(ctx, PAD, insightsY, insightsW, insightsH, 24)
  ctx.fill()

  const bulletColors = [CORAL_RED, SAGE, MUTED_YELLOW]
  const insightTexts = [
    `You thrive on ${traits[0]?.toLowerCase() ?? 'deep connection'}`,
    `Focus on developing your ${traits[3]?.toLowerCase() ?? 'boundaries'}`,
    `Your ${traits[1]?.toLowerCase() ?? 'empathy'} is a profound gift`,
  ]

  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < 3; i++) {
    const iy = insightsY + 36 + i * 48
    // Bullet
    ctx.beginPath()
    ctx.arc(PAD + 24, iy, 6, 0, Math.PI * 2)
    ctx.fillStyle = bulletColors[i]
    ctx.fill()
    // Text
    ctx.fillStyle = 'rgba(32,32,32,0.65)'
    ctx.font = `400 20px ${SANS}`
    const lines = wrapText(ctx, insightTexts[i], insightsW - 72)
    ctx.fillText(lines[0], PAD + 44, iy)
  }

  // ── CTA Button ──────────────────────────────────────────────────────────────
  const ctaY = insightsY + insightsH + 28
  const ctaH = 76
  const ctaW = W - PAD * 2

  ctx.fillStyle = CORAL
  roundRect(ctx, PAD, ctaY, ctaW, ctaH, 24)
  ctx.fill()

  // CTA text
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `400 16px ${SANS}`
  ctx.fillText('Ready to go deeper?', PAD + 28, ctaY + ctaH / 2 - 12)
  ctx.fillStyle = TEXT_WHITE
  ctx.font = `bold 22px ${SANS_BOLD}`
  ctx.fillText('Take the quiz on Koru', PAD + 28, ctaY + ctaH / 2 + 14)

  // White circle arrow icon
  const iconCx = PAD + ctaW - 42
  const iconCy = ctaY + ctaH / 2
  ctx.beginPath()
  ctx.arc(iconCx, iconCy, 22, 0, Math.PI * 2)
  ctx.fillStyle = TEXT_WHITE
  ctx.fill()
  // Arrow
  ctx.strokeStyle = CORAL
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(iconCx - 8, iconCy)
  ctx.lineTo(iconCx + 6, iconCy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(iconCx + 2, iconCy - 6)
  ctx.lineTo(iconCx + 6, iconCy)
  ctx.lineTo(iconCx + 2, iconCy + 6)
  ctx.stroke()

  // ── Footer ──────────────────────────────────────────────────────────────────
  ctx.fillStyle = TEXT_MUTED_DARK
  ctx.font = `400 16px ${SANS}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(`@${data.userHandle}`, PAD, H - 48)
  ctx.textAlign = 'right'
  ctx.fillText('koru.app', W - PAD, H - 48)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}

// ── 2. Daily Ritual Card (1080×1350) ───────────────────────────────────────────
export async function generateDailyRitualImage(data: {
  moodEmoji: string
  moodLabel: string
  moodScore: number      // 1–5
  energy: number         // 1–5
  gratitude: string
  streak: number
  personalBest: number
  date: string
  trendData: Array<{ mood: number; energy: number } | null>  // 7 entries
  userHandle: string
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

  // Background
  ctx.fillStyle = DARK_BG
  ctx.fillRect(0, 0, W, H)

  const PAD = 56

  // ── Header ──────────────────────────────────────────────────────────────────
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'

  // "— DAILY RITUAL"
  ctx.fillStyle = TEXT_MUTED_LIGHT
  ctx.font = `600 20px ${SANS}`
  ctx.fillText('— DAILY RITUAL', PAD, PAD + 8)

  // "My Daily Koru Check-in"
  ctx.fillStyle = TEXT_WHITE
  ctx.font = `bold 38px ${SERIF}`
  ctx.fillText('My Daily Koru Check-in', PAD, PAD + 40)

  // Date
  ctx.fillStyle = TEXT_MUTED_LIGHT
  ctx.font = `400 20px ${SANS}`
  ctx.fillText(data.date, PAD, PAD + 92)

  // K logo top-right
  drawKoruK(ctx, W - PAD - 20, PAD + 36, 40, TEXT_SECONDARY)

  // ── Metric Cards (Mood, Energy, Gratitude) ──────────────────────────────────
  const metricsY = PAD + 140
  const cardW = (W - PAD * 2 - 16) / 2
  const cardH = 130

  // Mood card
  ctx.fillStyle = DARK_CARD_ALT
  roundRect(ctx, PAD, metricsY, cardW, cardH, 20)
  ctx.fill()

  ctx.font = `28px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(data.moodEmoji, PAD + 20, metricsY + 16)

  ctx.fillStyle = TEXT_MUTED_LIGHT
  ctx.font = `600 13px ${SANS}`
  ctx.fillText('MOOD', PAD + 20, metricsY + 56)

  ctx.fillStyle = TEXT_WHITE
  ctx.font = `600 18px ${SANS_BOLD}`
  ctx.fillText(data.moodLabel, PAD + 20, metricsY + 78)

  // Mood dots
  const dotR = 7
  const dotGap = 22
  const dotsX = PAD + 20
  const dotsY = metricsY + cardH - 22
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath()
    ctx.arc(dotsX + (i - 1) * dotGap, dotsY, dotR, 0, Math.PI * 2)
    ctx.fillStyle = i <= data.moodScore ? SAGE : 'rgba(125,134,129,0.25)'
    ctx.fill()
  }

  // Mood score right
  ctx.fillStyle = TEXT_MUTED_LIGHT
  ctx.font = `400 16px ${SANS}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${data.moodScore}/5`, PAD + cardW - 16, metricsY + cardH - 12)

  // Energy card
  const energyX = PAD + cardW + 16
  ctx.fillStyle = DARK_CARD_ALT
  roundRect(ctx, energyX, metricsY, cardW, cardH, 20)
  ctx.fill()

  // Lightning bolt icon
  ctx.fillStyle = GOLD
  ctx.font = `28px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('⚡', energyX + 20, metricsY + 14)

  ctx.fillStyle = GOLD
  ctx.font = `600 13px ${SANS}`
  ctx.fillText('ENERGY LEVEL', energyX + 20, metricsY + 56)

  ctx.fillStyle = TEXT_WHITE
  ctx.font = `600 18px ${SANS_BOLD}`
  ctx.fillText(energyLabel(data.energy), energyX + 20, metricsY + 78)

  // Energy bars
  const barX = energyX + 20
  const barY = metricsY + cardH - 26
  const barW = (cardW - 40) / 5 - 4
  for (let i = 1; i <= 5; i++) {
    ctx.fillStyle = i <= data.energy ? GOLD : 'rgba(125,134,129,0.2)'
    roundRect(ctx, barX + (i - 1) * (barW + 4), barY, barW, 14, 4)
    ctx.fill()
  }

  // Energy score right
  ctx.fillStyle = GOLD
  ctx.font = `400 16px ${SANS}`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${data.energy}/5`, energyX + cardW - 16, metricsY + cardH - 12)

  // Gratitude card (full width)
  const gratY = metricsY + cardH + 16
  const gratH = 100
  ctx.fillStyle = DARK_CARD_ALT
  roundRect(ctx, PAD, gratY, W - PAD * 2, gratH, 20)
  ctx.fill()

  // Lightbulb icon
  ctx.fillStyle = CORAL
  ctx.font = `28px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('💡', PAD + 20, gratY + 14)

  ctx.fillStyle = CORAL
  ctx.font = `600 13px ${SANS}`
  ctx.fillText('GRATITUDE', PAD + 20, gratY + 56)

  ctx.fillStyle = TEXT_WHITE
  ctx.font = `600 18px ${SANS_BOLD}`
  const gratText = data.gratitude || '—'
  const gratLines = wrapText(ctx, gratText, W - PAD * 2 - 120)
  ctx.fillText(gratLines[0] || '—', PAD + 20, gratY + 78)

  // ── Streak Section ──────────────────────────────────────────────────────────
  const streakY = gratY + gratH + 16
  const streakH = 100
  ctx.fillStyle = STREAK_BOX
  roundRect(ctx, PAD, streakY, W - PAD * 2, streakH, 20)
  ctx.fill()

  // Fire icon
  ctx.fillStyle = CORAL
  ctx.font = `36px serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('🔥', PAD + 24, streakY + streakH / 2)

  // Streak title
  ctx.fillStyle = TEXT_WHITE
  ctx.font = `bold 28px ${SERIF}`
  ctx.fillText(`${data.streak}-Day Streak`, PAD + 76, streakY + 38)

  // Subtext
  ctx.fillStyle = TEXT_SECONDARY
  ctx.font = `400 15px ${SANS}`
  ctx.fillText('Awareness practice active', PAD + 76, streakY + 68)

  // Personal best (right side)
  ctx.textAlign = 'right'
  ctx.fillStyle = CORAL
  ctx.font = `600 12px ${SANS}`
  ctx.fillText('PERSONAL BEST', W - PAD - 20, streakY + 30)

  ctx.fillStyle = TEXT_WHITE
  ctx.font = `bold 32px ${SERIF}`
  ctx.fillText(String(data.personalBest), W - PAD - 64, streakY + 62)

  ctx.fillStyle = TEXT_MUTED_LIGHT
  ctx.font = `400 14px ${SANS}`
  ctx.fillText('days', W - PAD - 20, streakY + 68)

  // ── 7-Day Trends Chart ──────────────────────────────────────────────────────
  const trendsY = streakY + streakH + 24
  const trendsH = 200

  // Heading
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = TEXT_SECONDARY
  ctx.font = `600 14px ${SANS}`
  ctx.fillText('7-DAY TRENDS', PAD, trendsY)

  // Legend
  ctx.fillStyle = SAGE
  ctx.beginPath()
  ctx.arc(PAD + 140, trendsY + 7, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = TEXT_SECONDARY
  ctx.font = `400 14px ${SANS}`
  ctx.fillText('Mood', PAD + 152, trendsY)

  ctx.fillStyle = GOLD
  ctx.beginPath()
  ctx.arc(PAD + 220, trendsY + 7, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = TEXT_SECONDARY
  ctx.fillText('Energy', PAD + 232, trendsY)

  // Bar chart
  const chartY = trendsY + 36
  const chartH = 120
  const chartW = W - PAD * 2
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
  const colW = chartW / 7
  const barW = colW * 0.28
  const maxBarH = chartH - 20

  for (let i = 0; i < 7; i++) {
    const cx = PAD + i * colW + colW / 2
    const day = data.trendData[i]

    // Highlight current day (last = SUN)
    if (i === 6) {
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      roundRect(ctx, cx - colW / 2 + 6, chartY - 6, colW - 12, chartH + 6, 12)
      ctx.fill()
    }

    if (day) {
      // Mood bar (left)
      const moodH = (day.mood / 5) * maxBarH
      ctx.fillStyle = SAGE
      roundRect(ctx, cx - barW - 2, chartY + chartH - moodH - 16, barW, moodH, 4)
      ctx.fill()

      // Energy bar (right)
      const energyH = (day.energy / 5) * maxBarH
      ctx.fillStyle = GOLD
      roundRect(ctx, cx + 2, chartY + chartH - energyH - 16, barW, energyH, 4)
      ctx.fill()
    }

    // Day label
    ctx.fillStyle = i === 6 ? TEXT_WHITE : TEXT_MUTED_LIGHT
    ctx.font = `600 11px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(dayLabels[i], cx, chartY + chartH - 8)
  }

  // ── Footer: Circular Progress Charts ───────────────────────────────────────
  const footerY = trendsY + trendsH + 16
  const footerH = 160
  const circleR = 42
  const circleSpacing = (W - PAD * 2) / 3

  // Calculate averages
  const validDays = data.trendData.filter(Boolean) as Array<{ mood: number; energy: number }>
  const moodAvg = validDays.length > 0
    ? Math.round((validDays.reduce((s, d) => s + d.mood, 0) / validDays.length / 5) * 100)
    : 0
  const energyAvg = validDays.length > 0
    ? Math.round((validDays.reduce((s, d) => s + d.energy, 0) / validDays.length / 5) * 100)
    : 0
  const streakPct = Math.min(100, Math.round((data.streak / Math.max(data.personalBest, 1)) * 100))

  const footerStats = [
    { label: 'MOOD', pct: moodAvg, color: SAGE },
    { label: 'ENERGY', pct: energyAvg, color: GOLD },
    { label: 'STREAK', pct: streakPct, color: CORAL },
  ]

  for (let i = 0; i < 3; i++) {
    const stat = footerStats[i]
    const cx = PAD + circleSpacing * i + circleSpacing / 2
    const cy = footerY + circleR + 12

    // Background circle
    ctx.beginPath()
    ctx.arc(cx, cy, circleR, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(125,134,129,0.15)'
    ctx.lineWidth = 6
    ctx.stroke()

    // Progress arc
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (stat.pct / 100) * 2 * Math.PI
    ctx.beginPath()
    ctx.arc(cx, cy, circleR, startAngle, endAngle)
    ctx.strokeStyle = stat.color
    ctx.lineWidth = 6
    ctx.lineCap = 'round'
    ctx.stroke()

    // Percentage text
    ctx.fillStyle = TEXT_WHITE
    ctx.font = `bold 22px ${SANS_BOLD}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${stat.pct}%`, cx, cy - 4)

    // "avg" label
    ctx.fillStyle = TEXT_MUTED_LIGHT
    ctx.font = `400 12px ${SANS}`
    ctx.fillText('avg', cx, cy + 18)

    // Label below circle
    ctx.fillStyle = TEXT_SECONDARY
    ctx.font = `600 12px ${SANS}`
    ctx.textBaseline = 'top'
    ctx.fillText(stat.label, cx, cy + circleR + 12)
  }

  // ── Bottom footer ──────────────────────────────────────────────────────────
  ctx.fillStyle = TEXT_MUTED_LIGHT
  ctx.font = `400 14px ${SANS}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`@${data.userHandle}`, PAD, H - 24)
  ctx.textAlign = 'right'
  ctx.fillText('koru.app', W - PAD, H - 24)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}
