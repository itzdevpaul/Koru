import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { getAuthenticatedUser, sendApiError } from './_lib/auth'
import { handleOptions, methodNotAllowed, setCors } from './_lib/http'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)
    const { to, name } = req.body as { to: string; name: string }
    if (!to || !name || to.toLowerCase() !== decoded.email?.toLowerCase()) {
      res.status(403).json({ error: 'Email ownership could not be verified' }); return
    }

    const key = process.env.RESEND_API_KEY?.trim()
    if (!key) { res.status(500).json({ error: 'RESEND_API_KEY not configured' }); return }

    const resend = new Resend(key)
    await resend.emails.send({
      from: 'Koru <hello@koru.com.ng>',
      to,
      subject: `Hey ${name}, welcome to Koru 🌿`,
      html: buildWelcomeEmail(name),
    })
    res.json({ ok: true })
  } catch (err) {
    sendApiError(res, err)
  }
}

function buildWelcomeEmail(name: string): string {
  const appUrl = process.env.APP_URL ?? 'https://koru.com.ng'
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FBF9F5;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF9F5;padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="padding-bottom:32px;text-align:center">
          <div style="width:44px;height:44px;background:#1B3B2B;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;font-size:22px;line-height:44px">🌿</div>
          <p style="margin:8px 0 0;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;color:#1B3B2B;font-size:16px">Koru</p>
        </td></tr>
        <tr><td style="background:#fff;border-radius:20px;padding:36px 32px;border:1px solid rgba(162,191,166,0.3)">
           <h1 style="margin:0 0 12px;color:#1B3B2B;font-family:'Plus Jakarta Sans',sans-serif;font-size:24px;font-weight:700">Welcome, ${escapeHtml(name)} 🌱</h1>
          <p style="margin:0 0 20px;color:#4a6a58;font-size:15px;line-height:1.65">We're glad you're here. Koru is your private space to think clearly, understand yourself better, and navigate what comes next.</p>
          <p style="margin:0 0 28px;color:#4a6a58;font-size:15px;line-height:1.65">Start with a quiz — they take less than 5 minutes and the results might just surprise you.</p>
          <a href="${appUrl}/home" style="display:inline-block;padding:14px 28px;background:#1B3B2B;color:#fff;text-decoration:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px">Go to my dashboard →</a>
        </td></tr>
        <tr><td style="padding:24px 0;text-align:center">
          <p style="margin:0;color:#A2BFA6;font-size:12px">Questions? Reply to this email — we read every one.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char))
}
