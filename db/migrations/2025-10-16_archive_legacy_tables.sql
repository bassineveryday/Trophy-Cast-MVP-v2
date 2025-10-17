-- Archive legacy/shadow/social tables without dropping them.
-- Proposed to archive if present:
--   - aoy_standings_rows
--   - tournament_events_rows
--   - tournament_results_rows
--   - community_posts, community_chat, members (social prototypes)

BEGIN;

CREATE SCHEMA IF NOT EXISTS archive;

-- Move known legacy shadow tables
ALTER TABLE IF EXISTS public.aoy_standings_rows      SET SCHEMA archive;
ALTER TABLE IF EXISTS public.tournament_events_rows  SET SCHEMA archive;
ALTER TABLE IF EXISTS public.tournament_results_rows SET SCHEMA archive;

-- Move social prototypes if present
ALTER TABLE IF EXISTS public.community_posts SET SCHEMA archive;
ALTER TABLE IF EXISTS public.community_chat  SET SCHEMA archive;
ALTER TABLE IF EXISTS public.members         SET SCHEMA archive;

COMMIT;
