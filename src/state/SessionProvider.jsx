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

const demoSession = ({ rolle, email }) => ({
  rolle,
  email,
  name: rolle === 'kunde' ? 'Dr. Katrin Ahlers' : 'M. Reinhardt',
  kundeId: rolle === 'kunde' ? 'nordvita' : null,
  organisationId: rolle === 'kunde' ? 'nordvita-demo' : 'symmedis-demo',
  seit: new Date().toISOString(),
  demo: true,
})

function mapProfile(profile, authUser) {
  const rolle = profile?.role === 'kunde' ? 'kunde' : 'intern'
  return {
    rolle,
    email: profile?.email || authUser?.email || '',
    name: profile?.full_name || authUser?.email?.split('@')[0] || 'SYMMEDIS Nutzer',
    kundeId: profile?.client_id || null,
    organisationId: profile?.organization_id || null,
    seit: new Date().toISOString(),
    demo: false,
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)
  const [authSession, setAuthSession] = useState(() => readStoredAuthSession())
  const [authBereit, setAuthBereit] = useState(!supabaseEnabled)

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
        const profile = await fetchMyProfile(erneuert.access_token)
        if (aktiv) {
          setAuthSession(erneuert)
          setSession(mapProfile(profile, erneuert.user))
        }
      } catch {
        clearStoredAuthSession()
        if (aktiv) {
          setAuthSession(null)
          setSession(null)
        }
      } finally {
        if (aktiv) setAuthBereit(true)
      }
    }

    restore()
    return () => {
      aktiv = false
    }
  }, [])

  const anmelden = useCallback(async ({ rolle, email, passwort }) => {
    if (!supabaseEnabled) {
      const next = demoSession({ rolle, email })
      setSession(next)
      return next
    }

    const nextAuth = await signInWithPassword(email, passwort)
    const profile = await fetchMyProfile(nextAuth.access_token)
    const next = mapProfile(profile, nextAuth.user)

    if (next.rolle !== rolle && profile?.role !== 'admin') {
      await signOut(nextAuth.access_token)
      throw new Error(
        rolle === 'kunde'
          ? 'Dieser Zugang gehört nicht zum Kundenportal.'
          : 'Dieser Zugang gehört nicht zum Mitarbeiterportal.',
      )
    }

    setAuthSession(nextAuth)
    setSession(next)
    return next
  }, [])

  const abmelden = useCallback(async () => {
    await signOut(authSession?.access_token)
    setAuthSession(null)
    setSession(null)
  }, [authSession])

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
