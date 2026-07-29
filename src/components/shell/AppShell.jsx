import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { CountBadge } from '../ui/primitives.jsx'
import { IconClose, IconMenu } from '../ui/Icons.jsx'
import { Logo } from '../brand/Logo.jsx'
import { Topbar } from './Topbar.jsx'

/**
 * Anwendungsrahmen für alle eingeloggten Bereiche und die Demo.
 *
 * Desktop  – feste Sidebar (240 px)
 * Tablet   – Sidebar auf Icons reduziert (64 px)
 * Mobile   – Bottom-Navigation mit den fünf wichtigsten Zielen + Drawer für alles Weitere
 */
export function AppShell({
  nav,
  bereich,
  badge,
  kopf,
  children,
  footerSlot,
  zeigeBenachrichtigungen = true,
  kundenBereich = null,
  aufgabenZiel,
  benachrichtigungsZiel,
}) {
  const [drawerOffen, setDrawerOffen] = useState(false)

  useEffect(() => {
    if (!drawerOffen) return undefined
    const onKey = (e) => e.key === 'Escape' && setDrawerOffen(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOffen])

  const primaer = nav.slice(0, 4)
  const weitere = nav.slice(4)

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#hauptinhalt"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-brand"
      >
        Zum Inhalt springen
      </a>

      {/* ---------------------------------------------------------- Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface md:flex',
          'w-16 lg:w-60',
        )}
      >
        <div className="flex h-14 shrink-0 items-center border-b border-line px-3 lg:px-4">
          <Logo compact bereich={bereich} />
        </div>

        <nav aria-label="Hauptnavigation" className="scroll-area flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.id}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors',
                      'lg:justify-start justify-center',
                      isActive
                        ? 'bg-brand-soft text-brand-ink'
                        : 'text-ink-2 hover:bg-surface-muted hover:text-ink',
                    )
                  }
                >
                  <item.icon className="size-[1.125rem] shrink-0" />
                  <span className="hidden lg:inline lg:flex-1 lg:truncate">{item.label}</span>
                  {item.badge ? (
                    <span className="hidden lg:inline">
                      <CountBadge value={item.badge} toneName={item.badgeTone ?? 'brand'} />
                    </span>
                  ) : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {footerSlot ? (
          <div className="shrink-0 border-t border-line p-2 lg:p-3">{footerSlot}</div>
        ) : null}
      </aside>

      {/* ------------------------------------------------------------ Inhalt */}
      <div className="md:pl-16 lg:pl-60">
        <Topbar
          bereich={bereich}
          badge={badge}
          kopf={kopf}
          ziele={nav}
          zeigeBenachrichtigungen={zeigeBenachrichtigungen}
          kundenBereich={kundenBereich}
          aufgabenZiel={aufgabenZiel}
          benachrichtigungsZiel={benachrichtigungsZiel}
          onMenu={() => setDrawerOffen(true)}
        />

        <main id="hauptinhalt" className="px-4 pt-5 pb-24 sm:px-6 md:pb-10 xl:px-8">
          {children}
        </main>
      </div>

      {/* -------------------------------------------------- Mobile: Bottom-Nav */}
      <nav
        aria-label="Hauptnavigation (mobil)"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {primaer.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-medium transition-colors',
                    isActive ? 'text-brand-ink' : 'text-ink-3',
                  )
                }
              >
                <item.icon className="size-5" />
                <span className="max-w-full truncate px-1">{item.label}</span>
                {item.badge ? (
                  <span className="absolute top-1.5 right-[22%] size-1.5 rounded-full bg-urgent" />
                ) : null}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setDrawerOffen(true)}
              className="flex w-full flex-col items-center gap-1 py-2.5 text-[0.625rem] font-medium text-ink-3"
            >
              <IconMenu className="size-5" />
              Mehr
            </button>
          </li>
        </ul>
      </nav>

      {/* ----------------------------------------------------- Mobile: Drawer */}
      {drawerOffen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setDrawerOffen(false)}
            className="absolute inset-0 cursor-default bg-[var(--c-overlay)] animate-fade-in"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-2xl border-t border-line bg-surface animate-rise">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Logo bereich={bereich} />
              <button
                type="button"
                onClick={() => setDrawerOffen(false)}
                aria-label="Menü schließen"
                className="rounded-lg p-2 text-ink-3 hover:bg-surface-muted hover:text-ink"
              >
                <IconClose className="size-5" />
              </button>
            </div>
            <nav aria-label="Alle Bereiche" className="scroll-area max-h-[65vh] overflow-y-auto p-3">
              <ul className="grid grid-cols-2 gap-2">
                {[...primaer, ...weitere].map((item) => (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={() => setDrawerOffen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg border px-3 py-3 text-[0.8125rem] font-medium',
                          isActive
                            ? 'border-brand-border bg-brand-soft text-brand-ink'
                            : 'border-line text-ink-2',
                        )
                      }
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.badge ? <CountBadge value={item.badge} toneName={item.badgeTone ?? 'brand'} /> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
              {footerSlot ? <div className="mt-3 border-t border-line pt-3">{footerSlot}</div> : null}
            </nav>
          </div>
        </div>
      ) : null}
    </div>
  )
}
