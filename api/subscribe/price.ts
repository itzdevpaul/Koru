import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAdminApp } from '../_lib/admin'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const BASE_PRICE_KOBO = 250000 // ₦2,500

function calculatePrice(referredBy: boolean): {
  amount: number
  discountPercent: number
  discountReason: string
} {
  const now = new Date()
  const isAnniversary = now.getMonth() === 8 && now.getDate() === 4
  if (isAnniversary) {
    return {
      amount: Math.round(BASE_PRICE_KOBO * 0.5),
      discountPercent: 50,
      discountReason: 'Happy Anniversary! 50% off Koru Pro',
    }
  }
  if (referredBy) {
    return {
      amount: Math.round(BASE_PRICE_KOBO * 0.95),
      discountPercent: 5,
      discountReason: 'Invite code benefit — 5% off',
    }
  }
  return { amount: BASE_PRICE_KOBO, discountPercent: 0, discountReason: '' }
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
    const profileSnap = await firestore.doc(`users/${decoded.uid}/profile/main`).get()
    const referredBy = Boolean(profileSnap.exists && profileSnap.data()?.referredBy)
    const price = calculatePrice(referredBy)
    res.json({
      baseAmount: BASE_PRICE_KOBO / 100,
      discountPercent: price.discountPercent,
      finalAmount: price.amount / 100,
      discountReason: price.discountReason,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(msg === 'Authentication required' ? 401 : 500).json({ error: msg })
  }
}
