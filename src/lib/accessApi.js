import { invokeEdgeFunction } from './supabase.js'

export function inviteCustomerUser(accessToken, kunde, email, fullName) {
  return invokeEdgeFunction('invite-user', accessToken, {
    clientId: kunde.id,
    projectId: kunde.projectId,
    email,
    fullName,
  })
}
