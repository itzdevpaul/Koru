import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'
import { validatePromoCode } from '../_lib/promo'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    await getAuthenticatedUser(req)
    const { code } = (req.body ?? {}) as { code?: string }
    if (!code) { res.status(400).json({ error: 'Promo code is required.' }); return }
    res.json(await validatePromoCode(code))
  } catch (err) {
    sendApiError(res, err)
  }
}
