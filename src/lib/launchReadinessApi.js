import { restRpc } from './supabase.js'

export async function fetchLaunchReadiness(accessToken) {
  return restRpc('get_launch_readiness', accessToken, {})
}
