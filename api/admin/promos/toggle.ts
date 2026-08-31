import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../../_lib/admin'
import { getAdminUser, sendApiError } from '../../_lib/auth'
import { safePromoCode } from '../../_lib/promo'
import { handleOptions, methodNotAllowed, setCors } from '../../_lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }
  try {
    await getAdminUser(req)
    const cleanCode = safePromoCode((req.body ?? {}).code)
    if (!cleanCode) { res.status(400).json({ error: 'code required' }); return }
    const ref = getFirestore(getAdminApp()).doc(`promoCodes/${cleanCode}`)
    const snap = await ref.get()
    if (!snap.exists) { res.status(404).json({ error: 'Promo code not found' }); return }
    const active = !Boolean(snap.data()?.active)
    await ref.set({ active }, { merge: true })
    res.json({ ok: true, active })
  } catch (err) {
    sendApiError(res, err)
  }
}
