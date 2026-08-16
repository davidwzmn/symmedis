import { useMemo, useState } from 'react'
import { TEAM } from '../../data/workspace.js'
import { EXTENSIONS, PLATFORM_EXTENSIONS } from '../../data/extensions.js'
import { useTheme } from '../../hooks/useTheme.js'
import { useToast } from '../../hooks/useToast.js'
import { useSession } from '../../hooks/useSession.js'
import { Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, Banner, MetricCard } from '../../components/ui/layout.jsx'
import { Toggle } from '../../components/ui/forms.jsx'
import { IconCheck, IconClose, IconLink, IconShield, IconUsers, IconLayers, IconTarget } from '../../components/ui/Icons.jsx'

const ROLLEN = [
  {
    id: 'lead', name: 'Lead Analyst:in',
    rechte: ['Analyse bearbeiten und intern freigeben', 'Für Kunden freigeben', 'Interne Notizen lesen und schreiben', 'Berichte erstellen und finalisieren'],
  },
  {
    id: 'analyst', name: 'Analyst:in',
    rechte: ['Analyse bearbeiten', 'Intern freigeben', 'Interne Notizen lesen und schreiben', 'Keine Kundenfreigabe'],
  },
  {
    id: 'social', name: 'Social & Content',
    rechte: ['Social-Auswertung bearbeiten', 'Teilberichte erstellen', 'Interne Notizen lesen', 'Keine Kundenfreigabe'],
  },
  {
    id: 'kunde', name: 'Kundenzugang',
    rechte: ['Freigegebene Analysepunkte lesen', 'Aufgaben der eigenen Seite bearbeiten', 'Dokumente hochladen', 'Keine internen Notizen, keine anderen Mandanten'],
  },
]

const STATUS = {
  ready: { label: 'Connector vorbereitet', tone: 'accent' },
  planned: { label: 'Geplant', tone: 'neutral' },
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { echteAuthentifizierung } = useSession()
  const toast = useToast()
  const [hinweise, setHinweise] = useState(true)
  const [freigabeErinnerung, setFreigabeErinnerung] = useState(true)
  const [filter, setFilter] = useState('Alle')

  const categories = useMemo(() => ['Alle', ...new Set(EXTENSIONS.map((item) => item.category))], [])
  const sichtbareExtensions = filter === 'Alle' ? EXTENSIONS : EXTENSIONS.filter((item) => item.category === filter)
  const vorbereitet = EXTENSIONS.filter((item) => item.status === 'ready').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Einstellungen & Extensions"
        subtitle="Rollen, Datenquellen, Automatisierung und Plattform-Fähigkeiten für den produktiven SYMMEDIS-Betrieb."
      />

      <Banner toneName={echteAuthentifizierung ? 'ok' : 'warn'} icon={IconShield} title={echteAuthentifizierung ? 'Produktionsfähige Zugriffsschicht aktiv' : 'Demo-Modus aktiv'}>
        {echteAuthentifizierung
          ? 'Authentifizierung und Mandantentrennung laufen über Supabase RLS. Externe Connectoren werden erst als verbunden markiert, wenn OAuth/Secrets tatsächlich konfiguriert wurden.'
          : 'Ohne Supabase-Umgebungsvariablen bleibt SYMMEDIS absichtlich im Demo-Modus. Externe Connectoren werden nicht als live dargestellt.'}
      </Banner>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Connectoren" value={EXTENSIONS.length} icon={IconLink} hint="priorisierte Integrationen" />
        <MetricCard label="Vorbereitet" value={vorbereitet} icon={IconCheck} toneName="ok" hint="bereit für Provider-Konfiguration" />
        <MetricCard label="Plattform-Extensions" value={PLATFORM_EXTENSIONS.length} icon={IconLayers} toneName="accent" hint="Postgres/Supabase-Fähigkeiten" />
        <MetricCard label="Security Boundary" value="RLS" icon={IconShield} toneName="brand" hint="Tenant-basierte Datenfreigabe" />
      </div>

      <Card>
        <CardHeader title="Extension Hub" subtitle="Priorisierte Datenquellen und Automationen – Status zeigt technische Vorbereitung, nicht eine vorgetäuschte Live-Verbindung." icon={IconLink} />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2" aria-label="Extension-Kategorien filtern">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${filter === category ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink-2 hover:bg-surface-muted'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {sichtbareExtensions.map((extension) => {
              const status = STATUS[extension.status] || STATUS.planned
              return (
                <div key={extension.id} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{extension.name}</p>
                      <p className="mt-0.5 text-xs text-ink-3">{extension.category}</p>
                    </div>
                    <Chip size="sm" toneName={status.tone}>{status.label}</Chip>
                  </div>
                  <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-2">{extension.value}</p>
                </div>
              )
            })}
          </div>

          <p className="text-xs leading-relaxed text-ink-3">
            Provider-Zugangsdaten gehören ausschließlich in serverseitige Secrets/OAuth-Stores. In der Datenbank werden nur Connection-Metadaten, Sync-Status und Scopes gespeichert.
          </p>
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader title="Plattform-Fähigkeiten" subtitle="Aktive Datenbank-Extensions für Suche, Retrieval und Automatisierung" icon={IconLayers} />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {PLATFORM_EXTENSIONS.map((extension) => (
                <li key={extension.id} className="flex items-start justify-between gap-4 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-[0.875rem] font-semibold text-ink">{extension.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-3">{extension.value}</p>
                  </div>
                  <Chip size="sm" toneName="ok">Aktiv</Chip>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Produkt-Prinzipien" subtitle="Nicht verhandelbare Qualitätsgrenzen" icon={IconTarget} />
          <CardBody className="space-y-3">
            {[
              'KI-Ergebnisse werden niemals automatisch kundensichtbar.',
              'Confidence muss aus realer Beleglage kommen, nicht aus UI-Heuristiken.',
              'Connectoren gelten erst als verbunden, wenn Auth und Sync verifiziert sind.',
              'Service-Keys und Provider-Secrets bleiben serverseitig.',
              'Jede Kundenfreigabe ist tenantgebunden und auditierbar.',
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-line bg-surface-muted p-3 text-[0.8125rem] text-ink-2">
                <IconCheck className="mt-0.5 size-4 shrink-0 text-ok-ink" />
                <span>{item}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Rollen und Rechte" subtitle="Wer darf was sehen und freigeben" icon={IconUsers} />
          <CardBody className="px-0 py-0">
            <ul className="divide-y divide-line">
              {ROLLEN.map((rolle) => (
                <li key={rolle.id} className="px-4 py-4 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.875rem] font-semibold text-ink">{rolle.name}</p>
                    <Chip size="sm" toneName={rolle.id === 'kunde' ? 'brand' : 'accent'}>{rolle.id === 'kunde' ? 'Extern' : 'Intern'}</Chip>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {rolle.rechte.map((recht) => {
                      const verneint = recht.startsWith('Keine')
                      return (
                        <li key={recht} className="flex items-start gap-2 text-[0.8125rem] text-ink-2">
                          {verneint ? <IconClose className="mt-0.5 size-3.5 shrink-0 text-danger-ink" /> : <IconCheck className="mt-0.5 size-3.5 shrink-0 text-ok-ink" />}
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
            <CardHeader title="Persönliche Einstellungen" />
            <CardBody className="space-y-4">
              <Toggle checked={theme === 'dark'} onChange={toggleTheme} label="Dunkler Modus" description="Wirkt auf die gesamte Anwendung." />
              <Toggle
                checked={hinweise}
                onChange={(wert) => {
                  setHinweise(wert)
                  toast.show({ title: wert ? 'Hinweise aktiviert' : 'Hinweise deaktiviert', description: 'Persistente Notification Preferences sind im Backend vorbereitet.' })
                }}
                label="Hinweise im Benachrichtigungszentrum"
                description="Neue Dokumente, offene Freigaben, überfällige Aufgaben."
              />
              <Toggle checked={freigabeErinnerung} onChange={setFreigabeErinnerung} label="Erinnerung vor Ergebnisterminen" description="Drei Tage vor dem Termin, wenn noch Freigaben offen sind." />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Team" icon={IconUsers} />
            <CardBody className="px-0 py-0">
              <ul className="divide-y divide-line">
                {TEAM.map((mitglied) => (
                  <li key={mitglied.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <p className="text-[0.8125rem] font-medium text-ink">{mitglied.name}</p>
                      <p className="text-xs text-ink-3">{mitglied.rolle}</p>
                    </div>
                    <Chip size="sm" toneName="accent">Intern</Chip>
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
