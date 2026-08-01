import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res)
  if (req.method === 'OPTIONS') { res.status(200).end(); return }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return }

  try {
    const { to, name, resultTitle } = req.body as { to: string; name: string; resultTitle?: string }
    if (!to || !name) { res.status(400).json({ error: 'to and name are required' }); return }

    const key = process.env.RESEND_API_KEY
    if (!key) { res.status(500).json({ error: 'RESEND_API_KEY not configured' }); return }

    const resend = new Resend(key)
    const prompt = getReflectionPrompt(resultTitle)
    await resend.emails.send({
      from: 'Koru <hello@koru.com.ng>',
      to,
      subject: '🌿 Your weekly reflection prompt',
      html: buildReminderEmail(name, prompt),
    })
    res.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Koru] send-reminder error:', msg)
    res.status(500).json({ error: msg })
  }
}

function getReflectionPrompt(resultTitle?: string): string {
  const prompts = [
    'What is one thing you did this week that felt genuinely like you?',
    'What would you do differently if you knew you could not fail?',
    'Who made you feel most like yourself recently — and why?',
    'What have you been putting off that you actually want to do?',
    'What does "a good life" look like for you right now?',
    'What is something you believe that most people around you do not?',
    'When did you last feel fully present? What were you doing?',
    'What is one small thing you could do this week to invest in yourself?',
    'What part of your life feels most aligned with who you are becoming?',
    'If you stripped away what everyone expected of you, what would remain?',
  ]
  if (resultTitle) return `As ${resultTitle}, here's your prompt: ${prompts[Math.floor(Math.random() * prompts.length)]}`
  return prompts[Math.floor(Math.random() * prompts.length)]
}

function buildReminderEmail(name: string, prompt: string): string {
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
          <p style="margin:8px 0 0;font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;color:#1B3B2B;font-size:16px;letter-spacing:-0.3px">Koru</p>
        </td></tr>
        <tr><td style="background:#fff;border-radius:20px;padding:36px 32px;border:1px solid rgba(162,191,166,0.3)">
          <p style="margin:0 0 8px;color:#A2BFA6;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">Weekly Reflection</p>
          <h1 style="margin:0 0 16px;color:#1B3B2B;font-family:'Plus Jakarta Sans',sans-serif;font-size:22px;font-weight:700;line-height:1.3">Hey ${name} 👋</h1>
          <p style="margin:0 0 24px;color:#4a6a58;font-size:15px;line-height:1.6">Here's your reflection prompt for this week:</p>
          <blockquote style="margin:0 0 28px;padding:20px 24px;background:rgba(162,191,166,0.12);border-left:3px solid #A2BFA6;border-radius:0 12px 12px 0">
            <p style="margin:0;color:#1B3B2B;font-size:16px;font-weight:600;line-height:1.5;font-style:italic">${prompt}</p>
          </blockquote>
          <p style="margin:0 0 28px;color:#7a9a86;font-size:14px;line-height:1.6">Take a few minutes in your journal, on a walk, or just sitting quietly. There are no right answers — only honest ones.</p>
          <a href="${appUrl}/home" style="display:inline-block;padding:14px 28px;background:#1B3B2B;color:#fff;text-decoration:none;border-radius:14px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px">Open Koru →</a>
        </td></tr>
        <tr><td style="padding:24px 0;text-align:center">
          <p style="margin:0;color:#A2BFA6;font-size:12px">You're receiving this because you opted in to weekly prompts.</p>
          <p style="margin:4px 0 0;color:#A2BFA6;font-size:12px">Manage preferences in your <a href="${appUrl}/profile" style="color:#7a9a86">profile settings</a>.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
