import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { unzipSync } from "fflate";

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
const MAX_OFFICE_BYTES = 25 * 1024 * 1024;
const MAX_OFFICE_UNCOMPRESSED_BYTES = 96 * 1024 * 1024;
const MAX_OFFICE_ENTRY_BYTES = 32 * 1024 * 1024;
const MAX_OFFICE_ENTRIES = 2500;
const MAX_OFFICE_COMPRESSION_RATIO = 60;

function originOf(value: string) { try { return new URL(value).origin; } catch { return ""; } }
function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = new Set([originOf(APP_URL), "https://davidwzmn.github.io", "http://127.0.0.1:4176"]);
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
function decodeXmlText(value: string) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code))).replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}
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
function readU16(bytes: Uint8Array, offset: number) { return bytes[offset] | (bytes[offset + 1] << 8); }
function readU32(bytes: Uint8Array, offset: number) { return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0; }
function inspectOfficeArchive(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_OFFICE_BYTES) throw new Error("Office-Dokument ist für die Indexierung zu groß.");
  const minEocd = 22;
  if (bytes.length < minEocd) throw new Error("Office-Datei ist kein gültiges ZIP-Archiv.");
  const searchStart = Math.max(0, bytes.length - 65_557);
  let eocd = -1;
  for (let offset = bytes.length - minEocd; offset >= searchStart; offset -= 1) {
    if (readU32(bytes, offset) === 0x06054b50) { eocd = offset; break; }
  }
  if (eocd < 0) throw new Error("Office-Datei enthält kein gültiges ZIP-Verzeichnis.");
  const entries = readU16(bytes, eocd + 10);
  const centralSize = readU32(bytes, eocd + 12);
  const centralOffset = readU32(bytes, eocd + 16);
  if (entries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) throw new Error("ZIP64-Office-Dateien werden aus Sicherheitsgründen nicht indexiert.");
  if (entries === 0 || entries > MAX_OFFICE_ENTRIES) throw new Error(`Office-Archiv enthält zu viele Einträge (maximal ${MAX_OFFICE_ENTRIES}).`);
  if (centralOffset + centralSize > bytes.length) throw new Error("Office-Archiv enthält ein beschädigtes ZIP-Verzeichnis.");
  let offset = centralOffset;
  let seen = 0;
  let compressedTotal = 0;
  let uncompressedTotal = 0;
  while (offset < centralOffset + centralSize && seen < entries) {
    if (readU32(bytes, offset) !== 0x02014b50) throw new Error("Office-Archiv enthält einen ungültigen ZIP-Eintrag.");
    const flags = readU16(bytes, offset + 8);
    const compressed = readU32(bytes, offset + 20);
    const uncompressed = readU32(bytes, offset + 24);
    const nameLength = readU16(bytes, offset + 28);
    const extraLength = readU16(bytes, offset + 30);
    const commentLength = readU16(bytes, offset + 32);
    if (flags & 0x0001) throw new Error("Passwortgeschützte Office-Dateien können nicht indexiert werden.");
    if (compressed === 0xffffffff || uncompressed === 0xffffffff) throw new Error("ZIP64-Einträge werden aus Sicherheitsgründen nicht indexiert.");
    if (uncompressed > MAX_OFFICE_ENTRY_BYTES) throw new Error("Office-Archiv enthält einen ungewöhnlich großen Eintrag und wurde aus Sicherheitsgründen abgelehnt.");
    compressedTotal += compressed;
    uncompressedTotal += uncompressed;
    if (uncompressedTotal > MAX_OFFICE_UNCOMPRESSED_BYTES) throw new Error("Office-Archiv würde beim Entpacken zu viel Speicher benötigen.");
    offset += 46 + nameLength + extraLength + commentLength;
    seen += 1;
  }
  if (seen !== entries || offset > centralOffset + centralSize) throw new Error("Office-Archiv enthält ein inkonsistentes ZIP-Verzeichnis.");
  const ratio = compressedTotal > 0 ? uncompressedTotal / compressedTotal : uncompressedTotal > 0 ? Infinity : 1;
  if (uncompressedTotal > 8 * 1024 * 1024 && ratio > MAX_OFFICE_COMPRESSION_RATIO) throw new Error("Office-Archiv ist ungewöhnlich stark komprimiert und wurde aus Sicherheitsgründen abgelehnt.");
  return { entries, compressedTotal, uncompressedTotal };
}
function xmlFromZip(files: Record<string, Uint8Array>, name: string) { const file = files[name]; return file ? new TextDecoder().decode(file) : ""; }
function xmlText(xml: string) {
  if (!xml) return "";
  return decodeXmlText(xml.replace(/<w:tab\/?\s*>/g, "\t").replace(/<w:br\/?\s*>/g, "\n").replace(/<a:br\/?\s*>/g, "\n").replace(/<\/w:p>/g, "\n").replace(/<\/a:p>/g, "\n").replace(/<\/row>/g, "\n").replace(/<[^>]+>/g, " "));
}
function extractDocx(files: Record<string, Uint8Array>) {
  const parts = [xmlText(xmlFromZip(files, "word/document.xml")), ...Object.keys(files).filter((name) => /^word\/(header|footer)\d+\.xml$/.test(name)).sort().map((name) => xmlText(xmlFromZip(files, name)))];
  return cleanText(parts.filter(Boolean).join("\n\n"));
}
function extractPptx(files: Record<string, Uint8Array>) {
  const slideNames = Object.keys(files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/slide(\d+)/)?.[1] || 0) - Number(b.match(/slide(\d+)/)?.[1] || 0));
  return cleanText(slideNames.map((name, index) => `Folie ${index + 1}\n${xmlText(xmlFromZip(files, name))}`).join("\n\n"));
}
function cellRefs(xml: string) { return [...xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)].map((match) => ({ attrs: match[1], inner: match[2] })); }
function extractXlsx(files: Record<string, Uint8Array>) {
  const sharedXml = xmlFromZip(files, "xl/sharedStrings.xml");
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => cleanText(xmlText(match[1])));
  const sheets = Object.keys(files).filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/sheet(\d+)/)?.[1] || 0) - Number(b.match(/sheet(\d+)/)?.[1] || 0));
  const output: string[] = [];
  sheets.forEach((name, index) => {
    const xml = xmlFromZip(files, name);
    const values = cellRefs(xml).map(({ attrs, inner }) => {
      const type = attrs.match(/\bt="([^"]+)"/)?.[1] || "";
      if (type === "inlineStr") return cleanText(xmlText(inner.match(/<is>([\s\S]*?)<\/is>/)?.[1] || ""));
      const raw = decodeXmlText(inner.match(/<v>([\s\S]*?)<\/v>/)?.[1] || "").trim();
      if (!raw) return "";
      if (type === "s") return shared[Number(raw)] || "";
      if (type === "b") return raw === "1" ? "WAHR" : "FALSCH";
      return raw;
    }).filter(Boolean);
    if (values.length) output.push(`Tabelle ${index + 1}\n${values.join(" | ")}`);
  });
  return cleanText(output.join("\n\n"));
}
function extractOffice(bytes: Uint8Array, type: string) {
  inspectOfficeArchive(bytes);
  const files = unzipSync(bytes);
  const actualSize = Object.values(files).reduce((sum, value) => sum + value.byteLength, 0);
  if (Object.keys(files).length > MAX_OFFICE_ENTRIES || actualSize > MAX_OFFICE_UNCOMPRESSED_BYTES) throw new Error("Office-Archiv überschreitet nach dem Entpacken die sichere Verarbeitungsgrenze.");
  if (type === "docx") return extractDocx(files);
  if (type === "pptx") return extractPptx(files);
  if (type === "xlsx") return extractXlsx(files);
  return "";
}
async function extractPdf(bytes: Uint8Array, title: string) {
  if (!AI_ENABLED || !ANTHROPIC_API_KEY || !ANTHROPIC_MODEL) return null;
  const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": ANTHROPIC_API_KEY },
    body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 8000, system: "Extrahiere ausschließlich den belegbaren Textinhalt des bereitgestellten Dokuments für eine interne Wissenssuche. Erfinde nichts, kommentiere nichts und gib nur kompakten Fließtext mit sinnvollen Abschnittsüberschriften zurück.", messages: [{ role: "user", content: [{ type: "text", text: `Dokument: ${title}` }, { type: "document", source: { type: "base64", media_type: "application/pdf", data: bytesToBase64(bytes) } }] }] }),
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
    if (["txt", "csv"].includes(type)) text = cleanText(await fileResponse.text());
    else if (["docx", "xlsx", "pptx"].includes(type)) text = extractOffice(new Uint8Array(await fileResponse.arrayBuffer()), type);
    else if (type === "pdf") {
      const bytes = new Uint8Array(await fileResponse.arrayBuffer());
      if (bytes.byteLength > MAX_PDF_BYTES) throw new Error("PDF ist für die Indexierung zu groß.");
      const extracted = await extractPdf(bytes, document.name);
      if (!extracted) {
        const reason = !AI_ENABLED ? "Bezahlte KI-Extraktion ist in dieser Umgebung deaktiviert." : !ANTHROPIC_API_KEY || !ANTHROPIC_MODEL ? "KI-Extraktion ist noch nicht vollständig konfiguriert." : "PDF konnte nicht extrahiert werden.";
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
    await api(`/rest/v1/knowledge_chunks`, adminHeaders(), { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(parts.map((content, index) => ({ project_id: document.project_id, document_id: document.id, source_label: document.name, chunk_index: index, content, metadata: { file_type: type, indexed_by: "index-document-v7" } }))) });
    await api(`/rest/v1/documents?id=eq.${document.id}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "indexed", index_error: "", indexed_at: new Date().toISOString() }) });
    await api(`/rest/v1/audit_events`, adminHeaders(), { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify({ organization_id: client.organization_id, client_id: project.client_id, project_id: document.project_id, actor_user_id: profile.id, event_type: "document.indexed", entity_type: "document", entity_id: document.id, summary: `Dokument indexiert: ${document.name}`, metadata: { chunks: parts.length, file_type: type, actor_role: profile.role, extraction: ["docx", "xlsx", "pptx"].includes(type) ? "local_office_parser" : type === "pdf" ? "ai_pdf_parser" : "plain_text", archive_guard: ["docx", "xlsx", "pptx"].includes(type) ? "central_directory_v1" : null } }) }).catch(() => null);
    return json(req, 200, { ok: true, indexed: true, chunks: parts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Indexierung fehlgeschlagen.";
    if (documentId) await api(`/rest/v1/documents?id=eq.${encodeURIComponent(documentId)}`, adminHeaders(), { method: "PATCH", body: JSON.stringify({ index_status: "failed", index_error: message.slice(0, 1000) }) }).catch(() => null);
    return json(req, 500, { error: message });
  }
});
