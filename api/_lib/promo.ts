import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from './admin'

export function safePromoCode(value: unknown): string {
  return String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

export async function validatePromoCode(code: unknown): Promise<{
  valid: boolean
  discountPercent: number
  error?: string
}> {
  const cleanCode = safePromoCode(code)
  if (!cleanCode || cleanCode.length < 3) {
    return { valid: false, discountPercent: 0, error: 'Invalid promo code format.' }
  }

  const snap = await getFirestore(getAdminApp()).doc(`promoCodes/${cleanCode}`).get()
  if (!snap.exists) return { valid: false, discountPercent: 0, error: 'Promo code not found.' }

  const data = snap.data()
  if (!data?.active) {
    return { valid: false, discountPercent: 0, error: 'This promo code is no longer active.' }
  }
  if (data.expiresAt) {
    const expiry = data.expiresAt?.toDate?.() ?? new Date(data.expiresAt)
    if (expiry < new Date()) {
      return { valid: false, discountPercent: 0, error: 'This promo code has expired.' }
    }
  }

  return {
    valid: true,
    discountPercent: Math.min(100, Math.max(0, Number(data.discountPercent ?? 0))),
  }
}
