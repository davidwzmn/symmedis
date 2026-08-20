import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("SYMMEDIS_APP_URL") || "https://davidwzmn.github.io/symmedis/";
const EMAIL_AUTH_METHODS = new Set(["otp", "magiclink", "invite"]);

function originOf(value: string) {
  try { return new URL(value).origin; } catch { return ""; }
}
function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed = new Set([originOf(APP_URL), "https://davidwzmn.github.io"]);
  return {
    "Access-Control-Allow-Origin": allowed.has(origin) ? origin : originOf(APP_URL),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
function json(req: Request, status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(req) });
  if (req.method !== "POST") return json(req, 405, { error: "method_not_allowed" });

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(req, 401, { error: "unauthorized" });
  const token = authHeader.slice("Bearer ".length).trim();

  try {
    // Validate the token with Supabase Auth before trusting any decoded claims.
    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY, Authorization: authHeader },
    });
    const authUser = await userResponse.json().catch(() => null);
    if (!userResponse.ok || !authUser?.id) return json(req, 401, { error: "invalid_session" });

    const payload = decodeJwtPayload(token);
    const amr = Array.isArray(payload?.amr) ? payload.amr : [];
    const methods = new Set(amr.map((entry) => String((entry as Record<string, unknown>)?.method || "").toLowerCase()));
    const emailAuthMethod = [...methods].find((method) => EMAIL_AUTH_METHODS.has(method));
    if (!emailAuthMethod) return json(req, 202, { ok: true, recorded: false, reason: "not_email_auth" });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("id,email,role,organization_id,client_id")
      .eq("id", authUser.id)
      .maybeSingle();
    if (profileError || !profile || profile.role !== "kunde" || !profile.organization_id || !profile.client_id) {
      return json(req, 202, { ok: true, recorded: false, reason: "not_customer" });
    }
    if (String(profile.email || authUser.email || "").toLowerCase().endsWith("@example.invalid")) {
      return json(req, 202, { ok: true, recorded: false, reason: "synthetic_identity" });
    }

    const { data: invite, error: inviteError } = await admin
      .from("audit_events")
      .select("id,occurred_at,organization_id,client_id")
      .eq("event_type", "access.invited")
      .eq("entity_type", "profile")
      .eq("entity_id", authUser.id)
      .eq("organization_id", profile.organization_id)
      .eq("client_id", profile.client_id)
      .order("occurred_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (inviteError || !invite) return json(req, 202, { ok: true, recorded: false, reason: "no_product_invite" });

    const now = new Date().toISOString();
    const evidenceNote = `Serverseitig verifiziert: realer Kundenzugang aus SYMMEDIS-Invite wurde per E-Mail-Authentifizierung (${emailAuthMethod}) eingelöst.`;
    const rows = ["real_invite_delivery", "real_magic_link_login"].map((gateKey) => ({
      organization_id: profile.organization_id,
      gate_key: gateKey,
      status: "verified",
      source: "real_mailbox",
      evidence_note: evidenceNote,
      verified_at: now,
      created_by: null,
      updated_at: now,
    }));
    const { error: evidenceError } = await admin
      .from("launch_gate_evidence")
      .upsert(rows, { onConflict: "organization_id,gate_key" });
    if (evidenceError) throw evidenceError;

    const { error: auditError } = await admin.from("audit_events").insert({
      organization_id: profile.organization_id,
      client_id: profile.client_id,
      project_id: null,
      actor_user_id: profile.id,
      event_type: "launch.email_auth_verified",
      entity_type: "profile",
      entity_id: profile.id,
      summary: "Realer Kunden-Invite und E-Mail-Login verifiziert",
      metadata: { auth_method: emailAuthMethod, invite_audit_id: invite.id },
    });
    if (auditError) throw auditError;

    return json(req, 200, { ok: true, recorded: true, gates: ["real_invite_delivery", "real_magic_link_login"] });
  } catch (error) {
    console.error("auth-email-evidence failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "email_auth_evidence_failed" });
  }
});
