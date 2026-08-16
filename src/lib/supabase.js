const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const STORAGE_KEY = 'symmedis.supabase.session'

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY)

function headers(accessToken) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function request(path, options = {}) {
  if (!supabaseEnabled) throw new Error('Supabase ist nicht konfiguriert.')

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: { ...headers(options.accessToken), ...options.headers },
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.msg || payload?.message || payload?.error_description || payload?.error || 'Anfrage fehlgeschlagen.'
    throw new Error(message)
  }
  return payload
}

export function readStoredAuthSession() {
  if (!supabaseEnabled || typeof window === 'undefined') return null
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

function storeAuthSession(session) {
  if (typeof window === 'undefined') return
  if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  else window.localStorage.removeItem(STORAGE_KEY)
}

export async function signInWithPassword(email, password) {
  const payload = await request('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeAuthSession(payload)
  return payload
}

export async function refreshAuthSession(refreshToken) {
  const payload = await request('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  storeAuthSession(payload)
  return payload
}

export async function signOut(accessToken) {
  if (supabaseEnabled && accessToken) {
    await request('/auth/v1/logout', { method: 'POST', accessToken }).catch(() => null)
  }
  storeAuthSession(null)
}

export async function fetchMyProfile(accessToken) {
  const rows = await request('/rest/v1/profiles?select=id,email,full_name,role,organization_id,client_id&limit=1', {
    method: 'GET',
    accessToken,
    headers: { Prefer: 'return=representation' },
  })
  return rows?.[0] ?? null
}

export function clearStoredAuthSession() {
  storeAuthSession(null)
}
