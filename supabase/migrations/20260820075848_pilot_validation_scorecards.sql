create table public.pilot_validation_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  review_round smallint not null check (review_round between 1 and 12),
  reviewed_at timestamptz not null default now(),
  understanding_score smallint check (understanding_score between 1 and 5),
  decision_clarity_score smallint check (decision_clarity_score between 1 and 5),
  human_review_material_change boolean,
  decision_changed boolean,
  portal_return_count integer not null default 0 check (portal_return_count >= 0),
  willingness_to_pay text not null default 'unknown' check (willingness_to_pay in ('unknown','no','weak','medium','strong')),
  renewal_signal text not null default 'unknown' check (renewal_signal in ('unknown','no','weak','medium','strong')),
  customer_understanding_note text not null default '' check (char_length(customer_understanding_note) <= 2000),
  decision_change_note text not null default '' check (char_length(decision_change_note) <= 2000),
  interviewer_note text not null default '' check (char_length(interviewer_note) <= 4000),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, review_round)
);

alter table public.pilot_validation_reviews enable row level security;
revoke all on public.pilot_validation_reviews from public, anon;
grant select, insert, update, delete on public.pilot_validation_reviews to authenticated;

create policy pilot_validation_staff_select on public.pilot_validation_reviews for select to authenticated using (
  exists (select 1 from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid()) where p.id=pilot_validation_reviews.project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id)
);
create policy pilot_validation_staff_insert on public.pilot_validation_reviews for insert to authenticated with check (
  created_by=(select auth.uid()) and exists (select 1 from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid()) where p.id=pilot_validation_reviews.project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id)
);
create policy pilot_validation_staff_update on public.pilot_validation_reviews for update to authenticated using (
  exists (select 1 from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid()) where p.id=pilot_validation_reviews.project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id)
) with check (
  exists (select 1 from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid()) where p.id=pilot_validation_reviews.project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id)
);
create policy pilot_validation_staff_delete on public.pilot_validation_reviews for delete to authenticated using (
  exists (select 1 from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid()) where p.id=pilot_validation_reviews.project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id)
);

create index pilot_validation_reviews_project_reviewed_idx on public.pilot_validation_reviews(project_id, reviewed_at desc);

create or replace function public.get_pilot_validation_scorecard(p_project_id uuid)
returns jsonb language sql security invoker set search_path='' as $$
  with project_scope as (
    select p.id,p.created_at,p.start_date from public.projects p join public.clients c on c.id=p.client_id join public.profiles me on me.id=(select auth.uid()) where p.id=p_project_id and me.role in ('intern','admin') and me.organization_id=c.organization_id
  ), finding_stats as (
    select min(ai.updated_at) filter (where ai.customer_visible=true and ai.approval_status='kunde') as first_customer_finding_at,
      count(*) filter (where ai.customer_visible=true and ai.approval_status='kunde' and ai.confidence>=70 and jsonb_array_length(ai.evidence_assessment)>0)::int as evidence_ready_findings,
      count(*) filter (where ai.customer_visible=true and ai.approval_status='kunde')::int as customer_findings,
      count(*) filter (where ai.outcome_status in ('confirmed','refuted','mixed','unknown'))::int as measured_outcomes
    from public.analysis_items ai where ai.project_id=p_project_id
  ), decision_stats as (
    select min(r.report_date)::date as first_final_report_date from public.reports r where r.project_id=p_project_id and r.state='final'
  ), task_stats as (
    select count(*) filter (where t.source_analysis_item_id is not null)::int as linked_actions,
      count(*) filter (where t.source_analysis_item_id is not null and t.status='erledigt')::int as completed_linked_actions
    from public.tasks t where t.project_id=p_project_id
  ), latest_review as (
    select to_jsonb(r)-'id'-'project_id'-'created_by'-'created_at'-'updated_at' as review from public.pilot_validation_reviews r where r.project_id=p_project_id order by r.reviewed_at desc,r.review_round desc limit 1
  )
  select jsonb_build_object(
    'projectId',ps.id,'projectCreatedAt',ps.created_at,'projectStartDate',ps.start_date,'firstCustomerFindingAt',fs.first_customer_finding_at,
    'timeToFirstCustomerFindingHours',case when fs.first_customer_finding_at is null then null else round((extract(epoch from (fs.first_customer_finding_at-ps.created_at))/3600.0)::numeric,1) end,
    'evidenceReadyFindings',fs.evidence_ready_findings,'customerFindings',fs.customer_findings,
    'evidenceReadyRate',case when fs.customer_findings=0 then null else round((fs.evidence_ready_findings::numeric/fs.customer_findings::numeric),4) end,
    'firstFinalReportDate',ds.first_final_report_date,
    'timeFindingToDecisionHours',case when fs.first_customer_finding_at is null or ds.first_final_report_date is null then null else greatest(0,round((extract(epoch from (ds.first_final_report_date::timestamptz-fs.first_customer_finding_at))/3600.0)::numeric,1)) end,
    'linkedActions',ts.linked_actions,'completedLinkedActions',ts.completed_linked_actions,
    'linkedActionCompletionRate',case when ts.linked_actions=0 then null else round((ts.completed_linked_actions::numeric/ts.linked_actions::numeric),4) end,
    'measuredOutcomes',fs.measured_outcomes,'latestReview',lr.review)
  from project_scope ps cross join finding_stats fs cross join decision_stats ds cross join task_stats ts left join latest_review lr on true;
$$;
revoke all on function public.get_pilot_validation_scorecard(uuid) from public,anon;
grant execute on function public.get_pilot_validation_scorecard(uuid) to authenticated;
