import { invokeEdgeFunction } from './supabase.js'

export async function fetchWebsiteLeads(accessToken) {
  const payload = await invokeEdgeFunction('manage-leads', accessToken, { action: 'list' })
  return payload?.leads || []
}

export async function updateWebsiteLead(accessToken, id, status) {
  const payload = await invokeEdgeFunction('manage-leads', accessToken, { action: 'update', id, status })
  return payload?.lead || null
}
