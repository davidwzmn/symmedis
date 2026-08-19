import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GITHUB_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_JWKS = "https://token.actions.githubusercontent.com/.well-known/jwks";
const EXPECTED_AUDIENCE = "symmedis-e2e-bootstrap";
const EXPECTED_REPOSITORY = "davidwzmn/symmedis";
const EXPECTED_REPOSITORY_ID = "1314992444";
const EXPECTED_REF = "refs/heads/agent/supabase-auth-foundation";
const EXPECTED_WORKFLOW_REF = "davidwzmn/symmedis/.github/workflows/cross-role-e2e.yml@refs/heads/agent/supabase-auth-foundation";
const FIXTURE_PROJECT_ID = "a551b1c8-55d0-4a90-8897-1408e7a08bac";
const FIXTURE_VERSION = 1;
const ALLOWED_EVENTS = new Set(["push", "workflow_dispatch"]);
const AUTH_PAGE_SIZE = 1000;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(normalized);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function parseJsonPart(part: string) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(part)));
}

async function verifyGitHubOidc(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("invalid_oidc_token");
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseJsonPart(encodedHeader);
  const claims = parseJsonPart(encodedPayload);
  if (header?.alg !== "RS256" || !header?.kid) throw new Error("invalid_oidc_header");

  const jwksResponse = await fetch(GITHUB_JWKS, { headers: { Accept: "application/json" } });
  if (!jwksResponse.ok) throw new Error("github_jwks_unavailable");
  const jwks = await jwksResponse.json();
  const jwk = Array.isArray(jwks?.keys) ? jwks.keys.find((key: { kid?: string }) => key.kid === header.kid) : null;
  if (!jwk) throw new Error("github_oidc_key_not_found");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    decodeBase64Url(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`),
  );
  if (!validSignature) throw new Error("invalid_oidc_signature");

  const now = Math.floor(Date.now() / 1000);
  if (claims?.iss !== GITHUB_ISSUER) throw new Error("invalid_oidc_issuer");
  if (claims?.aud !== EXPECTED_AUDIENCE) throw new Error("invalid_oidc_audience");
  if (!Number.isFinite(Number(claims?.exp)) || Number(claims.exp) < now - 5) throw new Error("expired_oidc_token");
  if (Number.isFinite(Number(claims?.nbf)) && Number(claims.nbf) > now + 30) throw new Error("oidc_not_yet_valid");
  if (Number.isFinite(Number(claims?.iat)) && Math.abs(now - Number(claims.iat)) > 15 * 60) throw new Error("stale_oidc_token");
  if (claims?.repository !== EXPECTED_REPOSITORY || String(claims?.repository_id || "") !== EXPECTED_REPOSITORY_ID) throw new Error("wrong_repository");
  if (claims?.repository_visibility !== "public") throw new Error("wrong_repository_visibility");
  if (claims?.ref !== EXPECTED_REF || claims?.ref_type !== "branch") throw new Error("wrong_ref");
  if (claims?.workflow_ref !== EXPECTED_WORKFLOW_REF) throw new Error("wrong_workflow");
  if (!ALLOWED_EVENTS.has(String(claims?.event_name || ""))) throw new Error("wrong_event");
  if (claims?.runner_environment !== "github-hosted") throw new Error("wrong_runner_environment");
  if (!claims?.run_id || !claims?.run_attempt) throw new Error("missing_run_identity");
  return claims;
}

function randomPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const body = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `Aa1!${body}`;
}

function runEmails(claims: Record<string, unknown>) {
  const run = String(claims.run_id).replace(/[^0-9]/g, "");
  const attempt = String(claims.run_attempt).replace(/[^0-9]/g, "");
  if (!run || !attempt) throw new Error("invalid_run_identity");
  const suffix = `${run}-${attempt}`;
  return {
    staff: `symmedis-e2e-staff-${suffix}@example.invalid`,
    customer: `symmedis-e2e-customer-${suffix}@example.invalid`,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "oidc_required" });

  try {
    const claims = await verifyGitHubOidc(authHeader.slice(7));
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "bootstrap");
    if (String(body?.runId || "") !== String(claims.run_id)) return json(403, { error: "run_id_mismatch" });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id,client_id,metadata")
      .eq("id", FIXTURE_PROJECT_ID)
      .maybeSingle();
    if (
      projectError || !project
      || project.metadata?.e2e_fixture !== true
      || project.metadata?.allow_mutating_e2e !== true
      || project.metadata?.environment !== "staging"
      || Number(project.metadata?.fixture_version) !== FIXTURE_VERSION
    ) {
      return json(409, { error: "fixture_safety_contract_failed" });
    }
    const { data: client, error: clientError } = await admin
      .from("clients")
      .select("id,organization_id")
      .eq("id", project.client_id)
      .maybeSingle();
    if (clientError || !client?.organization_id) return json(409, { error: "fixture_client_missing" });

    const emails = runEmails(claims);
    const expectedEmails = new Set([emails.staff, emails.customer]);
    const runId = String(claims.run_id);

    const cleanup = async () => {
      const { data: rows, error } = await admin
        .from("profiles")
        .select("id,email,role,client_id,organization_id")
        .in("email", [emails.staff, emails.customer]);
      if (error) throw error;

      for (const row of rows || []) {
        const expected = row.email === emails.staff
          ? row.role === "intern" && row.organization_id === client.organization_id && row.client_id == null
          : row.email === emails.customer
            && row.role === "kunde"
            && row.client_id === client.id
            && row.organization_id === client.organization_id;
        if (!expected) throw new Error("existing_e2e_identity_safety_mismatch");
      }

      const authUsers = [];
      for (let page = 1; ; page += 1) {
        const { data, error: listError } = await admin.auth.admin.listUsers({ page, perPage: AUTH_PAGE_SIZE });
        if (listError) throw listError;
        const users = data?.users || [];
        authUsers.push(...users.filter((user) => user.email && expectedEmails.has(user.email)));
        if (users.length < AUTH_PAGE_SIZE) break;
      }

      for (const user of authUsers) {
        if (
          user.app_metadata?.e2e_fixture !== true
          || String(user.app_metadata?.e2e_run_id || "") !== runId
          || !user.email
          || !expectedEmails.has(user.email)
        ) {
          throw new Error("existing_e2e_auth_identity_safety_mismatch");
        }
        const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
        if (deleteError) throw deleteError;
      }

      const { error: profileDeleteError } = await admin
        .from("profiles")
        .delete()
        .in("email", [emails.staff, emails.customer]);
      if (profileDeleteError) throw profileDeleteError;
    };

    if (action === "cleanup") {
      await cleanup();
      return json(200, { ok: true, cleaned: true });
    }
    if (action !== "bootstrap") return json(400, { error: "unknown_action" });

    await cleanup();
    const staffPassword = randomPassword();
    const customerPassword = randomPassword();
    const created: string[] = [];
    try {
      const { data: staffAuth, error: staffAuthError } = await admin.auth.admin.createUser({
        email: emails.staff,
        password: staffPassword,
        email_confirm: true,
        user_metadata: { full_name: "SYMMEDIS E2E Staff" },
        app_metadata: { e2e_fixture: true, e2e_run_id: runId },
      });
      if (staffAuthError || !staffAuth.user?.id) throw staffAuthError || new Error("staff_user_not_created");
      created.push(staffAuth.user.id);
      const { error: staffProfileError } = await admin.from("profiles").upsert({
        id: staffAuth.user.id,
        email: emails.staff,
        full_name: "SYMMEDIS E2E Staff",
        role: "intern",
        organization_id: client.organization_id,
        client_id: null,
        updated_at: new Date().toISOString(),
      });
      if (staffProfileError) throw staffProfileError;

      const { data: customerAuth, error: customerAuthError } = await admin.auth.admin.createUser({
        email: emails.customer,
        password: customerPassword,
        email_confirm: true,
        user_metadata: { full_name: "SYMMEDIS E2E Customer" },
        app_metadata: { e2e_fixture: true, e2e_run_id: runId },
      });
      if (customerAuthError || !customerAuth.user?.id) throw customerAuthError || new Error("customer_user_not_created");
      created.push(customerAuth.user.id);
      const { error: customerProfileError } = await admin.from("profiles").upsert({
        id: customerAuth.user.id,
        email: emails.customer,
        full_name: "SYMMEDIS E2E Customer",
        role: "kunde",
        organization_id: client.organization_id,
        client_id: client.id,
        updated_at: new Date().toISOString(),
      });
      if (customerProfileError) throw customerProfileError;

      return json(200, {
        ok: true,
        runId,
        staff: { email: emails.staff, password: staffPassword },
        customer: { email: emails.customer, password: customerPassword },
      });
    } catch (error) {
      for (const userId of created.reverse()) {
        const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
        if (deleteError) console.error("partial bootstrap auth cleanup failed", userId, deleteError.message);
      }
      const { error: profileCleanupError } = await admin.from("profiles").delete().in("email", [emails.staff, emails.customer]);
      if (profileCleanupError) console.error("partial bootstrap profile cleanup failed", profileCleanupError.message);
      throw error;
    }
  } catch (error) {
    console.error("e2e-auth-bootstrap failed", error instanceof Error ? error.message : "unknown");
    return json(403, { error: "e2e_bootstrap_denied" });
  }
});
