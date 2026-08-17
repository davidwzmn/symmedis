import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn.js'
import { useTheme } from '../../hooks/useTheme.js'
import { useSeo } from '../../hooks/useSeo.js'
import { seoFuerPfad } from '../../content/seo.js'
import { Button } from '../../components/ui/primitives.jsx'
import { Modal } from '../../components/ui/overlays.jsx'
import { Logo } from '../../components/brand/Logo.jsx'
import { NAV, RECHTSTEXTE } from '../../content/marketing.js'
import { IconArrowRight, IconCalendar, IconClose, IconMenu, IconMoon, IconSun } from '../../components/ui/Icons.jsx'

export function MarketingLayout() {
  const [rechtstext, setRechtstext] = useState(null)
  const { pathname } = useLocation()
  useSeo(seoFuerPfad(pathname))

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a href="#hauptinhalt" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-100 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-brand">Zum Inhalt springen</a>
      <Kopfzeile />
      <main id="hauptinhalt" className="flex-1"><Outlet /></main>
      <Fusszeile onRecht={setRechtstext} />
      <MobileTerminCta />
      <Modal open={Boolean(rechtstext)} onClose={() => setRechtstext(null)} title={rechtstext ? RECHTSTEXTE[rechtstext].titel : ''} size="md">
        <div className="space-y-4 px-5 py-5">
          {rechtstext ? RECHTSTEXTE[rechtstext].absaetze.map((absatz) => <p key={absatz} className="text-[0.875rem] leading-relaxed text-ink-2">{absatz}</p>) : null}
        </div>
      </Modal>
    </div>
  )
}

function MobileTerminCta() {
  const { pathname } = useLocation()
  if (pathname === '/termin' || pathname.startsWith('/demo')) return null
  return (
    <>
      <div aria-hidden="true" className="h-[4.75rem] lg:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-3 pt-2.5 backdrop-blur lg:hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.625rem)' }}>
        <div className="mx-auto grid max-w-xl grid-cols-[0.88fr_1.12fr] gap-2">
          <Button as={Link} to="/demo" variant="secondary" size="lg" fullWidth>Demo <IconArrowRight className="size-4" /></Button>
          <Button as={Link} to="/termin" variant="cta" size="lg" fullWidth><IconCalendar className="size-4" />Gespräch anfragen</Button>
        </div>
      </div>
    </>
  )
}

function Kopfzeile() {
  const { theme, toggleTheme } = useTheme()
  const [offen, setOffen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOffen(false), [pathname])
  useEffect(() => {
    if (!offen) return undefined
    const onKey = (event) => event.key === 'Escape' && setOffen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen])

  const linkKlasse = ({ isActive }) => cn('rounded-lg px-3 py-2 text-[0.8125rem] font-medium transition-colors', isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-muted hover:text-ink')

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <div className="shell-container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="rounded-lg" aria-label="Zur Startseite"><Logo bereich="Diagnosis OS" /></Link>
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">{NAV.map((eintrag) => <li key={eintrag.to}><NavLink to={eintrag.to} className={linkKlasse}>{eintrag.label}</NavLink></li>)}</ul>
        </nav>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'} aria-pressed={theme === 'dark'} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink">{theme === 'dark' ? <IconSun className="size-[1.125rem]" /> : <IconMoon className="size-[1.125rem]" />}</button>
          <span className="hidden sm:inline-flex"><Button as={Link} to="/login" variant="ghost" size="sm">Anmelden</Button></span>
          <span className="hidden xl:inline-flex"><Button as={Link} to="/demo" variant="secondary" size="sm" className="whitespace-nowrap">Produktdemo</Button></span>
          <span className="hidden md:inline-flex"><Button as={Link} to="/termin" variant="cta" size="sm" className="whitespace-nowrap"><IconCalendar className="size-4" /><span className="xl:hidden">Gespräch anfragen</span><span className="hidden xl:inline">15-Minuten-Gespräch anfragen</span></Button></span>
          <button type="button" onClick={() => setOffen((o) => !o)} aria-expanded={offen} aria-label={offen ? 'Menü schließen' : 'Menü öffnen'} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-muted lg:hidden">{offen ? <IconClose className="size-5" /> : <IconMenu className="size-5" />}</button>
        </div>
      </div>

      {offen ? (
        <div className="border-t border-line bg-surface lg:hidden">
          <nav aria-label="Hauptnavigation (mobil)" className="shell-container py-3">
            <ul className="space-y-0.5">
              {NAV.map((eintrag) => <li key={eintrag.to}><NavLink to={eintrag.to} className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-brand-soft text-brand-ink' : 'text-ink-2 hover:bg-surface-muted hover:text-ink')}>{eintrag.label}</NavLink></li>)}
            </ul>
            <div className="mt-3 grid gap-2 border-t border-line pt-3">
              <Button as={Link} to="/demo" fullWidth>Interaktive Produktdemo <IconArrowRight className="size-4" /></Button>
              <Button as={Link} to="/termin" variant="cta" fullWidth><IconCalendar className="size-4" />15-Minuten-Gespräch anfragen</Button>
              <Button as={Link} to="/login" variant="secondary" fullWidth>Anmelden</Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}

function Fusszeile({ onRecht }) {
  return (
    <footer className="bg-surface-inverse">
      <div className="shell-container py-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <span className="inline-flex items-center gap-2.5"><span className="inline-flex size-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand">S</span><span className="text-sm font-semibold text-canvas">SYMMEDIS Diagnosis OS</span></span>
            <p className="mt-3.5 text-[0.8125rem] leading-relaxed text-canvas/70">Strategische Ursachenanalyse und Diagnosis OS für erklärungsbedürftige Gesundheits-, MedTech- und B2B-Produkte.</p>
          </div>
          <FooterSpalte titel="Seiten">{NAV.map((eintrag) => <FooterLink key={eintrag.to} to={eintrag.to}>{eintrag.label}</FooterLink>)}</FooterSpalte>
          <FooterSpalte titel="Plattform"><FooterLink to="/demo">Produktdemo</FooterLink><FooterLink to="/login?rolle=kunde">Kundenportal</FooterLink><FooterLink to="/login?rolle=intern">Mitarbeiterportal</FooterLink><FooterLink to="/termin">Gespräch anfragen</FooterLink></FooterSpalte>
          <FooterSpalte titel="Rechtliches"><FooterLink to="/impressum">Impressum</FooterLink><FooterLink to="/datenschutz">Datenschutz</FooterLink><FooterLink to="/agb">AGB</FooterLink><li><button type="button" onClick={() => onRecht('barrierefreiheit')} className="text-[0.8125rem] text-canvas/80 transition-colors hover:text-canvas">{RECHTSTEXTE.barrierefreiheit.titel}</button></li></FooterSpalte>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-canvas/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-canvas/60">© 2026 SYMMEDIS Diagnosis OS.</p>
          <p className="text-xs text-canvas/60">Strategische Unternehmensanalyse · keine medizinische Beratung · keine Patientendaten erforderlich.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterSpalte({ titel, children }) {
  return <div><p className="text-xs font-semibold text-canvas/60">{titel}</p><ul className="mt-3 space-y-2">{children}</ul></div>
}

function FooterLink({ to, children }) {
  return <li><Link to={to} className="text-[0.8125rem] text-canvas/80 transition-colors hover:text-canvas">{children}</Link></li>
}
