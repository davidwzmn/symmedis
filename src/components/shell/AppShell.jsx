import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { CountBadge } from '../ui/primitives.jsx'
import { IconClose, IconMenu } from '../ui/Icons.jsx'
import { Logo } from '../brand/Logo.jsx'
import { Topbar } from './Topbar.jsx'

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
  const menuButtonRef = useRef(null)
  const closeButtonRef = useRef(null)
  const drawerPanelRef = useRef(null)

  useEffect(() => {
    if (!drawerOffen) return undefined
    const previousFocus = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setDrawerOffen(false)
        return
      }
      if (event.key !== 'Tab') return

      const panel = drawerPanelRef.current
      if (!panel) return
      const focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((element) => element instanceof HTMLElement && !element.hasAttribute('hidden'))
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [drawerOffen])

  const primaer = nav.slice(0, 4)
  const weitere = nav.slice(4)

  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#hauptinhalt" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-brand">Zum Inhalt springen</a>

      <aside className={cn('fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line bg-surface md:flex', 'w-16 lg:w-60')}>
        <div className="flex h-14 shrink-0 items-center border-b border-line px-3 lg:px-4"><Logo compact bereich={bereich} /></div>
        <nav aria-label="Hauptnavigation" className="scroll-area flex-1 overflow-y-auto px-2 py-3">
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <li key={item.id}>
                <NavLink to={item.to} end={item.end} title={item.label} className={({ isActive }) => cn('group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8125rem] font-medium transition-colors', 'lg:justify-start justify-center', isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-muted hover:text-ink')}>
                  <item.icon className="size-[1.125rem] shrink-0" aria-hidden="true" />
                  <span className="hidden lg:inline lg:flex-1 lg:truncate">{item.label}</span>
                  {item.badge ? <span className="hidden lg:inline"><CountBadge value={item.badge} toneName={item.badgeTone ?? 'brand'} /></span> : null}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {footerSlot ? <div className="shrink-0 border-t border-line p-2 lg:p-3">{footerSlot}</div> : null}
      </aside>

      <div className="md:pl-16 lg:pl-60">
        <Topbar bereich={bereich} badge={badge} kopf={kopf} ziele={nav} zeigeBenachrichtigungen={zeigeBenachrichtigungen} kundenBereich={kundenBereich} aufgabenZiel={aufgabenZiel} benachrichtigungsZiel={benachrichtigungsZiel} onMenu={() => setDrawerOffen(true)} />
        <main id="hauptinhalt" className="px-4 pt-5 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-10 xl:px-8">{children}</main>
      </div>

      <nav aria-label="Hauptnavigation (mobil)" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <ul className="grid grid-cols-5">
          {primaer.map((item) => (
            <li key={item.id}>
              <NavLink to={item.to} end={item.end} className={({ isActive }) => cn('relative flex min-h-12 flex-col items-center justify-center gap-1 py-2 text-[0.625rem] font-medium transition-colors', isActive ? 'text-brand-ink' : 'text-ink-3')}>
                <item.icon className="size-5" aria-hidden="true" />
                <span className="max-w-full truncate px-1">{item.label}</span>
                {item.badge ? <><span className="absolute top-1.5 right-[22%] size-1.5 rounded-full bg-urgent" aria-hidden="true" /><span className="sr-only">, {item.badge} offene Einträge</span></> : null}
              </NavLink>
            </li>
          ))}
          <li>
            <button ref={menuButtonRef} type="button" onClick={() => setDrawerOffen(true)} aria-expanded={drawerOffen} aria-controls="mobile-app-menu" className="flex min-h-12 w-full flex-col items-center justify-center gap-1 py-2 text-[0.625rem] font-medium text-ink-3">
              <IconMenu className="size-5" aria-hidden="true" />Mehr
            </button>
          </li>
        </ul>
      </nav>

      {drawerOffen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Alle Bereiche">
          <button type="button" aria-label="Menü schließen" onClick={() => setDrawerOffen(false)} className="absolute inset-0 cursor-default bg-[var(--c-overlay)] animate-fade-in" />
          <div ref={drawerPanelRef} id="mobile-app-menu" className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-hidden rounded-t-2xl border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] animate-rise">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Logo bereich={bereich} />
              <button ref={closeButtonRef} type="button" onClick={() => setDrawerOffen(false)} aria-label="Menü schließen" className="rounded-lg p-2 text-ink-3 hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <IconClose className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Alle Bereiche" className="scroll-area max-h-[65dvh] overflow-y-auto p-3">
              <ul className="grid grid-cols-2 gap-2">
                {[...primaer, ...weitere].map((item) => (
                  <li key={item.id}>
                    <NavLink to={item.to} end={item.end} onClick={() => setDrawerOffen(false)} className={({ isActive }) => cn('flex min-h-12 items-center gap-2.5 rounded-lg border px-3 py-3 text-[0.8125rem] font-medium', isActive ? 'border-brand-border bg-brand-soft text-brand-ink' : 'border-line text-ink-2')}>
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
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
