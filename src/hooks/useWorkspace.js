import { useContext } from 'react'
import { WorkspaceContext } from '../state/WorkspaceContext.js'

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace benötigt <WorkspaceProvider>.')
  return context
}
