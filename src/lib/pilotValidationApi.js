import { restInsert, restRpc, restSelect, restUpdate } from './supabase.js'

export async function fetchPilotValidationScorecard(accessToken, projectId) {
  return restRpc('get_pilot_validation_scorecard', accessToken, { p_project_id: projectId })
}

export async function fetchPilotStartReadiness(accessToken, projectId) {
  return restRpc('get_pilot_start_readiness', accessToken, { p_project_id: projectId })
}

export async function fetchPilotValidationReviews(accessToken, projectId) {
  return restSelect(
    'pilot_validation_reviews',
    accessToken,
    `select=id,review_round,reviewed_at,understanding_score,decision_clarity_score,human_review_material_change,reviewed_findings_count,materially_changed_findings_count,decision_changed,portal_return_count,willingness_to_pay,renewal_signal,customer_understanding_note,decision_change_note,interviewer_note,created_at,updated_at&project_id=eq.${encodeURIComponent(projectId)}&order=review_round.desc`,
  )
}

export async function savePilotValidationReview(accessToken, projectId, userId, review) {
  const existing = await restSelect(
    'pilot_validation_reviews',
    accessToken,
    `select=id&project_id=eq.${encodeURIComponent(projectId)}&review_round=eq.${review.reviewRound}&limit=1`,
  )

  const reviewedFindingsCount = review.reviewedFindingsCount === '' || review.reviewedFindingsCount == null ? null : Math.max(0, Number(review.reviewedFindingsCount) || 0)
  const materiallyChangedFindingsCount = review.materiallyChangedFindingsCount === '' || review.materiallyChangedFindingsCount == null ? null : Math.max(0, Number(review.materiallyChangedFindingsCount) || 0)
  if (reviewedFindingsCount != null && materiallyChangedFindingsCount != null && materiallyChangedFindingsCount > reviewedFindingsCount) {
    throw new Error('Wesentlich geänderte Findings dürfen die Zahl der geprüften Findings nicht überschreiten.')
  }

  const payload = {
    project_id: projectId,
    review_round: review.reviewRound,
    reviewed_at: review.reviewedAt || new Date().toISOString(),
    understanding_score: review.understandingScore || null,
    decision_clarity_score: review.decisionClarityScore || null,
    human_review_material_change: review.humanReviewMaterialChange,
    reviewed_findings_count: reviewedFindingsCount,
    materially_changed_findings_count: materiallyChangedFindingsCount,
    decision_changed: review.decisionChanged,
    portal_return_count: Math.max(0, Number(review.portalReturnCount) || 0),
    willingness_to_pay: review.willingnessToPay || 'unknown',
    renewal_signal: review.renewalSignal || 'unknown',
    customer_understanding_note: review.customerUnderstandingNote?.trim() || '',
    decision_change_note: review.decisionChangeNote?.trim() || '',
    interviewer_note: review.interviewerNote?.trim() || '',
    updated_at: new Date().toISOString(),
  }

  if (existing?.[0]?.id) {
    return restUpdate('pilot_validation_reviews', accessToken, `id=eq.${existing[0].id}`, payload)
  }

  return restInsert('pilot_validation_reviews', accessToken, {
    ...payload,
    created_by: userId,
  })
}
