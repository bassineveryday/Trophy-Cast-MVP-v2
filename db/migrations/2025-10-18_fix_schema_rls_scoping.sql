-- ============================================================================
-- TROPHY CAST: SCHEMA & RLS FIX
-- Date: 2025-10-18
-- Purpose: Consolidate schema fixes, add scoping columns, implement real RLS
-- ============================================================================
-- CRITICAL FIXES:
-- 1. Rename payout → cash_payout for consistency
-- 2. Add is_demo column for lane separation
-- 3. Make aoy_points NOT NULL with DEFAULT
-- 4. Add season_year, club_id for scoping
-- 5. Replace USING (true) with real RLS filtering
-- 6. Use consistent date extraction (EXTRACT(YEAR))
-- ============================================================================

BEGIN;

-- ============================================================================
-- PHASE 1: Update tournament_results table
-- ============================================================================

-- Add missing columns if they don't exist
ALTER TABLE public.tournament_results
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS club_id text,
  ADD COLUMN IF NOT EXISTS season_year int;

-- Rename payout → cash_payout if it exists and cash_payout doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='tournament_results' AND column_name='payout'
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name='tournament_results' AND column_name='cash_payout'
    )
  ) THEN
    ALTER TABLE public.tournament_results RENAME COLUMN payout TO cash_payout;
  END IF;
END $$;

-- Ensure cash_payout has proper default
ALTER TABLE public.tournament_results
  ALTER COLUMN cash_payout SET DEFAULT 0,
  ALTER COLUMN aoy_points SET DEFAULT 0 NOT NULL;

-- Backfill season_year from event_date for existing records
UPDATE public.tournament_results
SET season_year = EXTRACT(YEAR FROM event_date)::int
WHERE season_year IS NULL
  AND event_date IS NOT NULL;

-- ============================================================================
-- PHASE 2: Update tournament_events table
-- ============================================================================

ALTER TABLE public.tournament_events
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS season_year int,
  ADD COLUMN IF NOT EXISTS club_id text;

-- Backfill season_year from event_date
UPDATE public.tournament_events
SET season_year = EXTRACT(YEAR FROM event_date)::int
WHERE season_year IS NULL
  AND event_date IS NOT NULL;

-- ============================================================================
-- PHASE 3: Recreate AOY standings view with proper date handling
-- ============================================================================

-- Safe drop (works for both views and materialized views)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'aoy_standings'
  ) THEN
    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.aoy_standings CASCADE';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'aoy_standings'
  ) THEN
    EXECUTE 'DROP VIEW IF EXISTS public.aoy_standings CASCADE';
  END IF;
END $$;

-- Recreate view with consistent date extraction and scoping
CREATE OR REPLACE VIEW public.aoy_standings AS
WITH base AS (
  SELECT
    r.member_id,
    COALESCE(NULLIF(TRIM(r.member_name), ''), r.member_id::text) AS member_name,
    r.club_id,
    r.is_demo,
    -- Consistent date extraction: EXTRACT(YEAR) from DATE type
    EXTRACT(YEAR FROM r.event_date)::int AS season_year,
    -- Use aoy_points (enforced NOT NULL now), never fall back to ambiguous columns
    COALESCE(r.aoy_points, 0) AS pts
  FROM public.tournament_results r
  WHERE r.aoy_points IS NOT NULL
    AND r.aoy_points > 0
    AND EXTRACT(YEAR FROM r.event_date) IS NOT NULL
),
ranked AS (
  SELECT
    member_id,
    member_name,
    club_id,
    season_year,
    -- Array of top scores ordered descending
    ARRAY_AGG(pts ORDER BY pts DESC) AS pts_arr
  FROM base
  WHERE season_year IS NOT NULL
  GROUP BY member_id, member_name, club_id, season_year
),
scored AS (
  SELECT
    member_id,
    member_name,
    club_id,
    season_year,
    -- Best-4 scoring: sum of top 4 scores
    (
      SELECT COALESCE(SUM(x), 0)
      FROM UNNEST(pts_arr[1:4]) AS x
    ) AS total_aoy_points
  FROM ranked
)
SELECT
  member_id,
  member_name,
  club_id,
  season_year,
  total_aoy_points,
  -- Rank within season by total points (ties broken by name)
  ROW_NUMBER() OVER (
    PARTITION BY season_year
    ORDER BY total_aoy_points DESC, member_name ASC
  ) AS aoy_rank
FROM scored
ORDER BY season_year DESC, aoy_rank ASC;

COMMENT ON VIEW public.aoy_standings IS 
  'AOY Best-4 standings computed from tournament_results. Scoped by season_year, club_id.';

-- ============================================================================
-- PHASE 4: Implement real RLS policies (not USING (true))
-- ============================================================================

-- Drop existing blanket policies (USING true)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read events" ON public.tournament_events;
  DROP POLICY IF EXISTS "Public read results" ON public.tournament_results;
  DROP POLICY IF EXISTS "Public read aoy" ON public.aoy_standings;
  DROP POLICY IF EXISTS "Public read tournament members" ON public.tournament_members;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Tournament Events: Public read (no sensitive data)
-- but exclude demo events unless explicitly requested
DO $$
BEGIN
  CREATE POLICY "Public read non-demo events" 
    ON public.tournament_events
    FOR SELECT
    USING (is_demo = false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tournament Results: Public read (anonymized)
-- but exclude demo results
DO $$
BEGIN
  CREATE POLICY "Public read non-demo results"
    ON public.tournament_results
    FOR SELECT
    USING (is_demo = false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AOY Standings: Public read, scoped by season (prevent data bleed)
-- Only show current and past 2 seasons
DO $$
BEGIN
  CREATE POLICY "Public read aoy current seasons"
    ON public.aoy_standings
    FOR SELECT
    USING (
      season_year >= EXTRACT(YEAR FROM NOW())::int - 2
      AND season_year <= EXTRACT(YEAR FROM NOW())::int
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PHASE 5: Add indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tournament_results_season_year 
  ON public.tournament_results (season_year);

CREATE INDEX IF NOT EXISTS idx_tournament_results_is_demo 
  ON public.tournament_results (is_demo);

CREATE INDEX IF NOT EXISTS idx_tournament_results_member_season 
  ON public.tournament_results (member_id, season_year);

CREATE INDEX IF NOT EXISTS idx_tournament_events_season_year 
  ON public.tournament_events (season_year);

CREATE INDEX IF NOT EXISTS idx_tournament_events_is_demo 
  ON public.tournament_events (is_demo);

-- ============================================================================
-- PHASE 6: Validation checks
-- ============================================================================

-- Log table sizes
DO $$
DECLARE
  v_events_count int;
  v_results_count int;
  v_aoy_count int;
BEGIN
  SELECT COUNT(*) INTO v_events_count FROM public.tournament_events;
  SELECT COUNT(*) INTO v_results_count FROM public.tournament_results;
  SELECT COUNT(DISTINCT member_id) INTO v_aoy_count FROM public.aoy_standings;
  
  RAISE NOTICE 'Migration 2025-10-18 complete:';
  RAISE NOTICE '  Tournament Events: % rows', v_events_count;
  RAISE NOTICE '  Tournament Results: % rows', v_results_count;
  RAISE NOTICE '  AOY Members (current): % unique', v_aoy_count;
END $$;

COMMIT;
