import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_ORIGIN = "https://davidwzmn.github.io";
const ALLOWED_STATUS = new Set(["new", "contacted", "qualified", "closed", "spam"]);

function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  return {
    "Access-Control-Allow-Origin": origin === APP_ORIGIN ? origin : APP_ORIGIN,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), { status, headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
async function request(path: string, key: string, auth: string, init: RequestInit = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: auth, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || payload?.error || `Database request failed (${response.status})`);
  return payload;
}
async function authenticatedUserId(auth: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: auth } });
  const user = await response.json().catch(() => null);
  return response.ok && user?.id ? String(user.id) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json(req, 401, { error: "unauthorized" });

  try {
    const userId = await authenticatedUserId(auth);
    if (!userId) return json(req, 401, { error: "Sitzung ist ungültig oder abgelaufen." });

    const profiles = await request(`profiles?id=eq.${encodeURIComponent(userId)}&select=id,role,organization_id&limit=1`, ANON_KEY, auth);
    const profile = profiles?.[0];
    if (!profile || !["intern", "admin"].includes(profile.role)) return json(req, 403, { error: "forbidden" });

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "list");
    const serviceAuth = `Bearer ${SERVICE_KEY}`;

    if (action === "list") {
      const leads = await request("website_leads?select=id,name,company,email,situation,source,status,created_at&order=created_at.desc&limit=100", SERVICE_KEY, serviceAuth);
      return json(req, 200, { leads: leads || [] });
    }

    if (action === "update") {
      const id = String(body?.id || "");
      const status = String(body?.status || "");
      if (!/^[0-9a-f-]{36}$/i.test(id) || !ALLOWED_STATUS.has(status)) return json(req, 422, { error: "invalid_update" });
      const rows = await request(`website_leads?id=eq.${encodeURIComponent(id)}`, SERVICE_KEY, serviceAuth, {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({ status }),
      });
      if (!rows?.[0]) return json(req, 404, { error: "lead_not_found" });

      await request("audit_events", SERVICE_KEY, serviceAuth, {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ organization_id: profile.organization_id, actor_user_id: profile.id, event_type: "lead.status_updated", entity_type: "website_lead", entity_id: id, summary: `Website-Anfrage auf ${status} gesetzt`, metadata: { status } }),
      }).catch(() => undefined);

      return json(req, 200, { lead: rows[0] });
    }

    return json(req, 400, { error: "unknown_action" });
  } catch (error) {
    console.error("manage-leads failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "Anfragen konnten nicht verarbeitet werden." });
  }
});
