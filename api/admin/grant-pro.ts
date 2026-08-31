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
    const { uid, days } = (req.body ?? {}) as { uid?: string; days?: number }
    if (!uid || !Number.isFinite(days) || Number(days) < 1 || Number(days) > 3650) {
      res.status(400).json({ error: 'uid and days (1–3650) are required' }); return
    }
    const expiresAt = new Date(Date.now() + Number(days) * 86_400_000)
    await getFirestore(getAdminApp()).doc(`users/${uid}/subscription/main`).set({
      active: true, expiresAt, grantedByAdmin: true, grantedAt: new Date(),
    }, { merge: true })
    res.json({ ok: true, expiresAt: expiresAt.toISOString() })
  } catch (err) {
    sendApiError(res, err)
  }
}
