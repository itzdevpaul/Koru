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
    const prefix = `koru_unlock_${decoded.uid}_`
    if (!ref || !ref.startsWith(prefix)) {
      res.status(403).json({ error: 'Payment ownership could not be verified' }); return
    }
    if (!(await verifySquadTransaction(ref))) {
      res.status(402).json({ error: 'Payment could not be verified' }); return
    }

    const afterUid = ref.slice(prefix.length)
    const quizId = afterUid.slice(0, afterUid.lastIndexOf('_'))
    if (!quizId) { res.status(400).json({ error: 'Invalid payment reference' }); return }
    await getFirestore(getAdminApp()).doc(`users/${decoded.uid}/unlocks/${quizId}`).set({
      active: true,
      squadRef: ref,
      activatedAt: new Date(),
    })
    res.json({ ok: true, quizId })
  } catch (err) {
    sendApiError(res, err)
  }
}
