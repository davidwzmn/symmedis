import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { formatDate, formatTime } from '../../lib/format.js'
import { cn } from '../../lib/cn.js'
import { tone } from '../../lib/tone.js'
import { Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, PageHeader, Banner } from '../../components/ui/layout.jsx'
import { SearchInput, Select } from '../../components/ui/forms.jsx'
import { IconHistory, IconShield } from '../../components/ui/Icons.jsx'

/**
 * Prüfpfad über alle Projekte.
 *
 * Jeder Schritt bleibt nachvollziehbar: wer hat wann was getan. Das ist die
 * Grundlage dafür, dass die Bewertung nicht als Blackbox erscheint.
 */
export function AuditPage() {
  const { kunden } = useWorkspace()
  const [kunde, setKunde] = useState('alle')
  const [suche, setSuche] = useState('')

  const eintraege = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunden
      .flatMap((k) => k.aktivitaet.map((e) => ({ ...e, kunde: k })))
      .filter((e) => (kunde === 'alle' || e.kunde.id === kunde))
      .filter((e) => !q || e.titel.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.zeit) - new Date(a.zeit))
  }, [kunden, kunde, suche])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aktivitäten"
        subtitle={`${eintraege.length} Einträge im Prüfpfad. Der Verlauf zeigt, welcher Schritt von der Software vorbereitet und welcher vom Team verantwortet wurde.`}
      />

      <Banner toneName="info" icon={IconShield} title="Warum der Prüfpfad zählt">
        Für jede Bewertung ist nachvollziehbar, wer sie geprüft und freigegeben hat. Genau das
        unterscheidet eine geprüfte Analyse von einer automatisch erzeugten Auswertung.
      </Banner>

      <Card>
        <CardHeader title="Verlauf" icon={IconHistory} />
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <SearchInput
            value={suche}
            onChange={(event) => setSuche(event.target.value)}
            placeholder="Vorgang oder Person …"
            label="Prüfpfad durchsuchen"
            className="flex-1"
          />
          <Select
            label="Projekt"
            value={kunde}
            onChange={(event) => setKunde(event.target.value)}
            className="sm:w-60"
            required
          >
            <option value="alle">Alle Projekte</option>
            {kunden.map((k) => (
              <option key={k.id} value={k.id}>
                {k.unternehmen}
              </option>
            ))}
          </Select>
        </CardBody>

        <div className="border-t border-line">
          {eintraege.length === 0 ? (
            <EmptyState
              icon={IconHistory}
              title="Keine Einträge"
              description="Für diese Auswahl liegt kein Verlauf vor."
            />
          ) : (
            <ul className="divide-y divide-line">
              {eintraege.map((eintrag) => (
                <li
                  key={`${eintrag.kunde.id}-${eintrag.id}`}
                  className="flex items-start gap-3 px-4 py-3.5 sm:px-5"
                >
                  <span
                    aria-hidden="true"
                    className={cn('mt-1.5 size-2 shrink-0 rounded-full', tone(eintrag.tone).dot)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.8125rem] font-medium text-ink">{eintrag.titel}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-3">
                      <Link
                        to={`/intern/kunden/${eintrag.kunde.id}`}
                        className="font-medium text-brand-ink hover:underline"
                      >
                        {eintrag.kunde.kurz}
                      </Link>
                      <span aria-hidden="true">·</span>
                      <span>{eintrag.actor}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {formatDate(eintrag.zeit)}, {formatTime(eintrag.zeit)} Uhr
                      </span>
                    </p>
                  </div>
                  <Chip size="sm" toneName={eintrag.actor === 'Diagnosis OS' ? 'brand' : 'neutral'}>
                    {eintrag.actor === 'Diagnosis OS' ? 'Software' : 'Mensch'}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  )
}
