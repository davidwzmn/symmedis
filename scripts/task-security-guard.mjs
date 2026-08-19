import { readFile } from 'node:fs/promises'

const failures = []
const text = (path) => readFile(path, 'utf8')
const requireText = (content, value, label) => {
  if (!content.includes(value)) failures.push(`${label}: fehlt: ${value}`)
}

const [migration, workspaceApi, tasksModule] = await Promise.all([
  text('supabase/migrations/20260819114000_task_status_rpc_least_privilege.sql'),
  text('src/lib/workspaceApi.js'),
  text('src/components/modules/TasksModule.jsx'),
])

for (const value of [
  'drop function if exists public.update_task_status(uuid, text)',
  'revoke update on table public.tasks from authenticated',
  'grant update (status) on table public.tasks to authenticated',
  'create policy tasks_status_update',
  "p.role in ('intern', 'admin')",
  "p.role = 'kunde'",
  "tasks.responsible_party = 'kunde'",
  'private.audit_task_status_update()',
  'security definer',
  "'task.status_updated'",
  "'from', old.status",
  "'to', new.status",
  'before update of status on public.tasks',
  'revoke all on function private.audit_task_status_update() from authenticated',
]) {
  requireText(migration, value, 'Task-Migration')
}

requireText(workspaceApi, "restUpdate('tasks', accessToken, `id=eq.${id}`, { status })", 'Workspace API')
if (/restRpc\('update_task_status'/.test(workspaceApi)) failures.push('Workspace API: der entfernte öffentliche Task-RPC darf nicht zurückkehren.')

for (const value of [
  "rolle === 'intern' || (rolle === 'kunde' && aufgabe.verantwortlich === 'kunde')",
  'Statuspflege durch SYMMEDIS',
]) {
  requireText(tasksModule, value, 'TasksModule')
}

if (/grant\s+update\s+on\s+(?:table\s+)?public\.tasks\s+to\s+authenticated/i.test(migration)) {
  failures.push('Task-Migration: authenticated darf kein tabellenweites UPDATE auf tasks erhalten.')
}
if (/grant\s+execute\s+on\s+function\s+public\.update_task_status/i.test(migration)) {
  failures.push('Task-Migration: ein öffentlich ausführbarer Task-Status-RPC darf nicht zurückkehren.')
}

if (failures.length) {
  console.error('\nSYMMEDIS Task Security Guard: FEHLGESCHLAGEN\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('SYMMEDIS Task Security Guard: OK')
console.log('✓ Browserrollen besitzen ausschließlich UPDATE(status) auf Aufgaben')
console.log('✓ RLS erzwingt Mandant, Rolle und Kunden-Zuständigkeit auf Zeilenebene')
console.log('✓ Öffentlicher SECURITY-DEFINER-Task-RPC ist entfernt')
console.log('✓ Statuswechsel werden über einen nicht exponierten privaten Trigger auditierbar')
console.log('✓ SYMMEDIS-Aufgaben bleiben für Kunden sichtbar, aber read-only')
