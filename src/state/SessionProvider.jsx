import { useCallback, useEffect, useMemo, useState } from 'react'
import { SessionContext } from './SessionContext.js'
import {
  clearStoredAuthSession,
  fetchMyProfile,
  readStoredAuthSession,
  refreshAuthSession,
  signInWithPassword,
  signOut,
  supabaseEnabled,
} from '../lib/supabase.js'

const SESSION_STORAGE_KEY = 'symmedis.supabase.session'
const REFRESH_SAFETY_WINDOW_MS = 90 * 1000
const MIN_REFRESH_DELAY_MS = 15 * 1000

const demoSession = ({ rolle, email }) => ({
  rolle,
  email,
  name: rolle === 'kunde' ? 'Dr. Katrin Ahlers' : 'M. Reinhardt',
  userId: null,
  kundeId: rolle === 'kunde' ? 'nordvita' : null,
  organisationId: rolle === 'kunde' ? 'nordvita-demo' : 'symmedis-demo',
  seit: new Date().toISOString(),
  demo: true,
})

function mapProfile(profile, authUser) {
  if (!profile) {
    throw new Error('Für diesen Zugang ist noch kein SYMMEDIS-Profil freigeschaltet.')
  }

  const rolle = profile.role === 'kunde' ? 'kunde' : 'intern'
  return {
    rolle,
    email: profile.email || authUser?.email || '',
    name: profile.full_name || authUser?.email?.split('@')[0] || 'SYMMEDIS Nutzer',
    userId: profile.id || authUser?.id || null,
    kundeId: profile.client_id || null,
    organisationId: profile.organization_id,
    seit: new Date().toISOString(),
    demo: false,
  }
}

function refreshDelay(authSession) {
  const expiresAtMs = Number(authSession?.expires_at || 0) * 1000
  if (expiresAtMs > 0) {
    return Math.max(MIN_REFRESH_DELAY_MS, expiresAtMs - Date.now() - REFRESH_SAFETY_WINDOW_MS)
  }
  const expiresInMs = Number(authSession?.expires_in || 3600) * 1000
  return Math.max(MIN_REFRESH_DELAY_MS, expiresInMs - REFRESH_SAFETY_WINDOW_MS)
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authSession, setAuthSession] = useState(() => readStoredAuthSession())
  const [authBereit, setAuthBereit] = useState(!supabaseEnabled)

  const applyAuthSession = useCallback(async (nextAuth) => {
    const profile = await fetchMyProfile(nextAuth.access_token, nextAuth.user?.id || null)
    const next = mapProfile(profile, nextAuth.user)
    setAuthSession(nextAuth)
    setSession(next)
    return next
  }, [])

  const clearSession = useCallback(() => {
    clearStoredAuthSession()
    setAuthSession(null)
    setSession(null)
  }, [])

  useEffect(() => {
    if (!supabaseEnabled) return undefined

    let aktiv = true

    async function restore() {
      const gespeichert = readStoredAuthSession()
      if (!gespeichert?.refresh_token) {
        if (aktiv) setAuthBereit(true)
        return
      }

      try {
        const erneuert = await refreshAuthSession(gespeichert.refresh_token)
        if (aktiv) await applyAuthSession(erneuert)
      } catch {
        if (aktiv) clearSession()
      } finally {
        if (aktiv) setAuthBereit(true)
      }
    }

    restore()
    return () => {
      aktiv = false
    }
  }, [applyAuthSession, clearSession])

  useEffect(() => {
    if (!supabaseEnabled || !authSession?.refresh_token || !session) return undefined

    let aktiv = true
    const timer = window.setTimeout(async () => {
      try {
        const erneuert = await refreshAuthSession(authSession.refresh_token)
        if (aktiv) await applyAuthSession(erneuert)
      } catch {
        if (aktiv) clearSession()
      }
    }, refreshDelay(authSession))

    return () => {
      aktiv = false
      window.clearTimeout(timer)
    }
  }, [authSession, session, applyAuthSession, clearSession])

  useEffect(() => {
    if (!supabaseEnabled) return undefined

    const onStorage = async (event) => {
      if (event.key !== SESSION_STORAGE_KEY) return
      if (!event.newValue) {
        setAuthSession(null)
        setSession(null)
        return
      }

      try {
        const nextAuth = JSON.parse(event.newValue)
        if (!nextAuth?.access_token) return
        await applyAuthSession(nextAuth)
      } catch {
        clearSession()
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [applyAuthSession, clearSession])

  const anmelden = useCallback(async ({ rolle, email, passwort }) => {
    if (!supabaseEnabled) {
      const next = demoSession({ rolle, email })
      setSession(next)
      return next
    }

    const nextAuth = await signInWithPassword(email, passwort)

    try {
      const next = await applyAuthSession(nextAuth)

      if (next.rolle !== rolle && nextAuth.user && next.rolle !== 'intern') {
        throw new Error(
          rolle === 'kunde'
            ? 'Dieser Zugang gehört nicht zum Kundenportal.'
            : 'Dieser Zugang gehört nicht zum Mitarbeiterportal.',
        )
      }

      return next
    } catch (error) {
      await signOut(nextAuth.access_token)
      clearSession()
      throw error
    }
  }, [applyAuthSession, clearSession])

  const abmelden = useCallback(async () => {
    await signOut(authSession?.access_token)
    clearSession()
  }, [authSession, clearSession])

  const value = useMemo(
    () => ({
      session,
      anmelden,
      abmelden,
      authBereit,
      echteAuthentifizierung: supabaseEnabled,
      accessToken: authSession?.access_token || null,
    }),
    [session, anmelden, abmelden, authBereit, authSession],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
