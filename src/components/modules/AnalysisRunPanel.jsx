import { useState } from 'react'
import { runProjectAnalysis } from '../../lib/analysisRunApi.js'
import { useSession } from '../../hooks/useSession.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner } from '../ui/layout.jsx'
import { Textarea } from '../ui/forms.jsx'
import { IconDocument, IconShield, IconSparkles } from '../ui/Icons.jsx'

export function AnalysisRunPanel({ kunde }) {
  const { accessToken } = useSession()
  const { echteDaten, neuLaden } = useWorkspace()
  const toast = useToast()
  const [context, setContext] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  if (!echteDaten) return null

  const start = async () => {
    setRunning(true)
    setError(null)
    try {
      const result = await runProjectAnalysis(accessToken, kunde.projectId, context)
      await neuLaden()
      toast.show({
        title: 'Analyse erzeugt',
        description: `${result.findings ?? 10} Findings aus ${result.sourceDocuments ?? 0} ausgelesenen Quelldokumenten. Alle Ergebnisse warten auf menschliche Prüfung.`,
        variant: 'success',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analyse konnte nicht gestartet werden.'
      setError(message)
      toast.show({ title: 'Analyse fehlgeschlagen', description: message, variant: 'danger' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="border-brand-border">
      <CardHeader
        title="SYMMEDIS Analyse-Engine"
        subtitle="Evidenzbasierter Entwurf · niemals automatische Kundenfreigabe"
        icon={IconSparkles}
        action={<Chip toneName="brand" size="sm">Human-in-the-loop</Chip>}
      />
      <CardBody className="space-y-4">
        <Banner toneName="info" icon={IconShield} title="Kontrollierter Analyse-Run">
          Die Engine verarbeitet freigegebene Projektquellen, erzeugt zehn strukturierte Findings und markiert unsichere Aussagen mit niedriger Confidence. Erst die Prüfung durch das SYMMEDIS-Team kann Inhalte für Kunden sichtbar machen.
        </Banner>
        <div className="flex flex-wrap gap-2 text-xs text-ink-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-muted px-2.5 py-1.5">
            <IconDocument className="size-3.5" />
            {kunde.dokumente.length} Projektdokumente
          </span>
          <span className="rounded-md border border-line bg-surface-muted px-2.5 py-1.5">{kunde.analyse.length}/10 Findings vorhanden</span>
        </div>
        <Textarea
          label="Analystenbriefing"
          hint="Optional: Ziel, aktuelle Situation, Hypothesen oder Besonderheiten, die bei diesem Run berücksichtigt werden sollen."
          rows={4}
          maxLength={8000}
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Beispiel: Fokus auf die Ursache für stagnierende Neukundenanfragen im DACH-Vertrieb …"
        />
        {error ? <p className="text-sm text-danger-ink">{error}</p> : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ink-3">PDF, TXT und CSV werden aktuell direkt als Analysequelle gelesen; weitere Formate bleiben als Projektkontext sichtbar.</p>
          <Button onClick={start} disabled={running || !kunde.projectId}>
            <IconSparkles className="size-4" />
            {running ? 'Analyse läuft …' : kunde.analyse.length ? 'Analyse neu ausführen' : 'Analyse starten'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
