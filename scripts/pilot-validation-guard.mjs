import fs from 'node:fs'

const migration = fs.readFileSync('supabase/migrations/20260820075848_pilot_validation_scorecards.sql', 'utf8')
const indexMigration = fs.readFileSync('supabase/migrations/20260820075919_index_pilot_validation_review_creator.sql', 'utf8')
const strengthMigration = fs.readFileSync('supabase/migrations/20260820081411_strengthen_pilot_validation_metrics.sql', 'utf8')
const api = fs.readFileSync('src/lib/pilotValidationApi.js', 'utf8')
const moduleSource = fs.readFileSync('src/components/modules/PilotValidationModule.jsx', 'utf8')
const clientDetail = fs.readFileSync('src/pages/staff/ClientDetail.jsx', 'utf8')

const requiredMigrationContracts = [
  'create table public.pilot_validation_reviews',
  'alter table public.pilot_validation_reviews enable row level security',
  "me.role in ('intern','admin')",
  'me.organization_id=c.organization_id',
  'create or replace function public.get_pilot_validation_scorecard',
  'security invoker',
  "ai.approval_status='kunde'",
  'ai.confidence>=70',
  "r.state='final'",
  "t.status='erledigt'",
  "willingness_to_pay in ('unknown','no','weak','medium','strong')",
  "renewal_signal in ('unknown','no','weak','medium','strong')",
]
for (const contract of requiredMigrationContracts) if (!migration.includes(contract)) throw new Error(`Pilot validation migration contract missing: ${contract}`)

const evidenceGradeContracts = [
  'reviewed_findings_count', 'materially_changed_findings_count', 'material_change_count_range_check',
  "t.phase_id='p1'", "t.phase_id='p2'", "t.phase_id='p3'",
  "'humanReviewMaterialChangeRate'", "'phase30CompletionRate'", "'phase60CompletionRate'", "'phase90CompletionRate'",
]
for (const contract of evidenceGradeContracts) if (!strengthMigration.includes(contract)) throw new Error(`Evidence-grade pilot metric missing: ${contract}`)

if (!indexMigration.includes('pilot_validation_reviews_created_by_idx')) throw new Error('Pilot review creator FK index missing.')
if (!api.includes("restRpc('get_pilot_validation_scorecard'")) throw new Error('Pilot scorecard RPC client missing.')
if (!api.includes("restInsert('pilot_validation_reviews'")) throw new Error('Pilot review persistence missing.')
if (!api.includes('materiallyChangedFindingsCount > reviewedFindingsCount')) throw new Error('Pilot human-review count validation missing.')

const requiredUiContracts = [
  'Zeit bis erstes Finding', 'Evidenzstarke Findings', 'Finding → Entscheidung', 'Human-Review-Änderungsquote',
  '30/60/90-Umsetzung', 'Tag 1–30', 'Tag 31–60', 'Tag 61–90',
  'Verstehen Sie jetzt besser, warum Wachstum stockt?', 'Welche Entscheidung haben Sie durch SYMMEDIS anders getroffen?',
  'Zahlungsbereitschaft', 'Renewal-Signal', 'Weltklasse-Status bleibt offen', 'Pilot-Evidenz nur im echten Staff-Workspace',
]
for (const contract of requiredUiContracts) if (!moduleSource.includes(contract)) throw new Error(`Pilot validation UI contract missing: ${contract}`)

if (!clientDetail.includes("id: 'pilot'")) throw new Error('Pilot evidence staff tab missing.')
if (!clientDetail.includes('<PilotValidationModule kunde={kunde} />')) throw new Error('Pilot validation module is not mounted in staff client detail.')

console.log('Pilot validation evidence contracts verified.')
