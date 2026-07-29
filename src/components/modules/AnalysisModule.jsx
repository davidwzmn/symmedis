import { useMemo, useState } from 'react'
import { cn } from '../../lib/cn.js'
import { KATEGORIEN, KATEGORIE_MAP } from '../../data/catalog.js'
import { FREIGABE, PRIORITAETEN, scoreStufe, tone } from '../../lib/tone.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState, Banner } from '../ui/layout.jsx'
import { Drawer } from '../ui/overlays.jsx'
import { Select, Textarea, Segmented } from '../ui/forms.jsx'
import { RadarChart, ScoreBar } from '../viz/charts.jsx'
import {
  IconAlert,
  IconCheckCircle,
  IconEye,
  IconEyeOff,
  IconLock,
  IconNote,
  IconSparkles,
} from '../ui/Icons.jsx'

/**
 * Analysemodul.
 *
 * rolle = 'kunde' → nur freigegebene Punkte, ohne interne Notizen
 * rolle = 'intern' → alle Punkte, Editor und Freigabeprozess
 * rolle = 'demo'  → alle Punkte, aber schreibgeschützt
 */
export function AnalysisModule({ kunde, rolle = 'kunde' }) {
  const [auswahl, setAuswahl] = useState(null)
  const [filter, setFilter] = useState('alle')

  const eintraege = useMemo(() => {
    const basis = rolle === 'kunde' ? kunde.analyse.filter((a) => a.sichtbarKunde) : kunde.analyse
    if (filter === 'kritisch') return basis.filter((a) => a.score < 58)
    if (filter === 'offen') return basis.filter((a) => a.freigabe !== 'kunde')
    return basis
  }, [kunde.analyse, rolle, filter])

  const sortiert = useMemo(() => [...eintraege].sort((a, b) => a.score - b.score), [eintraege])

  const achsen = KATEGORIEN.map((k) => ({ kurz: k.kurz, label: k.label }))
  const serie = KATEGORIEN.map((k) => kunde.analyse.find((a) => a.kategorieId === k.id)?.score ?? 0)
  const median = [58, 54, 52, 56, 60, 55, 48, 53, 51, 57]

  const nichtFreigegeben = kunde.analyse.length - kunde.analyse.filter((a) => a.sichtbarKunde).length

  return (
    <div className="min-w-0 space-y-5">
      {rolle === 'kunde' && nichtFreigegeben > 0 ? (
        <Banner toneName="info" icon={IconLock} title="Analyse in Prüfung">
          {nichtFreigegeben} von {kunde.analyse.length} Punkten werden aktuell noch vom SYMMEDIS-Team
          geprüft und erscheinen hier, sobald sie freigegeben sind.
        </Banner>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
        {/* Liste */}
        <Card>
          <CardHeader
            title="Analysedimensionen"
            subtitle={`${sortiert.length} von ${KATEGORIEN.length} Dimensionen · aufsteigend nach Score`}
            action={
              <Segmented
                size="sm"
                label="Analyse filtern"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'alle', label: 'Alle' },
                  { value: 'kritisch', label: 'Auffällig' },
                  ...(rolle === 'intern' ? [{ value: 'offen', label: 'Offen' }] : []),
                ]}
              />
            }
          />
          <CardBody className="px-0 py-0">
            {sortiert.length === 0 ? (
              <EmptyState
                icon={IconLock}
                title="Noch keine Ergebnisse freigegeben"
                description="Sobald das SYMMEDIS-Team die Bewertung geprüft hat, erscheinen die Punkte hier."
              />
            ) : (
              <ul className="divide-y divide-line">
                {sortiert.map((eintrag) => {
                  const kategorie = KATEGORIE_MAP[eintrag.kategorieId]
                  const freigabe = FREIGABE[eintrag.freigabe]
                  return (
                    <li key={eintrag.kategorieId}>
                      <button
                        type="button"
                        onClick={() => setAuswahl(eintrag.kategorieId)}
                        className="w-full px-4 py-3.5 text-left transition-colors hover:bg-surface-muted sm:px-5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <ScoreBar
                              score={eintrag.score}
                              label={kategorie.label}
                              sublabel={eintrag.beobachtung}
                            />
                          </div>
                        </div>
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <Chip size="sm" toneName={PRIORITAETEN[eintrag.prioritaet].tone}>
                            Priorität {PRIORITAETEN[eintrag.prioritaet].label}
                          </Chip>
                          <Chip size="sm" toneName="neutral">
                            {kategorie.gruppe}
                          </Chip>
                          {rolle === 'intern' ? (
                            <Chip size="sm" toneName={freigabe.tone}>
                              {freigabe.kurz}
                            </Chip>
                          ) : null}
                          {rolle === 'intern' && eintrag.internNotiz ? (
                            <Chip size="sm" toneName="warn" icon={IconNote}>
                              Interne Notiz
                            </Chip>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* Profil */}
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Analyseprofil" subtitle="Alle zehn Dimensionen im Vergleich" />
            <CardBody>
              <RadarChart axes={achsen} series={serie} compare={median} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Verteilung" />
            <CardBody className="space-y-3">
              {['kritisch', 'auffaellig', 'solide', 'stark'].map((stufe) => {
                const anzahl = kunde.analyse.filter((a) => scoreStufe(a.score).key === stufe).length
                const info = { kritisch: 'Kritisch', auffaellig: 'Auffällig', solide: 'Solide', stark: 'Stark' }
                const tonName = { kritisch: 'danger', auffaellig: 'warn', solide: 'info', stark: 'ok' }[stufe]
                return (
                  <div key={stufe} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-[0.8125rem] text-ink-2">
                      <span aria-hidden="true" className={cn('size-2 rounded-full', tone(tonName).dot)} />
                      {info[stufe]}
                    </span>
                    <span className="tabular text-[0.8125rem] font-semibold text-ink">{anzahl}</span>
                  </div>
                )
              })}
            </CardBody>
          </Card>
        </div>
      </div>

      <AnalyseDetail
        kunde={kunde}
        kategorieId={auswahl}
        rolle={rolle}
        onClose={() => setAuswahl(null)}
      />
    </div>
  )
}

/* --------------------------------------------------------- Detail / Editor */

function AnalyseDetail({ kunde, kategorieId, rolle, onClose }) {
  const { setAnalyseFeld, setFreigabe } = useWorkspace()
  const toast = useToast()
  const eintrag = kunde.analyse.find((a) => a.kategorieId === kategorieId)
  const kategorie = kategorieId ? KATEGORIE_MAP[kategorieId] : null

  if (!eintrag || !kategorie) {
    return <Drawer open={false} onClose={onClose} title="" />
  }

  const stufe = scoreStufe(eintrag.score)
  const bearbeitbar = rolle === 'intern'

  const felder = [
    { key: 'beobachtung', label: 'Beobachtung' },
    { key: 'ursache', label: 'Ursache' },
    { key: 'auswirkung', label: 'Auswirkung' },
    { key: 'beleg', label: 'Beleg' },
    { key: 'empfehlung', label: 'Empfehlung' },
  ]

  return (
    <Drawer
      open={Boolean(kategorieId)}
      onClose={onClose}
      width="lg"
      title={kategorie.label}
      subtitle={kategorie.frage}
      footer={
        bearbeitbar ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-3">
              Interne Notizen erscheinen nie im Kundenportal.
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFreigabe(kunde.id, kategorie.id, 'intern')
                  toast.show({ title: 'Intern freigegeben', variant: 'success' })
                }}
              >
                Intern freigeben
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setFreigabe(kunde.id, kategorie.id, 'kunde')
                  toast.show({
                    title: 'Für Kunden freigegeben',
                    description: `${kategorie.label} ist jetzt im Kundenportal sichtbar.`,
                    variant: 'success',
                  })
                }}
              >
                Für Kunden freigeben
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-3">
            Bewertung durch das SYMMEDIS-Team geprüft · Beleg: {eintrag.beleg}
          </p>
        )
      }
    >
      <div className="space-y-5 px-5 py-5">
        {/* Kopf */}
        <div className="flex flex-wrap items-center gap-2">
          <Chip toneName={stufe.tone}>{stufe.label}</Chip>
          <Chip toneName={PRIORITAETEN[eintrag.prioritaet].tone}>
            Priorität {PRIORITAETEN[eintrag.prioritaet].label}
          </Chip>
          <Chip toneName="neutral">{kategorie.gruppe}</Chip>
          {rolle === 'intern' ? (
            <Chip toneName={FREIGABE[eintrag.freigabe].tone} icon={eintrag.sichtbarKunde ? IconEye : IconEyeOff}>
              {FREIGABE[eintrag.freigabe].label}
            </Chip>
          ) : null}
        </div>

        <div className="rounded-lg border border-line bg-surface-muted p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-ink-2">Reifegrad</span>
            <span className="tabular text-2xl font-semibold text-ink">{eintrag.score}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-viz-track">
            <div
              className={cn('h-full rounded-full', tone(stufe.tone).bar)}
              style={{ width: `${eintrag.score}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-3">
            0–39 kritisch · 40–57 auffällig · 58–74 solide · ab 75 stark
          </p>
        </div>

        {/* Felder */}
        {felder.map((feld) => (
          <div key={feld.key}>
            <h3 className="text-xs font-semibold text-ink-2">{feld.label}</h3>
            {bearbeitbar ? (
              <Textarea
                rows={feld.key === 'beleg' ? 2 : 3}
                value={eintrag[feld.key]}
                onChange={(e) => setAnalyseFeld(kunde.id, kategorie.id, { [feld.key]: e.target.value })}
                className="mt-1.5"
                aria-label={feld.label}
              />
            ) : (
              <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink">{eintrag[feld.key]}</p>
            )}
          </div>
        ))}

        {bearbeitbar ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Priorität"
                value={eintrag.prioritaet}
                onChange={(e) => setAnalyseFeld(kunde.id, kategorie.id, { prioritaet: e.target.value })}
              >
                {Object.entries(PRIORITAETEN).map(([key, wert]) => (
                  <option key={key} value={key}>
                    {wert.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Freigabestatus"
                value={eintrag.freigabe}
                onChange={(e) => setFreigabe(kunde.id, kategorie.id, e.target.value)}
              >
                {Object.entries(FREIGABE).map(([key, wert]) => (
                  <option key={key} value={key}>
                    {wert.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="rounded-lg border border-warn-border bg-warn-soft p-4">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-warn-ink">
                <IconLock className="size-3.5" />
                Interne Notiz – nicht für den Kunden sichtbar
              </h3>
              <Textarea
                rows={3}
                value={eintrag.internNotiz}
                placeholder="Nur für das SYMMEDIS-Team …"
                onChange={(e) => setAnalyseFeld(kunde.id, kategorie.id, { internNotiz: e.target.value })}
                className="mt-2"
                aria-label="Interne Notiz"
              />
            </div>
          </>
        ) : null}

        {rolle === 'kunde' ? (
          <div className="rounded-lg border border-brand-border bg-brand-soft p-4">
            <h3 className="flex items-center gap-2 text-xs font-semibold text-brand-ink">
              <IconCheckCircle className="size-3.5" />
              Menschlich geprüft
            </h3>
            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-2">
              Diese Bewertung wurde durch die Software strukturiert und anschließend vom
              SYMMEDIS-Team geprüft und freigegeben.
            </p>
          </div>
        ) : null}

        {rolle === 'demo' ? (
          <Banner toneName="neutral" icon={IconSparkles}>
            Demo-Ansicht: Bearbeitung und Freigabe stehen nur im Mitarbeiterportal zur Verfügung.
          </Banner>
        ) : null}
      </div>
    </Drawer>
  )
}

/* ---------------------------------------------------------- Umsatzbremsen */

/** Die drei größten Umsatzbremsen als priorisierte Karten. */
export function BremsenCards({ kunde, kompakt = false, onOeffnen }) {
  return (
    <div className={cn('grid min-w-0 gap-4', kompakt ? 'sm:grid-cols-3' : 'md:grid-cols-3')}>
      {kunde.bremsen.map((bremse) => {
        const stufe = scoreStufe(bremse.score)
        const prio = PRIORITAETEN[bremse.prioritaet]
        return (
          <Card key={bremse.id} className="flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-inverse text-xs font-semibold text-canvas">
                {bremse.rang}
              </span>
              <Chip size="sm" toneName={prio.tone} icon={bremse.prioritaet === 'hoch' ? IconAlert : undefined}>
                {prio.label}
              </Chip>
            </div>

            <h2 className="mt-3 text-[0.9375rem] font-semibold text-ink">{bremse.titel}</h2>
            <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-ink-2">
              {bremse.beschreibung}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs">
              <Chip size="sm" toneName={stufe.tone}>
                Score {bremse.score}
              </Chip>
              <span className="text-ink-3">{KATEGORIE_MAP[bremse.kategorieId].gruppe}</span>
            </div>

            {!kompakt ? (
              <div className="mt-3 border-t border-line pt-3">
                <p className="text-xs font-medium text-ink-2">Empfohlene nächste Aktion</p>
                <p className="mt-1 text-[0.8125rem] leading-snug text-ink">{bremse.naechsteAktion}</p>
              </div>
            ) : null}

            {onOeffnen ? (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 self-start"
                onClick={() => onOeffnen(bremse.kategorieId)}
              >
                Details ansehen
              </Button>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}

/** Kurzübersicht der Analysebereiche für Dashboards. */
export function AnalyseUebersicht({ kunde, kategorien, titel = 'Analyseübersicht' }) {
  const ids = kategorien ?? ['positionierung', 'verstaendlichkeit', 'website', 'social', 'vertrieb', 'marktaktivierung']
  return (
    <Card>
      <CardHeader title={titel} subtitle="Reifegrad je Bereich" />
      <CardBody className="space-y-3.5">
        {ids.map((id) => {
          const eintrag = kunde.analyse.find((a) => a.kategorieId === id)
          if (!eintrag) return null
          return <ScoreBar key={id} score={eintrag.score} label={KATEGORIE_MAP[id].label} />
        })}
      </CardBody>
    </Card>
  )
}
