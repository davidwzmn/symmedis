import { invokeEdgeFunction } from './supabase.js'

export function inviteStaffUser(accessToken, { email, fullName, role }) {
  return invokeEdgeFunction('invite-staff', accessToken, {
    email: email.trim().toLowerCase(),
    fullName: fullName.trim(),
    role,
  })
}
