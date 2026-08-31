import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuthenticatedUser, sendApiError } from '../_lib/auth'
import { getAdminApp } from '../_lib/admin'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'
import { validatePromoCode } from '../_lib/promo'
import { initiateSquadTransaction, PRICING, safeCallbackOrigin } from '../_lib/squad'

function calculatePrice(referredBy: boolean, isFirstTime: boolean, promoDiscount: number): {
  amount: number
  discountPercent: number
  discountReason: string
} {
  const now = new Date()
  const anniversary = now.getMonth() === 8 && now.getDate() === 4
  if (anniversary) {
    const discount = Math.min(100, 50 + promoDiscount)
    return {
      amount: Math.round(PRICING.baseAmount * (1 - discount / 100)),
      discountPercent: discount,
      discountReason: promoDiscount ? `Happy Anniversary! 50% + promo ${promoDiscount}% off` : 'Happy Anniversary! 50% off Koru Pro',
    }
  }
  if (isFirstTime) {
    const discount = Math.min(100, 60 + promoDiscount)
    return {
      amount: Math.round(PRICING.baseAmount * (1 - discount / 100)),
      discountPercent: discount,
      discountReason: promoDiscount ? `First month intro 60% + promo ${promoDiscount}% off` : 'First month intro offer — 60% off',
    }
  }
  if (promoDiscount > 0) {
    return {
      amount: Math.round(PRICING.baseAmount * (1 - promoDiscount / 100)),
      discountPercent: promoDiscount,
      discountReason: `Promo code — ${promoDiscount}% off`,
    }
  }
  if (referredBy) {
    return {
      amount: Math.round(PRICING.baseAmount * 0.95),
      discountPercent: 5,
      discountReason: 'Invite code benefit — 5% off',
    }
  }
  return { amount: PRICING.baseAmount, discountPercent: 0, discountReason: '' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)
    if (!decoded.email) { res.status(400).json({ error: 'Authenticated email is required' }); return }

    const body = (req.body ?? {}) as { origin?: string; promoCode?: string }
    const firestore = getFirestore(getAdminApp())
    const [profileSnap, subscriptionSnap] = await Promise.all([
      firestore.doc(`users/${decoded.uid}/profile/main`).get(),
      firestore.doc(`users/${decoded.uid}/subscription/main`).get(),
    ])
    const referredBy = Boolean(profileSnap.exists && profileSnap.data()?.referredBy)
    const promo = body.promoCode ? await validatePromoCode(body.promoCode) : null
    const price = calculatePrice(referredBy, !subscriptionSnap.exists, promo?.valid ? promo.discountPercent : 0)
    const reference = `koru_sub_${decoded.uid}_${Date.now()}`
    const { checkoutUrl } = await initiateSquadTransaction({
      email: decoded.email,
      amount: price.amount,
      reference,
      callbackUrl: `${safeCallbackOrigin(body.origin)}/payment/return`,
    })
    res.json({ checkout_url: checkoutUrl, ref: reference })
  } catch (err) {
    sendApiError(res, err)
  }
}
