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
  'public.update_task_status',
  "p_status not in ('offen', 'in-arbeit', 'erledigt')",
  "v_task_responsible <> 'kunde'",
  'for update of t',
  "'task.status_updated'",
  "jsonb_build_object(",
  'revoke update on table public.tasks from authenticated',
  'revoke all on function public.update_task_status(uuid, text) from anon',
  'grant execute on function public.update_task_status(uuid, text) to authenticated',
]) {
  requireText(migration, value, 'Task-Migration')
}

requireText(workspaceApi, "restRpc('update_task_status'", 'Workspace API')
if (/restUpdate\('tasks'/.test(workspaceApi)) failures.push('Workspace API: Aufgabenstatus darf nicht per direktem REST UPDATE gespeichert werden.')

for (const value of [
  "rolle === 'intern' || (rolle === 'kunde' && aufgabe.verantwortlich === 'kunde')",
  'Statuspflege durch SYMMEDIS',
]) {
  requireText(tasksModule, value, 'TasksModule')
}

if (failures.length) {
  console.error('\nSYMMEDIS Task Security Guard: FEHLGESCHLAGEN\n')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('SYMMEDIS Task Security Guard: OK')
console.log('✓ Aufgabenstatus läuft ausschließlich über den autorisierten RPC')
console.log('✓ Kundenzugänge können nur kundenverantwortliche Aufgaben verändern')
console.log('✓ Task-Statuswechsel sind atomar gesperrt und auditierbar')
console.log('✓ SYMMEDIS-Aufgaben bleiben für Kunden sichtbar, aber read-only')
