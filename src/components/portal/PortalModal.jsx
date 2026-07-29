import { useEffect, useState } from 'react'
import { useToast } from '../../hooks/useToast.js'
import { useInbox } from '../../hooks/useInbox.js'
import { Button } from '../ui/Button.jsx'
import { Field, controlBorder, controlBorderError, controlClasses } from '../ui/Field.jsx'
import { IconLock, IconTeam, IconUser } from '../ui/Icons.jsx'
import { Modal } from '../ui/Modal.jsx'
import { Spinner } from '../ui/Spinner.jsx'
import { CustomerChat } from './CustomerChat.jsx'
import { StaffConsole } from './StaffConsole.jsx'

const ROLLEN = [
  {
    id: 'kunde',
    label: 'Kundenlogin',
    icon: IconUser,
    beschreibung: 'Direkter Draht zur SYMMEDIS-Beratung – KI-gestützt und jederzeit erreichbar.',
    demoMail: 'kundin@nordvita-demo.de',
  },
  {
    id: 'mitarbeiter',
    label: 'Mitarbeiterlogin',
    icon: IconTeam,
    beschreibung: 'Interner Posteingang: Kundenanfragen einsehen, einordnen und beantworten.',
    demoMail: 'm.reinhardt@symmedis-demo.de',
  },
]

export function PortalModal({ open, onClose, session, initialRole = 'kunde', onLogin, onLogout }) {
  const [rolle, setRolle] = useState(initialRole)
  const [values, setValues] = useState({ email: '', passwort: '' })
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const toast = useToast()
  const { offeneAnzahl } = useInbox()

  useEffect(() => {
    if (open && !session) {
      setRolle(initialRole)
      setErrors({})
    }
  }, [open, initialRole, session])

  const aktiveRolle = ROLLEN.find((r) => r.id === rolle) ?? ROLLEN[0]

  const anmelden = async (event) => {
    event.preventDefault()
    if (pending) return

    const next = {}
    if (!values.email.includes('@')) next.email = 'Bitte geben Sie eine E-Mail-Adresse ein.'
    if (values.passwort.length < 1) next.passwort = 'Bitte geben Sie ein Passwort ein.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      document.getElementById(`login-${Object.keys(next)[0]}`)?.focus()
      return
    }

    setPending(true)
    await new Promise((resolve) => setTimeout(resolve, 650))
    setPending(false)

    onLogin({ role: rolle, email: values.email.trim() })
    setValues({ email: '', passwort: '' })
    toast.show({
      title: rolle === 'kunde' ? 'Angemeldet als Kunde' : 'Angemeldet als Mitarbeiter',
      description: 'Demo-Zugang ohne echte Authentifizierung.',
      variant: 'success',
    })
  }

  const demoDatenEinsetzen = () => {
    setValues({ email: aktiveRolle.demoMail, passwort: 'demo1234' })
    setErrors({})
  }

  const abmelden = () => {
    onLogout()
    setValues({ email: '', passwort: '' })
    toast.show({ title: 'Abgemeldet', description: 'Sie sind zurück im Login.', variant: 'info' })
  }

  const titel = session
    ? session.role === 'kunde'
      ? 'Kundenbereich · Chat mit SYMMEDIS'
      : 'Mitarbeiterbereich · Kundenanfragen'
    : 'Login'

  const untertitel = session
    ? session.role === 'kunde'
      ? 'Beta-Demo – der Verlauf besteht nur in dieser Sitzung.'
      : `Demo-Zustand mit fiktiven Anfragen · ${offeneAnzahl} offen.`
    : 'Demo-Zugang: Jede E-Mail-Adresse und jedes Passwort funktionieren.'

  return (
    <Modal
      open={open}
      onClose={onClose}
      size={session ? 'xl' : 'md'}
      title={titel}
      subtitle={untertitel}
      footer={
        session ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[0.75rem] prose-muted">
              Angemeldet als {session.role === 'kunde' ? 'Kunde' : 'Mitarbeiter'} ·{' '}
              {session.email}
            </p>
            <Button variant="secondary" size="sm" onClick={abmelden}>
              Abmelden
            </Button>
          </div>
        ) : null
      }
    >
      {session ? (
        session.role === 'kunde' ? (
          <CustomerChat session={session} />
        ) : (
          <StaffConsole session={session} />
        )
      ) : (
        <div className="px-5 py-6 sm:px-7 sm:py-7">
          {/* Rollenauswahl */}
          <div
            role="tablist"
            aria-label="Zugang wählen"
            className="grid grid-cols-2 gap-2 rounded-sm border border-shell-200 p-1 dark:border-night-700"
          >
            {ROLLEN.map((eintrag) => (
              <button
                key={eintrag.id}
                type="button"
                role="tab"
                aria-selected={rolle === eintrag.id}
                onClick={() => setRolle(eintrag.id)}
                className={`flex items-center justify-center gap-2 rounded-xs px-3 py-2.5 text-[0.8125rem] font-medium transition-colors ${
                  rolle === eintrag.id
                    ? 'bg-marine-800 text-white dark:bg-marine-400 dark:text-night-950'
                    : 'text-shell-600 hover:text-marine-900 dark:text-night-300 dark:hover:text-night-100'
                }`}
              >
                <eintrag.icon className="size-4" />
                {eintrag.label}
              </button>
            ))}
          </div>

          <p className="mt-4 text-[0.875rem] leading-relaxed prose-muted">
            {aktiveRolle.beschreibung}
          </p>

          <form onSubmit={anmelden} noValidate className="mt-6 space-y-5">
            <Field id="login-email" label="E-Mail" required error={errors.email}>
              {({ errorId }) => (
                <input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  value={values.email}
                  data-autofocus
                  onChange={(event) => {
                    setValues((c) => ({ ...c, email: event.target.value }))
                    setErrors((c) => ({ ...c, email: undefined }))
                  }}
                  aria-invalid={errors.email ? 'true' : undefined}
                  aria-describedby={errorId}
                  className={`${controlClasses} ${errors.email ? controlBorderError : controlBorder}`}
                  placeholder={aktiveRolle.demoMail}
                />
              )}
            </Field>

            <Field id="login-passwort" label="Passwort" required error={errors.passwort}>
              {({ errorId }) => (
                <input
                  id="login-passwort"
                  type="password"
                  autoComplete="current-password"
                  value={values.passwort}
                  onChange={(event) => {
                    setValues((c) => ({ ...c, passwort: event.target.value }))
                    setErrors((c) => ({ ...c, passwort: undefined }))
                  }}
                  aria-invalid={errors.passwort ? 'true' : undefined}
                  aria-describedby={errorId}
                  className={`${controlClasses} ${errors.passwort ? controlBorderError : controlBorder}`}
                  placeholder="Beliebiges Passwort"
                />
              )}
            </Field>

            <Button type="submit" fullWidth size="lg" disabled={pending}>
              {pending ? (
                <Spinner label="Anmeldung läuft …" />
              ) : (
                <>
                  <IconLock className="size-4" />
                  Anmelden
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 rounded-sm border border-shell-200 bg-shell-50 px-4 py-3.5 dark:border-night-700 dark:bg-night-800/50">
            <p className="text-[0.75rem] leading-relaxed prose-muted">
              <strong className="font-medium text-marine-900 dark:text-night-100">
                Demo-Hinweis:
              </strong>{' '}
              Dieser Login ist eine Attrappe ohne echte Authentifizierung. Es werden keine Daten
              übertragen oder gespeichert.
            </p>
            <button
              type="button"
              onClick={demoDatenEinsetzen}
              className="mt-2 rounded-sm text-[0.75rem] font-medium text-marine-700 underline decoration-brass-400 underline-offset-4 transition-colors hover:text-marine-900 dark:text-marine-300 dark:hover:text-night-100"
            >
              Demo-Zugangsdaten einsetzen
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
