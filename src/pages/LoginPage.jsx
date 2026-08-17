import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useSession } from '../hooks/useSession.js'
import { useTheme } from '../hooks/useTheme.js'
import { sendMagicLink } from '../lib/supabase.js'
import { cn } from '../lib/cn.js'
import { Button, Chip } from '../components/ui/primitives.jsx'
import { Input } from '../components/ui/forms.jsx'
import { Banner } from '../components/ui/layout.jsx'
import { Logo } from '../components/brand/Logo.jsx'
import {
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconMoon,
  IconShield,
  IconSun,
  IconUsers,
} from '../components/ui/Icons.jsx'

const ROLLEN = {
  kunde: {
    titel: 'Kundenportal',
    text: 'Ihr Projektstand, die freigegebene Analyse, der 90-Tage-Plan und der direkte Draht zum Team.',
    beispiel: 'name@unternehmen.de',
    ziel: '/portal/uebersicht', icon: IconBuilding,
    punkte: ['Freigegebene Analyse mit Beleg und Empfehlung', 'Aufgaben, Dokumente und Termine des eigenen Projekts', 'Keine internen Notizen, keine fremden Mandanten'],
  },
  intern: {
    titel: 'Mitarbeiterportal',
    text: 'Alle Projekte, der Analyse-Editor, das Freigabezentrum und der interne Prüfpfad.',
    beispiel: 'name@symmedis.de',
    ziel: '/intern/uebersicht', icon: IconUsers,
    punkte: ['Analyse bearbeiten und stufenweise freigeben', 'Interne Notizen, Prüfpfad und Teamauslastung', 'Projektübergreifende Listen und Auswertungen'],
  },
}

export function LoginPage() {
  const [params] = useSearchParams()
  const { session, anmelden, authBereit } = useSession()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const gewuenscht = params.get('rolle') === 'intern' ? 'intern' : 'kunde'
  const [rolle, setRolle] = useState(gewuenscht)
  const [email, setEmail] = useState('')
  const [passwort, setPasswort] = useState('')
  const [fehler, setFehler] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [magicGesendet, setMagicGesendet] = useState(false)

  if (authBereit && session) return <Navigate to={ROLLEN[session.rolle].ziel} replace />

  const absenden = async (event) => {
    event.preventDefault()
    if (!email.trim()) return setFehler('Bitte geben Sie eine E-Mail-Adresse ein.')
    if (!passwort) return setFehler('Bitte geben Sie Ihr Kennwort ein.')
    setLaedt(true); setFehler(null)
    try {
      const next = await anmelden({ rolle, email: email.trim(), passwort })
      navigate(ROLLEN[next.rolle].ziel, { replace: true })
    } catch (error) {
      setFehler(error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen.')
    } finally { setLaedt(false) }
  }

  const magicLink = async () => {
    if (!email.trim()) return setFehler('Bitte geben Sie zuerst Ihre E-Mail-Adresse ein.')
    setLaedt(true); setFehler(null); setMagicGesendet(false)
    try {
      await sendMagicLink(email.trim())
      setMagicGesendet(true)
    } catch (error) {
      setFehler(error instanceof Error ? error.message : 'Anmeldelink konnte nicht gesendet werden.')
    } finally { setLaedt(false) }
  }

  const aktiv = ROLLEN[rolle]

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-surface">
        <div className="shell-container flex h-16 items-center justify-between">
          <Link to="/" className="rounded-lg"><Logo bereich="Diagnosis OS" /></Link>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Zum hellen Modus wechseln' : 'Zum dunklen Modus wechseln'} aria-pressed={theme === 'dark'} className="inline-flex size-9 items-center justify-center rounded-lg text-ink-2 transition-colors hover:bg-surface-muted hover:text-ink">
              {theme === 'dark' ? <IconSun className="size-[1.125rem]" /> : <IconMoon className="size-[1.125rem]" />}
            </button>
            <Button as={Link} to="/" variant="ghost" size="sm">Zur Website</Button>
          </div>
        </div>
      </header>

      <main id="hauptinhalt" className="shell-container py-10 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
          <div>
            <Chip toneName="ok" icon={IconShield}>Geschützter SYMMEDIS-Zugang</Chip>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Sicher anmelden. Nur das sehen, was für Sie freigegeben ist.</h1>
            <p className="mt-3 max-w-md text-[0.9375rem] leading-relaxed text-ink-2">Das Kundenportal zeigt ausschließlich geprüfte und freigegebene Inhalte. Das Mitarbeiterportal enthält zusätzlich Analyse-Editor, Freigabeprozess und interne Notizen.</p>
            <ul className="mt-6 space-y-2.5">
              {aktiv.punkte.map((punkt) => <li key={punkt} className="flex items-start gap-2.5 text-[0.875rem] text-ink"><IconCheck className="mt-0.5 size-4 shrink-0 text-accent-ink" />{punkt}</li>)}
            </ul>
            <Banner toneName="info" icon={IconShield} className="mt-6">
              Die Anmeldung wird über Supabase Auth geprüft; der Datenzugriff zusätzlich durch Row Level Security je Mandant begrenzt.
            </Banner>
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
            <fieldset disabled={laedt}>
              <legend className="text-[0.8125rem] font-medium text-ink">Zugang wählen</legend>
              <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
                {Object.entries(ROLLEN).map(([key, wert]) => {
                  const Icon = wert.icon
                  const gewaehlt = key === rolle
                  return (
                    <button key={key} type="button" onClick={() => { setRolle(key); setFehler(null); setMagicGesendet(false) }} aria-pressed={gewaehlt} className={cn('flex flex-col items-start gap-1.5 rounded-lg border p-3.5 text-left transition-colors', gewaehlt ? 'border-brand bg-brand-soft' : 'border-line-strong hover:border-brand hover:bg-surface-muted')}>
                      <span className={cn('inline-flex size-8 items-center justify-center rounded-md', gewaehlt ? 'bg-brand text-on-brand' : 'bg-surface-muted text-ink-2')}><Icon className="size-4" /></span>
                      <span className={cn('text-[0.8125rem] font-semibold', gewaehlt ? 'text-brand-ink' : 'text-ink')}>{wert.titel}</span>
                      <span className="text-xs leading-snug text-ink-2">{wert.text}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <form className="mt-6 space-y-4" onSubmit={absenden}>
              <Input label="E-Mail-Adresse" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setFehler(null); setMagicGesendet(false) }} placeholder={aktiv.beispiel} hint="Ihre für SYMMEDIS freigeschaltete E-Mail-Adresse." error={fehler} autoComplete="username" disabled={laedt} />
              <Input label="Kennwort" type="password" value={passwort} onChange={(event) => { setPasswort(event.target.value); setFehler(null) }} placeholder="Ihr Kennwort" hint="Wenn Sie kein Kennwort verwenden, senden wir Ihnen alternativ einen einmaligen Anmeldelink." autoComplete="current-password" disabled={laedt} />

              {magicGesendet ? <Banner toneName="ok" icon={IconCheck}>Anmeldelink wurde versendet. Öffnen Sie den Link auf diesem Gerät; anschließend werden Sie automatisch Ihrem freigeschalteten Portal zugeordnet.</Banner> : null}

              <Button type="submit" size="lg" fullWidth disabled={laedt || !authBereit}>{laedt ? 'Anmeldung wird geprüft …' : `${aktiv.titel} mit Kennwort öffnen`}{!laedt && <IconArrowRight className="size-4" />}</Button>
              <Button type="button" size="lg" fullWidth variant="secondary" onClick={magicLink} disabled={laedt || !authBereit}>Einmaligen Anmeldelink per E-Mail senden</Button>
            </form>

            <p className="mt-4 text-center text-xs leading-relaxed text-ink-3">Noch keinen Zugang? Dieser wird vom SYMMEDIS-Team für Ihr Projekt freigeschaltet. <Link to="/demo" className="font-medium text-brand-ink hover:underline">Produktdemo ansehen</Link></p>
          </div>
        </div>
      </main>
    </div>
  )
}
