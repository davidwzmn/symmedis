import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ALLOWED_ORIGINS = new Set([
  "https://davidwzmn.github.io",
  "http://127.0.0.1:4176",
]);
const FIXTURE_PROJECT_ID = "a551b1c8-55d0-4a90-8897-1408e7a08bac";
const FIXTURE_NAME = "Ursachenanalyse – Staging E2E";
const FIXTURE_VERSION = 1;
const STAFF_TASK_ID = "72e4af65-806c-44ad-9e03-4f5393a97d19";
const CUSTOMER_TASK_ID = "9d0d9f33-0ce2-4b8c-9d67-4f27791913c5";
const ANALYSIS_ITEM_ID = "63e6f8df-c28b-4cc2-9a72-dc9750746f0e";
const REPORT_ID = "51cb3d63-abc3-47ab-9e62-f316cb678d75";
const INTERNAL_NOTE_ID = "a9874539-3aeb-4db4-a78d-3036925f0698";
const INTERNAL_NOTE_MARKER = "E2E: Diese interne Notiz darf niemals im Kundenportal erscheinen.";
const RESET_CONFIRMATION = "RESET_SYMMEDIS_E2E";
const STAFF_ROLES = new Set(["intern", "admin"]);

function cors(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://davidwzmn.github.io";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
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
      && project.metadata?.allow_mutating_e2e === true
      && Number(project.metadata?.fixture_version) === FIXTURE_VERSION;
    if (!safeFixture) return json(req, 409, { error: "fixture_safety_contract_failed" });

    const inspect = async () => {
      const [
        { data: tasks, error: tasksError },
        { data: analysis, error: analysisError },
        { data: reports, error: reportsError },
        { data: documents, error: documentsError },
        { data: versions, error: versionsError },
        { data: internalNotes, error: internalNotesError },
      ] = await Promise.all([
        admin.from("tasks").select("id,title,status,responsible_party").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
        admin.from("analysis_items").select("id,category_id,approval_status,customer_visible,observation").eq("project_id", FIXTURE_PROJECT_ID).order("category_id"),
        admin.from("reports").select("id,title,state,report_date").eq("project_id", FIXTURE_PROJECT_ID).order("report_date").order("id"),
        admin.from("documents").select("id,name,storage_path,status,source,customer_visible").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
        admin.from("report_versions").select("id,report_id,version_number,state").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
        admin.from("internal_notes").select("id,author,body").eq("project_id", FIXTURE_PROJECT_ID).order("created_at"),
      ]);
      assertAdminResult(tasksError, "tasks inspect");
      assertAdminResult(analysisError, "analysis inspect");
      assertAdminResult(reportsError, "reports inspect");
      assertAdminResult(documentsError, "documents inspect");
      assertAdminResult(versionsError, "versions inspect");
      assertAdminResult(internalNotesError, "internal notes inspect");
      return {
        project: { id: project.id, name: project.name, fixtureVersion: FIXTURE_VERSION },
        tasks: tasks || [], analysis: analysis || [], reports: reports || [], documents: documents || [], reportVersions: versions || [], internalNotes: internalNotes || [],
      };
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
    const { error: deleteReportsError } = await admin.from("reports").delete().eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(deleteReportsError, "reports canonical reset");
    const { error: deleteTasksError } = await admin.from("tasks").delete().eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(deleteTasksError, "tasks canonical reset");
    const { error: deleteAnalysisError } = await admin.from("analysis_items").delete().eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(deleteAnalysisError, "analysis canonical reset");
    const { error: deleteInternalNotesError } = await admin.from("internal_notes").delete().eq("project_id", FIXTURE_PROJECT_ID);
    assertAdminResult(deleteInternalNotesError, "internal notes canonical reset");

    const { error: tasksBaselineError } = await admin.from("tasks").insert([
      {
        id: STAFF_TASK_ID, project_id: FIXTURE_PROJECT_ID, phase_id: "30", category_id: null,
        title: "Staging: Onboarding-Flow vollständig prüfen", responsible_party: "symmedis", assignee_name: "SYMMEDIS",
        priority: "mittel", status: "offen", due_date: "2026-08-20", kpi: "E2E Staff Flow",
      },
      {
        id: CUSTOMER_TASK_ID, project_id: FIXTURE_PROJECT_ID, phase_id: "30", category_id: null,
        title: "Staging: Kunden-Aufgabe vollständig prüfen", responsible_party: "kunde", assignee_name: "E2E Customer",
        priority: "mittel", status: "offen", due_date: "2026-08-21", kpi: "E2E Statuswechsel",
      },
    ]);
    assertAdminResult(tasksBaselineError, "tasks baseline reset");

    const { error: analysisBaselineError } = await admin.from("analysis_items").insert({
      id: ANALYSIS_ITEM_ID,
      project_id: FIXTURE_PROJECT_ID,
      category_id: "positionierung",
      score: 42,
      observation: "E2E: Positionierungs-Finding wartet auf Kundenfreigabe.",
      cause: "E2E: Die Positionierung ist im Testfall bewusst noch nicht vollständig geschärft.",
      impact: "E2E: Der Test prüft den kontrollierten Human-Review-Handover.",
      recommendation: "E2E: Finding nach menschlicher Prüfung für den Kunden freigeben.",
      evidence: "E2E-Fixture · kontrollierter Testbeleg",
      priority: "hoch",
      approval_status: "intern",
      customer_visible: false,
      internal_note: "Nur E2E-Fixture; niemals für reale Kunden verwenden.",
      comment: "",
      confidence: 88,
      evidence_sources: [{ type: "fixture", label: "E2E Testbeleg" }],
      impact_currency: "EUR",
      impact_basis: "E2E-only, kein realer wirtschaftlicher Impact",
      impact_verified: false,
    });
    assertAdminResult(analysisBaselineError, "analysis baseline reset");

    const { error: reportBaselineError } = await admin.from("reports").insert({
      id: REPORT_ID,
      project_id: FIXTURE_PROJECT_ID,
      title: "Staging Report – nicht freigeben",
      report_type: "Executive Diagnosis",
      pages: 0,
      state: "entwurf",
      report_date: "2026-08-17",
      author: "SYMMEDIS Team",
      storage_path: null,
      generated_from_analysis_run_id: null,
      executive_summary: "Interner Testdatensatz. Keine Kundenfreigabe.",
      content: { staging: true, customer_release: false },
    });
    assertAdminResult(reportBaselineError, "report baseline reset");

    const { error: internalNoteBaselineError } = await admin.from("internal_notes").insert({
      id: INTERNAL_NOTE_ID,
      project_id: FIXTURE_PROJECT_ID,
      author: "SYMMEDIS E2E",
      body: INTERNAL_NOTE_MARKER,
      created_by: null,
    });
    assertAdminResult(internalNoteBaselineError, "internal note baseline reset");

    // Audit-Ereignisse sind bewusst append-only. Ein Fixture-Reset setzt nur den
    // fachlichen Testzustand zurück; historische E2E-Auditspuren bleiben erhalten.
    const fixture = await inspect();
    const baselineTasks = new Map(fixture.tasks.map((task: { id: string; status: string; responsible_party: string }) => [task.id, task]));
    const staffTask = baselineTasks.get(STAFF_TASK_ID);
    const customerTask = baselineTasks.get(CUSTOMER_TASK_ID);
    const analysisItem = fixture.analysis.find((item: { id: string }) => item.id === ANALYSIS_ITEM_ID);
    const report = fixture.reports.find((item: { id: string }) => item.id === REPORT_ID);
    const internalNote = fixture.internalNotes.find((item: { id: string }) => item.id === INTERNAL_NOTE_ID);
    const resetValid = fixture.tasks.length === 2
      && staffTask?.status === "offen" && staffTask?.responsible_party === "symmedis"
      && customerTask?.status === "offen" && customerTask?.responsible_party === "kunde"
      && fixture.analysis.length === 1 && analysisItem?.approval_status === "intern" && analysisItem?.customer_visible === false
      && fixture.reports.length === 1 && report?.state === "entwurf"
      && fixture.internalNotes.length === 1 && internalNote?.body === INTERNAL_NOTE_MARKER
      && fixture.documents.length === 0 && fixture.reportVersions.length === 0;
    if (!resetValid) return json(req, 500, { error: "fixture_reset_incomplete", fixture });

    return json(req, 200, { ok: true, reset: true, fixture });
  } catch (error) {
    console.error("e2e-fixture failed", error instanceof Error ? error.message : "unknown");
    return json(req, 500, { error: "E2E-Fixture konnte nicht verarbeitet werden." });
  }
});
