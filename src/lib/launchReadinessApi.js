import { restInsert, restRpc, restSelect, restUpdate } from './supabase.js'

export async function fetchLaunchReadiness(accessToken) {
  return restRpc('get_launch_readiness', accessToken, {})
}

export async function saveLaunchGateEvidence(accessToken, organizationId, userId, gateKey, evidenceNote) {
  const note = String(evidenceNote || '').trim()
  if (!note) throw new Error('Bitte einen konkreten Nachweis dokumentieren.')
  if (!['custom_smtp', 'restore_drill'].includes(gateKey)) {
    throw new Error('Dieses Gate wird automatisch verifiziert und kann nicht manuell gesetzt werden.')
  }

  const existing = await restSelect(
    'launch_gate_evidence',
    accessToken,
    `select=id&organization_id=eq.${encodeURIComponent(organizationId)}&gate_key=eq.${encodeURIComponent(gateKey)}&limit=1`,
  )

  const payload = {
    organization_id: organizationId,
    gate_key: gateKey,
    status: 'verified',
    source: gateKey === 'restore_drill' ? 'restore_drill' : 'dashboard',
    evidence_note: note.slice(0, 2000),
    verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existing?.[0]?.id) {
    return restUpdate('launch_gate_evidence', accessToken, `id=eq.${existing[0].id}`, payload)
  }
  return restInsert('launch_gate_evidence', accessToken, { ...payload, created_by: userId })
}
