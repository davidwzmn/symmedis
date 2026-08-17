import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("SYMMEDIS_APP_URL") || "https://davidwzmn.github.io/symmedis/";
const MAX_INVITES_PER_HOUR = 20;

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
async function authenticatedUserId(authHeader: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: authHeader } });
  const user = await response.json().catch(() => null);
  return response.ok && user?.id ? String(user.id) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(req, 401, { error: "unauthorized" });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false, autoRefreshToken: false } });
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const userId = await authenticatedUserId(authHeader);
    if (!userId) return json(req, 401, { error: "Sitzung ist ungültig oder abgelaufen." });

    const { data: caller, error: callerError } = await userClient.from("profiles").select("id,role,organization_id").eq("id", userId).maybeSingle();
    if (callerError || !caller || !["intern", "admin"].includes(caller.role)) return json(req, 403, { error: "Nur das SYMMEDIS-Team darf Zugänge einladen." });

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin.from("audit_events").select("id", { count: "exact", head: true }).eq("actor_user_id", caller.id).eq("event_type", "access.invited").gte("occurred_at", since);
    if ((count || 0) >= MAX_INVITES_PER_HOUR) return json(req, 429, { error: "Invite-Limit erreicht. Bitte später erneut versuchen." });

    const body = await req.json();
    const clientId = String(body?.clientId || "");
    const projectId = body?.projectId ? String(body.projectId) : null;
    const email = String(body?.email || "").trim().toLowerCase();
    const fullName = String(body?.fullName || "").trim().slice(0, 160);
    if (!clientId || !email.includes("@") || email.length > 254) return json(req, 400, { error: "Kunde und gültige E-Mail-Adresse sind erforderlich." });

    const { data: client, error: clientError } = await userClient.from("clients").select("id,organization_id,name").eq("id", clientId).maybeSingle();
    if (clientError || !client || client.organization_id !== caller.organization_id) return json(req, 404, { error: "Kunde nicht gefunden." });

    if (projectId) {
      const { data: project, error: projectError } = await userClient.from("projects").select("id,client_id").eq("id", projectId).eq("client_id", client.id).maybeSingle();
      if (projectError || !project) return json(req, 400, { error: "Projekt gehört nicht zu diesem Kunden." });
    }

    const { data: existingProfile } = await admin.from("profiles").select("id,role,client_id").eq("email", email).maybeSingle();
    if (existingProfile) {
      const sameAccess = existingProfile.role === "kunde" && existingProfile.client_id === client.id;
      return json(req, 409, { error: sameAccess ? "Für diese E-Mail existiert bereits ein Kundenzugang." : "Für diese E-Mail existiert bereits ein anderer SYMMEDIS-Zugang." });
    }

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, { data: { full_name: fullName, client_name: client.name }, redirectTo: `${APP_URL.replace(/\/$/, "")}/` });
    if (inviteError) {
      const message = String(inviteError.message || "");
      if (/already|registered|exists/i.test(message)) return json(req, 409, { error: "Für diese E-Mail existiert bereits ein Auth-Zugang. Bitte den bestehenden Zugang prüfen." });
      throw inviteError;
    }
    if (!invited.user?.id) throw new Error("Einladung erzeugte keine Benutzer-ID.");

    const { error: profileError } = await admin.from("profiles").upsert({ id: invited.user.id, email, full_name: fullName || email.split("@")[0], role: "kunde", organization_id: client.organization_id, client_id: client.id, updated_at: new Date().toISOString() });
    if (profileError) throw profileError;

    await admin.from("activities").insert({ project_id: projectId, title: `Kunden-Zugang eingeladen: ${email}`, actor: "SYMMEDIS", tone: "info", happened_at: new Date().toISOString() }).then(() => undefined).catch(() => undefined);
    await admin.from("audit_events").insert({ organization_id: client.organization_id, client_id: client.id, project_id: projectId, actor_user_id: caller.id, event_type: "access.invited", entity_type: "profile", entity_id: invited.user.id, summary: "Kundenzugang eingeladen", metadata: { invited_email_domain: email.split("@")[1] || "", redirect_origin: originOf(APP_URL) } }).then(() => undefined).catch(() => undefined);

    return json(req, 200, { ok: true, userId: invited.user.id, email });
  } catch (error) {
    console.error("invite-user failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "Einladung konnte nicht verarbeitet werden." });
  }
});
