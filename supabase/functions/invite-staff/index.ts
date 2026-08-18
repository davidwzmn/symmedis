import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("SYMMEDIS_APP_URL") || "https://davidwzmn.github.io/symmedis/";
const MAX_INVITES_PER_HOUR = 10;
const STAFF_ROLES = new Set(["intern", "admin"]);

function originOf(value: string) {
  try { return new URL(value).origin; } catch { return ""; }
}

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
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function authenticatedUserId(authHeader: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: authHeader },
  });
  const user = await response.json().catch(() => null);
  return response.ok && user?.id ? String(user.id) : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(req, 401, { error: "unauthorized" });

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const userId = await authenticatedUserId(authHeader);
    if (!userId) return json(req, 401, { error: "Sitzung ist ungültig oder abgelaufen." });

    const { data: caller, error: callerError } = await userClient
      .from("profiles")
      .select("id,role,organization_id")
      .eq("id", userId)
      .maybeSingle();

    if (callerError || !caller || caller.role !== "admin") {
      return json(req, 403, { error: "Nur Administrator:innen dürfen Teamzugänge einladen." });
    }

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("audit_events")
      .select("id", { count: "exact", head: true })
      .eq("actor_user_id", caller.id)
      .eq("event_type", "staff.invited")
      .gte("occurred_at", since);

    if ((count || 0) >= MAX_INVITES_PER_HOUR) {
      return json(req, 429, { error: "Einladungs-Limit erreicht. Bitte später erneut versuchen." });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const fullName = String(body?.fullName || "").trim().slice(0, 160);
    const role = String(body?.role || "intern").trim().toLowerCase();

    if (!email.includes("@") || email.length > 254) {
      return json(req, 400, { error: "Eine gültige E-Mail-Adresse ist erforderlich." });
    }
    if (!STAFF_ROLES.has(role)) {
      return json(req, 400, { error: "Ungültige Teamrolle." });
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id,role,organization_id,client_id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      const sameOrg = existingProfile.organization_id === caller.organization_id;
      const sameStaffRole = STAFF_ROLES.has(existingProfile.role) && !existingProfile.client_id;
      return json(req, 409, {
        error: sameOrg && sameStaffRole
          ? "Für diese E-Mail existiert bereits ein Teamzugang."
          : "Für diese E-Mail existiert bereits ein anderer SYMMEDIS-Zugang.",
      });
    }

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName, invited_role: role },
      redirectTo: `${APP_URL.replace(/\/$/, "")}/`,
    });

    if (inviteError) {
      const message = String(inviteError.message || "");
      if (/already|registered|exists/i.test(message)) {
        return json(req, 409, { error: "Für diese E-Mail existiert bereits ein Auth-Zugang." });
      }
      throw inviteError;
    }
    if (!invited.user?.id) throw new Error("Einladung erzeugte keine Benutzer-ID.");

    const { error: profileError } = await admin.from("profiles").upsert({
      id: invited.user.id,
      email,
      full_name: fullName || email.split("@")[0],
      role,
      organization_id: caller.organization_id,
      client_id: null,
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(invited.user.id).catch(() => undefined);
      throw profileError;
    }

    await admin.from("audit_events").insert({
      organization_id: caller.organization_id,
      actor_user_id: caller.id,
      event_type: "staff.invited",
      entity_type: "profile",
      entity_id: invited.user.id,
      summary: "Teamzugang eingeladen",
      metadata: { invited_role: role, invited_email_domain: email.split("@")[1] || "" },
    }).then(() => undefined).catch(() => undefined);

    return json(req, 200, { ok: true, userId: invited.user.id, email, role });
  } catch (error) {
    console.error("invite-staff failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "Teamzugang konnte nicht verarbeitet werden." });
  }
});
