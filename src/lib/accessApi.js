import { invokeEdgeFunction, restSelect } from './supabase.js'

export function inviteCustomerUser(accessToken, kunde, email, fullName) {
  return invokeEdgeFunction('invite-user', accessToken, {
    clientId: kunde.id,
    projectId: kunde.projectId,
    email,
    fullName,
  })
}

export async function fetchCustomerUsers(accessToken, clientId) {
  if (!accessToken || !clientId) return []
  const rows = await restSelect(
    'profiles',
    accessToken,
    `select=id,email,full_name,role,client_id&client_id=eq.${encodeURIComponent(clientId)}&role=eq.kunde&order=full_name.asc,email.asc`,
  )
  return (rows || []).map((row) => ({
    id: row.id,
    email: row.email || '',
    name: row.full_name || row.email?.split('@')[0] || 'Kundenzugang',
    role: row.role,
  }))
}
