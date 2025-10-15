-- DEPRECATED: 2025-10-14
-- This table is replaced by a computed view `public.aoy_standings`.
-- Prefer running: db/migrations/2025-10-14_aoy_cleanup.sql
-- which drops this table (if present) and creates the computed view based on
-- top-4 tournaments per member per season.
--
-- Keep this file only for rollback/reference. Do not use in new setups.
--
-- Create table for Angler of the Year standings
CREATE TABLE public.aoy_standings_rows (
  member_id text NOT NULL,
  season_year bigint NULL,
  aoy_rank bigint NULL,
  member_name text NULL,
  boater_status text NULL,
  total_aoy_points bigint NULL,
  CONSTRAINT aoy_standings_rows_pkey PRIMARY KEY (member_id)
) TABLESPACE pg_default;

-- Optional: insert sample rows for testing
-- INSERT INTO public.aoy_standings_rows (member_id, season_year, aoy_rank, member_name, boater_status, total_aoy_points) VALUES
-- ('m1', 2025, 1, 'John Fisher', 'B', 2500),
-- ('m2', 2025, 2, 'Sam Angler', 'C', 2200);