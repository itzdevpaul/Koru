import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'
import { FieldPath, getFirestore } from 'firebase-admin/firestore'
import { getAuthenticatedUser, sendApiError } from './_lib/auth'
import { getAdminApp } from './_lib/admin'
import { handleOptions, methodNotAllowed, setCors } from './_lib/http'

const MOOD_SCORES: Record<string, number> = { rough: 1, low: 2, okay: 3, good: 4, thriving: 5 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(req, res, 'POST,OPTIONS')
  if (handleOptions(req, res)) return
  if (req.method !== 'POST') { methodNotAllowed(res, 'POST,OPTIONS'); return }

  try {
    const decoded = await getAuthenticatedUser(req)
    if (!decoded.email) { res.status(400).json({ error: 'Authenticated email is required' }); return }
    const { to, name } = (req.body ?? {}) as { to?: string; name?: string }
    if (!to || !name || to.toLowerCase() !== decoded.email.toLowerCase()) {
      res.status(403).json({ error: 'Email ownership could not be verified' }); return
    }
    const key = process.env.RESEND_API_KEY?.trim()
    if (!key) { res.status(500).json({ error: 'RESEND_API_KEY not configured' }); return }

    const endDate = new Date().toISOString().split('T')[0]
    const start = new Date()
    start.setDate(start.getDate() - 7)
    const startDate = start.toISOString().split('T')[0]
    const firestore = getFirestore(getAdminApp())
    const [checkInSnap, profileSnap] = await Promise.all([
      firestore.collection(`users/${decoded.uid}/checkins`)
        .where(FieldPath.documentId(), '>=', startDate)
        .where(FieldPath.documentId(), '<=', endDate)
        .get(),
      firestore.doc(`users/${decoded.uid}/profile/main`).get(),
    ])
    const checkIns = checkInSnap.docs.map(doc => doc.data() as { mood?: string; energy?: number })
    const count = checkIns.length
    const avgMood = count ? checkIns.reduce((sum, item) => sum + (MOOD_SCORES[item.mood ?? 'okay'] ?? 3), 0) / count : 0
    const avgEnergy = count ? checkIns.reduce((sum, item) => sum + Number(item.energy ?? 0), 0) / count : 0
    const streak = Number(profileSnap.data()?.streak ?? 0)

    await new Resend(key).emails.send({
      from: 'Koru <hello@koru.com.ng>',
      to,
      subject: '📊 Your Koru weekly wrap-up',
      html: buildEmail(name, { count, streak, avgMood: Math.round(avgMood * 10) / 10, avgEnergy: Math.round(avgEnergy * 10) / 10 }),
    })
    res.json({ ok: true })
  } catch (err) {
    sendApiError(res, err)
  }
}

function buildEmail(name: string, stats: { count: number; streak: number; avgMood: number; avgEnergy: number }): string {
  const appUrl = process.env.APP_URL?.trim().replace(/\/$/, '') || 'https://koru.com.ng'
  return `<!doctype html><html><body style="margin:0;padding:40px 20px;background:#FBF9F5;font-family:Arial,sans-serif;color:#1B3B2B">
  <main style="max-width:520px;margin:auto;background:#fff;border:1px solid #dce9de;border-radius:20px;padding:32px">
  <p style="color:#7a9a86;font-size:12px;text-transform:uppercase;letter-spacing:1px">Weekly wrap-up</p>
  <h1>Hey ${escapeHtml(name)} 👋</h1>
  <p>Here is a small look back at your week in Koru.</p>
  <p><strong>${stats.count}</strong> check-ins · <strong>${stats.streak}</strong> day streak · average mood <strong>${stats.avgMood}</strong>/5 · average energy <strong>${stats.avgEnergy}</strong>/5</p>
  <a href="${appUrl}/home" style="display:inline-block;padding:14px 24px;background:#1B3B2B;color:#fff;text-decoration:none;border-radius:12px">Open Koru →</a>
  </main></body></html>`
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char))
}
