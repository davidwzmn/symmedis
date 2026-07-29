import { formatRelative } from '../../lib/format.js'
import { Card, CardBody, CardHeader, EmptyState } from '../ui/layout.jsx'
import { Timeline } from '../ui/data.jsx'
import { IconHistory } from '../ui/Icons.jsx'

/**
 * Aktivitätsverlauf des Projekts.
 * Im Mitarbeiterportal zusätzlich als Prüfpfad lesbar (wer hat wann was getan).
 */
export function ActivityFeed({ kunde, titel = 'Aktivitäten', limit, alsPruefpfad = false }) {
  const eintraege = limit ? kunde.aktivitaet.slice(0, limit) : kunde.aktivitaet

  return (
    <Card>
      <CardHeader
        title={titel}
        subtitle={alsPruefpfad ? 'Nachvollziehbarer Verlauf aller Schritte' : undefined}
        icon={IconHistory}
      />
      <CardBody>
        {eintraege.length === 0 ? (
          <EmptyState
            compact
            icon={IconHistory}
            title="Noch keine Aktivitäten"
            description="Sobald die Analyse startet, erscheinen hier alle Schritte."
          />
        ) : (
          <Timeline
            items={eintraege.map((eintrag) => ({
              id: eintrag.id,
              title: eintrag.titel,
              actor: eintrag.actor,
              time: formatRelative(eintrag.zeit),
              tone: eintrag.tone,
            }))}
          />
        )}
      </CardBody>
    </Card>
  )
}
