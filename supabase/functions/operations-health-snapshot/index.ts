import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.111.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GITHUB_ISSUER = "https://token.actions.githubusercontent.com";
const GITHUB_JWKS = "https://token.actions.githubusercontent.com/.well-known/jwks";
const EXPECTED_AUDIENCE = "symmedis-operations-watch";
const EXPECTED_REPOSITORY = "davidwzmn/symmedis";
const EXPECTED_REPOSITORY_ID = "1314992444";
const EXPECTED_WORKFLOW_PREFIX = "davidwzmn/symmedis/.github/workflows/operations-watch.yml@refs/heads/";
const ALLOWED_EVENTS = new Set(["push", "workflow_dispatch", "schedule"]);

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
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
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const validSignature = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, decodeBase64Url(encodedSignature), new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`));
  if (!validSignature) throw new Error("invalid_oidc_signature");

  const now = Math.floor(Date.now() / 1000);
  if (claims?.iss !== GITHUB_ISSUER) throw new Error("invalid_oidc_issuer");
  if (claims?.aud !== EXPECTED_AUDIENCE) throw new Error("invalid_oidc_audience");
  if (!Number.isFinite(Number(claims?.exp)) || Number(claims.exp) < now - 5) throw new Error("expired_oidc_token");
  if (Number.isFinite(Number(claims?.nbf)) && Number(claims.nbf) > now + 30) throw new Error("oidc_not_yet_valid");
  if (Number.isFinite(Number(claims?.iat)) && Math.abs(now - Number(claims.iat)) > 15 * 60) throw new Error("stale_oidc_token");
  if (claims?.repository !== EXPECTED_REPOSITORY || String(claims?.repository_id || "") !== EXPECTED_REPOSITORY_ID) throw new Error("wrong_repository");
  if (claims?.repository_visibility !== "public") throw new Error("wrong_repository_visibility");
  if (claims?.ref_type !== "branch" || typeof claims?.ref !== "string" || !claims.ref.startsWith("refs/heads/")) throw new Error("wrong_ref");
  if (typeof claims?.workflow_ref !== "string" || !claims.workflow_ref.startsWith(EXPECTED_WORKFLOW_PREFIX)) throw new Error("wrong_workflow");
  if (!claims.workflow_ref.endsWith(`@${claims.ref}`)) throw new Error("workflow_ref_mismatch");
  if (!ALLOWED_EVENTS.has(String(claims?.event_name || ""))) throw new Error("wrong_event");
  if (claims?.runner_environment !== "github-hosted") throw new Error("wrong_runner_environment");
  if (!claims?.run_id || !claims?.run_attempt) throw new Error("missing_run_identity");
  return claims;
}

type Bucket = { event_type: string; operation: string; surface: string; outcome: string; sample_count: number; total_duration_ms: number; max_duration_ms: number; metric_name: string; metric_sum: number; metric_max: number };

function aggregate(rows: Bucket[]) {
  const map = new Map<string, { eventType: string; operation: string; surface: string; metricName: string; samples: number; failures: number; totalDurationMs: number; maxDurationMs: number; metricSum: number; metricMax: number }>();
  for (const row of rows) {
    const id = [row.event_type, row.operation || "", row.surface, row.metric_name || ""].join("|");
    const current = map.get(id) || { eventType: row.event_type, operation: row.operation || "", surface: row.surface, metricName: row.metric_name || "", samples: 0, failures: 0, totalDurationMs: 0, maxDurationMs: 0, metricSum: 0, metricMax: 0 };
    const count = Number(row.sample_count || 0);
    current.samples += count;
    if (row.outcome === "failure") current.failures += count;
    current.totalDurationMs += Number(row.total_duration_ms || 0);
    current.maxDurationMs = Math.max(current.maxDurationMs, Number(row.max_duration_ms || 0));
    current.metricSum += Number(row.metric_sum || 0);
    current.metricMax = Math.max(current.metricMax, Number(row.metric_max || 0));
    map.set(id, current);
  }
  return [...map.values()].map((item) => ({ ...item, failureRate: item.samples ? item.failures / item.samples : 0, avgDurationMs: item.samples ? item.totalDurationMs / item.samples : 0, avgMetricValue: item.samples && item.metricName ? item.metricSum / item.samples : null }));
}

function evaluate(summary: ReturnType<typeof aggregate>) {
  const alerts: Array<{ severity: "SEV-2" | "SEV-3"; signal: string; detail: string }> = [];
  for (const item of summary) {
    const label = [item.eventType, item.operation, item.surface].filter(Boolean).join("/");
    if (item.eventType === "render_failure" && item.samples > 0) alerts.push({ severity: "SEV-2", signal: label, detail: `${item.samples} render failures in 24h` });
    if (item.eventType === "save_action" && item.samples >= 10 && item.failureRate > 0.02) alerts.push({ severity: "SEV-2", signal: label, detail: `failure rate ${(item.failureRate * 100).toFixed(1)}% > 2%` });
    if (item.eventType === "file_transfer" && item.samples >= 5 && item.failureRate > 0.05) alerts.push({ severity: "SEV-2", signal: label, detail: `failure rate ${(item.failureRate * 100).toFixed(1)}% > 5%` });
    if (item.eventType === "auth_action" && item.samples >= 5 && item.failureRate > 0.05) alerts.push({ severity: "SEV-2", signal: label, detail: `failure rate ${(item.failureRate * 100).toFixed(1)}% > 5%` });
    if (item.eventType === "edge_function" && item.samples >= 5 && item.failureRate > 0.05) alerts.push({ severity: "SEV-2", signal: label, detail: `failure rate ${(item.failureRate * 100).toFixed(1)}% > 5%` });
    if (item.eventType === "workspace_load" && item.samples >= 10 && item.failureRate > 0.05) alerts.push({ severity: "SEV-2", signal: label, detail: `failure rate ${(item.failureRate * 100).toFixed(1)}% > 5%` });
    if (["edge_function", "workspace_load"].includes(item.eventType) && item.maxDurationMs > 10000) alerts.push({ severity: "SEV-3", signal: label, detail: `max latency ${Math.round(item.maxDurationMs)}ms > 10000ms` });
    if (item.eventType === "web_vital" && item.metricName === "lcp" && Number(item.avgMetricValue || 0) > 4000) alerts.push({ severity: "SEV-3", signal: label, detail: `avg LCP ${Math.round(Number(item.avgMetricValue))}ms > 4000ms` });
    if (item.eventType === "web_vital" && item.metricName === "cls" && Number(item.avgMetricValue || 0) > 0.25) alerts.push({ severity: "SEV-3", signal: label, detail: `avg CLS ${Number(item.avgMetricValue).toFixed(3)} > 0.25` });
    if (item.eventType === "web_vital" && item.metricName === "inp" && Number(item.avgMetricValue || 0) > 500) alerts.push({ severity: "SEV-3", signal: label, detail: `avg INP ${Math.round(Number(item.avgMetricValue))}ms > 500ms` });
  }
  return alerts;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "oidc_required" });
  try {
    await verifyGitHubOidc(authHeader.slice(7));
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await admin.from("operational_metric_buckets").select("event_type,operation,surface,outcome,sample_count,total_duration_ms,max_duration_ms,metric_name,metric_sum,metric_max").gte("bucket_start", cutoff).limit(5000);
    if (error) throw error;
    const summary = aggregate((data || []) as Bucket[]);
    const alerts = evaluate(summary);
    return json(200, { ok: true, observedAt: new Date().toISOString(), windowHours: 24, status: alerts.some((alert) => alert.severity === "SEV-2") ? "failure" : alerts.length ? "warning" : "success", alerts, summary, measurementGap: "Pre-authentication login failures are not persisted by client telemetry because no trusted user JWT exists yet." });
  } catch (error) {
    console.error("operations-health-snapshot denied", error instanceof Error ? error.message : "unknown");
    return json(403, { error: "operations_health_denied" });
  }
});
