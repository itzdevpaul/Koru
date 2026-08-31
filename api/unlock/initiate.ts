import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAuthenticatedUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'
import { validatePromoCode } from '../_lib/promo'
import { initiateSquadTransaction, PRICING, safeCallbackOrigin } from '../_lib/squad'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)
    if (!decoded.email) { res.status(400).json({ error: 'Authenticated email is required' }); return }
    const body = (req.body ?? {}) as { quizId?: string; promoCode?: string; origin?: string }
    const quizId = String(body.quizId ?? '').trim().slice(0, 100)
    if (!quizId) { res.status(400).json({ error: 'quizId is required' }); return }

    const promo = body.promoCode ? await validatePromoCode(body.promoCode) : null
    const amount = promo?.valid
      ? Math.round(PRICING.unlockAmount * (1 - promo.discountPercent / 100))
      : PRICING.unlockAmount
    const reference = `koru_unlock_${decoded.uid}_${quizId}_${Date.now()}`
    const { checkoutUrl } = await initiateSquadTransaction({
      email: decoded.email,
      amount,
      reference,
      callbackUrl: `${safeCallbackOrigin(body.origin)}/payment/return`,
    })
    res.json({ checkout_url: checkoutUrl, ref: reference })
  } catch (err) {
    sendApiError(res, err)
  }
}
