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
    const { uid, email, origin } = req.body as { uid: string; email: string; origin?: string }
    if (!uid || !email) { res.status(400).json({ error: 'uid and email required' }); return }

    const key = process.env.SQUAD_SECRET_KEY
    if (!key) { res.status(500).json({ error: 'SQUAD_SECRET_KEY not configured' }); return }

    const ref = `koru_sub_${uid}_${Date.now()}`

    // Build callback URL — trust origin only for known safe patterns
    const safeOrigin =
      origin &&
      (origin === 'https://koru.com.ng' || /^https:\/\/[\w-]+(\.[\w-]+)*\.vercel\.app$/.test(origin) || /^https:\/\/[\w-]+(\.[\w-]+)*\.replit\.dev$/.test(origin))
        ? origin
        : (process.env.APP_URL ?? 'https://koru.com.ng')
    const callbackUrl = `${safeOrigin}/payment/return`

    const squadRes = await fetch(`${squadBase()}/transaction/initiate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: 250000, // ₦2,500 in kobo
        currency: 'NGN',
        initiate_type: 'inline',
        transaction_ref: ref,
        callback_url: callbackUrl,
        pass_charge: false,
      }),
    })

    const data = await squadRes.json()

    const isProd = process.env.SQUAD_ENV === 'prod'
    const checkoutUrl: string =
      data?.data?.checkout_url ??
      (isProd ? `https://pay.squadco.com/${ref}` : `https://sandbox-pay.squadco.com/${ref}`)

    // Squad sandbox returns { success: true }, prod returns { status: 200 }
    const ok = data?.success === true || data?.status === 200
    if (!ok) {
      console.error('[Koru] Squad initiate failed:', JSON.stringify(data))
      res.status(502).json({ error: data?.message ?? 'Could not create payment session' })
      return
    }

    res.json({ checkout_url: checkoutUrl, ref })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] /api/subscribe/initiate error:', msg)
    res.status(500).json({ error: msg })
  }
}
