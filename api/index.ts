import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { app } = await import('../server/index')

    // vercel.json passes the original API path as a query parameter because the
    // Express app is mounted behind this single Hobby-plan function. Some
    // Vercel request shapes omit query, so also derive the path from the URL.
    const route = req.query?.path
    const currentUrl = new URL(req.url ?? '/', 'http://vercel.local')
    const routeFromQuery = Array.isArray(route) ? route.join('/') : String(route ?? '')
    const routeFromUrl = currentUrl.pathname.replace(/^\/api\/?/, '').replace(/^index\/?/, '')
    const path = routeFromQuery || routeFromUrl
    currentUrl.searchParams.delete('path')
    req.url = `/api/${path}${currentUrl.searchParams.toString() ? `?${currentUrl.searchParams.toString()}` : ''}`

    return app(req as never, res as never)
  } catch (error) {
    console.error('[Koru API] Gateway invocation failed', error)
    if (!res.headersSent) {
      return res.status(500).json({ error: 'API gateway initialization failed' })
    }
    res.end()
  }
}