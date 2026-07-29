import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { PROJEKT_STATUS, TEAM, TEAM_MAP } from '../../data/workspace.js'
import { formatDate, tageBis } from '../../lib/format.js'
import { scoreStufe } from '../../lib/tone.js'
import { Avatar, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, EmptyState, PageHeader } from '../../components/ui/layout.jsx'
import { DataTable, ProgressBar } from '../../components/ui/data.jsx'
import { SearchInput, Select } from '../../components/ui/forms.jsx'
import { IconBuilding } from '../../components/ui/Icons.jsx'

/** Kundenliste mit Filtern – Einstieg in jedes Projekt. */
export function ClientsPage() {
  const { kunden } = useWorkspace()
  const navigate = useNavigate()
  const [suche, setSuche] = useState('')
  const [status, setStatus] = useState('alle')
  const [betreuer, setBetreuer] = useState('alle')

  const zeilen = useMemo(() => {
    const q = suche.trim().toLowerCase()
    return kunden.filter((kunde) => {
      if (status !== 'alle' && kunde.status !== status) return false
      if (betreuer !== 'alle' && kunde.betreuerId !== betreuer) return false
      if (
        q &&
        !kunde.unternehmen.toLowerCase().includes(q) &&
        !kunde.branche.toLowerCase().includes(q) &&
        !kunde.ansprechpartner.name.toLowerCase().includes(q)
      ) {
        return false
      }
      return true
    })
  }, [kunden, suche, status, betreuer])

  const spalten = [
    {
      key: 'unternehmen',
      label: 'Kunde',
      render: (kunde) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar name={kunde.kurz} size="sm" />
          <span className="min-w-0">
            <span className="block truncate font-medium text-ink">{kunde.unternehmen}</span>
            <span className="block truncate text-xs text-ink-3">
              {kunde.branche} · {kunde.ort}
            </span>
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Phase',
      render: (kunde) => (
        <Chip size="sm" toneName={PROJEKT_STATUS[kunde.status].tone} dot>
          {PROJEKT_STATUS[kunde.status].label}
        </Chip>
      ),
    },
    {
      key: 'score',
      label: 'Reifegrad',
      hideBelow: 'lg',
      render: (kunde) => (
        <span className="flex items-center gap-2">
          <span className="tabular font-semibold text-ink">{kunde.gesamtScore}</span>
          <Chip size="sm" toneName={scoreStufe(kunde.gesamtScore).tone}>
            {scoreStufe(kunde.gesamtScore).label}
          </Chip>
        </span>
      ),
    },
    {
      key: 'fortschritt',
      label: 'Fortschritt',
      hideBelow: 'lg',
      render: (kunde) => (
        <span className="block w-28">
          <ProgressBar
            value={kunde.fortschritt}
            size="sm"
            hideLabel
            label={`Fortschritt ${kunde.unternehmen}`}
            animate={false}
          />
          <span className="tabular mt-1 block text-xs text-ink-3">{kunde.fortschritt} %</span>
        </span>
      ),
    },
    {
      key: 'freigaben',
      label: 'Freigaben offen',
      hideBelow: 'xl',
      align: 'center',
      render: (kunde) => {
        const offen = kunde.analyse.filter(
          (a) => a.freigabe === 'bearbeitet' || a.freigabe === 'intern',
        ).length
        return offen > 0 ? (
          <Chip size="sm" toneName="warn">
            {offen}
          </Chip>
        ) : (
          <span className="text-xs text-ink-3">–</span>
        )
      },
    },
    {
      key: 'betreuer',
      label: 'Betreuung',
      hideBelow: 'xl',
      render: (kunde) => (
        <span className="text-ink-2">{TEAM_MAP[kunde.betreuerId].name}</span>
      ),
    },
    {
      key: 'ergebnis',
      label: 'Ergebnistermin',
      hideBelow: 'md',
      align: 'right',
      render: (kunde) => {
        const tage = tageBis(kunde.ergebnis)
        return (
          <span className="block">
            <span className="block text-ink-2">{formatDate(kunde.ergebnis)}</span>
            <span
              className={
                tage < 0 ? 'block text-xs text-ink-3' : 'block text-xs font-medium text-warn-ink'
              }
            >
              {tage < 0 ? 'abgeschlossen' : `in ${tage} Tagen`}
            </span>
          </span>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kunden"
        subtitle={`${zeilen.length} von ${kunden.length} Projekten · Mandantenzugriff nur für das SYMMEDIS-Team`}
      />

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <SearchInput
            value={suche}
            onChange={(event) => setSuche(event.target.value)}
            placeholder="Unternehmen, Branche oder Ansprechpartner …"
            label="Kunden durchsuchen"
            className="flex-1"
          />
          <Select
            label="Phase"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="sm:w-52"
            required
          >
            <option value="alle">Alle Phasen</option>
            {Object.entries(PROJEKT_STATUS).map(([key, wert]) => (
              <option key={key} value={key}>
                {wert.label}
              </option>
            ))}
          </Select>
          <Select
            label="Betreuung"
            value={betreuer}
            onChange={(event) => setBetreuer(event.target.value)}
            className="sm:w-52"
            required
          >
            <option value="alle">Alle im Team</option>
            {TEAM.map((mitglied) => (
              <option key={mitglied.id} value={mitglied.id}>
                {mitglied.name}
              </option>
            ))}
          </Select>
        </CardBody>

        <div className="border-t border-line">
          <DataTable
            caption="Alle betreuten Kundenprojekte"
            columns={spalten}
            rows={zeilen}
            getKey={(kunde) => kunde.id}
            onRowClick={(kunde) => navigate(`/intern/kunden/${kunde.id}`)}
            empty={
              <EmptyState
                icon={IconBuilding}
                title="Keine Kunden in dieser Auswahl"
                description="Passen Sie Suche oder Filter an."
              />
            }
            renderCard={(kunde) => (
              <div className="flex items-start gap-3">
                <Avatar name={kunde.kurz} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8125rem] font-medium text-ink">
                    {kunde.unternehmen}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-3">
                    {kunde.branche} · {TEAM_MAP[kunde.betreuerId].name}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Chip size="sm" toneName={PROJEKT_STATUS[kunde.status].tone} dot>
                      {PROJEKT_STATUS[kunde.status].label}
                    </Chip>
                    <Chip size="sm" toneName={scoreStufe(kunde.gesamtScore).tone}>
                      Reifegrad {kunde.gesamtScore}
                    </Chip>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      </Card>
    </div>
  )
}
