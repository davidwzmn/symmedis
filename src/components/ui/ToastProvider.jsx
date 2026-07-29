import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ToastContext } from '../../context/ToastContext.js'
import { cn } from '../../lib/cn.js'
import { tone } from '../../lib/tone.js'
import { IconAlert, IconCheckCircle, IconClose, IconInfo } from './Icons.jsx'

const AUTO_DISMISS_MS = 6000

/** Variante → Ton und Icon. Die Farbe ist nie alleiniger Träger der Aussage. */
const VARIANTEN = {
  success: { toneName: 'ok', icon: IconCheckCircle },
  error: { toneName: 'danger', icon: IconAlert },
  info: { toneName: 'info', icon: IconInfo },
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
        className="pointer-events-none fixed inset-x-3 bottom-20 z-100 flex flex-col items-center gap-2 md:bottom-5 sm:inset-x-auto sm:right-5 sm:items-end"
      >
        {toasts.map((toast) => {
          const variante = VARIANTEN[toast.variant] ?? VARIANTEN.info
          const Icon = variante.icon
          return (
            <div
              key={toast.id}
              role="status"
              className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card border border-line bg-surface px-4 py-3 shadow-lg animate-rise"
            >
              <span className={cn('mt-0.5 shrink-0', tone(variante.toneName).text)}>
                <Icon className="size-4.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-semibold text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-2">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Meldung schließen"
                className="-mt-0.5 -mr-1 shrink-0 rounded-md p-1 text-ink-3 transition-colors hover:bg-surface-muted hover:text-ink"
              >
                <IconClose className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
