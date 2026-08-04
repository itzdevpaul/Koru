// Canvas-based shareable image generator for Koru

const FOREST = '#1B3B2B'
const CREAM  = '#FBF9F5'
const SAGE   = '#A2BFA6'
const BODY   = '#4A6358'

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

// ── Quiz result card (1080×1080) ─────────────────────────────────────────────
export async function generateQuizShareImage(data: {
  emoji: string
  title: string
  tagline: string
  quizTitle: string
}): Promise<Blob> {
  await document.fonts.ready

  const S = 1080
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Background
  ctx.fillStyle = FOREST
  ctx.fillRect(0, 0, S, S)

  // Radial glow
  const g1 = ctx.createRadialGradient(S * 0.5, S * 0.35, 0, S * 0.5, S * 0.35, S * 0.65)
  g1.addColorStop(0, 'rgba(162,191,166,0.22)')
  g1.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, S, S)

  // Subtle bottom fade
  const g2 = ctx.createLinearGradient(0, S * 0.7, 0, S)
  g2.addColorStop(0, 'rgba(0,0,0,0)')
  g2.addColorStop(1, 'rgba(0,0,0,0.25)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, S, S)

  // Card border
  ctx.strokeStyle = 'rgba(162,191,166,0.22)'
  ctx.lineWidth = 2
  roundRect(ctx, 60, 60, S - 120, S - 120, 52)
  ctx.stroke()

  // Top label
  ctx.fillStyle = SAGE
  ctx.font = `600 26px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('KORU · SELF-DISCOVERY', S / 2, 148)

  // Emoji (large)
  ctx.font = `128px serif`
  ctx.fillText(data.emoji, S / 2, 370)

  // Result title
  ctx.fillStyle = CREAM
  ctx.font = `bold 76px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText(data.title, S / 2, 490)

  // Tagline (wrapped)
  ctx.fillStyle = 'rgba(251,249,245,0.70)'
  ctx.font = `400 38px "Inter", sans-serif`
  const tagLines = wrapText(ctx, data.tagline, 720)
  tagLines.forEach((line, i) => ctx.fillText(line, S / 2, 568 + i * 54))

  // Divider
  const divY = 660 + Math.max(0, tagLines.length - 1) * 54
  ctx.strokeStyle = 'rgba(162,191,166,0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(S / 2 - 90, divY)
  ctx.lineTo(S / 2 + 90, divY)
  ctx.stroke()

  // Quiz name
  ctx.fillStyle = 'rgba(162,191,166,0.90)'
  ctx.font = `500 28px "Inter", sans-serif`
  ctx.fillText(data.quizTitle.toUpperCase(), S / 2, divY + 58)

  // Domain
  ctx.fillStyle = 'rgba(251,249,245,0.38)'
  ctx.font = `500 24px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('koru.com.ng', S / 2, S - 96)

  return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/png', 1.0))
}

// ── Daily check-in card (1080×1080) ──────────────────────────────────────────
export async function generateCheckInShareImage(data: {
  moodEmoji: string
  moodLabel: string
  energy: number
  reflection?: string
  date?: string
}): Promise<Blob> {
  await document.fonts.ready

  const S = 1080
  const canvas = document.createElement('canvas')
  canvas.width = S
  canvas.height = S
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // Cream background
  ctx.fillStyle = CREAM
  ctx.fillRect(0, 0, S, S)

  // Corner glow
  const g1 = ctx.createRadialGradient(S * 0.88, S * 0.12, 0, S * 0.88, S * 0.12, S * 0.78)
  g1.addColorStop(0, 'rgba(162,191,166,0.32)')
  g1.addColorStop(0.45, 'rgba(224,122,95,0.08)')
  g1.addColorStop(1, 'rgba(251,249,245,0)')
  ctx.fillStyle = g1
  ctx.fillRect(0, 0, S, S)

  // Bottom left glow
  const g2 = ctx.createRadialGradient(S * 0.1, S * 0.9, 0, S * 0.1, S * 0.9, S * 0.5)
  g2.addColorStop(0, 'rgba(162,191,166,0.18)')
  g2.addColorStop(1, 'rgba(251,249,245,0)')
  ctx.fillStyle = g2
  ctx.fillRect(0, 0, S, S)

  // Card border
  ctx.strokeStyle = 'rgba(27,59,43,0.09)'
  ctx.lineWidth = 2
  roundRect(ctx, 60, 60, S - 120, S - 120, 52)
  ctx.stroke()

  // Top label
  ctx.fillStyle = SAGE
  ctx.font = `600 26px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('DAILY CHECK-IN · KORU', S / 2, 148)

  // Date
  if (data.date) {
    ctx.fillStyle = 'rgba(27,59,43,0.40)'
    ctx.font = `400 26px "Inter", sans-serif`
    ctx.fillText(data.date, S / 2, 196)
  }

  // Big mood emoji
  ctx.font = `150px serif`
  ctx.fillText(data.moodEmoji, S / 2, 420)

  // Mood label
  ctx.fillStyle = FOREST
  ctx.font = `bold 72px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText(data.moodLabel, S / 2, 530)

  // Energy dots
  const dotR = 17
  const gap   = 48
  const totalW = 5 * (dotR * 2) + 4 * (gap - dotR * 2)
  const startX = S / 2 - totalW / 2 + dotR
  const dotY   = 614
  for (let i = 1; i <= 5; i++) {
    ctx.beginPath()
    ctx.arc(startX + (i - 1) * gap, dotY, dotR, 0, Math.PI * 2)
    ctx.fillStyle = i <= data.energy ? FOREST : 'rgba(27,59,43,0.14)'
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(27,59,43,0.48)'
  ctx.font = `400 24px "Inter", sans-serif`
  ctx.fillText(`Energy ${data.energy}/5`, S / 2, dotY + 46)

  // Reflection
  const reflectionText = data.reflection?.trim()
  if (reflectionText) {
    ctx.fillStyle = BODY
    ctx.font = `italic 400 34px "Inter", sans-serif`
    const lines = wrapText(ctx, `"${reflectionText}"`, 800)
    const topY = 748
    lines.slice(0, 3).forEach((line, i) => ctx.fillText(line, S / 2, topY + i * 50))
  }

  // Domain
  ctx.fillStyle = 'rgba(27,59,43,0.30)'
  ctx.font = `500 24px "Plus Jakarta Sans", "Inter", sans-serif`
  ctx.fillText('koru.com.ng', S / 2, S - 96)

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
