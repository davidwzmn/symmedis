create table if not exists public.website_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  company text not null check (char_length(company) between 2 and 160),
  email text not null check (char_length(email) between 5 and 254),
  situation text not null default '' check (char_length(situation) <= 4000),
  source text not null default 'website' check (char_length(source) <= 80),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed','spam')),
  ip_hash text not null default '',
  user_agent text not null default '' check (char_length(user_agent) <= 500),
  created_at timestamptz not null default now()
);

alter table public.website_leads enable row level security;

revoke all on table public.website_leads from anon, authenticated, public;
grant select, insert, update, delete on table public.website_leads to service_role;

create index if not exists website_leads_created_at_idx on public.website_leads (created_at desc);
create index if not exists website_leads_email_created_at_idx on public.website_leads (lower(email), created_at desc);
create index if not exists website_leads_ip_hash_created_at_idx on public.website_leads (ip_hash, created_at desc);

comment on table public.website_leads is 'Private website contact requests. Browser roles have no direct table privileges; writes go through the submit-lead Edge Function.';
