import type { VercelRequest, VercelResponse } from '@vercel/node'
import { app } from '../server/index'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // vercel.json passes the original API path as a query parameter because the
  // Express app is mounted behind this single Hobby-plan function.
  const route = req.query.path
  const currentUrl = new URL(req.url ?? '/', 'http://vercel.local')
  const routeFromQuery = Array.isArray(route) ? route.join('/') : String(route ?? '')
  const routeFromUrl = currentUrl.pathname.replace(/^\/api\/?/, '').replace(/^index\/?/, '')
  const path = routeFromQuery || routeFromUrl
  currentUrl.searchParams.delete('path')
  req.url = `/api/${path}${currentUrl.searchParams.toString() ? `?${currentUrl.searchParams.toString()}` : ''}`
  return app(req as never, res as never)
}