import { readFile } from 'node:fs/promises'

const files = {
  model: 'supabase/migrations/20260819202448_finding_intervention_measurement_outcomes.sql',
  security: 'supabase/migrations/20260819202736_harden_finding_measurement_tenant_visibility.sql',
  quality: 'supabase/migrations/20260819203420_freeze_outcome_quality_snapshot.sql',
  panel: 'src/components/modules/FindingOutcomeMeasurements.jsx',
  analyses: 'src/pages/staff/AnalysesPage.jsx',
  plan: 'src/components/modules/PlanModule.jsx',
}

const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(path, 'utf8')])))

const checks = [
  ['Finding-Projekt-FK bleibt aktiv', source.model.includes('measurement_snapshots_analysis_project_fk') && source.model.includes('references public.analysis_items(id, project_id)')],
  ['30/60/90-Horizonte bleiben beschränkt', source.model.includes('horizon_days in (30, 60, 90)')],
  ['Messbewertung bleibt kalibriert', source.model.includes("assessment in ('pending', 'supports', 'refutes', 'mixed', 'unknown')")],
  ['Staff-Messungen bleiben organisationsgebunden', source.security.includes('p.organization_id = c.organization_id')],
  ['Kundenmessung verlangt freigegebenes Finding', source.security.includes('ai.customer_visible') && source.security.includes("ai.approval_status = 'kunde'")],
  ['Outcome bleibt Human-in-the-loop', source.panel.includes('Outcome bewusst übernehmen') && source.panel.includes('persistAnalysisPatch')],
  ['Outcome friert Diagnosezustand ein', source.panel.includes('outcome_confidence') && source.panel.includes('outcome_hypothesis') && source.panel.includes('outcome_intervention') && source.panel.includes('outcome_evidence_assessment') && source.panel.includes('outcome_reviewed_by')],
  ['Historische Snapshot-Spalten sind schema-seitig begrenzt', source.quality.includes('analysis_items_outcome_confidence_check') && source.quality.includes('analysis_items_outcome_evidence_assessment_check')],
  ['Qualitäts-RPC bleibt Security Invoker und Staff-only', source.quality.includes('security invoker') && source.quality.includes("v_role not in ('intern', 'admin')")],
  ['Kalibrierung nutzt nur bestätigt/widerlegt', source.quality.includes("outcome_status in ('confirmed','refuted')") && source.quality.includes('brier_score')],
  ['Vanity-Metrik wird bei kleiner Stichprobe blockiert', source.quality.includes("a.binary_outcomes < 10 then 'insufficient_data'") && source.analyses.includes('mindestens 10 menschlich überprüfte Findings')],
  ['30/60/90-Panel ist im Umsetzungsplan sichtbar', source.plan.includes('<FindingOutcomeMeasurements kunde={kunde} rolle={rolle} />')],
  ['Demo bleibt ohne Backend-Schreibzugriff', source.panel.includes('Die öffentliche Demo bleibt bewusst ohne Backend-Schreibzugriffe.')],
]

const failed = checks.filter(([, ok]) => !ok)
if (failed.length) {
  console.error('SYMMEDIS Outcome Measurement Guard: FEHLER')
  for (const [label] of failed) console.error(`✗ ${label}`)
  process.exit(1)
}

console.log('SYMMEDIS Outcome Measurement Guard: OK')
for (const [label] of checks) console.log(`✓ ${label}`)
