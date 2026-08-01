import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminApp } from '../_lib/admin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Admin-Key')

  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return }

  const adminKey = process.env.ADMIN_PASSWORD
  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    res.status(401).json({ error: 'Unauthorized' }); return
  }

  try {
    const admin = getAdminApp()
    const auth = getAuth(admin)
    const firestore = getFirestore(admin)

    const allUsers: Awaited<ReturnType<typeof auth.listUsers>>['users'] = []
    let pageToken: string | undefined
    do {
      const result = await auth.listUsers(1000, pageToken)
      allUsers.push(...result.users)
      pageToken = result.pageToken
    } while (pageToken)

    const enriched = await Promise.all(
      allUsers.map(async (u) => {
        const uid = u.uid
        const [profileSnap, subSnap, quizSnap] = await Promise.all([
          firestore.doc(`users/${uid}/profile/main`).get(),
          firestore.doc(`users/${uid}/subscription/main`).get(),
          firestore.collection(`users/${uid}/quizResults`).count().get(),
        ])
        const profile = profileSnap.exists ? profileSnap.data() : null
        const sub = subSnap.exists ? subSnap.data() : null
        return {
          uid,
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          createdAt: u.metadata.creationTime ?? '',
          lastSignIn: u.metadata.lastSignInTime ?? '',
          profile: profile ? {
            onboardingComplete: !!profile.onboardingComplete,
            focusAreas: profile.focusAreas ?? [],
            ageRange: profile.ageRange ?? '',
            streak: profile.streak ?? 0,
            lastActive: profile.lastActive ?? '',
            emailOptIn: !!profile.emailOptIn,
          } : null,
          subscription: sub ? {
            active: !!sub.active,
            expiresAt: sub.expiresAt?.toDate?.()?.toISOString() ?? null,
          } : null,
          quizCount: quizSnap.data().count ?? 0,
        }
      })
    )

    enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    res.json(enriched)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/admin/users error:', msg)
    res.status(500).json({ error: msg })
  }
}
