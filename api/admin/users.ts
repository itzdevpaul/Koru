import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from '../_lib/admin'
import { getAdminUser, sendApiError } from '../_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from '../_lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'GET,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'GET') { methodNotAllowed(res, 'GET,OPTIONS'); return }

  try {
    await getAdminUser(req)
    const adminApp = getAdminApp()
    const adminAuth = getAuth(adminApp)
    const firestore = getFirestore(adminApp)
    const allUsers: Awaited<ReturnType<typeof adminAuth.listUsers>>['users'] = []
    let pageToken: string | undefined
    do {
      const result = await adminAuth.listUsers(1000, pageToken)
      allUsers.push(...result.users)
      pageToken = result.pageToken
    } while (pageToken)

    const enriched = await Promise.all(allUsers.map(async user => {
      const [profileSnap, subSnap, quizSnap] = await Promise.all([
        firestore.doc(`users/${user.uid}/profile/main`).get(),
        firestore.doc(`users/${user.uid}/subscription/main`).get(),
        firestore.collection(`users/${user.uid}/quizResults`).count().get(),
      ])
      const profile = profileSnap.exists ? profileSnap.data() : null
      const subscription = subSnap.exists ? subSnap.data() : null
      return {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? '',
        createdAt: user.metadata.creationTime ?? '',
        lastSignIn: user.metadata.lastSignInTime ?? '',
        profile: profile ? {
          onboardingComplete: !!profile.onboardingComplete,
          focusAreas: profile.focusAreas ?? [],
          ageRange: profile.ageRange ?? '',
          streak: profile.streak ?? 0,
          lastActive: profile.lastActive ?? '',
          emailOptIn: !!profile.emailOptIn,
        } : null,
        subscription: subscription ? {
          active: !!subscription.active,
          expiresAt: subscription.expiresAt?.toDate?.()?.toISOString() ?? null,
        } : null,
        quizCount: quizSnap.data().count ?? 0,
      }
    }))
    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(enriched)
  } catch (err) {
    sendApiError(res, err)
  }
}
