import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { KATEGORIEN, KATEGORIE_MAP } from '../../data/catalog.js'
import { scoreStufe, tone } from '../../lib/tone.js'
import { cn } from '../../lib/cn.js'
import { Button, Chip } from '../../components/ui/primitives.jsx'
import { Card, CardBody, CardHeader, PageHeader, Banner, EmptyState } from '../../components/ui/layout.jsx'
import { Segmented } from '../../components/ui/forms.jsx'
import { BarList } from '../../components/viz/charts.jsx'
import { IconChart, IconInfo } from '../../components/ui/Icons.jsx'

function score(value) {
  const zahl = Number(value)
  return Number.isFinite(zahl) ? Math.max(0, Math.min(100, zahl)) : null
}

export function AnalysesPage() {
  const { kunden } = useWorkspace()
  const navigate = useNavigate()
  const [ansicht, setAnsicht] = useState('matrix')

  const kundenMitAnalyse = useMemo(() => kunden.filter((kunde) => kunde.analyse?.length > 0), [kunden])
  const durchschnitt = useMemo(() => KATEGORIEN.map((kategorie) => {
    const werte = kundenMitAnalyse
      .map((kunde) => score(kunde.analyse.find((a) => a.kategorieId === kategorie.id)?.score))
      .filter((wert) => wert !== null)
    return {
      label: kategorie.label,
      value: werte.length ? Math.round(werte.reduce((summe, wert) => summe + wert, 0) / werte.length) : 0,
      sample: werte.length,
    }
  }), [kundenMitAnalyse])

  const dimensionenMitDaten = durchschnitt.filter((item) => item.sample > 0)
  const schwaechste = [...dimensionenMitDaten].sort((a, b) => a.value - b.value)[0] || null

  if (kunden.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analysen" subtitle="Portfoliovergleich über alle laufenden Kundenprojekte." />
        <Card><EmptyState icon={IconChart} title="Noch keine Kundenprojekte" description="Sobald der erste Kunden-Tenant mit Analyseprojekt angelegt ist, entsteht hier der organisationsweite Quervergleich." /></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysen"
        subtitle={`${kundenMitAnalyse.length} von ${kunden.length} Projekten mit Analysewerten · Quervergleich nur über tatsächlich vorhandene Dimensionen.`}
        actions={<Segmented label="Ansicht wählen" value={ansicht} onChange={setAnsicht} options={[{ value: 'matrix', label: 'Matrix' }, { value: 'mittel', label: 'Portfolio' }]} />}
      />

      {schwaechste ? (
        <Banner toneName="info" icon={IconInfo} title="Muster im Portfolio">
          Schwächste belastbar vergleichbare Dimension: <strong>{schwaechste.label}</strong> mit einem Mittelwert von {schwaechste.value} aus {schwaechste.sample} {schwaechste.sample === 1 ? 'Projekt' : 'Projekten'}. Das ist ein Portfolio-Hinweis, keine Aussage über Projekte ohne Daten.
        </Banner>
      ) : (
        <Banner toneName="neutral" icon={IconInfo} title="Vergleich startet mit den ersten Bewertungen">
          Kundenprojekte sind vorhanden, aber noch keine vergleichbaren Analysedimensionen. Fehlende Werte werden bewusst nicht als Nullwertung interpretiert.
        </Banner>
      )}

      {ansicht === 'mittel' ? (
        <Card>
          <CardHeader title="Mittelwerte je Dimension" subtitle="Nur vorhandene Bewertungen; fehlende Dimensionen fließen nicht als 0 ein" icon={IconChart} />
          <CardBody>
            {dimensionenMitDaten.length ? <BarList items={dimensionenMitDaten} max={100} /> : <EmptyState compact icon={IconChart} title="Noch keine Vergleichswerte" description="Sobald mindestens eine Dimension bewertet wurde, erscheint hier der Portfoliovergleich." />}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader title="Analysematrix" subtitle="Zeile = Projekt, Spalte = Dimension. „–“ bedeutet: noch keine Bewertung vorhanden." />
          <CardBody className="px-0 py-0">
            <div className="scroll-area overflow-x-auto">
              <table className="w-full min-w-[56rem] border-collapse text-sm">
                <caption className="sr-only">Reifegrade aller Projekte über die Analysedimensionen; fehlende Bewertungen werden mit Gedankenstrich dargestellt.</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="sticky left-0 z-10 bg-surface px-4 py-2.5 text-left text-xs font-semibold text-ink-2 sm:px-5">Projekt</th>
                    {KATEGORIEN.map((kategorie) => <th key={kategorie.id} scope="col" className="px-2 py-2.5 text-center text-xs font-semibold text-ink-2">{kategorie.kurz}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {kunden.map((kunde) => {
                    const gesamt = score(kunde.gesamtScore)
                    return (
                      <tr key={kunde.id} tabIndex={0} role="link" onClick={() => navigate(`/intern/kunden/${kunde.id}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/intern/kunden/${kunde.id}`) } }} className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand">
                        <th scope="row" className="sticky left-0 z-10 bg-surface px-4 py-3 text-left sm:px-5"><span className="block text-[0.8125rem] font-medium text-ink">{kunde.kurz || kunde.unternehmen || 'Projekt'}</span><span className="block text-xs text-ink-3">Gesamt {gesamt === null || !kunde.analyse?.length ? '–' : gesamt}</span></th>
                        {KATEGORIEN.map((kategorie) => {
                          const wert = score(kunde.analyse?.find((a) => a.kategorieId === kategorie.id)?.score)
                          if (wert === null) return <td key={kategorie.id} className="px-2 py-3 text-center"><span className="text-xs text-ink-3" title={`${KATEGORIE_MAP[kategorie.id]?.label || kategorie.label}: noch nicht bewertet`}>–</span></td>
                          const stufe = scoreStufe(wert)
                          return <td key={kategorie.id} className="px-2 py-3 text-center"><span title={`${KATEGORIE_MAP[kategorie.id]?.label || kategorie.label}: ${wert} (${stufe.label})`} className={cn('tabular inline-flex h-7 w-11 items-center justify-center rounded-md border text-xs font-semibold', tone(stufe.tone).chip)}>{wert}</span></td>
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3 sm:px-5">
            <span className="text-xs text-ink-3">Bewertungsstufen:</span>
            {[{ label: 'Kritisch (0–39)', tone: 'danger' }, { label: 'Auffällig (40–57)', tone: 'warn' }, { label: 'Solide (58–74)', tone: 'info' }, { label: 'Stark (ab 75)', tone: 'ok' }].map((stufe) => <Chip key={stufe.label} size="sm" toneName={stufe.tone}>{stufe.label}</Chip>)}
            {kundenMitAnalyse.length < kunden.length ? <Button variant="ghost" size="xs" onClick={() => navigate('/intern/kunden')}>{kunden.length - kundenMitAnalyse} Projekt{kunden.length - kundenMitAnalyse === 1 ? '' : 'e'} ohne Analyse</Button> : null}
          </div>
        </Card>
      )}
    </div>
  )
}
