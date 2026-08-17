import { useEffect, useMemo, useState } from 'react'
import { KATEGORIE_MAP } from '../../data/catalog.js'
import { useSession } from '../../hooks/useSession.js'
import { useToast } from '../../hooks/useToast.js'
import { useWorkspace } from '../../hooks/useWorkspace.js'
import { persistAnalysisPatch, persistMeasurement } from '../../lib/workspaceApi.js'
import { Button, Chip } from '../ui/primitives.jsx'
import { Banner, Card, CardBody, CardHeader, MetricCard } from '../ui/layout.jsx'
import { Input, Select, Textarea } from '../ui/forms.jsx'
import { IconCheckCircle, IconTarget } from '../ui/Icons.jsx'

const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const asNumber = (value) => (value === '' || value == null ? null : Number(value))
const today = () => new Date().toISOString().slice(0, 10)
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 80)

function initial(item) {
  return {
    revenueImpactMin: item?.revenueImpactMin ?? '', revenueImpactMax: item?.revenueImpactMax ?? '',
    costImpactMin: item?.costImpactMin ?? '', costImpactMax: item?.costImpactMax ?? '',
    effort: item?.effort ?? '', timeToImpactDays: item?.timeToImpactDays ?? '',
    impactBasis: item?.impactBasis ?? '', impactVerified: Boolean(item?.impactVerified),
  }
}
function emptyMeasurement() {
  return { key: '', label: '', unit: '%', baseline: '', current: '', target: '', baselineAt: today(), currentAt: today(), targetAt: '', source: '', sichtbarKunde: false }
}

export function ImpactModule({ kunde }) {
  const { accessToken, echteAuthentifizierung, session } = useSession()
  const { neuLaden } = useWorkspace()
  const toast = useToast()
  const [categoryId, setCategoryId] = useState(kunde.analyse[0]?.kategorieId || '')
  const item = kunde.analyse.find((entry) => entry.kategorieId === categoryId) || null
  const [form, setForm] = useState(() => initial(item))
  const [measurement, setMeasurement] = useState(emptyMeasurement)
  const [saving, setSaving] = useState(false)
  const [savingMeasurement, setSavingMeasurement] = useState(false)

  useEffect(() => setForm(initial(item)), [item])

  const verified = useMemo(() => kunde.analyse.filter((entry) => entry.impactVerified), [kunde.analyse])
  const totals = useMemo(() => verified.reduce((sum, entry) => ({
    min: sum.min + (entry.revenueImpactMin || 0) + (entry.costImpactMin || 0),
    max: sum.max + (entry.revenueImpactMax || 0) + (entry.costImpactMax || 0),
  }), { min: 0, max: 0 }), [verified])

  const speichern = async () => {
    if (!item || !echteAuthentifizierung || !accessToken) {
      toast.show({ title: 'Nur im echten Backend speicherbar', description: 'Die Demo verändert keine monetären Schätzungen.' }); return
    }
    const revenueMin = asNumber(form.revenueImpactMin), revenueMax = asNumber(form.revenueImpactMax)
    const costMin = asNumber(form.costImpactMin), costMax = asNumber(form.costImpactMax)
    if ((revenueMin != null && revenueMax != null && revenueMin > revenueMax) || (costMin != null && costMax != null && costMin > costMax)) {
      toast.show({ title: 'Bandbreite prüfen', description: 'Der Mindestwert darf nicht über dem Maximalwert liegen.' }); return
    }
    if (form.impactVerified && !form.impactBasis.trim()) {
      toast.show({ title: 'Begründung fehlt', description: 'Verifizierte Impact-Werte brauchen eine nachvollziehbare Basis.' }); return
    }
    setSaving(true)
    try {
      await persistAnalysisPatch(accessToken, kunde.projectId, item.kategorieId, {
        impact_currency: 'EUR', revenue_impact_min: revenueMin, revenue_impact_max: revenueMax,
        cost_impact_min: costMin, cost_impact_max: costMax, effort: form.effort || null,
        time_to_impact_days: asNumber(form.timeToImpactDays), impact_basis: form.impactBasis.trim(),
        impact_verified: Boolean(form.impactVerified), updated_at: new Date().toISOString(),
      })
      await neuLaden()
      toast.show({ title: 'Impact-Modell gespeichert', description: 'Die Schätzung ist mit ihrer Annahmebasis dokumentiert.', variant: 'success' })
    } catch (error) { toast.show({ title: 'Speichern fehlgeschlagen', description: error instanceof Error ? error.message : 'Unbekannter Fehler' }) }
    finally { setSaving(false) }
  }

  const measurementSpeichern = async () => {
    if (!echteAuthentifizierung || !accessToken) { toast.show({ title: 'Nur im echten Backend speicherbar' }); return }
    if (!measurement.label.trim()) { toast.show({ title: 'KPI-Name fehlt' }); return }
    const key = measurement.key || slug(measurement.label)
    if (!key) { toast.show({ title: 'KPI-Key konnte nicht erzeugt werden' }); return }
    setSavingMeasurement(true)
    try {
      await persistMeasurement(accessToken, kunde.projectId, {
        ...measurement, key, label: measurement.label.trim(), source: measurement.source.trim(),
        baseline: asNumber(measurement.baseline), current: asNumber(measurement.current), target: asNumber(measurement.target),
      }, session?.userId)
      await neuLaden()
      setMeasurement(emptyMeasurement())
      toast.show({ title: 'KPI gespeichert', description: 'Baseline, Ist und Ziel stehen für die Before/After-Messung bereit.', variant: 'success' })
    } catch (error) { toast.show({ title: 'KPI konnte nicht gespeichert werden', description: error instanceof Error ? error.message : 'Unbekannter Fehler' }) }
    finally { setSavingMeasurement(false) }
  }

  const editMeasurement = (metric) => setMeasurement({ ...metric, baseline: metric.baseline ?? '', current: metric.current ?? '', target: metric.target ?? '', baselineAt: metric.baselineAt || '', currentAt: metric.currentAt || '', targetAt: metric.targetAt || '' })

  return (
    <div className="space-y-5">
      <Banner toneName="brand" icon={IconTarget} title="€-Impact statt KI-Fantasiezahlen">
        Monetäre Effekte werden in SYMMEDIS als Analysten-Szenario mit Bandbreite, Aufwand, Zeit bis Wirkung und Begründung geführt. Erst nach manueller Verifizierung fließen sie in den Management-Report ein.
      </Banner>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Verifizierte Hebel" value={verified.length} unit={`/ ${kunde.analyse.length}`} icon={IconCheckCircle} toneName={verified.length ? 'ok' : 'neutral'} />
        <MetricCard label="Impact Untergrenze" value={euro.format(totals.min)} icon={IconTarget} toneName="info" hint="Umsatz + Kostenwirkung" />
        <MetricCard label="Impact Obergrenze" value={euro.format(totals.max)} icon={IconTarget} toneName="brand" hint="Nur verifizierte Szenarien" />
      </div>

      <Card>
        <CardHeader title="Impact-Modell je Analysedimension" subtitle="Konservative Bandbreiten mit prüfbarer Annahmebasis" />
        <CardBody className="space-y-5">
          <Select label="Analysedimension" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            {kunde.analyse.map((entry) => <option key={entry.kategorieId} value={entry.kategorieId}>{KATEGORIE_MAP[entry.kategorieId]?.label || entry.kategorieId}</option>)}
          </Select>
          {item ? <>
            <div className="flex flex-wrap gap-2"><Chip toneName={item.impactVerified ? 'ok' : 'warn'}>{item.impactVerified ? 'Verifiziert' : 'Noch Schätzung'}</Chip><Chip toneName="neutral">Confidence Analyse: {item.confidence || 0}%</Chip></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input type="number" min="0" step="100" label="Zusätzlicher Umsatz – min. (€)" value={form.revenueImpactMin} onChange={(e) => setForm((v) => ({ ...v, revenueImpactMin: e.target.value }))} />
              <Input type="number" min="0" step="100" label="Zusätzlicher Umsatz – max. (€)" value={form.revenueImpactMax} onChange={(e) => setForm((v) => ({ ...v, revenueImpactMax: e.target.value }))} />
              <Input type="number" min="0" step="100" label="Kostenwirkung – min. (€)" value={form.costImpactMin} onChange={(e) => setForm((v) => ({ ...v, costImpactMin: e.target.value }))} />
              <Input type="number" min="0" step="100" label="Kostenwirkung – max. (€)" value={form.costImpactMax} onChange={(e) => setForm((v) => ({ ...v, costImpactMax: e.target.value }))} />
              <Select label="Umsetzungsaufwand" value={form.effort} onChange={(e) => setForm((v) => ({ ...v, effort: e.target.value }))}><option value="">Noch offen</option><option value="niedrig">Niedrig</option><option value="mittel">Mittel</option><option value="hoch">Hoch</option></Select>
              <Input type="number" min="1" label="Zeit bis Wirkung (Tage)" value={form.timeToImpactDays} onChange={(e) => setForm((v) => ({ ...v, timeToImpactDays: e.target.value }))} />
            </div>
            <Textarea label="Annahmebasis / Herleitung" rows={4} value={form.impactBasis} onChange={(e) => setForm((v) => ({ ...v, impactBasis: e.target.value }))} placeholder="z. B. CRM-Baseline, Conversion, durchschnittlicher Auftragswert, validierte Einsparung …" />
            <label className="flex items-start gap-3 rounded-lg border border-line bg-surface-muted p-3 text-sm text-ink"><input type="checkbox" className="mt-0.5" checked={form.impactVerified} onChange={(e) => setForm((v) => ({ ...v, impactVerified: e.target.checked }))} /><span><span className="font-medium">Analystisch verifiziert</span><span className="mt-0.5 block text-xs text-ink-3">Nur aktivieren, wenn Bandbreite und Annahmen gegen reale Kundendaten geprüft wurden.</span></span></label>
            <div className="flex justify-end"><Button onClick={speichern} disabled={saving}>{saving ? 'Speichert …' : 'Impact speichern'}</Button></div>
          </> : <p className="text-sm text-ink-3">Noch keine Analyse vorhanden.</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Before / After Measurement" subtitle="Baseline, aktueller Wert und Ziel – mit Datenquelle und optionaler Kundensichtbarkeit" />
        <CardBody className="space-y-5">
          {kunde.messungen?.length ? <div className="grid gap-3 md:grid-cols-2">{kunde.messungen.map((metric) => <button type="button" key={metric.id} onClick={() => editMeasurement(metric)} className="rounded-lg border border-line bg-surface-muted p-3 text-left transition-colors hover:border-line-strong"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-ink">{metric.label}</p><Chip size="sm" toneName={metric.sichtbarKunde ? 'ok' : 'neutral'}>{metric.sichtbarKunde ? 'Kundensichtbar' : 'Intern'}</Chip></div><p className="mt-2 text-xs text-ink-2">Baseline <strong>{metric.baseline ?? '–'} {metric.unit}</strong> → Ist <strong>{metric.current ?? '–'} {metric.unit}</strong> → Ziel <strong>{metric.target ?? '–'} {metric.unit}</strong></p><p className="mt-1 text-xs text-ink-3">Quelle: {metric.source || 'noch offen'}</p></button>)}</div> : <p className="text-sm text-ink-3">Noch keine KPIs angelegt.</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="KPI" value={measurement.label} onChange={(e) => setMeasurement((v) => ({ ...v, label: e.target.value, key: v.key || slug(e.target.value) }))} placeholder="z. B. Lead-to-Opportunity Rate" />
            <Input label="Einheit" value={measurement.unit} onChange={(e) => setMeasurement((v) => ({ ...v, unit: e.target.value }))} placeholder="%, €, Leads …" />
            <Input label="Datenquelle" value={measurement.source} onChange={(e) => setMeasurement((v) => ({ ...v, source: e.target.value }))} placeholder="HubSpot, GA4, Finance …" />
            <Input type="number" label="Baseline" value={measurement.baseline} onChange={(e) => setMeasurement((v) => ({ ...v, baseline: e.target.value }))} />
            <Input type="number" label="Aktuell" value={measurement.current} onChange={(e) => setMeasurement((v) => ({ ...v, current: e.target.value }))} />
            <Input type="number" label="Ziel" value={measurement.target} onChange={(e) => setMeasurement((v) => ({ ...v, target: e.target.value }))} />
            <Input type="date" label="Baseline-Datum" value={measurement.baselineAt} onChange={(e) => setMeasurement((v) => ({ ...v, baselineAt: e.target.value }))} />
            <Input type="date" label="Ist-Datum" value={measurement.currentAt} onChange={(e) => setMeasurement((v) => ({ ...v, currentAt: e.target.value }))} />
            <Input type="date" label="Ziel-Datum" value={measurement.targetAt} onChange={(e) => setMeasurement((v) => ({ ...v, targetAt: e.target.value }))} />
          </div>
          <label className="flex items-center gap-3 text-sm text-ink"><input type="checkbox" checked={measurement.sichtbarKunde} onChange={(e) => setMeasurement((v) => ({ ...v, sichtbarKunde: e.target.checked }))} /><span>Diesen KPI nach Prüfung im Kundenreport zeigen</span></label>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => setMeasurement(emptyMeasurement())}>Neu / zurücksetzen</Button><Button onClick={measurementSpeichern} disabled={savingMeasurement}>{savingMeasurement ? 'Speichert …' : 'KPI speichern'}</Button></div>
        </CardBody>
      </Card>
    </div>
  )
}
