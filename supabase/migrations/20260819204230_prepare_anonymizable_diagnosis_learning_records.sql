create table if not exists private.diagnosis_learning_records (
  source_analysis_item_id uuid primary key references public.analysis_items(id) on delete cascade,
  organization_id uuid not null,
  schema_version smallint not null default 1,
  learning_payload jsonb not null,
  outcome_measured_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint diagnosis_learning_records_payload_object check (jsonb_typeof(learning_payload) = 'object')
);

create index if not exists diagnosis_learning_records_org_idx
  on private.diagnosis_learning_records (organization_id, outcome_measured_at desc);

revoke all on private.diagnosis_learning_records from public, anon, authenticated;

create or replace function private.refresh_diagnosis_learning_record()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public, private
as $$
declare
  v_org_id uuid;
  v_supports int := 0;
  v_refutes int := 0;
  v_neutral int := 0;
  v_measurements int := 0;
  v_max_horizon int := null;
  v_latest_assessment text := 'pending';
  v_confidence_band text;
  v_impact_band text;
  v_time_band text;
begin
  if new.outcome_status = 'pending' or new.outcome_confidence is null then
    delete from private.diagnosis_learning_records where source_analysis_item_id = new.id;
    return new;
  end if;

  select c.organization_id into v_org_id
  from public.projects pr
  join public.clients c on c.id = pr.client_id
  where pr.id = new.project_id;

  if v_org_id is null then
    delete from private.diagnosis_learning_records where source_analysis_item_id = new.id;
    return new;
  end if;

  select
    count(*) filter (where item->>'direction' = 'supports'),
    count(*) filter (where item->>'direction' = 'contradicts'),
    count(*) filter (where coalesce(item->>'direction','neutral') = 'neutral')
  into v_supports, v_refutes, v_neutral
  from jsonb_array_elements(coalesce(new.outcome_evidence_assessment, '[]'::jsonb)) item;

  select count(*), max(ms.horizon_days)
  into v_measurements, v_max_horizon
  from public.measurement_snapshots ms
  where ms.analysis_item_id = new.id;

  select coalesce(ms.assessment, 'pending') into v_latest_assessment
  from public.measurement_snapshots ms
  where ms.analysis_item_id = new.id
    and ms.assessment <> 'pending'
  order by ms.horizon_days desc nulls last, ms.updated_at desc
  limit 1;

  v_latest_assessment := coalesce(v_latest_assessment, 'pending');

  v_confidence_band := case
    when new.outcome_confidence < 25 then '0-24'
    when new.outcome_confidence < 50 then '25-49'
    when new.outcome_confidence < 75 then '50-74'
    when new.outcome_confidence < 90 then '75-89'
    else '90-100'
  end;

  v_impact_band := case
    when new.revenue_impact_max is null then 'unknown'
    when abs(new.revenue_impact_max) < 10000 then 'lt_10k'
    when abs(new.revenue_impact_max) < 50000 then '10k_50k'
    when abs(new.revenue_impact_max) < 250000 then '50k_250k'
    else 'gte_250k'
  end;

  v_time_band := case
    when new.time_to_impact_days is null then 'unknown'
    when new.time_to_impact_days <= 30 then '0_30d'
    when new.time_to_impact_days <= 60 then '31_60d'
    when new.time_to_impact_days <= 90 then '61_90d'
    else 'gt_90d'
  end;

  insert into private.diagnosis_learning_records (
    source_analysis_item_id,
    organization_id,
    schema_version,
    learning_payload,
    outcome_measured_at,
    updated_at
  ) values (
    new.id,
    v_org_id,
    1,
    jsonb_build_object(
      'categoryId', new.category_id,
      'confidenceBand', v_confidence_band,
      'outcomeStatus', new.outcome_status,
      'evidenceSupports', v_supports,
      'evidenceContradicts', v_refutes,
      'evidenceNeutral', v_neutral,
      'measurementCount', v_measurements,
      'maxHorizonDays', v_max_horizon,
      'latestMeasurementAssessment', v_latest_assessment,
      'impactBand', v_impact_band,
      'effort', coalesce(new.effort, 'unknown'),
      'timeToImpactBand', v_time_band,
      'hasIntervention', coalesce(length(trim(new.outcome_intervention)), 0) > 0
    ),
    new.outcome_measured_at,
    now()
  )
  on conflict (source_analysis_item_id) do update set
    organization_id = excluded.organization_id,
    schema_version = excluded.schema_version,
    learning_payload = excluded.learning_payload,
    outcome_measured_at = excluded.outcome_measured_at,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

revoke all on function private.refresh_diagnosis_learning_record() from public, anon, authenticated;

drop trigger if exists trg_refresh_diagnosis_learning_record on public.analysis_items;
create trigger trg_refresh_diagnosis_learning_record
after insert or update of outcome_status, outcome_confidence, outcome_evidence_assessment, outcome_intervention, revenue_impact_max, time_to_impact_days, effort, outcome_measured_at
on public.analysis_items
for each row
execute function private.refresh_diagnosis_learning_record();

comment on table private.diagnosis_learning_records is 'Private governance record for future de-identified diagnosis learning. learning_payload intentionally excludes client/project IDs and raw free-text hypothesis/intervention.';
