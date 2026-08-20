alter table public.pilot_validation_reviews
  add column reviewed_findings_count integer,
  add column materially_changed_findings_count integer;

alter table public.pilot_validation_reviews
  add constraint pilot_validation_reviews_reviewed_findings_count_check check (reviewed_findings_count is null or reviewed_findings_count >= 0),
  add constraint pilot_validation_reviews_materially_changed_findings_count_check check (materially_changed_findings_count is null or materially_changed_findings_count >= 0),
  add constraint pilot_validation_reviews_material_change_count_range_check check (reviewed_findings_count is null or materially_changed_findings_count is null or materially_changed_findings_count <= reviewed_findings_count);

create or replace function public.get_pilot_validation_scorecard(p_project_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
with project_scope as (
  select p.id,p.created_at,p.start_date from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid())
  where p.id=p_project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id
), finding_stats as (
  select min(ai.updated_at) filter (where ai.customer_visible=true and ai.approval_status='kunde') first_customer_finding_at,
    count(*) filter (where ai.customer_visible=true and ai.approval_status='kunde' and ai.confidence>=70 and jsonb_array_length(ai.evidence_assessment)>0)::int evidence_ready_findings,
    count(*) filter (where ai.customer_visible=true and ai.approval_status='kunde')::int customer_findings,
    count(*) filter (where ai.outcome_status in ('confirmed','refuted','mixed','unknown'))::int measured_outcomes
  from public.analysis_items ai where ai.project_id=p_project_id
), decision_stats as (
  select min(r.report_date)::date first_final_report_date from public.reports r where r.project_id=p_project_id and r.state='final'
), task_stats as (
  select count(*) filter (where t.source_analysis_item_id is not null)::int linked_actions,
    count(*) filter (where t.source_analysis_item_id is not null and t.status='erledigt')::int completed_linked_actions,
    count(*) filter (where t.source_analysis_item_id is not null and t.phase_id='p1')::int phase_30_actions,
    count(*) filter (where t.source_analysis_item_id is not null and t.phase_id='p1' and t.status='erledigt')::int phase_30_completed,
    count(*) filter (where t.source_analysis_item_id is not null and t.phase_id='p2')::int phase_60_actions,
    count(*) filter (where t.source_analysis_item_id is not null and t.phase_id='p2' and t.status='erledigt')::int phase_60_completed,
    count(*) filter (where t.source_analysis_item_id is not null and t.phase_id='p3')::int phase_90_actions,
    count(*) filter (where t.source_analysis_item_id is not null and t.phase_id='p3' and t.status='erledigt')::int phase_90_completed
  from public.tasks t where t.project_id=p_project_id
), latest_review as (
  select to_jsonb(r)-'id'-'project_id'-'created_by'-'created_at'-'updated_at' review,r.reviewed_findings_count,r.materially_changed_findings_count
  from public.pilot_validation_reviews r where r.project_id=p_project_id order by r.reviewed_at desc,r.review_round desc limit 1
)
select jsonb_build_object(
  'projectId',ps.id,'projectCreatedAt',ps.created_at,'projectStartDate',ps.start_date,'firstCustomerFindingAt',fs.first_customer_finding_at,
  'timeToFirstCustomerFindingHours',case when fs.first_customer_finding_at is null then null else round((extract(epoch from (fs.first_customer_finding_at-ps.created_at))/3600.0)::numeric,1) end,
  'evidenceReadyFindings',fs.evidence_ready_findings,'customerFindings',fs.customer_findings,'evidenceReadyRate',case when fs.customer_findings=0 then null else round(fs.evidence_ready_findings::numeric/fs.customer_findings,4) end,
  'firstFinalReportDate',ds.first_final_report_date,'timeFindingToDecisionHours',case when fs.first_customer_finding_at is null or ds.first_final_report_date is null then null else greatest(0,round((extract(epoch from (ds.first_final_report_date::timestamptz-fs.first_customer_finding_at))/3600.0)::numeric,1)) end,
  'linkedActions',ts.linked_actions,'completedLinkedActions',ts.completed_linked_actions,'linkedActionCompletionRate',case when ts.linked_actions=0 then null else round(ts.completed_linked_actions::numeric/ts.linked_actions,4) end,
  'phase30Actions',ts.phase_30_actions,'phase30Completed',ts.phase_30_completed,'phase30CompletionRate',case when ts.phase_30_actions=0 then null else round(ts.phase_30_completed::numeric/ts.phase_30_actions,4) end,
  'phase60Actions',ts.phase_60_actions,'phase60Completed',ts.phase_60_completed,'phase60CompletionRate',case when ts.phase_60_actions=0 then null else round(ts.phase_60_completed::numeric/ts.phase_60_actions,4) end,
  'phase90Actions',ts.phase_90_actions,'phase90Completed',ts.phase_90_completed,'phase90CompletionRate',case when ts.phase_90_actions=0 then null else round(ts.phase_90_completed::numeric/ts.phase_90_actions,4) end,
  'measuredOutcomes',fs.measured_outcomes,'humanReviewedFindings',lr.reviewed_findings_count,'materiallyChangedFindings',lr.materially_changed_findings_count,
  'humanReviewMaterialChangeRate',case when coalesce(lr.reviewed_findings_count,0)=0 or lr.materially_changed_findings_count is null then null else round(lr.materially_changed_findings_count::numeric/lr.reviewed_findings_count,4) end,
  'latestReview',lr.review)
from project_scope ps cross join finding_stats fs cross join decision_stats ds cross join task_stats ts left join latest_review lr on true;
$$;
