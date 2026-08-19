import { deleteProjectFile, invokeEdgeFunction, restInsert, restRpc, restSelect, restUpdate, uploadProjectFile } from './supabase.js'
import { PHASEN } from '../data/workspace.js'
import { PLATTFORMEN } from '../data/catalog.js'

const byProject = (rows, projectId) => rows.filter((row) => row.project_id === projectId)

function mapClient(client, project, data) {
  const analyse = byProject(data.analysis, project.id).map((row) => ({
    id: row.id,
    kategorieId: row.category_id,
    score: row.score,
    beobachtung: row.observation,
    ursache: row.cause,
    auswirkung: row.impact,
    empfehlung: row.recommendation,
    beleg: row.evidence,
    prioritaet: row.priority,
    freigabe: row.approval_status,
    sichtbarKunde: row.customer_visible,
    internNotiz: row.internal_note,
    kommentar: row.comment,
    confidence: row.confidence || 0,
    evidenceSources: row.evidence_sources || [],
    analysisRunId: row.analysis_run_id || null,
    impactCurrency: row.impact_currency || 'EUR',
    revenueImpactMin: row.revenue_impact_min == null ? null : Number(row.revenue_impact_min),
    revenueImpactMax: row.revenue_impact_max == null ? null : Number(row.revenue_impact_max),
    costImpactMin: row.cost_impact_min == null ? null : Number(row.cost_impact_min),
    costImpactMax: row.cost_impact_max == null ? null : Number(row.cost_impact_max),
    effort: row.effort || null,
    timeToImpactDays: row.time_to_impact_days || null,
    impactBasis: row.impact_basis || '',
    impactVerified: Boolean(row.impact_verified),
  }))

  const aufgaben = byProject(data.tasks, project.id).map((row) => ({
    id: row.id,
    titel: row.title,
    phaseId: row.phase_id,
    kategorieId: row.category_id,
    verantwortlich: row.responsible_party,
    zustaendig: row.assignee_name,
    prioritaet: row.priority,
    status: row.status,
    faellig: row.due_date,
    kpi: row.kpi,
    sourceAnalysisItemId: row.source_analysis_item_id || null,
  }))

  const rowsByPlatform = Object.fromEntries(byProject(data.socialProfiles, project.id).map((row) => [row.platform_id, row]))
  const socialProfiles = PLATTFORMEN.map((platform) => {
    const row = rowsByPlatform[platform.id]
    return { ...platform, verbunden: row?.connected || false, score: row?.score || 0, frequenz: Number(row?.frequency || 0), engagement: Number(row?.engagement || 0), follower: row?.followers || 0, verlauf: row?.history || [] }
  })
  const socialInsight = data.socialInsights.find((row) => row.project_id === project.id)
  const competitor = data.competitors.find((row) => row.project_id === project.id)
  const plan = PHASEN.map((phase) => ({ ...phase, aufgaben: aufgaben.filter((task) => task.phaseId === phase.id) }))
  const gesamtScore = analyse.length ? Math.round(analyse.reduce((sum, item) => sum + item.score, 0) / analyse.length) : 0

  return {
    id: client.id, projectId: project.id, organisationId: client.organization_id, unternehmen: client.name, kurz: client.short_name || client.name,
    branche: client.industry || '', ort: client.location || '', mitarbeitende: client.employee_count || 0, ansprechpartner: client.contact || {},
    betreuerId: client.account_manager_key || 'mr', status: project.status, start: project.start_date, ergebnis: project.result_date, fortschritt: project.progress,
    metadata: project.metadata || {}, gesamtScore, analyse,
    bremsen: byProject(data.blockers, project.id).sort((a, b) => a.rank - b.rank).map((row) => ({ id: row.id, rang: row.rank, titel: row.title, kategorieId: row.category_id, prioritaet: row.priority, beschreibung: row.description, ursache: row.cause, score: row.score, naechsteAktion: row.next_action, status: row.status })),
    aufgaben, plan,
    dokumente: byProject(data.documents, project.id).map((row) => ({ id: row.id, name: row.name, typ: row.file_type, groesse: Number(row.size_bytes), von: row.source, version: row.version, hochgeladen: row.uploaded_on, status: row.status, storagePath: row.storage_path, indexStatus: row.index_status || null, indexError: row.index_error || '', sichtbarKunde: Boolean(row.customer_visible) })),
    termine: byProject(data.appointments, project.id).map((row) => ({ id: row.id, titel: row.title, datum: row.starts_at, dauer: row.duration_minutes, typ: row.appointment_type, teilnehmer: row.participants || [] })),
    berichte: byProject(data.reports, project.id).map((row) => ({ id: row.id, titel: row.title, typ: row.report_type, seiten: row.pages, stand: row.state, datum: row.report_date, autor: row.author, storagePath: row.storage_path, analysisRunId: row.generated_from_analysis_run_id || null, executiveSummary: row.executive_summary || '', content: row.content || {} })),
    berichtVersionen: byProject(data.reportVersions, project.id)
      .sort((a, b) => b.version_number - a.version_number || String(b.created_at).localeCompare(String(a.created_at)))
      .map((row) => ({ id: row.id, reportId: row.report_id, version: row.version_number, stand: row.state, titel: row.title, typ: row.report_type, datum: row.report_date, autor: row.author, storagePath: row.storage_path, analysisRunId: row.generated_from_analysis_run_id || null, executiveSummary: row.executive_summary || '', content: row.content || {}, erstelltAm: row.created_at })),
    messungen: byProject(data.measurements, project.id).map((row) => ({ id: row.id, key: row.metric_key, label: row.label, unit: row.unit, baseline: row.baseline_value == null ? null : Number(row.baseline_value), current: row.current_value == null ? null : Number(row.current_value), target: row.target_value == null ? null : Number(row.target_value), baselineAt: row.baseline_at, currentAt: row.current_at, targetAt: row.target_at, source: row.source || '', sichtbarKunde: Boolean(row.customer_visible) })),
    aktivitaet: byProject(data.activities, project.id).map((row) => ({ id: row.id, titel: row.title, actor: row.actor, tone: row.tone, zeit: row.happened_at })),
    chat: byProject(data.messages, project.id).map((row) => ({ id: row.id, from: row.sender_kind, via: row.via, author: row.author, text: row.body, zeit: row.sent_at })),
    notizenIntern: byProject(data.notes, project.id).map((row) => ({ id: row.id, autor: row.author, zeit: row.created_at, text: row.body })),
    wettbewerb: competitor ? { dimensionen: competitor.dimensions || [], anbieter: competitor.providers || [], beobachtung: competitor.observation || '' } : { dimensionen: [], anbieter: [], beobachtung: '' },
    social: { gesamt: socialInsight?.total_score || 0, plattformen: socialProfiles, luecken: socialInsight?.gaps || [], quickWins: socialInsight?.quick_wins || [], frequenz: Number(socialInsight?.frequency || 0), engagement: Number(socialInsight?.engagement || 0), konsistenz: socialInsight?.consistency || 0, ctaNutzung: socialInsight?.cta_usage || 0 },
  }
}

async function selectAll(accessToken, table, query = 'select=*') { return restSelect(table, accessToken, query) }

export async function fetchWorkspace(accessToken) {
  const [clients, projects, analysis, blockers, tasks, documents, appointments, reports, reportVersions, measurements, activities, messages, notes, socialProfiles, socialInsights, competitors] = await Promise.all([
    selectAll(accessToken, 'clients'), selectAll(accessToken, 'projects'), selectAll(accessToken, 'analysis_items'), selectAll(accessToken, 'growth_blockers'),
    selectAll(accessToken, 'tasks'), selectAll(accessToken, 'documents'), selectAll(accessToken, 'appointments'), selectAll(accessToken, 'reports'), selectAll(accessToken, 'report_versions', 'select=*&order=created_at.desc'),
    selectAll(accessToken, 'measurement_snapshots'), selectAll(accessToken, 'activities', 'select=*&order=happened_at.desc'), selectAll(accessToken, 'messages', 'select=*&order=sent_at.asc'),
    selectAll(accessToken, 'internal_notes', 'select=*&order=created_at.desc'), selectAll(accessToken, 'social_profiles'), selectAll(accessToken, 'social_insights'), selectAll(accessToken, 'competitor_snapshots'),
  ])
  const data = { analysis, blockers, tasks, documents, appointments, reports, reportVersions, measurements, activities, messages, notes, socialProfiles, socialInsights, competitors }
  const projectsByClient = new Map()
  for (const project of projects) {
    const current = projectsByClient.get(project.client_id)
    const currentDate = current?.result_date || current?.start_date || ''
    const nextDate = project.result_date || project.start_date || ''
    if (!current || nextDate >= currentDate) projectsByClient.set(project.client_id, project)
  }
  return clients.map((client) => { const project = projectsByClient.get(client.id); return project ? mapClient(client, project, data) : null }).filter(Boolean)
}

export async function fetchTeamDirectory(accessToken) {
  const rows = await restSelect('profiles', accessToken, 'select=id,email,full_name,role,organization_id,client_id&role=in.(intern,admin)&order=full_name.asc,email.asc')
  return (rows || []).map((row) => ({
    id: row.id,
    email: row.email || '',
    name: row.full_name || row.email?.split('@')[0] || 'SYMMEDIS Team',
    role: row.role,
    roleLabel: row.role === 'admin' ? 'Administrator:in' : 'Mitarbeiter:in',
    organizationId: row.organization_id,
  }))
}

export const persistTaskStatus = (accessToken, id, status) => restRpc('update_task_status', accessToken, { p_task_id: id, p_status: status })
export const persistAnalysisPatch = (accessToken, projectId, categoryId, patch) => restUpdate('analysis_items', accessToken, `project_id=eq.${projectId}&category_id=eq.${encodeURIComponent(categoryId)}`, patch)
export const persistBlockerStatus = (accessToken, id, status) => restUpdate('growth_blockers', accessToken, `id=eq.${id}`, { status })
export const persistDocumentVisibility = (accessToken, id, customerVisible) => restUpdate('documents', accessToken, `id=eq.${id}`, { customer_visible: Boolean(customerVisible) })
export const generate90DayPlan = (accessToken, projectId) => restRpc('generate_90_day_plan', accessToken, { p_project_id: projectId })
export function searchProjectEvidence(accessToken, projectId, query, limit = 8) { return restRpc('search_project_evidence', accessToken, { p_project_id: projectId, p_query: query, p_limit: limit }) }

export async function persistMeasurement(accessToken, projectId, measurement, userId) {
  const rows = await restSelect('measurement_snapshots', accessToken, `select=id&project_id=eq.${projectId}&metric_key=eq.${encodeURIComponent(measurement.key)}&limit=1`)
  const payload = { project_id: projectId, metric_key: measurement.key, label: measurement.label, unit: measurement.unit || '', baseline_value: measurement.baseline ?? null, current_value: measurement.current ?? null, target_value: measurement.target ?? null, baseline_at: measurement.baselineAt || null, current_at: measurement.currentAt || null, target_at: measurement.targetAt || null, source: measurement.source || '', customer_visible: Boolean(measurement.sichtbarKunde), updated_at: new Date().toISOString() }
  if (rows?.[0]?.id) return restUpdate('measurement_snapshots', accessToken, `id=eq.${rows[0].id}`, payload)
  return restInsert('measurement_snapshots', accessToken, { ...payload, created_by: userId || null })
}

export function persistMessage(accessToken, projectId, userId, message) { return restInsert('messages', accessToken, { project_id: projectId, sender_kind: message.from, via: message.via || null, author: message.author || '', body: message.text, sent_at: new Date().toISOString(), created_by: userId }) }
export function persistInternalNote(accessToken, projectId, userId, text, author) { return restInsert('internal_notes', accessToken, { project_id: projectId, author, body: text, created_by: userId }) }
export function persistActivity(accessToken, projectId, entry) { return restInsert('activities', accessToken, { project_id: projectId, title: entry.titel, actor: entry.actor || '', tone: entry.tone || 'neutral', happened_at: entry.zeit || new Date().toISOString() }) }

function uniqueObjectName(fileName) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'upload'
  const nonce = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  return `${nonce}-${safeName}`
}

export async function persistDocument(accessToken, clientId, projectId, file, meta = {}) {
  const path = `${clientId}/${projectId}/${uniqueObjectName(file.name)}`
  let uploaded = false
  try {
    await uploadProjectFile(accessToken, path, file)
    uploaded = true
    const rows = await restInsert('documents', accessToken, {
      project_id: projectId,
      name: file.name,
      file_type: file.name.split('.').pop()?.toLowerCase() || '',
      size_bytes: file.size,
      source: meta.von || 'kunde',
      customer_visible: Boolean(meta.sichtbarKunde),
      version: 1,
      status: 'neu',
      storage_path: path,
    })
    const document = rows?.[0]
    if (!document?.id) throw new Error('Dokument konnte nicht registriert werden.')
    invokeEdgeFunction('index-document', accessToken, { documentId: document.id }).catch(() => null)
    return document
  } catch (error) {
    if (uploaded) await deleteProjectFile(accessToken, path).catch(() => null)
    throw error
  }
}
