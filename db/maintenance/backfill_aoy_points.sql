-- Backfill AOY points in tournament_results_rows
-- Rule: AOY points = 101 - place, minimum 0

WITH updated AS (
  UPDATE public.tournament_results_rows r
  SET aoy_points = GREATEST(0, 101 - r.place)
  WHERE r.aoy_points IS NULL
    AND r.place IS NOT NULL
    AND r.place > 0
  RETURNING 1
)
SELECT COUNT(*) AS rows_updated FROM updated;

-- Optional sanity check
SELECT member_id, event_date, place, aoy_points
FROM public.tournament_results_rows
WHERE aoy_points IS NULL OR aoy_points < 0
ORDER BY event_date DESC
LIMIT 50;
