import { invokeEdgeFunction } from './supabase.js'

export function runProjectAnalysis(accessToken, projectId, context = '') {
  return invokeEdgeFunction('analyze-project', accessToken, { projectId, context })
}
