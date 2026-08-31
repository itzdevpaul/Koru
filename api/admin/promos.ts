import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../_lib/admin'
import { getAdminUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'GET,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') { methodNotAllowed(res, 'GET,OPTIONS'); return }
  try {
    await getAdminUser(req)
    const snap = await getFirestore(getAdminApp()).collection('promoCodes').orderBy('createdAt', 'desc').get()
    res.json(snap.docs.map(doc => {
      const data = doc.data()
      return {
        code: doc.id,
        discountPercent: Number(data.discountPercent ?? 0),
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() ?? null,
        active: Boolean(data.active),
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      }
    }))
  } catch (err) {
    sendApiError(res, err)
  }
}
