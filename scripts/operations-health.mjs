import { readFile, writeFile } from 'node:fs/promises'

const REPO = process.env.GITHUB_REPOSITORY || 'davidwzmn/symmedis'
const BRANCH = process.env.SYMMEDIS_RELEASE_BRANCH || 'agent/supabase-auth-foundation'
const BASE_URL = (process.env.SYMMEDIS_LIVE_URL || 'https://davidwzmn.github.io/symmedis/').replace(/\/$/, '')
const SUPABASE_URL = 'https://jmxxinrvszwggcxvlwfs.supabase.co'
const GH_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || ''
const WINDOW_DAYS = Number(process.env.SYMMEDIS_HEALTH_WINDOW_DAYS || 30)
const MIN_HISTORY_RUNS = Number(process.env.SYMMEDIS_HEALTH_MIN_RUNS || 5)
const MIN_SUCCESS_RATE = Number(process.env.SYMMEDIS_HEALTH_MIN_SUCCESS_RATE || 0.95)
const MAX_AGE_HOURS = Number(process.env.SYMMEDIS_HEALTH_MAX_AGE_HOURS || 48)

function pct(value) {
  return `${(value * 100).toFixed(1)}%`
}

function hoursSince(value) {
  return (Date.now() - new Date(value).getTime()) / 3_600_000
}

async function githubJson(path) {
  const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'symmedis-operations-watch',
    },
  })
  if (!response.ok) throw new Error(`GitHub API ${response.status} for ${path}`)
  return response.json()
}

async function workflowHealth(workflowFile) {
  const payload = await githubJson(`/actions/workflows/${workflowFile}/runs?branch=${encodeURIComponent(BRANCH)}&per_page=100`)
  const cutoff = Date.now() - WINDOW_DAYS * 86_400_000
  const completed = (payload.workflow_runs || [])
    .filter((run) => run.status === 'completed' && new Date(run.created_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const successful = completed.filter((run) => run.conclusion === 'success')
  const rate = completed.length ? successful.length / completed.length : 0
  const latest = completed[0] || null
  return {
    workflow: workflowFile,
    completedRuns: completed.length,
    successfulRuns: successful.length,
    successRate: rate,
    latestConclusion: latest?.conclusion || 'missing',
    latestCreatedAt: latest?.created_at || null,
    latestUrl: latest?.html_url || null,
  }
}

async function livePageHealth() {
  const response = await fetch(`${BASE_URL}/?ops=${Date.now()}`, { redirect: 'follow' })
  const html = await response.text()
  const build = html.match(/name=["']symmedis-build["']\s+content=["']([0-9a-f]{7,40})["']/i)?.[1] || null
  return {
    ok: response.ok && html.includes('id="root"') && Boolean(build),
    status: response.status,
    buildSha: build,
  }
}

async function leadIngressHealth() {
  const source = await readFile('src/lib/supabase.js', 'utf8')
  const key = source.match(/DEFAULT_SUPABASE_PUBLISHABLE_KEY = '([^']+)'/)?.[1]
  if (!key) throw new Error('Publishable Supabase key not found in frontend config.')
  const response = await fetch(`${SUPABASE_URL}/functions/v1/submit-lead`, {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': 'application/json',
      Origin: 'https://davidwzmn.github.io',
    },
    body: JSON.stringify({ website: 'operations-watch-honeypot' }),
  })
  const body = await response.text()
  return { ok: response.ok && body.includes('"ok":true'), status: response.status }
}

async function telemetryAuthWallHealth() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/operational-telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType: 'workspace_load' }),
  })
  await response.text().catch(() => '')
  return { ok: response.status === 401, status: response.status }
}

function assessWorkflow(name, health, failures) {
  if (health.latestConclusion !== 'success') failures.push(`${name}: latest completed run is ${health.latestConclusion}`)
  if (!health.latestCreatedAt || hoursSince(health.latestCreatedAt) > MAX_AGE_HOURS) {
    failures.push(`${name}: no successful freshness proof within ${MAX_AGE_HOURS}h`)
  }
  if (health.completedRuns >= MIN_HISTORY_RUNS && health.successRate < MIN_SUCCESS_RATE) {
    failures.push(`${name}: ${WINDOW_DAYS}d success rate ${pct(health.successRate)} below ${pct(MIN_SUCCESS_RATE)}`)
  }
}

const failures = []
const [ci, crossRole, live, lead, telemetryAuthWall] = await Promise.all([
  workflowHealth('ci.yml'),
  workflowHealth('cross-role-e2e.yml'),
  livePageHealth(),
  leadIngressHealth(),
  telemetryAuthWallHealth(),
])

assessWorkflow('CI', ci, failures)
assessWorkflow('Cross-role E2E', crossRole, failures)
if (!live.ok) failures.push(`Live staging: HTTP ${live.status}, build marker=${live.buildSha || 'missing'}`)
if (!lead.ok) failures.push(`Lead ingress: HTTP ${lead.status}`)
if (!telemetryAuthWall.ok) failures.push(`Operational telemetry auth wall: expected 401, received ${telemetryAuthWall.status}`)

const result = {
  observedAt: new Date().toISOString(),
  branch: BRANCH,
  windowDays: WINDOW_DAYS,
  thresholds: {
    minHistoryRuns: MIN_HISTORY_RUNS,
    minSuccessRate: MIN_SUCCESS_RATE,
    maxAgeHours: MAX_AGE_HOURS,
  },
  checks: { ci, crossRole, live, lead, telemetryAuthWall },
  status: failures.length ? 'failure' : 'success',
  failures,
}

await writeFile('operations-health.json', `${JSON.stringify(result, null, 2)}\n`)

const summary = [
  '# SYMMEDIS Operations Health',
  '',
  `Status: **${result.status.toUpperCase()}**`,
  `Observed: ${result.observedAt}`,
  '',
  '| Signal | Result |',
  '| --- | --- |',
  `| CI ${WINDOW_DAYS}d | ${ci.successfulRuns}/${ci.completedRuns} (${pct(ci.successRate)}) · latest ${ci.latestConclusion} |`,
  `| Cross-role E2E ${WINDOW_DAYS}d | ${crossRole.successfulRuns}/${crossRole.completedRuns} (${pct(crossRole.successRate)}) · latest ${crossRole.latestConclusion} |`,
  `| Live staging | HTTP ${live.status} · build ${live.buildSha || 'missing'} |`,
  `| Lead ingress | HTTP ${lead.status} |`,
  `| Telemetry auth wall | HTTP ${telemetryAuthWall.status} (expected 401) |`,
  '',
  `Thresholds: success rate ≥ ${pct(MIN_SUCCESS_RATE)} once ≥ ${MIN_HISTORY_RUNS} runs exist; latest completed CI/E2E proof ≤ ${MAX_AGE_HOURS}h old.`,
  ...(failures.length ? ['', '## Failures', ...failures.map((failure) => `- ${failure}`)] : []),
].join('\n')

await writeFile('operations-health.md', `${summary}\n`)
console.log(summary)

if (failures.length) process.exit(1)
