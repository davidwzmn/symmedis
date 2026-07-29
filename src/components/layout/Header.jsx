import { useEffect, useState } from 'react'
import { NAV_ITEMS } from '../../content/site.js'
import { useScrollSpy } from '../../hooks/useScrollSpy.js'
import { scrollToSection } from '../../lib/scroll.js'
import { Button } from '../ui/Button.jsx'
import { IconClose, IconLock, IconMenu, IconMoon, IconSun } from '../ui/Icons.jsx'
import { Logo } from './Logo.jsx'

const SPY_IDS = [...NAV_ITEMS.map((item) => item.id), 'termin']

export function Header({ theme, onToggleTheme, onOpenPortal }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const activeId = useScrollSpy(SPY_IDS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile-Menü: Escape schließt, Hintergrund scrollt nicht mit.
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  // Beim Wechsel auf Desktop-Breite das Mobile-Menü schließen.
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const go = (id) => {
    setMenuOpen(false)
    scrollToSection(id)
  }

  const openPortal = (role) => {
    setMenuOpen(false)
    onOpenPortal(role)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled || menuOpen
          ? 'border-b border-shell-200 bg-white/92 backdrop-blur-md dark:border-night-700 dark:bg-night-950/92'
          : 'border-b border-transparent bg-white/70 backdrop-blur-sm dark:bg-night-950/70'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-[4.5rem]">
        <a
          href="#start"
          onClick={(event) => {
            event.preventDefault()
            go('start')
          }}
          className="rounded-sm"
          aria-label="SYMMEDIS Diagnosis OS – zum Seitenanfang"
        >
          <Logo />
        </a>

        {/* Desktop-Navigation */}
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = activeId === item.id
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active ? 'true' : undefined}
                    onClick={(event) => {
                      event.preventDefault()
                      go(item.id)
                    }}
                    className={`relative rounded-sm px-3 py-2 text-[0.8125rem] font-medium transition-colors ${
                      active
                        ? 'text-marine-900 dark:text-night-100'
                        : 'text-shell-600 hover:text-marine-800 dark:text-night-300 dark:hover:text-night-100'
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-3 -bottom-0.5 h-px origin-left bg-brass-500 transition-transform duration-300 dark:bg-brass-400 ${
                        active ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'}
            aria-pressed={theme === 'dark'}
            className="rounded-sm p-2 text-shell-600 transition-colors hover:bg-shell-100 hover:text-marine-900 dark:text-night-300 dark:hover:bg-night-800 dark:hover:text-night-100"
          >
            {theme === 'dark' ? <IconSun className="size-5" /> : <IconMoon className="size-5" />}
          </button>

          {/* Wrapper statt `hidden` direkt am Button: `hidden` und das
              `inline-flex` des Buttons haben dieselbe Spezifität – welche Regel
              gewinnt, hinge sonst von der Reihenfolge im Stylesheet ab. */}
          <span className="hidden lg:inline-flex">
            <Button variant="secondary" size="sm" onClick={() => openPortal('kunde')}>
              <IconLock className="size-4" />
              Kundenlogin
            </Button>
          </span>

          <span className="hidden sm:inline-flex">
            <Button size="sm" onClick={() => go('termin')}>
              Termin buchen
            </Button>
          </span>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'}
            className="rounded-sm p-2 text-marine-900 transition-colors hover:bg-shell-100 lg:hidden dark:text-night-100 dark:hover:bg-night-800"
          >
            {menuOpen ? <IconClose className="size-5" /> : <IconMenu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile-Menü */}
      {menuOpen ? (
        <div
          id="mobile-menu"
          className="border-t border-shell-200 bg-white lg:hidden dark:border-night-700 dark:bg-night-950"
        >
          <nav aria-label="Navigation (mobil)" className="container-page py-4">
            <ul className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(event) => {
                      event.preventDefault()
                      go(item.id)
                    }}
                    aria-current={activeId === item.id ? 'true' : undefined}
                    className={`flex items-center justify-between border-b border-shell-200/70 py-3 text-[0.9375rem] transition-colors dark:border-night-800 ${
                      activeId === item.id
                        ? 'font-medium text-marine-900 dark:text-night-100'
                        : 'text-shell-600 dark:text-night-300'
                    }`}
                  >
                    {item.label}
                    {activeId === item.id ? (
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-brass-500 dark:bg-brass-400"
                      />
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col gap-2">
              <Button variant="secondary" fullWidth onClick={() => openPortal('kunde')}>
                <IconLock className="size-4" />
                Kundenlogin
              </Button>
              <Button variant="ghost" fullWidth onClick={() => openPortal('mitarbeiter')}>
                Mitarbeiterlogin
              </Button>
              <Button fullWidth onClick={() => go('termin')}>
                Termin buchen
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
