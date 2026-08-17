import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const AI_ENABLED = Deno.env.get("SYMMEDIS_AI_ENABLED") === "true";
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") || "";
const ANTHROPIC_BASE_URL = (Deno.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
const APP_URL = Deno.env.get("SYMMEDIS_APP_URL") || "https://davidwzmn.github.io/symmedis/";
const MAX_PDF_BYTES = 18 * 1024 * 1024;
const MAX_TEXT_CHARS = 120_000;
const MAX_RUNS_PER_10_MINUTES = 3;
const CATEGORIES = ["positionierung", "verstaendlichkeit", "differenzierung", "marktaktivierung", "website", "vertrieb", "social", "zielgruppen", "nutzenargumentation", "wettbewerb"];

function originOf(value: string) { try { return new URL(value).origin; } catch { return ""; } }
function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = new Set([originOf(APP_URL), "https://davidwzmn.github.io"]);
  return { "Access-Control-Allow-Origin": allowed.has(origin) ? origin : originOf(APP_URL), "Vary": "Origin", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
}
function json(req: Request, status: number, payload: unknown) { return new Response(JSON.stringify(payload), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } }); }
function authHeaders(auth: string) { return { apikey: SUPABASE_ANON_KEY, Authorization: auth, "Content-Type": "application/json" }; }
async function db(auth: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...authHeaders(auth), ...(init.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || `Database request failed (${response.status})`);
  return data;
}
async function adminInsert(table: string, payload: unknown) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error(`Admin insert failed (${response.status})`);
}
function pathEncode(path: string) { return path.split("/").map(encodeURIComponent).join("/"); }
function bytesToBase64(bytes: Uint8Array) { let binary = ""; const chunk = 0x8000; for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length))); return btoa(binary); }
async function loadSourceBlocks(auth: string, documents: any[]) {
  const blocks: any[] = []; let used = 0, pdfBytes = 0;
  for (const document of documents) {
    if (!document.storage_path || used >= 8) continue;
    const type = String(document.file_type || "").toLowerCase();
    if (!["pdf", "txt", "csv"].includes(type)) continue;
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/project-files/${pathEncode(document.storage_path)}`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: auth } });
    if (!response.ok) continue;
    if (type === "pdf") {
      const buffer = new Uint8Array(await response.arrayBuffer());
      if (pdfBytes + buffer.byteLength > MAX_PDF_BYTES) continue;
      pdfBytes += buffer.byteLength;
      blocks.push({ type: "text", text: `Quelle/Dokument: ${document.name}` });
      blocks.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: bytesToBase64(buffer) } });
      used += 1;
      continue;
    }
    const text = (await response.text()).slice(0, MAX_TEXT_CHARS);
    if (text.trim()) { blocks.push({ type: "text", text: `Quelle/Dokument: ${document.name}\n\n${text}` }); used += 1; }
  }
  return { blocks, used };
}
function validateFindings(raw: any[]) {
  if (!Array.isArray(raw)) throw new Error("Analyse enthält keine Findings.");
  const byCategory = new Map<string, any>();
  for (const item of raw) {
    if (!CATEGORIES.includes(item?.category_id)) continue;
    byCategory.set(item.category_id, {
      category_id: item.category_id,
      score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
      observation: String(item.observation || "").slice(0, 5000),
      cause: String(item.cause || "").slice(0, 5000),
      impact: String(item.impact || "").slice(0, 5000),
      recommendation: String(item.recommendation || "").slice(0, 5000),
      evidence: String(item.evidence || "").slice(0, 5000),
      priority: ["hoch", "mittel", "niedrig"].includes(item.priority) ? item.priority : "mittel",
      confidence: Math.max(0, Math.min(100, Math.round(Number(item.confidence) || 0))),
      evidence_sources: Array.isArray(item.evidence_sources) ? item.evidence_sources.map((value: unknown) => String(value).slice(0, 300)).slice(0, 12) : [],
    });
  }
  if (byCategory.size !== CATEGORIES.length) throw new Error(`Analyse unvollständig (${byCategory.size}/10 Dimensionen).`);
  return CATEGORIES.map((id) => byCategory.get(id));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json(req, 401, { error: "unauthorized" });

  let runId: string | null = null;
  let actorId: string | null = null;
  let auditProjectId: string | null = null;
  let auditClientId: string | null = null;
  let auditOrgId: string | null = null;

  try {
    const body = await req.json();
    const projectId = String(body?.projectId || "");
    const context = String(body?.context || "").trim().slice(0, 8000);
    if (!projectId) return json(req, 400, { error: "Projekt-ID fehlt." });
    auditProjectId = projectId;

    const profiles = await db(auth, "profiles?select=id,role&limit=1");
    const profile = profiles?.[0];
    if (!profile || !["intern", "admin"].includes(profile.role)) return json(req, 403, { error: "Nur das SYMMEDIS-Team darf Analysen starten." });
    actorId = profile.id;

    if (!AI_ENABLED) return json(req, 503, { error: "KI-Kosten sind für diese Umgebung bewusst deaktiviert. Aktivierung erfolgt erst nach Freigabe durch SYMMEDIS.", code: "ai_disabled" });
    if (!ANTHROPIC_API_KEY || !ANTHROPIC_MODEL) return json(req, 503, { error: "KI-Analyse ist noch nicht vollständig konfiguriert.", code: "ai_not_configured" });

    const since = encodeURIComponent(new Date(Date.now() - 10 * 60 * 1000).toISOString());
    const recentRuns = await db(auth, `analysis_runs?created_by=eq.${encodeURIComponent(profile.id)}&created_at=gte.${since}&select=id&limit=${MAX_RUNS_PER_10_MINUTES}`);
    if ((recentRuns || []).length >= MAX_RUNS_PER_10_MINUTES) return json(req, 429, { error: "Analyse-Limit erreicht. Bitte in einigen Minuten erneut versuchen." });

    const projects = await db(auth, `projects?id=eq.${encodeURIComponent(projectId)}&select=id,name,client_id,status&limit=1`);
    const project = projects?.[0];
    if (!project) return json(req, 404, { error: "Projekt nicht gefunden." });
    auditClientId = project.client_id;

    const clients = await db(auth, `clients?id=eq.${encodeURIComponent(project.client_id)}&select=id,organization_id,name,industry,location,employee_count,contact&limit=1`);
    const client = clients?.[0];
    if (!client) return json(req, 404, { error: "Kunde nicht gefunden." });
    auditOrgId = client.organization_id;

    const documents = await db(auth, `documents?project_id=eq.${encodeURIComponent(projectId)}&select=id,name,file_type,size_bytes,storage_path,status&order=created_at.desc&limit=20`);
    const runs = await db(auth, "analysis_runs", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify({ project_id: projectId, status: "running", model: ANTHROPIC_MODEL, source_documents: 0, finding_count: 0, started_at: new Date().toISOString(), created_by: profile.id }) });
    runId = runs?.[0]?.id || null;
    await adminInsert("audit_events", { organization_id: auditOrgId, client_id: auditClientId, project_id: projectId, actor_user_id: actorId, event_type: "analysis.started", entity_type: "analysis_run", entity_id: runId, summary: "KI-Ursachenanalyse gestartet", metadata: { model: ANTHROPIC_MODEL } }).catch(() => undefined);

    const { blocks: sourceBlocks, used } = await loadSourceBlocks(auth, documents || []);
    const allDocumentNames = (documents || []).map((d: any) => d.name).join(", ") || "keine";
    const promptBlocks = [{ type: "text", text: `Führe eine belastbare strategische Ursachenanalyse für dieses Unternehmen durch.\n\nUnternehmen: ${client.name}\nBranche: ${client.industry || "nicht angegeben"}\nOrt: ${client.location || "nicht angegeben"}\nMitarbeitende: ${client.employee_count || "nicht angegeben"}\nProjekt: ${project.name}\nZusatzkontext des Analysten: ${context || "kein zusätzlicher Kontext"}\nVorhandene Dokumente: ${allDocumentNames}\n\nRegeln:\n- Bewerte exakt alle zehn vorgegebenen Dimensionen.\n- Trenne Beobachtung, Ursache, Auswirkung und Empfehlung sauber.\n- Erfinde keine Fakten, Kennzahlen, Quellen oder Wettbewerber.\n- Wenn Beleglage schwach ist, senke confidence deutlich und kennzeichne das im evidence-Feld.\n- evidence_sources darf nur tatsächlich bereitgestellte Dokumentnamen oder "Analystenbriefing" enthalten.\n- Score misst Reifegrad (0 schlecht, 100 stark), nicht Wichtigkeit.\n- Priorität misst Handlungsdruck.\n- Formuliere knapp, konkret, managementtauglich und auf Deutsch.` }, ...sourceBlocks];
    const tool = { name: "submit_analysis", description: "Übermittelt die vollständige SYMMEDIS-Ursachenanalyse mit exakt zehn Dimensionen.", input_schema: { type: "object", additionalProperties: false, properties: { findings: { type: "array", minItems: 10, maxItems: 10, items: { type: "object", additionalProperties: false, properties: { category_id: { type: "string", enum: CATEGORIES }, score: { type: "integer", minimum: 0, maximum: 100 }, observation: { type: "string" }, cause: { type: "string" }, impact: { type: "string" }, recommendation: { type: "string" }, evidence: { type: "string" }, priority: { type: "string", enum: ["hoch", "mittel", "niedrig"] }, confidence: { type: "integer", minimum: 0, maximum: 100 }, evidence_sources: { type: "array", items: { type: "string" }, maxItems: 12 } }, required: ["category_id", "score", "observation", "cause", "impact", "recommendation", "evidence", "priority", "confidence", "evidence_sources"] } } }, required: ["findings"] } };

    const aiResponse = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, { method: "POST", headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": ANTHROPIC_API_KEY }, body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 6000, system: "Du bist die interne Analyse-Engine von SYMMEDIS. Du arbeitest evidenzbasiert, konservativ bei Unsicherheit und veröffentlichst niemals direkt an Kunden. Deine Ausgabe wird immer von einem menschlichen Analysten geprüft.", messages: [{ role: "user", content: promptBlocks }], tools: [tool], tool_choice: { type: "tool", name: "submit_analysis" } }) });
    const aiData = await aiResponse.json().catch(() => null);
    if (!aiResponse.ok) throw new Error(aiData?.error?.message || `Anthropic API (${aiResponse.status})`);

    const usage = aiData?.usage || {};
    const toolUse = aiData?.content?.find((block: any) => block?.type === "tool_use" && block?.name === "submit_analysis");
    const findings = validateFindings(toolUse?.input?.findings || []);
    const rows = findings.map((finding: any) => ({ project_id: projectId, category_id: finding.category_id, score: finding.score, observation: finding.observation, cause: finding.cause, impact: finding.impact, recommendation: finding.recommendation, evidence: finding.evidence, priority: finding.priority, confidence: finding.confidence, evidence_sources: finding.evidence_sources, approval_status: "vorgeschlagen", customer_visible: false, internal_note: "", analysis_run_id: runId, updated_at: new Date().toISOString() }));
    await db(auth, "analysis_items?on_conflict=project_id,category_id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(rows) });

    const top = [...findings].sort((a: any, b: any) => a.score - b.score || b.confidence - a.confidence).slice(0, 3);
    await db(auth, "growth_blockers?on_conflict=project_id,rank", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(top.map((finding: any, index: number) => ({ project_id: projectId, rank: index + 1, title: finding.observation.slice(0, 180) || finding.category_id, category_id: finding.category_id, priority: finding.priority, description: finding.impact, cause: finding.cause, score: finding.score, next_action: finding.recommendation, status: "offen" }))) });
    await db(auth, `projects?id=eq.${projectId}`, { method: "PATCH", body: JSON.stringify({ status: "pruefung", progress: 55, updated_at: new Date().toISOString() }) });
    await db(auth, "activities", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ project_id: projectId, title: "KI-Ursachenanalyse erzeugt – menschliche Prüfung erforderlich", actor: "SYMMEDIS Analyse-Engine", tone: "warn", happened_at: new Date().toISOString() }) });

    if (runId) await db(auth, `analysis_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({
      status: "completed",
      source_documents: used,
      finding_count: findings.length,
      input_tokens: Number(usage.input_tokens || 0),
      output_tokens: Number(usage.output_tokens || 0),
      cache_read_input_tokens: Number(usage.cache_read_input_tokens || 0),
      cache_creation_input_tokens: Number(usage.cache_creation_input_tokens || 0),
      completed_at: new Date().toISOString(),
    }) });

    await adminInsert("audit_events", { organization_id: auditOrgId, client_id: auditClientId, project_id: projectId, actor_user_id: actorId, event_type: "analysis.completed", entity_type: "analysis_run", entity_id: runId, summary: "KI-Ursachenanalyse abgeschlossen – Prüfung erforderlich", metadata: { model: ANTHROPIC_MODEL, source_documents: used, findings: findings.length, input_tokens: Number(usage.input_tokens || 0), output_tokens: Number(usage.output_tokens || 0) } }).catch(() => undefined);
    return json(req, 200, { ok: true, runId, model: ANTHROPIC_MODEL, sourceDocuments: used, findings: findings.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analyse fehlgeschlagen.";
    if (runId) { try { await db(auth, `analysis_runs?id=eq.${runId}`, { method: "PATCH", body: JSON.stringify({ status: "failed", error_message: message.slice(0, 1000), completed_at: new Date().toISOString() }) }); } catch { /* best effort */ } }
    await adminInsert("audit_events", { organization_id: auditOrgId, client_id: auditClientId, project_id: auditProjectId, actor_user_id: actorId, event_type: "analysis.failed", entity_type: "analysis_run", entity_id: runId, summary: "KI-Ursachenanalyse fehlgeschlagen", metadata: { error: message.slice(0, 500) } }).catch(() => undefined);
    return json(req, 500, { error: message });
  }
});
