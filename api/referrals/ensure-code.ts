import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import { getAdminApp } from '../_lib/admin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

function inviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) { res.status(401).json({ error: 'Authentication required' }); return }
    const decoded = await getAuth(getAdminApp()).verifyIdToken(authHeader.slice(7))

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
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/referrals/ensure-code error:', msg)
    res.status(msg === 'Authentication required' ? 401 : 500).json({ error: msg })
  }
}
