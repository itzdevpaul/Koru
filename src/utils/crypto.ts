// Client-side encryption for sensitive free-text fields (reflections, intentions)
// Uses Web Crypto API (AES-GCM) with a key derived from the user's UID + app salt.
// This protects sensitive data at rest — a database breach alone cannot read it.

const APP_SALT = 'koru-encrypt-v1-9f3a7c2e1b8d'
const KEY_ALGO = 'AES-GCM'
const KEY_LENGTH = 256
const PBKDF2_ITERATIONS = 150_000

async function deriveKey(uid: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(`${uid}:${APP_SALT}`),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(APP_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: KEY_ALGO, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface EncryptedPayload {
  /** Base64-encoded ciphertext */
  c: string
  /** Base64-encoded IV */
  i: string
}

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

/** Encrypt a plaintext string for a given user. Returns null if crypto is unavailable. */
export async function encryptText(
  plaintext: string,
  uid: string,
): Promise<EncryptedPayload | null> {
  if (!plaintext || typeof crypto === 'undefined' || !crypto.subtle) return null
  try {
    const key = await deriveKey(uid)
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)
    const ciphertext = await crypto.subtle.encrypt(
      { name: KEY_ALGO, iv },
      key,
      encoded,
    )
    return { c: toBase64(ciphertext), i: toBase64(iv.buffer) }
  } catch {
    return null
  }
}

/** Decrypt an EncryptedPayload back to plaintext. Returns null on failure. */
export async function decryptText(
  payload: EncryptedPayload,
  uid: string,
): Promise<string | null> {
  if (!payload?.c || !payload?.i || typeof crypto === 'undefined' || !crypto.subtle) return null
  try {
    const key = await deriveKey(uid)
    const iv = fromBase64(payload.i)
    const ciphertext = fromBase64(payload.c)
    const decrypted = await crypto.subtle.decrypt(
      { name: KEY_ALGO, iv },
      key,
      ciphertext,
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}

/** Type guard: check if a value looks like an EncryptedPayload */
export function isEncrypted(value: unknown): value is EncryptedPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'c' in value &&
    'i' in value &&
    typeof (value as EncryptedPayload).c === 'string' &&
    typeof (value as EncryptedPayload).i === 'string'
  )
}
