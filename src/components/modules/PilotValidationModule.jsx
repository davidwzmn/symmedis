import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { fetchPilotValidationReviews, fetchPilotValidationScorecard, savePilotValidationReview } from '../../lib/pilotValidationApi.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Input, Select, Textarea } from '../ui/forms.jsx'
import { Card, CardBody, CardHeader, EmptyState, MetricCard } from '../ui/layout.jsx'
import { IconCheckSquare, IconHistory, IconShield, IconTarget } from '../ui/Icons.jsx'

const SIGNALS = [
  { value: 'unknown', label: 'Noch offen' },
  { value: 'no', label: 'Nein' },
  { value: 'weak', label: 'Schwach' },
  { value: 'medium', label: 'Mittel' },
  { value: 'strong', label: 'Stark' },
]

function percent(value) {
  if (value == null) return '–'
  return `${Math.round(Number(value) * 100)} %`
}

function hours(value) {
  if (value == null) return '–'
  const n = Number(value)
  if (!Number.isFinite(n)) return '–'
  if (n < 48) return `${n.toFixed(1)} h`
  return `${(n / 24).toFixed(1)} Tage`
}

const emptyReview = {
  reviewRound: 1,
  understandingScore: '',
  decisionClarityScore: '',
  humanReviewMaterialChange: null,
  decisionChanged: null,
  portalReturnCount: 0,
  willingnessToPay: 'unknown',
  renewalSignal: 'unknown',
  customerUnderstandingNote: '',
  decisionChangeNote: '',
  interviewerNote: '',
}

function BooleanField({ label, value, onChange }) {
  return <Select label={label} value={value == null ? '' : value ? 'yes' : 'no'} onChange={(event) => onChange(event.target.value === '' ? null : event.target.value === 'yes')}><option value="">Noch offen</option><option value="yes">Ja</option><option value="no">Nein</option></Select>
}

export function PilotValidationModule({ kunde }) {
  const { accessToken, session } = useSession()
  const toast = useToast()
  const [scorecard, setScorecard] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyReview)

  const load = useCallback(async () => {
    if (!accessToken || !kunde?.projectId) return
    setLoading(true)
    try {
      const [nextScorecard, nextReviews] = await Promise.all([
        fetchPilotValidationScorecard(accessToken, kunde.projectId),
        fetchPilotValidationReviews(accessToken, kunde.projectId),
      ])
      setScorecard(nextScorecard || null)
      setReviews(nextReviews || [])
      const nextRound = Math.min(12, Math.max(1, Number(nextReviews?.[0]?.review_round || 0) + 1))
      setForm((current) => ({ ...current, reviewRound: nextRound }))
    } catch (error) {
      toast.show({ title: 'Pilotmessung nicht geladen', description: error instanceof Error ? error.message : 'Die Validierungsdaten konnten nicht geladen werden.', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }, [accessToken, kunde?.projectId, toast])

  useEffect(() => { void load() }, [load])

  const latest = reviews[0] || null
  const evidenceLabel = useMemo(() => `${scorecard?.evidenceReadyFindings ?? 0}/${scorecard?.customerFindings ?? 0}`, [scorecard])

  const save = async (event) => {
    event.preventDefault()
    if (!accessToken || !session?.userId || saving) return
    setSaving(true)
    try {
      await savePilotValidationReview(accessToken, kunde.projectId, session.userId, {
        ...form,
        understandingScore: form.understandingScore === '' ? null : Number(form.understandingScore),
        decisionClarityScore: form.decisionClarityScore === '' ? null : Number(form.decisionClarityScore),
      })
      toast.show({ title: 'Pilot-Review gespeichert', description: 'Die qualitative Evidenz ist jetzt mit den Produktmetriken verknüpft.', variant: 'success' })
      await load()
    } catch (error) {
      toast.show({ title: 'Pilot-Review nicht gespeichert', description: error instanceof Error ? error.message : 'Bitte erneut versuchen.', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Card><CardBody><p className="text-sm text-ink-3">Pilot-Evidenz wird geladen …</p></CardBody></Card>

  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Zeit bis erstes Finding" value={hours(scorecard?.timeToFirstCustomerFindingHours)} icon={IconTarget} toneName={scorecard?.timeToFirstCustomerFindingHours == null ? 'neutral' : 'ok'} hint="Erstes kundensichtbares, freigegebenes Finding" />
      <MetricCard label="Evidenzstarke Findings" value={evidenceLabel} icon={IconShield} toneName={(scorecard?.evidenceReadyFindings || 0) > 0 ? 'ok' : 'neutral'} hint={percent(scorecard?.evidenceReadyRate)} />
      <MetricCard label="Finding → Entscheidung" value={hours(scorecard?.timeFindingToDecisionHours)} icon={IconHistory} toneName={scorecard?.timeFindingToDecisionHours == null ? 'neutral' : 'ok'} hint="Bis zum ersten finalen Report" />
      <MetricCard label="Maßnahmen abgeschlossen" value={`${scorecard?.completedLinkedActions ?? 0}/${scorecard?.linkedActions ?? 0}`} icon={IconCheckSquare} toneName={(scorecard?.completedLinkedActions || 0) > 0 ? 'ok' : 'neutral'} hint={percent(scorecard?.linkedActionCompletionRate)} />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader title="Pilot-Review" subtitle="Nur qualitative Evidenz erfassen, die nicht verlässlich aus Produktdaten ableitbar ist." icon={IconTarget} />
        <CardBody>
          <form className="space-y-4" onSubmit={save}>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Review-Runde" type="number" min="1" max="12" value={form.reviewRound} onChange={(event) => setForm({ ...form, reviewRound: Number(event.target.value) })} />
              <Select label="Verständnis: Warum stockt Wachstum?" value={form.understandingScore} onChange={(event) => setForm({ ...form, understandingScore: event.target.value })}><option value="">Noch offen</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</Select>
              <Select label="Entscheidungsklarheit" value={form.decisionClarityScore} onChange={(event) => setForm({ ...form, decisionClarityScore: event.target.value })}><option value="">Noch offen</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <BooleanField label="Finding nach Human Review wesentlich geändert?" value={form.humanReviewMaterialChange} onChange={(value) => setForm({ ...form, humanReviewMaterialChange: value })} />
              <BooleanField label="Hat SYMMEDIS eine Entscheidung verändert?" value={form.decisionChanged} onChange={(value) => setForm({ ...form, decisionChanged: value })} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Portal-Rückkehr zwischen Meetings" type="number" min="0" value={form.portalReturnCount} onChange={(event) => setForm({ ...form, portalReturnCount: Number(event.target.value) })} />
              <Select label="Zahlungsbereitschaft" value={form.willingnessToPay} onChange={(event) => setForm({ ...form, willingnessToPay: event.target.value })}>{SIGNALS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
              <Select label="Renewal-Signal" value={form.renewalSignal} onChange={(event) => setForm({ ...form, renewalSignal: event.target.value })}>{SIGNALS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
            </div>

            <Textarea rows={4} maxLength={2000} label="„Verstehen Sie jetzt besser, warum Wachstum stockt?“" value={form.customerUnderstandingNote} onChange={(event) => setForm({ ...form, customerUnderstandingNote: event.target.value })} />
            <Textarea rows={4} maxLength={2000} label="„Welche Entscheidung haben Sie durch SYMMEDIS anders getroffen?“" value={form.decisionChangeNote} onChange={(event) => setForm({ ...form, decisionChangeNote: event.target.value })} />
            <Textarea rows={3} maxLength={4000} label="Interne Pilotnotiz" value={form.interviewerNote} onChange={(event) => setForm({ ...form, interviewerNote: event.target.value })} />
            <div className="flex justify-end"><Button type="submit" disabled={saving} aria-busy={saving || undefined}>{saving ? 'Wird gespeichert …' : 'Pilot-Review speichern'}</Button></div>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Validierungsevidenz" subtitle="Keine erfundenen Ergebnisse: nur echte Produktdaten und dokumentierte Interviews." icon={IconShield} />
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Chip toneName={(scorecard?.measuredOutcomes || 0) > 0 ? 'ok' : 'neutral'}>{scorecard?.measuredOutcomes || 0} gemessene Outcomes</Chip>
            <Chip toneName={latest ? 'ok' : 'neutral'}>{latest ? `Review ${latest.review_round} vorhanden` : 'Noch kein Review'}</Chip>
          </div>
          {latest ? <div className="space-y-3 rounded-lg border border-line bg-surface-muted p-4 text-sm">
            <p><strong>Verständnis:</strong> {latest.understanding_score ? `${latest.understanding_score}/5` : 'offen'}</p>
            <p><strong>Entscheidungsklarheit:</strong> {latest.decision_clarity_score ? `${latest.decision_clarity_score}/5` : 'offen'}</p>
            <p><strong>Entscheidung verändert:</strong> {latest.decision_changed == null ? 'offen' : latest.decision_changed ? 'Ja' : 'Nein'}</p>
            <p><strong>Zahlungsbereitschaft:</strong> {SIGNALS.find((item) => item.value === latest.willingness_to_pay)?.label || latest.willingness_to_pay}</p>
            <p><strong>Renewal:</strong> {SIGNALS.find((item) => item.value === latest.renewal_signal)?.label || latest.renewal_signal}</p>
          </div> : <EmptyState compact icon={IconTarget} title="Noch keine qualitative Pilot-Evidenz" description="Nach dem nächsten echten Kundengespräch hier nur die tatsächlich beobachteten Signale dokumentieren." />}
          <p className="text-xs leading-relaxed text-ink-3">Weltklasse-Status bleibt offen, bis mindestens drei echte Kundenprojekte messbaren Entscheidungsnutzen zeigen. Diese Ansicht bereitet die Evidenz vor; sie ersetzt keine reale Validierung.</p>
        </CardBody>
      </Card>
    </div>
  </div>
}
