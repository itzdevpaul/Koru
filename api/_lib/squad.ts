const BASE_PRICE_KOBO = 250000
const UNLOCK_PRICE_KOBO = 100000
const INTRO_PRICE_KOBO = 100000

export const PRICING = {
  baseAmount: BASE_PRICE_KOBO,
  unlockAmount: UNLOCK_PRICE_KOBO,
  introAmount: INTRO_PRICE_KOBO,
}

export function squadBase(): string {
  return process.env.SQUAD_ENV === 'prod'
    ? 'https://api-d.squadco.com'
    : 'https://sandbox-api-d.squadco.com'
}

export function getSquadSecret(): string {
  const key = process.env.SQUAD_SECRET_KEY?.trim()
  if (!key) throw new Error('SQUAD_SECRET_KEY is not configured')
  return key
}

export async function initiateSquadTransaction(input: {
  email: string
  amount: number
  reference: string
  callbackUrl: string
}): Promise<{ checkoutUrl: string; reference: string }> {
  const key = getSquadSecret()
  const response = await fetch(`${squadBase()}/transaction/initiate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: 'NGN',
      initiate_type: 'inline',
      transaction_ref: input.reference,
      callback_url: input.callbackUrl,
      pass_charge: false,
    }),
  })

  const data = await response.json() as {
    success?: boolean
    status?: number
    message?: string
    data?: { checkout_url?: string }
  }
  const ok = data.success === true || data.status === 200
  if (!ok) {
    console.error('[Koru] Squad initiate failed:', JSON.stringify({
      status: response.status,
      message: data.message,
    }))
    throw new Error(data.message ?? 'Could not create payment session')
  }

  const checkoutUrl = data.data?.checkout_url ??
    (process.env.SQUAD_ENV === 'prod'
      ? `https://pay.squadco.com/${input.reference}`
      : `https://sandbox-pay.squadco.com/${input.reference}`)
  return { checkoutUrl, reference: input.reference }
}

export async function verifySquadTransaction(reference: string): Promise<boolean> {
  const key = getSquadSecret()
  const response = await fetch(`${squadBase()}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  const data = await response.json() as {
    status?: number
    data?: { transaction_status?: string }
  }
  return data.status === 200 &&
    (data.data?.transaction_status === 'Success' || data.data?.transaction_status === 'success')
}

export function safeCallbackOrigin(origin: unknown): string {
  const candidate = typeof origin === 'string' ? origin.replace(/\/$/, '') : ''
  if (candidate === 'https://koru.com.ng' || candidate === 'https://www.koru.com.ng') {
    return candidate
  }
  if (/^https:\/\/[\w-]+(\.[\w-]+)*\.vercel\.app$/.test(candidate)) return candidate
  if (/^https:\/\/[\w-]+(\.[\w-]+)*\.replit\.dev$/.test(candidate)) return candidate
  return (process.env.APP_URL?.trim().replace(/\/$/, '') || 'https://koru.com.ng')
}
