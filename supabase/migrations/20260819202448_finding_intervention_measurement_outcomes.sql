alter table public.measurement_snapshots
  add column if not exists analysis_item_id uuid,
  add column if not exists horizon_days smallint,
  add column if not exists assessment text not null default 'pending',
  add column if not exists assessment_note text not null default '';

alter table public.analysis_items
  add constraint analysis_items_id_project_unique unique (id, project_id);

alter table public.measurement_snapshots
  add constraint measurement_snapshots_analysis_project_fk
  foreign key (analysis_item_id, project_id)
  references public.analysis_items(id, project_id)
  on delete cascade;

alter table public.measurement_snapshots
  add constraint measurement_snapshots_horizon_days_check
  check (horizon_days is null or horizon_days in (30, 60, 90));

alter table public.measurement_snapshots
  add constraint measurement_snapshots_assessment_check
  check (assessment in ('pending', 'supports', 'refutes', 'mixed', 'unknown'));

create unique index if not exists measurement_snapshots_finding_horizon_metric_uidx
  on public.measurement_snapshots (analysis_item_id, horizon_days, metric_key)
  where analysis_item_id is not null and horizon_days is not null;

create index if not exists measurement_snapshots_analysis_item_idx
  on public.measurement_snapshots (analysis_item_id, horizon_days, target_at);

comment on column public.measurement_snapshots.analysis_item_id is 'Finding whose intervention this measurement tests.';
comment on column public.measurement_snapshots.horizon_days is 'Planned outcome horizon in days: 30, 60 or 90.';
comment on column public.measurement_snapshots.assessment is 'Whether this measurement supports, refutes, mixes or cannot determine the diagnosis.';
comment on column public.measurement_snapshots.assessment_note is 'Human-readable rationale for the measurement assessment.';
