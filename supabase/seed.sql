-- Idempotente Basisdaten für lokale/Preview-Supabase-Umgebungen.
insert into public.organizations (name, slug, kind)
values ('SYMMEDIS', 'symmedis', 'symmedis')
on conflict (slug) do update
set name = excluded.name,
    kind = excluded.kind;
