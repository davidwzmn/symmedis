import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from '../../context/ToastContext.js'
import { IconAlert, IconCheck, IconClose } from './Icons.jsx'

const AUTO_DISMISS_MS = 6000

const STYLES = {
  success:
    'border-marine-200 bg-white text-marine-950 dark:border-marine-500/40 dark:bg-night-800 dark:text-night-100',
  error:
    'border-[#b4462f]/35 bg-white text-marine-950 dark:border-[#e08a72]/40 dark:bg-night-800 dark:text-night-100',
  info: 'border-shell-200 bg-white text-marine-950 dark:border-night-600 dark:bg-night-800 dark:text-night-100',
}

const ICON_STYLES = {
  success: 'text-marine-600 dark:text-marine-300',
  error: 'text-[#b4462f] dark:text-[#e08a72]',
  info: 'text-brass-600 dark:text-brass-300',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const show = useCallback(
    ({ title, description = '', variant = 'info' }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setToasts((current) => [...current.slice(-2), { id, title, description, variant }])
      const timer = setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
      timers.current.set(id, timer)
      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const registry = timers.current
    return () => {
      registry.forEach((timer) => clearTimeout(timer))
      registry.clear()
    }
  }, [])

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-sm border px-4 py-3 shadow-lg animate-fade-up ${STYLES[toast.variant] ?? STYLES.info}`}
          >
            <span className={`mt-0.5 shrink-0 ${ICON_STYLES[toast.variant] ?? ICON_STYLES.info}`}>
              {toast.variant === 'error' ? (
                <IconAlert className="size-4.5" />
              ) : (
                <IconCheck className="size-4.5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description ? (
                <p className="mt-0.5 text-[0.8125rem] leading-relaxed prose-muted">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Meldung schließen"
              className="-mt-0.5 -mr-1 shrink-0 rounded-xs p-1 text-shell-500 transition-colors hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100"
            >
              <IconClose className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
