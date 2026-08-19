alter table public.analysis_items
  add column if not exists hypothesis text,
  add column if not exists counter_hypothesis text,
  add column if not exists evidence_assessment jsonb not null default '[]'::jsonb,
  add column if not exists confidence_rationale text,
  add column if not exists intervention text,
  add column if not exists outcome_status text not null default 'pending',
  add column if not exists outcome_note text,
  add column if not exists outcome_measured_at timestamptz;

alter table public.analysis_items
  drop constraint if exists analysis_items_evidence_assessment_array,
  add constraint analysis_items_evidence_assessment_array check (jsonb_typeof(evidence_assessment) = 'array');

alter table public.analysis_items
  drop constraint if exists analysis_items_outcome_status_check,
  add constraint analysis_items_outcome_status_check check (outcome_status in ('pending','confirmed','refuted','mixed','unknown'));

comment on column public.analysis_items.hypothesis is 'Pruefbare Arbeitshypothese zur beobachteten Wachstumsbremse.';
comment on column public.analysis_items.counter_hypothesis is 'Staerkste plausible Gegenhypothese, die aktiv widerlegt oder bestaetigt werden soll.';
comment on column public.analysis_items.evidence_assessment is 'Strukturierte Evidenzbewertungen, z. B. [{sourceId,direction,reliability,note}] mit direction supports|contradicts|neutral.';
comment on column public.analysis_items.confidence_rationale is 'Menschlich nachvollziehbare Begruendung fuer den Confidence-Wert.';
comment on column public.analysis_items.intervention is 'Konkrete Intervention, die aus der diagnostizierten Ursache folgt.';
comment on column public.analysis_items.outcome_status is 'Spaetere Bewertung, ob die Hypothese durch das beobachtete Outcome bestaetigt oder widerlegt wurde.';
