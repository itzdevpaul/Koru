import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import { getAdminApp } from '../_lib/admin'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuthenticatedUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'

function inviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)

    const firestore = getFirestore(getAdminApp())
    const profileRef = firestore.doc(`users/${decoded.uid}/profile/main`)

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = inviteCode()
      const codeRef = firestore.doc(`inviteCodes/${candidate}`)
      const result = await firestore.runTransaction(async transaction => {
        const [profileSnap, codeSnap] = await Promise.all([
          transaction.get(profileRef),
          transaction.get(codeRef),
        ])
        const profile = profileSnap.data() ?? {}
        if (typeof profile.inviteCode === 'string' && profile.inviteCode) {
          return {
            inviteCode: profile.inviteCode,
            referralCount: Number(profile.referralCount ?? 0),
            referralRewardGranted: Boolean(profile.referralRewardGranted),
          }
        }
        if (codeSnap.exists) return null
        transaction.set(codeRef, { uid: decoded.uid, createdAt: new Date() })
        transaction.set(profileRef, {
          inviteCode: candidate,
          referralCount: 0,
          referralRewardGranted: false,
          updatedAt: new Date(),
        }, { merge: true })
        return { inviteCode: candidate, referralCount: 0, referralRewardGranted: false }
      })
      if (result) {
        res.json({ ...result, rewardDays: 7 })
        return
      }
    }
    res.status(503).json({ error: 'Could not create an invite code. Please try again.' })
  } catch (err) {
    sendApiError(res, err)
  }
}
