import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") || "";
const AI_ENABLED = Deno.env.get("SYMMEDIS_AI_ENABLED") === "true";
const ANTHROPIC_MODEL = Deno.env.get("ANTHROPIC_MODEL") || "";
const ANTHROPIC_BASE_URL = (Deno.env.get("ANTHROPIC_BASE_URL") || "https://api.anthropic.com").replace(/\/+$/, "");
const APP_URL = Deno.env.get("SYMMEDIS_APP_URL") || "https://davidwzmn.github.io/symmedis/";
const MAX_TEXT_CHARS = 180_000;
const MAX_PDF_BYTES = 18 * 1024 * 1024;

function originOf(value: string) { try { return new URL(value).origin; } catch { return ""; } }
function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = new Set([originOf(APP_URL), "https://davidwzmn.github.io"]);
  return {
    "Access-Control-Allow-Origin": allowed.has(origin) ? origin : originOf(APP_URL),
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
function userHeaders(auth: string) { return { apikey: ANON_KEY, Authorization: auth, "Content-Type": "application/json" }; }
function adminHeaders(jsonContent = true) { return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, ...(jsonContent ? { "Content-Type": "application/json" } : {}) }; }
async function api(path: string, headers: Record<string,string>, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || `Supabase request failed (${response.status})`);
  return data;
}
async function authenticatedUserId(auth: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: auth } });
  const user = await response.json().catch(() => null);
  return response.ok && user?.id ? String(user.id) : null;
}
function pathEncode(path: string) { return path.split("/").map(encodeURIComponent).join("/"); }
function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
  return btoa(binary);
}
function cleanText(value: string) { return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/[\t ]+/g, " ").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_TEXT_CHARS); }
function chunks(text: string) {
  const size = 1400, overlap = 180, out: string[] = [];
  let start = 0;
  while (start < text.length && out.length < 160) {
    let end = Math.min(text.length, start + size);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf("\n", end), text.lastIndexOf(". ", end));
      if (boundary > start + 700) end = boundary + 1;
    }
    const chunk = text.slice(start, end).trim();
    if (chunk) out.push(chunk);
    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return out;
}
async function extractPdf(bytes: Uint8Array, title: string) {
  if (!AI_ENABLED || !ANTHROPIC_API_KEY || !ANTHROPIC_MODEL) return null;
  const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": ANTHROPIC_API_KEY },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 8000,
      system: "Extrahiere ausschließlich den belegbaren Textinhalt des bereitgestellten Dokuments für eine interne Wissenssuche. Erfinde nichts, kommentiere nichts und gib nur kompakten Fließtext mit sinnvollen Abschnittsüberschriften zurück.",
      messages: [{ role: "user", content: [
        { type: "text", text: `Dokument: ${title}` },
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: bytesToBase64(bytes) } },
      ] }],
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error?.message || `PDF extraction failed (${response.status})`);
  return cleanText((data?.content || []).filter((block: any) => block?.type === "text").map((block: any) => block.text).join("\n\n"));
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json(req, 401, { error: "unauthorized" });

  let documentId = "";
  try {
    const userId = await authenticatedUserId(auth);
    if (!userId) return json(req, 401, { error: "Sitzung ist ungültig oder abgelaufen." });
    const profiles = await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,role,organization_id,client_id&limit=1`, userHeaders(auth));
    const profile = profiles?.[0];
    if (!profile) return json(req, 403, { error: "Für diesen Zugang ist kein SYMMEDIS-Profil freigeschaltet." });
    const isStaff = ["intern", "admin"].includes(profile.role);

    const body = await req.json();
    documentId = String(body?.documentId || "");
    if (!documentId) return json(req, 400, { error: "Dokument-ID fehlt." });

    const docs = await api(`/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}&select=id,project_id,name,file_type,storage_path&limit=1`, userHeaders(auth));
    const document = docs?.[0];
    if (!document) return json(req, 404, { error: "Dokument nicht gefunden oder nicht zugreifbar." });
    const projects = await api(`/rest/v1/projects?id=eq.${encodeURIComponent(document.project_id)}&select=id,client_id&limit=1`, userHeaders(auth));
    const project = projects?.[0];
    if (!project) return json(req, 404, { error: "Projekt nicht gefunden." });
    const clients = await api(`/rest/v1/clients?id=eq.${encodeURIComponent(project.client_id)}&select=id,organization_id&limit=1`, userHeaders(auth));
    const client = clients?.[0];
    if (!client) return json(req, 404, { error: "Kunde nicht gefunden." });
    if (isStaff && client.organization_id !== profile.organization_id) return json(req, 403, { error: "Projekt gehört nicht zu Ihrer Organisation." });
    if (!isStaff && profile.client_id !== client.id) return json(req, 403, { error: "Projekt gehört nicht zu Ihrem Kundenzugang." });

    const type = String(document.file_type || "").toLowerCase();

    if (type === "pdf" && !isStaff) {
      const reason = "PDF-Extraktion mit potenziellen KI-Kosten wird ausschließlich durch das SYMMEDIS-Team gestartet.";
      await api(`/rest/v1/documents?id=eq.${document.id}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "pending", index_error: reason }) });
      return json(req, 202, { ok: true, pending: true, reason: "staff_review_required" });
    }

    await api(`/rest/v1/documents?id=eq.${document.id}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "indexing", index_error: "" }) });

    const fileResponse = await fetch(`${SUPABASE_URL}/storage/v1/object/authenticated/project-files/${pathEncode(document.storage_path)}`, { headers: { apikey: ANON_KEY, Authorization: auth } });
    if (!fileResponse.ok) throw new Error(`Datei konnte nicht gelesen werden (${fileResponse.status}).`);

    let text = "";
    if (["txt", "csv"].includes(type)) {
      text = cleanText(await fileResponse.text());
    } else if (type === "pdf") {
      const bytes = new Uint8Array(await fileResponse.arrayBuffer());
      if (bytes.byteLength > MAX_PDF_BYTES) throw new Error("PDF ist für die Indexierung zu groß.");
      const extracted = await extractPdf(bytes, document.name);
      if (!extracted) {
        const reason = !AI_ENABLED
          ? "Bezahlte KI-Extraktion ist in dieser Umgebung deaktiviert."
          : !ANTHROPIC_API_KEY || !ANTHROPIC_MODEL
            ? "KI-Extraktion ist noch nicht vollständig konfiguriert."
            : "PDF konnte nicht extrahiert werden.";
        await api(`/rest/v1/documents?id=eq.${document.id}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "pending", index_error: reason }) });
        return json(req, 202, { ok: true, pending: true, reason: !AI_ENABLED ? "ai_disabled" : "ai_not_configured" });
      }
      text = extracted;
    } else {
      await api(`/rest/v1/documents?id=eq.${document.id}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "unsupported", index_error: `Automatische Textextraktion für .${type || "unknown"} ist noch nicht aktiviert.` }) });
      return json(req, 200, { ok: true, indexed: false, unsupported: true });
    }

    const parts = chunks(text);
    if (!parts.length) throw new Error("Dokument enthält keinen indexierbaren Text.");
    await api(`/rest/v1/knowledge_chunks?document_id=eq.${document.id}`, adminHeaders(), { method: "DELETE" });
    await api(`/rest/v1/knowledge_chunks`, adminHeaders(), {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(parts.map((content, index) => ({ project_id: document.project_id, document_id: document.id, source_label: document.name, chunk_index: index, content, metadata: { file_type: type, indexed_by: "index-document-v4" } }))),
    });
    await api(`/rest/v1/documents?id=eq.${document.id}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "indexed", index_error: "", indexed_at: new Date().toISOString() }) });

    await api(`/rest/v1/audit_events`, adminHeaders(), { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: client.organization_id, client_id: project.client_id, project_id: document.project_id, actor_user_id: profile.id, event_type: "document.indexed", entity_type: "document", entity_id: document.id, summary: `Dokument indexiert: ${document.name}`, metadata: { chunks: parts.length, file_type: type, actor_role: profile.role } }) }).catch(() => null);

    return json(req, 200, { ok: true, indexed: true, chunks: parts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexierung fehlgeschlagen.";
    if (documentId) await api(`/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "failed", index_error: message.slice(0, 1000) }) }).catch(() => null);
    return json(req, 500, { error: message });
  }
});
