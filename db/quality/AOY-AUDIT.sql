-- AOY math audit (recompute Best-4 and compare to the view)
WITH base AS (
  SELECT
    r.member_id,
    COALESCE(r.aoy_points::int, r.points) AS pts,
    CASE WHEN r.event_date ~ '^[0-9]{4}' THEN LEFT(r.event_date, 4)::int END AS season_year
  FROM public.tournament_results r
),
ranked AS (
  SELECT
    member_id,
    season_year,
    pts,
    ROW_NUMBER() OVER (PARTITION BY member_id, season_year ORDER BY pts DESC NULLS LAST) AS rn
  FROM base
  WHERE season_year IS NOT NULL
),
Top4 AS (
  SELECT member_id, season_year, COALESCE(SUM(pts),0) AS recomputed_best4
  FROM ranked
  WHERE rn <= 4
  GROUP BY member_id, season_year
)
SELECT
  a.member_id,
  a.season_year,
  a.total_aoy_points       AS view_points,
  t.recomputed_best4       AS recomputed_points,
  (a.total_aoy_points - t.recomputed_best4) AS diff
FROM public.aoy_standings a
JOIN Top4 t
  ON t.member_id = a.member_id AND t.season_year = a.season_year
WHERE (a.total_aoy_points IS DISTINCT FROM t.recomputed_best4)
ORDER BY ABS(a.total_aoy_points - t.recomputed_best4) DESC
LIMIT 20;
