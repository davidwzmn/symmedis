-- SYMMEDIS enterprise audit layer
-- Live schema is applied in Supabase. This file documents the intended contract.

-- public.audit_events is append-only and stores actor, tenant/project context,
-- event type, entity reference, summary, metadata and timestamp.
--
-- Authenticated users receive SELECT only when they are SYMMEDIS staff/admin.
-- Direct INSERT/UPDATE/DELETE is intentionally not granted to frontend users.
-- Future Edge Functions/service workflows should append events server-side.
-- A database trigger blocks UPDATE and DELETE to preserve audit integrity.
