import type { VercelRequest, VercelResponse } from '@vercel/node'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function squadBase() {
  return process.env.SQUAD_ENV === 'prod'
    ? 'https://api-d.squadco.com'
    : 'https://sandbox-api-d.squadco.com'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  try {
    const { ref } = req.body as { ref: string }
    if (!ref) { res.status(400).json({ error: 'ref required' }); return }

    const key = process.env.SQUAD_SECRET_KEY
    if (!key) { res.status(500).json({ error: 'SQUAD_SECRET_KEY not configured' }); return }

    const response = await fetch(`${squadBase()}/transaction/verify/${ref}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    const data = await response.json()

    const verified =
      data?.status === 200 &&
      (data?.data?.transaction_status === 'Success' || data?.data?.transaction_status === 'success')

    res.json({ verified, raw: data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/subscribe/verify error:', msg)
    res.status(500).json({ error: msg })
  }
}
