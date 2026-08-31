import type { VercelRequest, VercelResponse } from '@vercel/node'
import { app } from '../server/index'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // vercel.json passes the original API path as a query parameter because the
  // Express app is mounted behind this single Hobby-plan function.
  const route = req.query.path
  const path = Array.isArray(route) ? route.join('/') : String(route ?? '')
  const query = new URL(req.url ?? '/', 'http://vercel.local').searchParams
  query.delete('path')
  req.url = `/api/${path}${query.toString() ? `?${query.toString()}` : ''}`
  return app(req as never, res as never)
}