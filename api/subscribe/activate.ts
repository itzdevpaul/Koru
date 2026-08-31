import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuthenticatedUser, sendApiError } from '../_lib/auth'
import { getAdminApp } from '../_lib/admin'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'
import { verifySquadTransaction } from '../_lib/squad'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)
    const { ref } = (req.body ?? {}) as { ref?: string }
    if (!ref || !ref.startsWith(`koru_sub_${decoded.uid}_`)) {
      res.status(403).json({ error: 'Payment ownership could not be verified' }); return
    }
    if (!(await verifySquadTransaction(ref))) {
      res.status(402).json({ error: 'Payment could not be verified' }); return
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    await getFirestore(getAdminApp()).doc(`users/${decoded.uid}/subscription/main`).set({
      active: true,
      expiresAt,
      squadRef: ref,
      activatedAt: new Date(),
      updatedAt: new Date(),
    })
    res.json({ ok: true })
  } catch (err) {
    sendApiError(res, err)
  }
}
