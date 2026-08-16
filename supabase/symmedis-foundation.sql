-- SYMMEDIS foundation schema for a dedicated Supabase project.
-- Apply only after creating the SYMMEDIS Supabase project.

create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  kind text not null default 'client' check (kind in ('symmedis', 'client')),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  slug text not null,
  status text not null default 'active' check (status in ('lead', 'active', 'paused', 'completed')),
  created_at timestamptz not null default now(),
  unique (organization_id, slug)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null check (role in ('kunde', 'intern', 'admin')),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  client_id uuid references public.clients(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_requires_client check (role <> 'kunde' or client_id is not null)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status text not null default 'setup' check (status in ('setup', 'analysis', 'review', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_organization_id_idx on public.clients(organization_id);
create index if not exists profiles_organization_id_idx on public.profiles(organization_id);
create index if not exists profiles_client_id_idx on public.profiles(client_id);
create index if not exists projects_client_id_idx on public.projects(client_id);

alter table public.organizations enable row level security;
alter table public.clients enable row level security;
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

-- Profiles are the authorization source. Do not use user_metadata for access control.
create policy "profiles_read_self"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

create policy "organizations_read_own"
on public.organizations for select
to authenticated
using (
  id = (select organization_id from public.profiles where id = (select auth.uid()))
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

create policy "clients_read_authorized"
on public.clients for select
to authenticated
using (
  id = (select client_id from public.profiles where id = (select auth.uid()))
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

create policy "projects_read_authorized"
on public.projects for select
to authenticated
using (
  client_id = (select client_id from public.profiles where id = (select auth.uid()))
  or exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

-- Initial write policies are deliberately staff-only. Add more granular
-- project-role policies when analysis/tasks/documents are migrated.
create policy "clients_staff_insert"
on public.clients for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

create policy "clients_staff_update"
on public.clients for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

create policy "projects_staff_insert"
on public.projects for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

create policy "projects_staff_update"
on public.projects for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role in ('intern', 'admin')
  )
);

grant usage on schema public to authenticated;
grant select on public.organizations, public.profiles to authenticated;
grant select, insert, update on public.clients, public.projects to authenticated;
