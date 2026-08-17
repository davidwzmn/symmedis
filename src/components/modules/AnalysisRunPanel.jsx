import { useState } from 'react'
import { runProjectAnalysis } from '../../lib/analysisRunApi.js'
import { useSession } from '../../hooks/useSession.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { useToast } from '../../hooks/useToast.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, Banner } from '../ui/layout.jsx'
import { Textarea } from '../ui/forms.jsx'
import { IconDocument, IconShield, IconSparkles } from '../ui/Icons.jsx'

const paidAiEnabled = import.meta.env.VITE_AI_ENABLED === 'true'

export function AnalysisRunPanel({ kunde }) {
  const { accessToken } = useSession()
  const { echteDaten, neuLaden } = useWorkspace()
  const toast = useToast()
  const [context, setContext] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  if (!echteDaten) return null

  const start = async () => {
    if (!paidAiEnabled) {
      toast.show({
        title: 'KI-Kosten sind gesperrt',
        description: 'Bezahlte Analyse-Runs sind für die Aufbauphase deaktiviert. Sie werden erst für den finalen E2E-Test bewusst freigeschaltet.',
        variant: 'info',
      })
      return
    }

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
        action={<Chip toneName={paidAiEnabled ? 'brand' : 'neutral'} size="sm">{paidAiEnabled ? 'Human-in-the-loop' : 'KI-Kosten gesperrt'}</Chip>}
      />
      <CardBody className="space-y-4">
        <Banner toneName={paidAiEnabled ? 'info' : 'warning'} icon={IconShield} title={paidAiEnabled ? 'Kontrollierter Analyse-Run' : 'Kosten-Schutz aktiv'}>
          {paidAiEnabled
            ? 'Die Engine verarbeitet freigegebene Projektquellen, erzeugt zehn strukturierte Findings und markiert unsichere Aussagen mit niedriger Confidence. Erst die Prüfung durch das SYMMEDIS-Team kann Inhalte für Kunden sichtbar machen.'
            : 'Bezahlte KI-Aufrufe sind in dieser Umgebung bewusst deaktiviert. Alle Produkt-, Auth-, Storage-, RLS-, Reporting- und Planungsfunktionen können ohne Anthropic-Kosten getestet werden.'}
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
          <p className="text-xs text-ink-3">TXT und CSV können kostenlos indexiert werden. PDF-KI-Extraktion und Analyse-Runs bleiben bis zur finalen Freigabe gesperrt.</p>
          <Button onClick={start} disabled={running || !kunde.projectId || !paidAiEnabled}>
            <IconSparkles className="size-4" />
            {running ? 'Analyse läuft …' : paidAiEnabled ? (kunde.analyse.length ? 'Analyse neu ausführen' : 'Analyse starten') : 'KI-Analyse gesperrt'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
