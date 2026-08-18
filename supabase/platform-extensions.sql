-- SYMMEDIS platform extensions
-- Applied to the production Supabase project. Keep this file as the reviewable source of truth.

create extension if not exists vector with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists unaccent with schema extensions;
create extension if not exists pg_cron;

-- Core extension tables live in the database:
-- public.integration_connections
-- public.sync_jobs
-- public.notification_preferences
-- public.notification_events
-- public.knowledge_chunks (embedding vector(1536))
--
-- Access is protected by RLS and organization/project membership. Provider credentials
-- are intentionally NOT stored in these tables; keep them in server-side secrets/OAuth vaults.

-- Search helpers:
-- public.search_project_knowledge(project_id, query, limit)
-- public.match_project_knowledge(project_id, embedding, limit, min_similarity)
-- Both functions use SECURITY INVOKER so existing RLS remains the authorization boundary.
