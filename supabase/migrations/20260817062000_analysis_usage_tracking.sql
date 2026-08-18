begin;

alter table public.analysis_runs
  add column if not exists input_tokens bigint not null default 0,
  add column if not exists output_tokens bigint not null default 0,
  add column if not exists cache_read_input_tokens bigint not null default 0,
  add column if not exists cache_creation_input_tokens bigint not null default 0;

commit;
