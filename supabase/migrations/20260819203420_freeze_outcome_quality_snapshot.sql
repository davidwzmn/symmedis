alter table public.analysis_items
  add column if not exists outcome_confidence smallint,
  add column if not exists outcome_hypothesis text,
  add column if not exists outcome_intervention text,
  add column if not exists outcome_evidence_assessment jsonb,
  add column if not exists outcome_reviewed_by uuid references public.profiles(id) on delete set null;

alter table public.analysis_items
  add constraint analysis_items_outcome_confidence_check
  check (outcome_confidence is null or (outcome_confidence >= 0 and outcome_confidence <= 100));

alter table public.analysis_items
  add constraint analysis_items_outcome_evidence_assessment_check
  check (outcome_evidence_assessment is null or jsonb_typeof(outcome_evidence_assessment) = 'array');

comment on column public.analysis_items.outcome_confidence is 'Frozen diagnosis confidence at the moment a human records a non-pending outcome.';
comment on column public.analysis_items.outcome_hypothesis is 'Frozen hypothesis text at outcome review time.';
comment on column public.analysis_items.outcome_intervention is 'Frozen intervention text at outcome review time.';
comment on column public.analysis_items.outcome_evidence_assessment is 'Frozen structured evidence assessment at outcome review time.';
comment on column public.analysis_items.outcome_reviewed_by is 'Human reviewer who consciously recorded the outcome.';

create or replace function public.get_diagnosis_quality_summary()
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_role text;
  v_result jsonb;
begin
  select p.role into v_role
  from public.profiles p
  where p.id = (select auth.uid());

  if v_role is null or v_role not in ('intern', 'admin') then
    raise exception 'diagnosis quality is staff-only' using errcode = '42501';
  end if;

  with eligible as (
    select
      ai.id,
      ai.project_id,
      ai.category_id,
      ai.outcome_status,
      ai.outcome_confidence,
      ai.outcome_measured_at,
      ai.outcome_hypothesis,
      ai.outcome_intervention,
      case
        when ai.outcome_status = 'confirmed' then 1.0
        when ai.outcome_status = 'refuted' then 0.0
        else null
      end as observed,
      case when ai.outcome_confidence is not null then ai.outcome_confidence / 100.0 else null end as predicted
    from public.analysis_items ai
  ),
  aggregate as (
    select
      count(*) as total_findings,
      count(*) filter (where outcome_status <> 'pending') as measured_findings,
      count(*) filter (where outcome_status in ('confirmed','refuted') and outcome_confidence is not null) as binary_outcomes,
      round(avg(outcome_confidence) filter (where outcome_status in ('confirmed','refuted') and outcome_confidence is not null), 1) as mean_confidence,
      round(100.0 * avg(observed) filter (where observed is not null and predicted is not null), 1) as confirmation_rate,
      round(avg(power(predicted - observed, 2)) filter (where observed is not null and predicted is not null), 4) as brier_score,
      round(avg(abs(predicted - observed)) filter (where observed is not null and predicted is not null), 4) as mean_abs_calibration_error,
      round(100.0 * avg(case when outcome_status = 'refuted' then 1.0 else 0.0 end)
        filter (where outcome_confidence >= 75 and outcome_status in ('confirmed','refuted')), 1) as high_confidence_refuted_rate
    from eligible
  ),
  recent as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'id', e.id,
      'projectId', e.project_id,
      'categoryId', e.category_id,
      'outcomeStatus', e.outcome_status,
      'outcomeConfidence', e.outcome_confidence,
      'outcomeMeasuredAt', e.outcome_measured_at,
      'hypothesis', e.outcome_hypothesis,
      'intervention', e.outcome_intervention
    ) order by e.outcome_measured_at desc) filter (where e.outcome_status <> 'pending'), '[]'::jsonb) as rows
    from (select * from eligible where outcome_status <> 'pending' order by outcome_measured_at desc nulls last limit 12) e
  )
  select jsonb_build_object(
    'totalFindings', a.total_findings,
    'measuredFindings', a.measured_findings,
    'binaryOutcomes', a.binary_outcomes,
    'outcomeCoveragePct', case when a.total_findings > 0 then round(100.0 * a.measured_findings / a.total_findings, 1) else 0 end,
    'meanConfidence', a.mean_confidence,
    'confirmationRatePct', a.confirmation_rate,
    'brierScore', a.brier_score,
    'meanAbsoluteCalibrationError', a.mean_abs_calibration_error,
    'highConfidenceRefutedRatePct', a.high_confidence_refuted_rate,
    'qualityStatus', case when a.binary_outcomes < 10 then 'insufficient_data' when a.binary_outcomes < 30 then 'early_signal' else 'stable' end,
    'recentOutcomes', r.rows
  ) into v_result
  from aggregate a cross join recent r;

  return v_result;
end;
$$;

revoke all on function public.get_diagnosis_quality_summary() from public;
revoke all on function public.get_diagnosis_quality_summary() from anon;
grant execute on function public.get_diagnosis_quality_summary() to authenticated;
