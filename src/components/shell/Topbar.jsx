import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { useSession } from '../../hooks/useSession.js'
import { useTheme } from '../../hooks/useTheme.js'
import { Avatar, Chip, Kbd } from '../ui/primitives.jsx'
import { IconLogout, IconMenu, IconMoon, IconSearch, IconSun } from '../ui/Icons.jsx'
import { CommandPalette } from './CommandPalette.jsx'
import { NotificationCenter } from './NotificationCenter.jsx'

export function Topbar({
  bereich,
  badge,
  kopf,
  onMenu,
  ziele = [],
  zeigeBenachrichtigungen = true,
  kundenBereich = null,
  aufgabenZiel,
  benachrichtigungsZiel,
}) {
  const { theme, toggleTheme } = useTheme()
  const { session, abmelden } = useSession()
  const [sucheOffen, setSucheOffen] = useState(false)
  const [menuOffen, setMenuOffen] = useState(false)
  const menuRef = useRef(null)

  // Globale Tastenkombination für die Suche
  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSucheOffen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!menuOffen) return undefined
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOffen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menuOffen])

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
        <div className="flex h-14 items-center gap-2 px-4 sm:px-6 xl:px-8">
          <button
            type="button"
            onClick={onMenu}
            aria-label="Menü öffnen"
            className="-ml-1.5 inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-muted md:hidden"
          >
            <IconMenu className="size-5" />
          </button>

          <div className="min-w-0 flex-1">
            {kopf ?? (
              <p className="truncate text-sm font-semibold text-ink">{bereich}</p>
            )}
          </div>

          {badge ? (
            <span className="hidden sm:inline">
              <Chip toneName={badge.tone ?? 'warn'} size="sm">
                {badge.label}
              </Chip>
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => setSucheOffen(true)}
            className="hidden items-center gap-2 rounded-lg border border-line bg-surface-muted px-2.5 py-1.5 text-xs text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 lg:inline-flex"
          >
            <IconSearch className="size-3.5" />
            Suchen
            <Kbd>⌘K</Kbd>
          </button>
          <button
            type="button"
            onClick={() => setSucheOffen(true)}
            aria-label="Suchen"
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-muted hover:text-ink lg:hidden"
          >
            <IconSearch className="size-[1.125rem]" />
          </button>

          {zeigeBenachrichtigungen ? (
            <NotificationCenter
              nurKunde={kundenBereich}
              zielFuer={
                benachrichtigungsZiel ?? ((n) => `/intern/kunden/${n.kundeId}`)
              }
            />
          ) : null}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
            aria-pressed={theme === 'dark'}
            className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
          >
            {theme === 'dark' ? <IconSun className="size-[1.125rem]" /> : <IconMoon className="size-[1.125rem]" />}
          </button>

          {session ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOffen((o) => !o)}
                aria-expanded={menuOffen}
                aria-label="Konto"
                className="ml-0.5 inline-flex items-center gap-2 rounded-lg p-0.5 hover:bg-surface-muted"
              >
                <Avatar name={session.name} size="sm" />
              </button>

              {menuOffen ? (
                <div className="absolute right-0 z-70 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-surface shadow-lg animate-rise">
                  <div className="border-b border-line px-3.5 py-3">
                    <p className="truncate text-[0.8125rem] font-semibold text-ink">{session.name}</p>
                    <p className="truncate text-xs text-ink-3">{session.email}</p>
                    <p className="mt-1.5 text-[0.6875rem] text-ink-3">
                      Rolle: {session.rolle === 'kunde' ? 'Kunde' : 'Mitarbeiter'} · Demo-Zugang
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOffen(false)
                      abmelden()
                      // Bewusst ein vollständiger Seitenwechsel statt einer
                      // Client-Navigation: beim Abmelden bleibt so garantiert
                      // nichts aus der Sitzung im Speicher zurück, und der
                      // Zugriffsschutz der Portalroute kann nicht noch einmal
                      // rendern und auf den Login umleiten.
                      window.location.assign('/')
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[0.8125rem] text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink"
                  >
                    <IconLogout className="size-4" />
                    Abmelden
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </header>

      <CommandPalette
        offen={sucheOffen}
        onClose={() => setSucheOffen(false)}
        ziele={ziele}
        kundenBereich={kundenBereich}
        aufgabenZiel={aufgabenZiel}
      />
    </>
  )
}

/** Kopfzeile mit Pfad (Breadcrumb) für Detailseiten. */
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Pfad" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
        {items.map((item, i) => (
          <li key={item.label} className={cn('flex min-w-0 items-center gap-1.5', i > 0 && 'hidden sm:flex')}>
            {i > 0 ? (
              <span aria-hidden="true" className="text-ink-3">
                /
              </span>
            ) : null}
            {item.to && i < items.length - 1 ? (
              <a href={item.to} className="truncate text-ink-3 hover:text-ink">
                {item.label}
              </a>
            ) : (
              <span className={cn('truncate', i === items.length - 1 ? 'font-semibold text-ink' : 'text-ink-3')}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
