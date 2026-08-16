const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '')
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

const STORAGE_KEY = 'symmedis.supabase.session'

export const supabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY)

function headers(accessToken, json = true) {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_KEY}`,
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

export async function supabaseRequest(path, options = {}) {
  if (!supabaseEnabled) throw new Error('Supabase ist nicht konfiguriert.')

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: { ...headers(options.accessToken, options.json !== false), ...options.headers },
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json().catch(() => null) : await response.blob().catch(() => null)
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
  const payload = await supabaseRequest('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  storeAuthSession(payload)
  return payload
}

export async function refreshAuthSession(refreshToken) {
  const payload = await supabaseRequest('/auth/v1/token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  storeAuthSession(payload)
  return payload
}

export async function signOut(accessToken) {
  if (supabaseEnabled && accessToken) {
    await supabaseRequest('/auth/v1/logout', { method: 'POST', accessToken }).catch(() => null)
  }
  storeAuthSession(null)
}

export async function fetchMyProfile(accessToken) {
  const rows = await supabaseRequest('/rest/v1/profiles?select=id,email,full_name,role,organization_id,client_id&limit=1', {
    method: 'GET',
    accessToken,
    headers: { Prefer: 'return=representation' },
  })
  return rows?.[0] ?? null
}

export async function restSelect(table, accessToken, query = '') {
  return supabaseRequest(`/rest/v1/${table}?${query}`, { method: 'GET', accessToken })
}

export async function restInsert(table, accessToken, row) {
  return supabaseRequest(`/rest/v1/${table}`, {
    method: 'POST',
    accessToken,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  })
}

export async function restUpdate(table, accessToken, filter, patch) {
  return supabaseRequest(`/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    accessToken,
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(patch),
  })
}

export async function restRpc(functionName, accessToken, args) {
  return supabaseRequest(`/rest/v1/rpc/${functionName}`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify(args),
  })
}

export async function uploadProjectFile(accessToken, path, file) {
  return supabaseRequest(`/storage/v1/object/project-files/${path}`, {
    method: 'POST',
    accessToken,
    json: false,
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    },
    body: file,
  })
}

export async function downloadProjectFile(accessToken, path) {
  return supabaseRequest(`/storage/v1/object/authenticated/project-files/${path}`, {
    method: 'GET',
    accessToken,
    json: false,
  })
}

export function clearStoredAuthSession() {
  storeAuthSession(null)
}
