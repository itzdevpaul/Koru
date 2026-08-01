import { initializeApp, cert, getApps, getApp, type App } from 'firebase-admin/app'

export function getAdminApp(): App {
  if (getApps().length > 0) return getApp()
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')
  const credential = JSON.parse(
    raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')
  )
  return initializeApp({ credential: cert(credential) })
}
