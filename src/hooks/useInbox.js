import { useContext } from 'react'
import { InboxContext } from '../context/InboxContext.js'

export function useInbox() {
  const context = useContext(InboxContext)
  if (!context) {
    throw new Error('useInbox muss innerhalb von <InboxProvider> verwendet werden.')
  }
  return context
}
