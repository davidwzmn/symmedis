import { useState } from 'react'
import { PLATTFORMEN } from '../../data/catalog.js'
import { TEAM } from '../../data/workspace.js'
import { useTheme } from '../../hooks/useTheme.js'
import { useToast } from '../../hooks/useToast.js'
import { Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, Banner } from '../../components/ui/layout.jsx'
import { Toggle } from '../../components/ui/forms.jsx'
import { IconCheck, IconClose, IconLink, IconShield, IconUsers } from '../../components/ui/Icons.jsx'

/**
 * Rollen, Rechte und Connector-Übersicht.
 *
 * Die Connector-Liste zeigt bewusst den echten Stand: keine Plattform ist in
 * dieser Demo angebunden. Vorbereitet ist die Schnittstelle, nicht die
 * Verbindung.
 */
const ROLLEN = [
  {
    id: 'lead',
    name: 'Lead Analyst:in',
    rechte: [
      'Analyse bearbeiten und intern freigeben',
      'Für Kunden freigeben',
      'Interne Notizen lesen und schreiben',
      'Berichte erstellen und finalisieren',
    ],
  },
  {
    id: 'analyst',
    name: 'Analyst:in',
    rechte: [
      'Analyse bearbeiten',
      'Intern freigeben',
      'Interne Notizen lesen und schreiben',
      'Keine Kundenfreigabe',
    ],
  },
  {
    id: 'social',
    name: 'Social & Content',
    rechte: [
      'Social-Auswertung bearbeiten',
      'Teilberichte erstellen',
      'Interne Notizen lesen',
      'Keine Kundenfreigabe',
    ],
  },
  {
    id: 'kunde',
    name: 'Kundenzugang',
    rechte: [
      'Freigegebene Analysepunkte lesen',
      'Aufgaben der eigenen Seite bearbeiten',
      'Dokumente hochladen',
      'Keine internen Notizen, keine anderen Mandanten',
    ],
  },
]

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const toast = useToast()
  const [hinweise, setHinweise] = useState(true)
  const [freigabeErinnerung, setFreigabeErinnerung] = useState(true)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Einstellungen"
        subtitle="Rollen und Rechte, Datenquellen und persönliche Voreinstellungen."
      />

      <Banner toneName="warn" icon={IconShield} title="Demo-Umgebung">
        Diese Installation läuft ohne echte Authentifizierung und ohne angebundene Datenquellen.
        Rollen und Rechte sind als Modell hinterlegt, nicht technisch durchgesetzt.
      </Banner>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Rollen und Rechte"
            subtitle="Wer darf was sehen und freigeben"
            icon={IconUsers}
          />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {ROLLEN.map((rolle) => (
                <li key={rolle.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.875rem] font-semibold text-ink">{rolle.name}</p>
                    <Chip size="sm" toneName={rolle.id === 'kunde' ? 'brand' : 'accent'}>
                      {rolle.id === 'kunde' ? 'Extern' : 'Intern'}
                    </Chip>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {rolle.rechte.map((recht) => {
                      const verneint = recht.startsWith('Keine')
                      return (
                        <li key={recht} className="flex items-start gap-2 text-[0.8125rem] text-ink-2">
                          {verneint ? (
                            <IconClose className="mt-0.5 size-3.5 shrink-0 text-danger-ink" />
                          ) : (
                            <IconCheck className="mt-0.5 size-3.5 shrink-0 text-ok-ink" />
                          )}
                          {recht}
                        </li>
                      )
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader
              title="Datenquellen"
              subtitle="Vorbereitete Connector-Schnittstellen"
              icon={IconLink}
            />
            <CardBody className="px-0 py-0">
              <ul className="divide-y divide-line">
                {PLATTFORMEN.map((plattform) => (
                  <li
                    key={plattform.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] font-medium text-ink">{plattform.label}</p>
                      <p className="text-xs text-ink-3">
                        Schnittstelle vorbereitet · Auswertung derzeit aus öffentlich sichtbaren
                        Beiträgen
                      </p>
                    </div>
                    <Chip size="sm" toneName="neutral">
                      Nicht verbunden
                    </Chip>
                  </li>
                ))}
              </ul>
            </CardBody>
            <p className="border-t border-line px-4 py-3 text-xs leading-relaxed text-ink-3 sm:px-5">
              Es wird bewusst keine Live-Verbindung vorgetäuscht. Bis eine Plattform tatsächlich
              angebunden ist, bleibt der Status „nicht verbunden“.
            </p>
          </Card>

          <Card>
            <CardHeader title="Persönliche Einstellungen" />
            <CardBody className="space-y-4">
              <Toggle
                checked={theme === 'dark'}
                onChange={toggleTheme}
                label="Dunkler Modus"
                description="Wirkt auf die gesamte Anwendung."
              />
              <Toggle
                checked={hinweise}
                onChange={(wert) => {
                  setHinweise(wert)
                  toast.show({
                    title: wert ? 'Hinweise aktiviert' : 'Hinweise deaktiviert',
                    description: 'Gilt nur für diese Sitzung.',
                  })
                }}
                label="Hinweise im Benachrichtigungszentrum"
                description="Neue Dokumente, offene Freigaben, überfällige Aufgaben."
              />
              <Toggle
                checked={freigabeErinnerung}
                onChange={setFreigabeErinnerung}
                label="Erinnerung vor Ergebnisterminen"
                description="Drei Tage vor dem Termin, wenn noch Freigaben offen sind."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Team" icon={IconUsers} />
            <CardBody className="px-0 py-0">
              <ul className="divide-y divide-line">
                {TEAM.map((mitglied) => (
                  <li
                    key={mitglied.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] font-medium text-ink">{mitglied.name}</p>
                      <p className="text-xs text-ink-3">{mitglied.rolle}</p>
                    </div>
                    <Chip size="sm" toneName="accent">
                      Intern
                    </Chip>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
