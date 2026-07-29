import { useContext } from 'react'
import { ToastContext } from '../context/ToastContext.js'

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast muss innerhalb von <ToastProvider> verwendet werden.')
  }
  return context
}
