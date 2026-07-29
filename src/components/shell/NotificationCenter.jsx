import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { formatRelative } from '../../lib/format.js'
import { tone } from '../../lib/tone.js'
import { IconBell, IconCheck } from '../ui/Icons.jsx'
import { EmptyState } from '../ui/layout.jsx'

/**
 * Globales Benachrichtigungszentrum – abgeleitet aus dem Projektzustand.
 *
 * `nurKunde` begrenzt die Liste auf einen Mandanten: im Kundenportal darf
 * kein Hinweis zu einem anderen Kunden erscheinen.
 */
export function NotificationCenter({ zielFuer, nurKunde = null }) {
  const { benachrichtigungen, markiereGelesen } = useWorkspace()
  const [offen, setOffen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const sichtbar = nurKunde
    ? benachrichtigungen.filter((n) => n.kundeId === nurKunde)
    : benachrichtigungen
  const ungelesen = sichtbar.filter((n) => !n.gelesen)

  useEffect(() => {
    if (!offen) return undefined
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOffen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOffen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [offen])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOffen((o) => !o)}
        aria-expanded={offen}
        aria-label={`Benachrichtigungen${ungelesen.length ? `, ${ungelesen.length} ungelesen` : ''}`}
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
      >
        <IconBell className="size-[1.125rem]" />
        {ungelesen.length > 0 ? (
          <span className="absolute top-1.5 right-1.5 flex size-2 rounded-full bg-urgent ring-2 ring-surface" />
        ) : null}
      </button>

      {offen ? (
        <div className="absolute right-0 z-70 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-lg animate-rise">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-[0.8125rem] font-semibold text-ink">Benachrichtigungen</p>
            <span className="text-xs text-ink-3">{ungelesen.length} ungelesen</span>
          </div>

          <div className="scroll-area max-h-[22rem] overflow-y-auto">
            {sichtbar.length === 0 ? (
              <EmptyState
                compact
                icon={IconCheck}
                title="Alles erledigt"
                description="Es liegen keine offenen Hinweise vor."
              />
            ) : (
              <ul className="divide-y divide-line">
                {sichtbar.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => {
                        markiereGelesen(n.id)
                        setOffen(false)
                        navigate(zielFuer(n))
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted',
                        !n.gelesen && 'bg-brand-softer',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn('mt-1.5 size-2 shrink-0 rounded-full', tone(n.tone).dot)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[0.8125rem] font-medium text-ink">{n.titel}</span>
                        <span className="mt-0.5 block truncate text-xs text-ink-2">{n.text}</span>
                        <span className="mt-0.5 block text-[0.6875rem] text-ink-3">
                          {formatRelative(n.zeit)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
