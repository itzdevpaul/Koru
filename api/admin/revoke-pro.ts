import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../_lib/admin'
import { getAdminUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }
  try {
    await getAdminUser(req)
    const { uid } = (req.body ?? {}) as { uid?: string }
    if (!uid) { res.status(400).json({ error: 'uid is required' }); return }
    await getFirestore(getAdminApp()).doc(`users/${uid}/subscription/main`).set({
      active: false, revokedByAdmin: true, revokedAt: new Date(),
    }, { merge: true })
    res.json({ ok: true })
  } catch (err) {
    sendApiError(res, err)
  }
}
