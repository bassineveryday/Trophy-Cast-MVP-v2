-- ============================================
-- AOY TOP-4 BREAKDOWN VIEW
-- Date: 2025-10-14
-- Purpose: Show which 4 events counted toward each member's AOY total
-- ============================================

CREATE OR REPLACE VIEW public.aoy_top4_breakdown AS
WITH results AS (
  SELECT
    r.member_id,
    m.member_name,
    m.boater_status,
    EXTRACT(YEAR FROM r.event_date)::int AS season_year,
    r.event_id,
    r.tournament_name,
    r.event_date,
    r.place,
    r.aoy_points
  FROM public.tournament_results_rows r
  JOIN public.tournament_members_rows m ON m.member_id = r.member_id
  WHERE r.event_date IS NOT NULL AND r.aoy_points IS NOT NULL
), ranked AS (
  SELECT
    *,
    ROW_NUMBER() OVER (
      PARTITION BY member_id, season_year
      ORDER BY aoy_points DESC, COALESCE(101 - place, 0) DESC
    ) AS rn
  FROM results
)
SELECT
  member_id,
  member_name,
  boater_status,
  season_year,
  event_id,
  tournament_name,
  event_date,
  place,
  aoy_points,
  rn AS rank_within_season
FROM ranked
WHERE rn <= 4
ORDER BY season_year DESC, member_id, rn ASC;

GRANT SELECT ON public.aoy_top4_breakdown TO anon, authenticated;
