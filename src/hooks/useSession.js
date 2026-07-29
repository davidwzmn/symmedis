import { useContext } from 'react'
import { SessionContext } from '../state/SessionContext.js'

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error('useSession benötigt <SessionProvider>.')
  return context
}
