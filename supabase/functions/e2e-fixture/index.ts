import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_ORIGIN = "https://davidwzmn.github.io";
const FIXTURE_PROJECT_ID = "a551b1c8-55d0-4a90-8897-1408e7a08bac";
const FIXTURE_NAME = "Ursachenanalyse – Staging E2E";
const RESET_CONFIRMATION = "RESET_SYMMEDIS_E2E";
const STAFF_ROLES = new Set(["intern", "admin"]);

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
  return new Response(JSON.stringify(payload), {
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

function assertAdminResult(error: unknown, label: string) {
  if (error) throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
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
    if (callerError || !caller || !STAFF_ROLES.has(caller.role)) {
      return json(req, 403, { error: "Nur SYMMEDIS-Teamkonten dürfen das E2E-Fixture verwalten." });
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "inspect");
    const projectId = String(body?.projectId || "");
    if (projectId !== FIXTURE_PROJECT_ID) return json(req, 404, { error: "fixture_not_found" });

    const { data: project, error: projectError } = await admin
      .from("projects")
      .select("id,name,metadata")
      .eq("id", FIXTURE_PROJECT_ID)
      .maybeSingle();
    if (projectError || !project) return json(req, 404, { error: "fixture_not_found" });

    const safeFixture = project.name === FIXTURE_NAME
      && project.metadata?.purpose === "e2e"
      && project.metadata?.environment === "staging"
      && project.metadata?.e2e_fixture === true
      && project.metadata?.allow_mutating_e2e === true;
    if (!safeFixture) return json(req, 409, { error: "fixture_safety_contract_failed" });

    const inspect = async () => {
      const [{ data: tasks, error: tasksError }, { data: reports, error: reportsError }, { data: documents, error: documentsError }, { data: versions, error: versionsError }] = await Promise.all([
        admin.from("tasks").select("id,title,status").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
        admin.from("reports").select("id,title,state,report_date").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
        admin.from("documents").select("id,name,storage_path,status").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
        admin.from("report_versions").select("id,report_id,version_number,state").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
      ]);
      assertAdminResult(tasksError, "tasks inspect");
      assertAdminResult(reportsError, "reports inspect");
      assertAdminResult(documentsError, "documents inspect");
      assertAdminResult(versionsError, "versions inspect");
      return { project: { id: project.id, name: project.name }, tasks: tasks || [], reports: reports || [], documents: documents || [], reportVersions: versions || [] };
    };

    if (action === "inspect") return json(req, 200, { ok: true, fixture: await inspect() });
    if (action !== "reset") return json(req, 400, { error: "unknown_action" });
    if (String(body?.confirm || "") !== RESET_CONFIRMATION) return json(req, 422, { error: "reset_confirmation_required" });

    const { data: documents, error: documentsError } = await admin
      .from("documents")
      .select("id,storage_path")
      .eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(documentsError, "documents reset read");

    const storagePaths = (documents || []).map((row) => row.storage_path).filter(Boolean);
    if (storagePaths.length) {
      const { error: storageError } = await admin.storage.from("project-files").remove(storagePaths);
      assertAdminResult(storageError, "storage reset");
    }

    const { error: deleteDocumentsError } = await admin.from("documents").delete().eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(deleteDocumentsError, "documents reset delete");

    const { data: fixtureReports, error: fixtureReportsError } = await admin
      .from("reports")
      .select("id")
      .eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(fixtureReportsError, "reports reset read");
    const reportIds = (fixtureReports || []).map((row) => row.id);
    if (reportIds.length) {
      const { error: versionsDeleteError } = await admin.from("report_versions").delete().in("report_id", reportIds);
      assertAdminResult(versionsDeleteError, "report versions reset");
    }

    const { error: reportResetError } = await admin
      .from("reports")
      .update({ state: "entwurf", report_date: null })
      .eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(reportResetError, "reports reset");

    const { error: taskResetError } = await admin
      .from("tasks")
      .update({ status: "offen" })
      .eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(taskResetError, "tasks reset");

    const { error: auditResetError } = await admin
      .from("audit_events")
      .delete()
      .eq("project_id", FIXTURE_PROJECT_ID)
      .in("event_type", ["report.version_published", "task.status_updated", "document.uploaded", "document.visibility_updated"]);
    assertAdminResult(auditResetError, "audit reset");

    const fixture = await inspect();
    const resetValid = fixture.tasks.every((task: { status: string }) => task.status === "offen")
      && fixture.reports.every((report: { state: string }) => report.state === "entwurf")
      && fixture.documents.length === 0
      && fixture.reportVersions.length === 0;
    if (!resetValid) return json(req, 500, { error: "fixture_reset_incomplete", fixture });

    return json(req, 200, { ok: true, reset: true, fixture });
  } catch (error) {
    console.error("e2e-fixture failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "E2E-Fixture konnte nicht verarbeitet werden." });
  }
});
