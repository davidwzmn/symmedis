import { FOOTER } from '../../content/site.js'
import { scrollToSection } from '../../lib/scroll.js'
import { IconLock, IconTeam } from '../ui/Icons.jsx'
import { Logo } from './Logo.jsx'

export function Footer({ onOpenLegal, onOpenPortal }) {
  return (
    <footer className="border-t border-shell-200 bg-shell-50 dark:border-night-800 dark:bg-night-900/60">
      <div className="container-page py-12 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-5 flex items-start gap-2.5 text-[0.8125rem] leading-relaxed prose-muted">
              <span
                aria-hidden="true"
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brass-500 dark:bg-brass-400"
              />
              {FOOTER.hinweis}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:gap-14">
            <div>
              <h2 className="text-[0.6875rem] font-semibold tracking-[0.16em] text-marine-900 uppercase dark:text-night-200">
                Zugänge
              </h2>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenPortal('kunde')}
                    className="inline-flex items-center gap-2 rounded-sm text-[0.875rem] text-shell-600 transition-colors hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100"
                  >
                    <IconLock className="size-4" />
                    Kundenlogin
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onOpenPortal('mitarbeiter')}
                    className="inline-flex items-center gap-2 rounded-sm text-[0.875rem] text-shell-600 transition-colors hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100"
                  >
                    <IconTeam className="size-4" />
                    Mitarbeiterlogin
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('termin')}
                    className="rounded-sm text-[0.875rem] text-shell-600 transition-colors hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100"
                  >
                    Termin buchen
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-[0.6875rem] font-semibold tracking-[0.16em] text-marine-900 uppercase dark:text-night-200">
                Rechtliches
              </h2>
              <ul className="mt-4 space-y-2.5">
                {FOOTER.links.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => onOpenLegal(link.id)}
                      className="rounded-sm text-[0.875rem] text-shell-600 transition-colors hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-shell-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-night-800">
          <p className="text-[0.8125rem] prose-muted">{FOOTER.copyright}</p>
          <p className="text-[0.75rem] prose-muted">
            Beta-Demo · Keine echten Patienten- oder Gesundheitsdaten
          </p>
        </div>
      </div>
    </footer>
  )
}
