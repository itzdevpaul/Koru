import type { VercelRequest, VercelResponse } from '@vercel/node'
import { app } from '../server/index'

// Import the Express app statically so Vercel's Node builder bundles the
// complete server into this single function. Dynamic imports of TypeScript
// source files can be left unresolved in the deployed function bundle.
export default function handler(req: VercelRequest, res: VercelResponse): unknown {
  return app(req as never, res as never)
}
