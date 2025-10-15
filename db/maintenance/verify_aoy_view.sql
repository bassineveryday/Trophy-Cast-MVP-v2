-- Verify AOY standings view after cleanup

-- Summary by season
SELECT season_year, COUNT(*) AS members_ranked
FROM public.aoy_standings
GROUP BY season_year
ORDER BY season_year DESC;

-- Top 10 current season
WITH current_year AS (
  SELECT EXTRACT(YEAR FROM CURRENT_DATE)::int AS y
)
SELECT s.*
FROM public.aoy_standings s
JOIN current_year cy ON s.season_year = cy.y
ORDER BY s.aoy_rank ASC
LIMIT 10;

-- Cross-check: recompute totals for a sample member
-- Replace 'DBM019' with your target member id
WITH params AS (
  SELECT 'DBM019'::text AS member_id
),
res AS (
  SELECT r.member_id,
         EXTRACT(YEAR FROM r.event_date)::int AS season_year,
         r.aoy_points
  FROM public.tournament_results_rows r
  JOIN params p ON p.member_id = r.member_id
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER(PARTITION BY member_id, season_year ORDER BY aoy_points DESC) rn
  FROM res
),
best4 AS (
  SELECT * FROM ranked WHERE rn <= 4
)
SELECT member_id, season_year, SUM(aoy_points) AS recomputed_total
FROM best4
GROUP BY member_id, season_year
ORDER BY season_year DESC;
