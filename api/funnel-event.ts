import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from './_lib/admin'
import { getAuthenticatedUser, sendApiError } from './_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from './_lib/http'

const EVENT_TYPES = new Set([
  'upgrade_page_view',
  'upgrade_scroll_50',
  'upgrade_scroll_100',
  'upgrade_price_seen',
  'upgrade_cta_click',
  'upgrade_bounce',
])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }
  try {
    const decoded = await getAuthenticatedUser(req)
    const body = (req.body ?? {}) as { type?: string; page?: string; metadata?: Record<string, unknown> }
    if (!body.type || !EVENT_TYPES.has(body.type)) {
      res.status(400).json({ error: 'Invalid event type' }); return
    }
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {}
    const safeMetadata: Record<string, unknown> = {}
    if (typeof metadata.amount === 'number' && Number.isFinite(metadata.amount)) {
      safeMetadata.amount = Math.max(0, Math.min(10_000_000, metadata.amount))
    }
    await getFirestore(getAdminApp()).collection('funnelEvents').add({
      ...safeMetadata,
      type: body.type,
      uid: decoded.uid,
      page: typeof body.page === 'string' ? body.page.slice(0, 100) : '/upgrade',
      timestamp: new Date(),
    })
    res.json({ ok: true })
  } catch (err) {
    sendApiError(res, err)
  }
}
