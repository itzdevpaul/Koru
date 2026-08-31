import type { VercelRequest, VercelResponse } from '@vercel/node'

const PRODUCTION_ORIGINS = new Set([
  'https://koru.com.ng',
  'https://www.koru.com.ng',
])

function isTrustedOrigin(origin: string): boolean {
  if (PRODUCTION_ORIGINS.has(origin)) return true

  const configuredUrl = process.env.APP_URL?.trim().replace(/\/$/, '')
  if (configuredUrl && configuredUrl === origin) return true

  // Vercel preview deployments are trusted so QA can exercise authenticated
  // flows without weakening production CORS to every origin.
  try {
    const url = new URL(origin)
    return url.protocol === 'https:' && url.hostname.endsWith('.vercel.app')
  } catch {
    return false
  }
}

export function setCors(
  req: VercelRequest,
  res: VercelResponse,
  methods = 'GET,POST,OPTIONS',
): void {
  const origin = req.headers.origin
  if (typeof origin === 'string' && isTrustedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', methods)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Max-Age', '86400')
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== 'OPTIONS') return false

  const origin = req.headers.origin
  if (typeof origin === 'string' && !isTrustedOrigin(origin)) {
    res.status(403).json({ error: 'Origin is not allowed.' })
  } else {
    res.status(204).end()
  }
  return true
}

export function methodNotAllowed(res: VercelResponse, allow: string): void {
  res.setHeader('Allow', allow)
  res.status(405).json({ error: 'Method not allowed' })
}
