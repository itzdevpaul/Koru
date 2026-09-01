import type { VercelRequest, VercelResponse } from '@vercel/node'

type ExpressHandler = (req: VercelRequest, res: VercelResponse) => unknown

let appPromise: Promise<ExpressHandler> | undefined

function loadApp(): Promise<ExpressHandler> {
  appPromise ??= import('../server/index')
    .then(({ app }) => app as unknown as ExpressHandler)
  return appPromise
}

// Keep the Vercel entrypoint explicit. Lazy-loading prevents a module
// initialization failure from turning every API response into Vercel's HTML
// FUNCTION_INVOCATION_FAILED page, and avoids initializing the API until it is
// actually called.
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const app = await loadApp()
    await app(req, res)
  } catch (error) {
    console.error('[Koru] Vercel API bootstrap failed:', error instanceof Error ? error.message : error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'API initialization failed' })
    }
  }
}