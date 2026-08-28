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

export function sanitizeHttpUrl(value: unknown): string {
  const raw = sanitizeText(value, 2048)
  try {
    const url = new URL(raw)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : ''
  } catch {
    return ''
  }
}
