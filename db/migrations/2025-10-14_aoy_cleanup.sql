-- ============================================
-- AOY CLEANUP MIGRATION
-- Date: 2025-10-14
-- Purpose: Remove static AOY sheet/table and replace with a computed view
-- Rules:
--   - AOY points per event = 101 - placement (already stored in tournament_results_rows.aoy_points)
--   - Only the best 4 tournaments per member per season count
--   - Ranking tie-breakers: (1) most first-place finishes in season, (2) best finish (lowest place), (3) member_name alphabetically
-- Output columns (backward-compatible with frontend type AOYStandingsRow):
--   member_id, season_year, aoy_rank, member_name, boater_status, total_aoy_points
-- ============================================

-- 1) Sync boater/co-angler status from legacy AOY table to members (if present)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'aoy_standings_rows'
  ) THEN
    UPDATE public.tournament_members_rows m
    SET boater_status = CASE
      WHEN s.src_status IS NULL OR s.src_status = '' THEN m.boater_status
      WHEN lower(s.src_status) IN ('b','boater') THEN 'B'
      WHEN lower(s.src_status) IN ('c','co','co-angler','co angler','non-boater','non boater','nonboater') THEN 'C'
      ELSE s.src_status
    END
    FROM (
      SELECT member_id, MAX(boater_status) AS src_status
      FROM public.aoy_standings_rows
      GROUP BY member_id
    ) s
    WHERE m.member_id = s.member_id
      AND (m.boater_status IS NULL OR trim(m.boater_status) = '');
  END IF;
END $$;

-- 2) Drop any obsolete AOY tables to avoid confusion (idempotent)
DROP TABLE IF EXISTS public.aoy_standings_rows CASCADE;

-- 3) Create computed AOY standings view
CREATE OR REPLACE VIEW public.aoy_standings AS
WITH results AS (
  SELECT
    r.member_id,
    m.member_name,
    m.boater_status,
    EXTRACT(YEAR FROM r.event_date)::int AS season_year,
    r.aoy_points,
    r.place
  FROM public.tournament_results_rows r
  JOIN public.tournament_members_rows m
    ON m.member_id = r.member_id
  WHERE r.event_date IS NOT NULL
),
ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY member_id, season_year
      ORDER BY aoy_points DESC NULLS LAST, COALESCE(101 - place, 0) DESC
    ) AS rn
  FROM results
  WHERE aoy_points IS NOT NULL
),
top4 AS (
  SELECT * FROM ranked WHERE rn <= 4
),
agg AS (
  SELECT
    member_id,
    season_year,
    SUM(COALESCE(aoy_points, 0)) AS total_aoy_points
  FROM top4
  GROUP BY member_id, season_year
),
season_stats AS (
  SELECT
    member_id,
    season_year,
    COUNT(*) AS tournaments_fished,
    MIN(place) AS best_finish,
    COUNT(*) FILTER (WHERE place = 1) AS first_place_count
  FROM results
  GROUP BY member_id, season_year
),
final AS (
  SELECT
    a.member_id,
    a.season_year,
    -- bring along display fields from any row in this season
    MAX(r.member_name) AS member_name,
    MAX(r.boater_status) AS boater_status,
    a.total_aoy_points,
    s.tournaments_fished,
    s.best_finish,
    s.first_place_count
  FROM agg a
  JOIN results r
    ON r.member_id = a.member_id AND r.season_year = a.season_year
  JOIN season_stats s
    ON s.member_id = a.member_id AND s.season_year = a.season_year
  GROUP BY a.member_id, a.season_year, a.total_aoy_points, s.tournaments_fished, s.best_finish, s.first_place_count
),
ranked_final AS (
  SELECT
    *,
    DENSE_RANK() OVER (
      PARTITION BY season_year
      ORDER BY total_aoy_points DESC,
               first_place_count DESC,
               best_finish ASC NULLS LAST,
               member_name ASC
    ) AS aoy_rank
  FROM final
)
SELECT
  member_id,
  season_year,
  aoy_rank,
  member_name,
  boater_status,
  total_aoy_points
FROM ranked_final
ORDER BY season_year DESC, aoy_rank ASC;

-- 4) Grant read access (typical Supabase roles)
GRANT SELECT ON public.aoy_standings TO anon, authenticated;

-- 5) Notes:
-- - This view recalculates standings dynamically from tournament_results_rows.
-- - Ensure tournament_results_rows.aoy_points is populated per event (101 - placement).
-- - If you previously had triggers/materialized tables for AOY, they can be safely removed now.
