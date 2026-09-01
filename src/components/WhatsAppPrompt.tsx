import { useEffect, useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getUserProfile, saveWhatsAppContact } from '../firebase'
import { normalizeWhatsAppNumber } from '../utils/sanitize'

const F = "'Plus Jakarta Sans', sans-serif"
const I = "'Inter', sans-serif"

export default function WhatsAppPrompt() {
  const { user } = useAuth()
  const { c } = useTheme()
  const { pathname } = useLocation()
  const [checking, setChecking] = useState(false)
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [consent, setConsent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setOpen(false)
    setPhone('')
    setConsent(false)
    setError('')

    if (!user) return

    setChecking(true)
    getUserProfile(user.uid)
      .then(profile => {
        if (!cancelled && !profile?.whatsappNumber) setOpen(true)
      })
      .catch(() => {
        // Do not block the app if profile lookup is temporarily unavailable.
      })
      .finally(() => {
        if (!cancelled) setChecking(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    const normalized = normalizeWhatsAppNumber(phone)
    if (!normalized) {
      setError('Enter a valid number, such as +234 801 234 5678.')
      return
    }
    if (!consent) {
      setError('Please confirm that you want to receive WhatsApp messages from Koru.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await saveWhatsAppContact(user.uid, normalized)
      setOpen(false)
    } catch {
      setError('We could not save your number. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user || pathname === '/admin' || checking || !open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-prompt-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(14,22,18,0.48)', backdropFilter: 'blur(5px)' }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8"
        style={{ background: c.card, border: `1px solid ${c.cardBorder}`, boxShadow: '0 20px 70px rgba(27,59,43,0.2)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl mb-3" aria-hidden="true">💬</p>
            <h2 id="whatsapp-prompt-title" className="text-xl font-bold" style={{ fontFamily: F, color: c.forest }}>
              Stay connected with Koru
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Not now"
            className="w-9 h-9 rounded-full text-lg transition-opacity hover:opacity-60"
            style={{ background: c.surface, color: c.muted }}
          >
            ×
          </button>
        </div>

        <p className="mt-3 text-sm leading-relaxed" style={{ fontFamily: I, color: c.body }}>
          Share your WhatsApp number if you would like occasional prompts, updates, and helpful reflections from Koru.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="whatsapp-number" className="block text-xs font-semibold mb-2" style={{ fontFamily: I, color: c.body }}>
            WhatsApp number
          </label>
          <input
            id="whatsapp-number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={event => setPhone(event.target.value)}
            placeholder="+234 801 234 5678"
            className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none"
            style={{ fontFamily: I, background: c.input, border: `1.5px solid ${c.inputBorder}`, color: c.inputText }}
          />
          <p className="mt-2 text-xs" style={{ fontFamily: I, color: c.muted }}>
            Include your country code. Nigerian numbers beginning with 0 are supported.
          </p>

          <label className="flex items-start gap-3 mt-5 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={event => setConsent(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1B3B2B]"
            />
            <span className="text-xs leading-relaxed" style={{ fontFamily: I, color: c.body }}>
              I agree to receive WhatsApp messages from Koru. I understand I can stop them at any time by replying STOP.
            </span>
          </label>

          {error && (
            <p className="mt-4 text-xs" role="alert" style={{ fontFamily: I, color: '#E07A5F' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ fontFamily: F, background: c.surface, color: c.forest }}
            >
              Not now
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-2xl py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ fontFamily: F, background: '#1B3B2B', color: '#fff' }}
            >
              {saving ? 'Saving…' : 'Save number'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}