create index if not exists analysis_items_outcome_reviewed_by_idx
  on public.analysis_items (outcome_reviewed_by);

create index if not exists measurement_snapshots_analysis_project_idx
  on public.measurement_snapshots (analysis_item_id, project_id);
