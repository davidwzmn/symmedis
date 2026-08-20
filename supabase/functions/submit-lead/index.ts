import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_ORIGIN = "https://davidwzmn.github.io";
const MAX_PER_15_MINUTES = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": origin === APP_ORIGIN ? origin : APP_ORIGIN,
    "Access-Control-Allow-Headers": "apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(req: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function normalize(value: unknown, max: number) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

async function sha256(value: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function adminRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || payload?.error || `Database request failed (${response.status})`);
  return payload;
}

async function recordLeadMetric(outcome: "success" | "failure", status: number, durationMs: number) {
  try {
    await adminRequest("rpc/record_operational_metric", {
      method: "POST",
      body: JSON.stringify({
        p_event_type: "lead_ingress",
        p_surface: "system",
        p_outcome: outcome,
        p_operation: "submit",
        p_route_family: "/termin",
        p_http_status: status,
        p_build_sha: "",
        p_duration_ms: Math.max(0, Math.round(durationMs)),
        p_metric_name: "",
        p_metric_value: null,
      }),
    });
  } catch (error) {
    console.error("lead metric record failed", error instanceof Error ? error.message : "unknown");
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });

  const origin = req.headers.get("Origin") || "";
  if (origin && origin !== APP_ORIGIN) return json(req, 403, { error: "origin_not_allowed" });

  const started = performance.now();
  let validIngestionAttempt = false;
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json(req, 400, { error: "Ungültige Anfrage." });
    if (normalize((body as Record<string, unknown>).website, 200)) return json(req, 200, { ok: true });

    const name = normalize((body as Record<string, unknown>).name, 120);
    const company = normalize((body as Record<string, unknown>).company, 160);
    const email = normalize((body as Record<string, unknown>).email, 254).toLowerCase();
    const situation = normalize((body as Record<string, unknown>).situation, 4000);
    const source = normalize((body as Record<string, unknown>).source || "website", 80) || "website";
    if (name.length < 2 || company.length < 2 || !EMAIL_RE.test(email)) return json(req, 422, { error: "Bitte Name, Unternehmen und eine gültige E-Mail-Adresse angeben." });

    const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("cf-connecting-ip") || "unknown";
    const ipHash = await sha256(`symmedis-lead:${forwarded}`);
    const userAgent = normalize(req.headers.get("user-agent"), 500);
    const since = encodeURIComponent(new Date(Date.now() - 15 * 60 * 1000).toISOString());
    const recent = await adminRequest(`website_leads?select=id&ip_hash=eq.${encodeURIComponent(ipHash)}&created_at=gte.${since}&limit=${MAX_PER_15_MINUTES}`);
    if ((recent || []).length >= MAX_PER_15_MINUTES) return json(req, 429, { error: "Zu viele Anfragen in kurzer Zeit. Bitte versuchen Sie es später erneut." });

    const duplicate = await adminRequest(`website_leads?select=id&email=eq.${encodeURIComponent(email)}&created_at=gte.${since}&limit=1`);
    if ((duplicate || []).length) return json(req, 200, { ok: true });

    validIngestionAttempt = true;
    await adminRequest("website_leads", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ name, company, email, situation, source, status: "new", ip_hash: ipHash, user_agent: userAgent }),
    });
    await recordLeadMetric("success", 201, performance.now() - started);
    return json(req, 201, { ok: true });
  } catch (error) {
    if (validIngestionAttempt) await recordLeadMetric("failure", 500, performance.now() - started);
    console.error("submit-lead failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "Die Anfrage konnte gerade nicht gespeichert werden. Bitte versuchen Sie es erneut." });
  }
});
