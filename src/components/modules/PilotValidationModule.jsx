import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { fetchPilotStartReadiness, fetchPilotValidationReviews, fetchPilotValidationScorecard, savePilotValidationReview } from '../../lib/pilotValidationApi.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Input, Select, Textarea } from '../ui/forms.jsx'
import { Banner, Card, CardBody, CardHeader, EmptyState, MetricCard } from '../ui/layout.jsx'
import { IconCheck, IconCheckSquare, IconClock, IconHistory, IconShield, IconTarget } from '../ui/Icons.jsx'

const SIGNALS = [
  { value: 'unknown', label: 'Noch offen' }, { value: 'no', label: 'Nein' }, { value: 'weak', label: 'Schwach' },
  { value: 'medium', label: 'Mittel' }, { value: 'strong', label: 'Stark' },
]
const emptyReview = { reviewRound: 1, understandingScore: '', decisionClarityScore: '', humanReviewMaterialChange: null, reviewedFindingsCount: '', materiallyChangedFindingsCount: '', decisionChanged: null, portalReturnCount: 0, willingnessToPay: 'unknown', renewalSignal: 'unknown', customerUnderstandingNote: '', decisionChangeNote: '', interviewerNote: '' }
const percent = (value) => value == null ? '–' : `${Math.round(Number(value) * 100)} %`
function hours(value) { if (value == null || !Number.isFinite(Number(value))) return '–'; const n = Number(value); return n < 48 ? `${n.toFixed(1)} h` : `${(n / 24).toFixed(1)} Tage` }
function BooleanField({ label, value, onChange }) { return <Select label={label} value={value == null ? '' : value ? 'yes' : 'no'} onChange={(event) => onChange(event.target.value === '' ? null : event.target.value === 'yes')}><option value="">Noch offen</option><option value="yes">Ja</option><option value="no">Nein</option></Select> }
function PhaseRow({ label, completed, total, rate }) { return <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-muted px-3 py-2.5 text-sm"><span className="font-medium text-ink">{label}</span><span className="tabular text-ink-2">{completed}/{total} · {percent(rate)}</span></div> }

export function PilotValidationModule({ kunde }) {
  const { accessToken, session } = useSession()
  const toast = useToast()
  const [scorecard, setScorecard] = useState(null)
  const [readiness, setReadiness] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyReview)

  const load = useCallback(async () => {
    if (!accessToken || !kunde?.projectId) { setLoading(false); setScorecard(null); setReadiness(null); setReviews([]); return }
    setLoading(true)
    try {
      const [nextScorecard, nextReadiness, nextReviews] = await Promise.all([
        fetchPilotValidationScorecard(accessToken, kunde.projectId),
        fetchPilotStartReadiness(accessToken, kunde.projectId),
        fetchPilotValidationReviews(accessToken, kunde.projectId),
      ])
      setScorecard(nextScorecard || null); setReadiness(nextReadiness || null); setReviews(nextReviews || [])
      setForm((current) => ({ ...current, reviewRound: Math.min(12, Math.max(1, Number(nextReviews?.[0]?.review_round || 0) + 1)) }))
    } catch (error) { toast.show({ title: 'Pilotmessung nicht geladen', description: error instanceof Error ? error.message : 'Die Validierungsdaten konnten nicht geladen werden.', variant: 'danger' }) }
    finally { setLoading(false) }
  }, [accessToken, kunde?.projectId, toast])
  useEffect(() => { void load() }, [load])

  const latest = reviews[0] || null
  const evidenceLabel = useMemo(() => `${scorecard?.evidenceReadyFindings ?? 0}/${scorecard?.customerFindings ?? 0}`, [scorecard])
  const passedReadiness = useMemo(() => readiness?.gates?.filter((gate) => gate.passed).length || 0, [readiness])
  const totalReadiness = readiness?.gates?.length || 0
  const save = async (event) => {
    event.preventDefault(); if (!accessToken || !session?.userId || saving) return; setSaving(true)
    try {
      await savePilotValidationReview(accessToken, kunde.projectId, session.userId, { ...form, understandingScore: form.understandingScore === '' ? null : Number(form.understandingScore), decisionClarityScore: form.decisionClarityScore === '' ? null : Number(form.decisionClarityScore) })
      toast.show({ title: 'Pilot-Review gespeichert', description: 'Die qualitative Evidenz ist jetzt mit den Produktmetriken verknüpft.', variant: 'success' }); await load()
    } catch (error) { toast.show({ title: 'Pilot-Review nicht gespeichert', description: error instanceof Error ? error.message : 'Bitte erneut versuchen.', variant: 'danger' }) }
    finally { setSaving(false) }
  }

  if (loading) return <Card><CardBody><p className="text-sm text-ink-3">Pilot-Evidenz wird geladen …</p></CardBody></Card>
  if (!accessToken) return <EmptyState icon={IconTarget} title="Pilot-Evidenz nur im echten Staff-Workspace" description="Die Pilotmessung schreibt keine Daten aus Demo-Sitzungen." />

  return <div className="space-y-5">
    <Card className={readiness?.ready ? 'border-ok-border' : 'border-brand-border'}>
      <CardHeader title="Pilot-Startfreigabe" subtitle="Ein Pilot zählt erst als real gestartet, wenn die operativen Mindestbedingungen erfüllt sind." icon={IconShield} action={<Chip toneName={readiness?.ready ? 'ok' : 'warn'}>{passedReadiness}/{totalReadiness} erfüllt</Chip>} />
      <CardBody className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {(readiness?.gates || []).map((gate) => <div key={gate.key} className="flex items-center gap-3 rounded-lg border border-line bg-surface-muted p-3"><span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ${gate.passed ? 'bg-ok-soft text-ok-ink' : 'bg-surface text-ink-3'}`}>{gate.passed ? <IconCheck className="size-4" /> : <IconClock className="size-4" />}</span><span className="text-[0.8125rem] font-medium text-ink">{gate.label}</span></div>)}
        </div>
        <Banner toneName={readiness?.ready ? 'ok' : 'warn'} icon={readiness?.ready ? IconCheck : IconClock} title={readiness?.ready ? 'Pilot kann als realer Validierungsfall starten' : 'Pilotstart noch nicht freigegeben'}>
          {readiness?.ready ? 'Die Baseline ist vollständig. Ab jetzt nur tatsächlich beobachtete Kunden- und Outcome-Evidenz erfassen.' : 'Fehlende Punkte zuerst schließen. E2E-Fixtures oder unvollständige Kundenzugänge dürfen nicht als reale Validierung zählen.'}
        </Banner>
      </CardBody>
    </Card>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Zeit bis erstes Finding" value={hours(scorecard?.timeToFirstCustomerFindingHours)} icon={IconTarget} toneName={scorecard?.timeToFirstCustomerFindingHours == null ? 'neutral' : 'ok'} hint="Erstes kundensichtbares, freigegebenes Finding" />
      <MetricCard label="Evidenzstarke Findings" value={evidenceLabel} icon={IconShield} toneName={(scorecard?.evidenceReadyFindings || 0) > 0 ? 'ok' : 'neutral'} hint={percent(scorecard?.evidenceReadyRate)} />
      <MetricCard label="Finding → Entscheidung" value={hours(scorecard?.timeFindingToDecisionHours)} icon={IconHistory} toneName={scorecard?.timeFindingToDecisionHours == null ? 'neutral' : 'ok'} hint="Bis zum ersten finalen Report" />
      <MetricCard label="Human-Review-Änderungsquote" value={percent(scorecard?.humanReviewMaterialChangeRate)} icon={IconShield} toneName={scorecard?.humanReviewMaterialChangeRate == null ? 'neutral' : 'info'} hint={`${scorecard?.materiallyChangedFindings ?? 0}/${scorecard?.humanReviewedFindings ?? 0} Findings wesentlich geändert`} />
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <Card><CardHeader title="Pilot-Review" subtitle="Nur qualitative Evidenz erfassen, die nicht verlässlich aus Produktdaten ableitbar ist." icon={IconTarget} /><CardBody>
        <form className="space-y-4" onSubmit={save}>
          <div className="grid gap-4 sm:grid-cols-3"><Input label="Review-Runde" type="number" min="1" max="12" value={form.reviewRound} onChange={(e) => setForm({ ...form, reviewRound: Number(e.target.value) })} /><Select label="Verständnis: Warum stockt Wachstum?" value={form.understandingScore} onChange={(e) => setForm({ ...form, understandingScore: e.target.value })}><option value="">Noch offen</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</Select><Select label="Entscheidungsklarheit" value={form.decisionClarityScore} onChange={(e) => setForm({ ...form, decisionClarityScore: e.target.value })}><option value="">Noch offen</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} / 5</option>)}</Select></div>
          <div className="grid gap-4 sm:grid-cols-3"><Input label="Geprüfte Findings" type="number" min="0" value={form.reviewedFindingsCount} onChange={(e) => setForm({ ...form, reviewedFindingsCount: e.target.value })} /><Input label="Wesentlich geändert" type="number" min="0" max={form.reviewedFindingsCount || undefined} value={form.materiallyChangedFindingsCount} onChange={(e) => setForm({ ...form, materiallyChangedFindingsCount: e.target.value })} /><BooleanField label="Review insgesamt materiell?" value={form.humanReviewMaterialChange} onChange={(value) => setForm({ ...form, humanReviewMaterialChange: value })} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><BooleanField label="Hat SYMMEDIS eine Entscheidung verändert?" value={form.decisionChanged} onChange={(value) => setForm({ ...form, decisionChanged: value })} /><Input label="Portal-Rückkehr zwischen Meetings" type="number" min="0" value={form.portalReturnCount} onChange={(e) => setForm({ ...form, portalReturnCount: Number(e.target.value) })} /></div>
          <div className="grid gap-4 sm:grid-cols-2"><Select label="Zahlungsbereitschaft" value={form.willingnessToPay} onChange={(e) => setForm({ ...form, willingnessToPay: e.target.value })}>{SIGNALS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select><Select label="Renewal-Signal" value={form.renewalSignal} onChange={(e) => setForm({ ...form, renewalSignal: e.target.value })}>{SIGNALS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select></div>
          <Textarea rows={4} maxLength={2000} label="„Verstehen Sie jetzt besser, warum Wachstum stockt?“" value={form.customerUnderstandingNote} onChange={(e) => setForm({ ...form, customerUnderstandingNote: e.target.value })} />
          <Textarea rows={4} maxLength={2000} label="„Welche Entscheidung haben Sie durch SYMMEDIS anders getroffen?“" value={form.decisionChangeNote} onChange={(e) => setForm({ ...form, decisionChangeNote: e.target.value })} />
          <Textarea rows={3} maxLength={4000} label="Interne Pilotnotiz" value={form.interviewerNote} onChange={(e) => setForm({ ...form, interviewerNote: e.target.value })} />
          <div className="flex justify-end"><Button type="submit" disabled={saving} aria-busy={saving || undefined}>{saving ? 'Wird gespeichert …' : 'Pilot-Review speichern'}</Button></div>
        </form>
      </CardBody></Card>

      <div className="space-y-5"><Card><CardHeader title="30/60/90-Umsetzung" subtitle="Nur Maßnahmen, die direkt mit einem Finding verknüpft sind." icon={IconCheckSquare} /><CardBody className="space-y-2.5"><PhaseRow label="Tag 1–30" completed={scorecard?.phase30Completed ?? 0} total={scorecard?.phase30Actions ?? 0} rate={scorecard?.phase30CompletionRate} /><PhaseRow label="Tag 31–60" completed={scorecard?.phase60Completed ?? 0} total={scorecard?.phase60Actions ?? 0} rate={scorecard?.phase60CompletionRate} /><PhaseRow label="Tag 61–90" completed={scorecard?.phase90Completed ?? 0} total={scorecard?.phase90Actions ?? 0} rate={scorecard?.phase90CompletionRate} /></CardBody></Card>
      <Card><CardHeader title="Validierungsevidenz" subtitle="Keine erfundenen Ergebnisse: nur echte Produktdaten und dokumentierte Interviews." icon={IconShield} /><CardBody className="space-y-4"><div className="flex flex-wrap gap-2"><Chip toneName={(scorecard?.measuredOutcomes || 0) > 0 ? 'ok' : 'neutral'}>{scorecard?.measuredOutcomes || 0} gemessene Outcomes</Chip><Chip toneName={latest ? 'ok' : 'neutral'}>{latest ? `Review ${latest.review_round} vorhanden` : 'Noch kein Review'}</Chip></div>{latest ? <div className="space-y-2 rounded-lg border border-line bg-surface-muted p-4 text-sm"><p><strong>Verständnis:</strong> {latest.understanding_score ? `${latest.understanding_score}/5` : 'offen'}</p><p><strong>Entscheidungsklarheit:</strong> {latest.decision_clarity_score ? `${latest.decision_clarity_score}/5` : 'offen'}</p><p><strong>Entscheidung verändert:</strong> {latest.decision_changed == null ? 'offen' : latest.decision_changed ? 'Ja' : 'Nein'}</p><p><strong>Human Review:</strong> {latest.materially_changed_findings_count ?? '–'}/{latest.reviewed_findings_count ?? '–'} wesentlich geändert</p><p><strong>Zahlungsbereitschaft:</strong> {SIGNALS.find((item) => item.value === latest.willingness_to_pay)?.label || latest.willingness_to_pay}</p><p><strong>Renewal:</strong> {SIGNALS.find((item) => item.value === latest.renewal_signal)?.label || latest.renewal_signal}</p></div> : <EmptyState compact icon={IconTarget} title="Noch keine qualitative Pilot-Evidenz" description="Nach dem nächsten echten Kundengespräch hier nur die tatsächlich beobachteten Signale dokumentieren." />}<p className="text-xs leading-relaxed text-ink-3">Weltklasse-Status bleibt offen, bis mindestens drei echte Kundenprojekte messbaren Entscheidungsnutzen zeigen. Diese Ansicht bereitet die Evidenz vor; sie ersetzt keine reale Validierung.</p></CardBody></Card></div>
    </div>
  </div>
}
