import type { DecodedIdToken } from 'firebase-admin/auth'
import type { VercelRequest } from '@vercel/node'
import { getAuth } from 'firebase-admin/auth'
import { getAdminApp } from './admin'

export const ADMIN_EMAIL = 'pauladamu600@gmail.com'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function getBearerToken(req: VercelRequest): string {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ') || header.length <= 7) {
    throw new ApiError('Authentication required', 401)
  }
  return header.slice(7)
}

export async function getAuthenticatedUser(req: VercelRequest): Promise<DecodedIdToken> {
  try {
    return await getAuth(getAdminApp()).verifyIdToken(getBearerToken(req))
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Invalid or expired authentication token.', 401)
  }
}

export async function getAdminUser(req: VercelRequest): Promise<DecodedIdToken> {
  const decoded = await getAuthenticatedUser(req)
  if (decoded.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new ApiError('Forbidden', 403)
  }
  return decoded
}

export function sendApiError(res: { status: (code: number) => { json: (body: unknown) => unknown } }, error: unknown): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message })
    return
  }
  const message = error instanceof Error ? error.message : 'Internal server error'
  console.error('[Koru] API error:', message)
  res.status(500).json({ error: 'Internal server error' })
}
