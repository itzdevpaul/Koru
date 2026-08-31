import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminApp } from '../_lib/admin'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuthenticatedUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'

function safeInviteCode(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

async function notifyInviter(inviterUid: string, referralCount: number, rewardGranted: boolean): Promise<void> {
  try {
    const firestore = getFirestore(getAdminApp())

    const message = rewardGranted
      ? "Your invite code was used! You've reached 10 referrals — 7 days of Pro unlocked! 🎉"
      : `Your invite code was used! ${referralCount} of 10 referrals — keep inviting to unlock Pro.`
    await firestore.collection(`users/${inviterUid}/notifications`).add({
      type: 'referral',
      title: 'Your invite code was used! 🎉',
      message,
      referralCount,
      rewardGranted,
      read: false,
      createdAt: new Date(),
    })

    // Try to send a push notification if the inviter has push enabled
    const profileSnap = await firestore.doc(`users/${inviterUid}/profile/main`).get()
    const pushToken = profileSnap.data()?.pushToken
    const pushEnabled = profileSnap.data()?.pushNotificationsEnabled
    if (pushToken && pushEnabled) {
      try {
        await getMessaging(getAdminApp()).send({
          token: pushToken,
          notification: {
            title: 'Your invite code was used! 🎉',
            body: rewardGranted
              ? '10 referrals reached — 7 days of Pro unlocked!'
              : `${referralCount} of 10 invites — keep going!`,
          },
          data: { url: '/profile' },
        })
      } catch (err) {
        console.warn('[Koru] Referral push notification failed:', err instanceof Error ? err.message : err)
      }
    }
  } catch (err) {
    console.error('[Koru] Failed to notify inviter:', err instanceof Error ? err.message : err)
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)

    const code = safeInviteCode((req.body as { inviteCode?: string }).inviteCode)
    if (code.length < 6) { res.status(400).json({ error: 'Enter a valid invite code.' }); return }

    const firestore = getFirestore(getAdminApp())
    const codeRef = firestore.doc(`inviteCodes/${code}`)
    const inviteeProfileRef = firestore.doc(`users/${decoded.uid}/profile/main`)
    const result = await firestore.runTransaction(async transaction => {
      const codeSnap = await transaction.get(codeRef)
      if (!codeSnap.exists) throw new Error('That invite code is not valid.')
      const ownerUid = String(codeSnap.data()?.uid ?? '')
      if (!ownerUid || ownerUid === decoded.uid) throw new Error('You cannot use your own invite code.')

      const inviterProfileRef = firestore.doc(`users/${ownerUid}/profile/main`)
      const actualReferralRef = firestore.doc(`users/${ownerUid}/referrals/${decoded.uid}`)
      const subscriptionRef = firestore.doc(`users/${ownerUid}/subscription/main`)
      const [inviteeProfile, referral, inviterProfile, subscription] = await Promise.all([
        transaction.get(inviteeProfileRef),
        transaction.get(actualReferralRef),
        transaction.get(inviterProfileRef),
        transaction.get(subscriptionRef),
      ])
      if (inviteeProfile.data()?.referredBy) throw new Error('An invite code has already been applied to this account.')
      if (referral.exists) return { rewardGranted: false, ownerUid: '', referralCount: 0 }

      const profile = inviterProfile.data() ?? {}
      const count = Number(profile.referralCount ?? 0) + 1
      const rewardGranted = Boolean(profile.referralRewardGranted) || count >= 10
      transaction.set(actualReferralRef, {
        invitedUid: decoded.uid,
        inviteCode: code,
        createdAt: new Date(),
      })
      transaction.set(inviteeProfileRef, {
        referredBy: ownerUid,
        referredAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date(),
      }, { merge: true })
      transaction.set(inviterProfileRef, {
        referralCount: count,
        referralRewardGranted: rewardGranted,
        updatedAt: new Date(),
      }, { merge: true })

      if (rewardGranted && !profile.referralRewardGranted) {
        const currentExpiry = subscription.data()?.expiresAt?.toDate?.() as Date | undefined
        const startsAt = currentExpiry && currentExpiry > new Date() ? currentExpiry : new Date()
        const expiresAt = new Date(startsAt)
        expiresAt.setDate(expiresAt.getDate() + 7)
        transaction.set(subscriptionRef, {
          active: true,
          expiresAt: Timestamp.fromDate(expiresAt),
          squadRef: 'referral-reward',
          activatedAt: new Date(),
          updatedAt: new Date(),
        }, { merge: true })
      }
      return { rewardGranted: rewardGranted && !profile.referralRewardGranted, ownerUid, referralCount: count }
    })

    if (result.ownerUid) {
      void notifyInviter(result.ownerUid, result.referralCount, result.rewardGranted)
    }

    res.json({ ok: true, rewardGranted: result.rewardGranted })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const status = msg.includes('valid') || msg.includes('own') || msg.includes('already') ? 400 : undefined
    if (status) res.status(status).json({ error: msg })
    else sendApiError(res, err)
  }
}
