// Small input sanitizers shared by the Firebase data layer.

export function sanitizeText(value: unknown, maxLength = 200): string {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength)
}

export function sanitizeEmail(value: unknown): string {
  return sanitizeText(value, 254).toLowerCase().replace(/\s+/g, '')
}

export function sanitizeDisplayName(value: unknown): string {
  return sanitizeText(value, 60).replace(/\s+/g, ' ')
}

export function sanitizeInviteCode(value: unknown): string {
  return sanitizeText(value, 12).toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Normalize common Nigerian local formats to an E.164-style WhatsApp number.
// International numbers must include their country code.
export function normalizeWhatsAppNumber(value: unknown): string {
  let raw = sanitizeText(value, 32).replace(/[()\s-]/g, '')
  if (raw.startsWith('00')) raw = `+${raw.slice(2)}`
  else if (raw.startsWith('0')) raw = `+234${raw.slice(1)}`
  else if (!raw.startsWith('+')) raw = `+${raw}`

  return /^\+[1-9]\d{7,14}$/.test(raw) ? raw : ''
}

export function sanitizeHttpUrl(value: unknown): string {
  const raw = sanitizeText(value, 2048)
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}
