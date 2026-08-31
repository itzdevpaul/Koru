import { initializeApp, cert, getApps, getApp, type App } from 'firebase-admin/app'

export function getAdminApp(): App {
  if (getApps().length > 0) return getApp()
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set')

  const trimmed = raw.trim()
  let jsonText = trimmed
  if (!trimmed.startsWith('{')) {
    jsonText = Buffer.from(trimmed, 'base64').toString('utf8')
  }

  // Support a value that was accidentally JSON-stringified once more while
  // still rejecting malformed credentials rather than silently falling back.
  let credential: Record<string, unknown> = JSON.parse(jsonText)
  if (typeof credential === 'string') {
    credential = JSON.parse(credential) as Record<string, unknown>
  }
  if (typeof credential.private_key === 'string') {
    credential.private_key = credential.private_key.replace(/\\n/g, '\n')
  }
  if (typeof credential.project_id !== 'string' || typeof credential.private_key !== 'string') {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not a valid Firebase Admin service account')
  }

  return initializeApp({ credential: cert(credential) })
}
