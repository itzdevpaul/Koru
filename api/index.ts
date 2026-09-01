import { app } from '../server/index'

// Vercel's Node runtime passes its native request/response objects directly to
// an Express application. The rewrite keeps the original /api/... URL intact,
// so all existing Express routes remain available behind one function.
export default app