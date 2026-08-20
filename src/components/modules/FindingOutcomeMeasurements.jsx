import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { persistAnalysisPatch } from '../../lib/workspaceApi.js'
import { restInsert, restSelect, restUpdate } from '../../lib/supabase.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Card, CardBody, CardHeader, EmptyState } from '../ui/layout.jsx'
import { Input, Select, Textarea } from '../ui/forms.jsx'
import { IconCheckCircle, IconTarget } from '../ui/Icons.jsx'

const HORIZONS = [30, 60, 90]
const ASSESSMENTS = {
  pending: { label: 'Noch offen', tone: 'neutral' },
  supports: { label: 'Stützt Diagnose', tone: 'ok' },
  refutes: { label: 'Widerlegt Diagnose', tone: 'danger' },
  mixed: { label: 'Gemischtes Signal', tone: 'warn' },
  unknown: { label: 'Nicht eindeutig', tone: 'neutral' },
}
const OUTCOME = {
  pending: 'Noch nicht gemessen',
  confirmed: 'Diagnose bestätigt',
  refuted: 'Diagnose widerlegt',
  mixed: 'Gemischtes Ergebnis',
  unknown: 'Nicht eindeutig',
}

function normalizeRow(row) {
  return {
    id: row.id,
    analysisItemId: row.analysis_item_id,
    horizonDays: Number(row.horizon_days || 0),
    key: row.metric_key || '',
    label: row.label || '',
    unit: row.unit || '',
    baseline: row.baseline_value == null ? '' : String(row.baseline_value),
    current: row.current_value == null ? '' : String(row.current_value),
    target: row.target_value == null ? '' : String(row.target_value),
    baselineAt: row.baseline_at || '',
    currentAt: row.current_at || '',
    targetAt: row.target_at || '',
    source: row.source || '',
    sichtbarKunde: Boolean(row.customer_visible),
    assessment: row.assessment || 'pending',
    assessmentNote: row.assessment_note || '',
  }
}

function numericOrNull(value) {
  if (value === '' || value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function outcomeSuggestion(rows) {
  const assessed = rows.filter((row) => row.assessment && row.assessment !== 'pending')
  if (!assessed.length) return { status: 'pending', horizon: null, reason: 'Noch kein 30/60/90-Messpunkt wurde bewertet.' }

  const horizon = Math.max(...assessed.map((row) => Number(row.horizonDays || 0)))
  const latest = assessed.filter((row) => Number(row.horizonDays || 0) === horizon)
  const signals = new Set(latest.map((row) => row.assessment))

  if (signals.has('mixed') || (signals.has('supports') && signals.has('refutes'))) {
    return { status: 'mixed', horizon, reason: `Die ${horizon}-Tage-Messung enthält gleichzeitig stützende und widersprechende Signale.` }
  }
  if (signals.size === 1 && signals.has('supports')) {
    return { status: 'confirmed', horizon, reason: `Alle bewerteten ${horizon}-Tage-Messpunkte stützen die Diagnose.` }
  }
  if (signals.size === 1 && signals.has('refutes')) {
    return { status: 'refuted', horizon, reason: `Alle bewerteten ${horizon}-Tage-Messpunkte widersprechen der Diagnose.` }
  }
  if (signals.has('unknown') && !signals.has('supports') && !signals.has('refutes')) {
    return { status: 'unknown', horizon, reason: `Die ${horizon}-Tage-Messung ist noch nicht eindeutig.` }
  }
  return { status: 'mixed', horizon, reason: `Die ${horizon}-Tage-Messung ergibt kein einheitliches Signal.` }
}

function measurementNonce() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID().slice(0, 8)
    }
  } catch {
    // Fallback below keeps measurement creation usable in restricted browser contexts.
  }
  return Math.random().toString(36).slice(2, 10)
}

function defaultMetric(finding, horizon) {
  const keyBase = String(finding.kategorieId || finding.id || 'finding').replace(/[^a-z0-9_-]+/gi, '-').toLowerCase()
  return {
    analysisItemId: finding.id,
    horizonDays: horizon,
    key: `${keyBase}-${horizon}d-${measurementNonce()}`,
    label: 'Wirkungskennzahl',
    unit: '',
    baseline: '',
    current: '',
    target: '',
    baselineAt: '',
    currentAt: '',
    targetAt: '',
    source: '',
    sichtbarKunde: false,
    assessment: 'pending',
    assessmentNote: '',
  }
}

export function FindingOutcomeMeasurements({ kunde, rolle = 'kunde' }) {
  const { accessToken, echteAuthentifizierung, session } = useSession()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [addingFindingId, setAddingFindingId] = useState(null)

  const load = useCallback(async () => {
    if (!echteAuthentifizierung || !accessToken || !kunde?.projectId) {
      setRows([])
      return
    }
    setLoading(true)
    try {
      const result = await restSelect('measurement_snapshots', accessToken, `select=*&project_id=eq.${kunde.projectId}&analysis_item_id=not.is.null&order=horizon_days.asc,metric_key.asc`)
      setRows((result || []).map(normalizeRow))
    } catch (error) {
      toast.show({ title: 'Outcome-Messungen konnten nicht geladen werden', description: error instanceof Error ? error.message : 'Unbekannter Fehler', variant: 'danger' })
    } finally {
      setLoading(false)
    }
  }, [accessToken, echteAuthentifizierung, kunde?.projectId, toast])

  useEffect(() => { load() }, [load])

  const grouped = useMemo(() => Object.fromEntries((kunde?.analyse || []).map((finding) => [finding.id, rows.filter((row) => row.analysisItemId === finding.id)])), [kunde?.analyse, rows])

  const updateLocal = (id, patch) => setRows((current) => current.map((row) => row.id === id ? { ...row, ...patch } : row))

  const save = async (row) => {
    if (!accessToken || !row.id) return
    setSavingId(row.id)
    try {
      await restUpdate('measurement_snapshots', accessToken, `id=eq.${row.id}`, {
        metric_key: row.key,
        label: row.label,
        unit: row.unit || '',
        baseline_value: numericOrNull(row.baseline),
        current_value: numericOrNull(row.current),
        target_value: numericOrNull(row.target),
        baseline_at: row.baselineAt || null,
        current_at: row.currentAt || null,
        target_at: row.targetAt || null,
        source: row.source || '',
        customer_visible: Boolean(row.sichtbarKunde),
        assessment: row.assessment || 'pending',
        assessment_note: row.assessmentNote || '',
        updated_at: new Date().toISOString(),
      })
      toast.show({ title: `${row.horizonDays}-Tage-Messpunkt gespeichert`, variant: 'success' })
    } catch (error) {
      toast.show({ title: 'Messpunkt nicht gespeichert', description: error instanceof Error ? error.message : 'Unbekannter Fehler', variant: 'danger' })
      await load()
    } finally {
      setSavingId(null)
    }
  }

  const addMeasurement = async (finding, horizon) => {
    if (!accessToken) return
    setAddingFindingId(`${finding.id}-${horizon}`)
    try {
      const draft = defaultMetric(finding, horizon)
      await restInsert('measurement_snapshots', accessToken, {
        project_id: kunde.projectId,
        analysis_item_id: finding.id,
        horizon_days: horizon,
        metric_key: draft.key,
        label: draft.label,
        unit: '',
        source: '',
        customer_visible: false,
        assessment: 'pending',
        assessment_note: '',
      })
      await load()
      toast.show({ title: `${horizon}-Tage-Messpunkt angelegt`, description: 'Definieren Sie jetzt Kennzahl, Ziel und Beurteilung.', variant: 'success' })
    } catch (error) {
      toast.show({ title: 'Messpunkt konnte nicht angelegt werden', description: error instanceof Error ? error.message : 'Unbekannter Fehler', variant: 'danger' })
    } finally {
      setAddingFindingId(null)
    }
  }

  const adoptOutcome = async (finding, suggestion) => {
    if (!accessToken || suggestion.status === 'pending') return
    setSavingId(`outcome-${finding.id}`)
    try {
      await persistAnalysisPatch(accessToken, kunde.projectId, finding.kategorieId, {
        outcome_status: suggestion.status,
        outcome_measured_at: new Date().toISOString(),
        outcome_note: suggestion.reason,
        outcome_confidence: Number.isFinite(Number(finding.confidence)) ? Math.round(Number(finding.confidence)) : null,
        outcome_hypothesis: finding.hypothese || finding.ursache || '',
        outcome_intervention: finding.intervention || finding.empfehlung || '',
        outcome_evidence_assessment: Array.isArray(finding.evidenzBewertung) ? finding.evidenzBewertung : [],
        outcome_reviewed_by: session?.userId || null,
      })
      toast.show({ title: OUTCOME[suggestion.status], description: 'Outcome und damaliger Diagnosezustand wurden durch den Human Review eingefroren.', variant: 'success' })
    } catch (error) {
      toast.show({ title: 'Outcome konnte nicht übernommen werden', description: error instanceof Error ? error.message : 'Unbekannter Fehler', variant: 'danger' })
    } finally {
      setSavingId(null)
    }
  }

  const findings = (kunde?.analyse || []).filter((finding) => finding.intervention || finding.empfehlung)
  if (!findings.length) return null

  return (
    <Card>
      <CardHeader title="Finding → Intervention → 30/60/90 → Outcome" subtitle="Messbare Wirkung statt Maßnahmen-Checkliste" icon={IconTarget} />
      <CardBody className="space-y-5">
        {!echteAuthentifizierung ? (
          <EmptyState compact icon={IconTarget} title="Outcome-Messung in echten Projekten" description="Im produktiven Mitarbeiterportal werden Findings mit 30/60/90-Messpunkten verbunden. Die öffentliche Demo bleibt bewusst ohne Backend-Schreibzugriffe." />
        ) : loading ? (
          <p className="text-sm text-ink-3" role="status">Outcome-Messungen werden geladen …</p>
        ) : findings.map((finding) => {
          const findingRows = grouped[finding.id] || []
          const suggestion = outcomeSuggestion(findingRows)
          return (
            <section key={finding.id} data-finding-id={finding.id} className="rounded-xl border border-line bg-surface-muted p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">{finding.hypothese || finding.ursache || finding.kategorieId}</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{finding.intervention || finding.empfehlung}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip toneName={suggestion.status === 'confirmed' ? 'ok' : suggestion.status === 'refuted' ? 'danger' : suggestion.status === 'mixed' ? 'warn' : 'neutral'}>{OUTCOME[suggestion.status]}</Chip>
                  {suggestion.horizon ? <Chip toneName="neutral">Basis: Tag {suggestion.horizon}</Chip> : null}
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-3">
                {HORIZONS.map((horizon) => {
                  const horizonRows = findingRows.filter((row) => row.horizonDays === horizon)
                  return (
                    <div key={horizon} data-horizon={horizon} className="rounded-lg border border-line bg-surface p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-ink">Tag {horizon}</p>
                        {rolle === 'intern' ? <Button size="sm" variant="ghost" data-action="add-measurement" disabled={Boolean(addingFindingId)} onClick={() => addMeasurement(finding, horizon)}>Messpunkt +</Button> : null}
                      </div>
                      {horizonRows.length === 0 ? <p className="mt-3 text-xs leading-relaxed text-ink-3">Noch kein Messpunkt definiert.</p> : (
                        <div className="mt-3 space-y-3">
                          {horizonRows.map((row) => (
                            <div key={row.id} data-measurement-id={row.id} className="rounded-lg border border-line bg-surface-muted p-3">
                              {rolle === 'intern' ? (
                                <div className="space-y-3">
                                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                                    <Input label="Kennzahl" value={row.label} onChange={(event) => updateLocal(row.id, { label: event.target.value })} />
                                    <Input label="Einheit" value={row.unit} onChange={(event) => updateLocal(row.id, { unit: event.target.value })} placeholder="%, €, Tage …" />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <Input label="Baseline" type="number" value={row.baseline} onChange={(event) => updateLocal(row.id, { baseline: event.target.value })} />
                                    <Input label="Ist" type="number" value={row.current} onChange={(event) => updateLocal(row.id, { current: event.target.value })} />
                                    <Input label="Ziel" type="number" value={row.target} onChange={(event) => updateLocal(row.id, { target: event.target.value })} />
                                  </div>
                                  <Input label="Quelle" value={row.source} onChange={(event) => updateLocal(row.id, { source: event.target.value })} placeholder="CRM, Finance, Analytics …" />
                                  <Select label="Bewertung" value={row.assessment} onChange={(event) => updateLocal(row.id, { assessment: event.target.value })}>{Object.entries(ASSESSMENTS).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</Select>
                                  <Textarea rows={2} label="Begründung" value={row.assessmentNote} onChange={(event) => updateLocal(row.id, { assessmentNote: event.target.value })} placeholder="Warum stützt oder widerlegt dieser Messpunkt die Diagnose?" />
                                  <label className="flex items-center gap-2 text-xs text-ink-2"><input type="checkbox" checked={row.sichtbarKunde} onChange={(event) => updateLocal(row.id, { sichtbarKunde: event.target.checked })} /> Für Kunden sichtbar</label>
                                  <Button size="sm" data-action="save-measurement" onClick={() => save(row)} disabled={savingId === row.id}>{savingId === row.id ? 'Speichert …' : 'Messpunkt speichern'}</Button>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold text-ink">{row.label}</p><Chip size="sm" toneName={ASSESSMENTS[row.assessment]?.tone || 'neutral'}>{ASSESSMENTS[row.assessment]?.label || row.assessment}</Chip></div>
                                  <p className="mt-2 text-xs text-ink-2">Baseline {row.baseline || '–'}{row.unit ? ` ${row.unit}` : ''} · Ist {row.current || '–'}{row.unit ? ` ${row.unit}` : ''} · Ziel {row.target || '–'}{row.unit ? ` ${row.unit}` : ''}</p>
                                  {row.assessmentNote ? <p className="mt-2 text-xs leading-relaxed text-ink-3">{row.assessmentNote}</p> : null}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-line bg-surface p-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-xs font-semibold text-ink">Outcome-Vorschlag</p><p className="mt-1 text-xs leading-relaxed text-ink-3">{suggestion.reason}</p></div>
                {rolle === 'intern' && suggestion.status !== 'pending' ? <Button size="sm" variant="secondary" icon={IconCheckCircle} data-action="adopt-outcome" disabled={savingId === `outcome-${finding.id}`} onClick={() => adoptOutcome(finding, suggestion)}>{savingId === `outcome-${finding.id}` ? 'Übernimmt …' : 'Outcome bewusst übernehmen'}</Button> : null}
              </div>
            </section>
          )
        })}
      </CardBody>
    </Card>
  )
}
