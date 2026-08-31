import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../../_lib/admin'
import { getAdminUser, sendApiError } from '../../_lib/auth'
import { safePromoCode } from '../../_lib/promo'
import { handleOptions, methodNotAllowed, setCors } from '../../_lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }
  try {
    const admin = await getAdminUser(req)
    const { code, discountPercent, expiresAt } = (req.body ?? {}) as { code?: string; discountPercent?: number; expiresAt?: string }
    const cleanCode = safePromoCode(code)
    if (cleanCode.length < 3) { res.status(400).json({ error: 'Promo code must be at least 3 characters (A-Z, 0-9).' }); return }
    if (!Number.isFinite(discountPercent) || Number(discountPercent) < 1 || Number(discountPercent) > 100) {
      res.status(400).json({ error: 'Discount must be 1–100%.' }); return
    }
    if (!expiresAt) { res.status(400).json({ error: 'Expiration date is required.' }); return }
    const expiry = new Date(expiresAt)
    if (Number.isNaN(expiry.getTime())) { res.status(400).json({ error: 'Expiration date is invalid.' }); return }
    expiry.setHours(23, 59, 59, 999)
    const firestore = getFirestore(getAdminApp())
    const promoRef = firestore.doc(`promoCodes/${cleanCode}`)
    if ((await promoRef.get()).exists) { res.status(409).json({ error: 'A promo code with this name already exists.' }); return }
    await promoRef.set({
      code: cleanCode,
      discountPercent: Number(discountPercent),
      expiresAt: Timestamp.fromDate(expiry),
      active: true,
      createdAt: new Date(),
      createdBy: admin.email,
    })
    res.json({ ok: true, code: cleanCode, discountPercent: Number(discountPercent), expiresAt: expiry.toISOString() })
  } catch (err) {
    sendApiError(res, err)
  }
}
