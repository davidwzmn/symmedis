import { useCallback, useMemo, useState } from 'react'
import { SessionContext } from './SessionContext.js'

/**
 * Demo-Anmeldung. Bewusst ohne echte Authentifizierung und ohne Persistenz –
 * die Sitzung lebt nur im React-State und ist überall als Demo gekennzeichnet.
 */
export function SessionProvider({ children }) {
  const [session, setSession] = useState(null)

  const anmelden = useCallback(({ rolle, email }) => {
    setSession({
      rolle,
      email,
      name: rolle === 'kunde' ? 'Dr. Katrin Ahlers' : 'M. Reinhardt',
      kundeId: rolle === 'kunde' ? 'nordvita' : null,
      seit: new Date().toISOString(),
    })
  }, [])

  const abmelden = useCallback(() => setSession(null), [])

  const value = useMemo(() => ({ session, anmelden, abmelden }), [session, anmelden, abmelden])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
