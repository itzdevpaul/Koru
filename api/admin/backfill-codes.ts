import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'node:crypto'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '../_lib/admin'
import { getAdminUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'

function inviteCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(crypto.randomBytes(8), byte => alphabet[byte % alphabet.length]).join('')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }
  try {
    await getAdminUser(req)
    const adminAuth = getAuth(getAdminApp())
    const firestore = getFirestore(getAdminApp())
    let pageToken: string | undefined
    let created = 0
    let skipped = 0
    do {
      const result = await adminAuth.listUsers(1000, pageToken)
      for (const user of result.users) {
        const profileRef = firestore.doc(`users/${user.uid}/profile/main`)
        const profile = (await profileRef.get()).data() ?? {}
        if (typeof profile.inviteCode === 'string' && profile.inviteCode) { skipped += 1; continue }
        for (let attempt = 0; attempt < 8; attempt += 1) {
          const candidate = inviteCode()
          const codeRef = firestore.doc(`inviteCodes/${candidate}`)
          if ((await codeRef.get()).exists) continue
          await codeRef.set({ uid: user.uid, createdAt: new Date() })
          await profileRef.set({ inviteCode: candidate, referralCount: 0, referralRewardGranted: false, updatedAt: new Date() }, { merge: true })
          created += 1
          break
        }
      }
      pageToken = result.pageToken
    } while (pageToken)
    res.json({ ok: true, created, skipped })
  } catch (err) {
    sendApiError(res, err)
  }
}
