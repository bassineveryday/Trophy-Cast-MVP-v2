-- AOY standings view joined to events for robust date parsing and Best-4 logic
-- Safe drop (works whether it's a view or materialized view)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'aoy_standings'
  ) THEN
    EXECUTE 'DROP MATERIALIZED VIEW IF EXISTS public.aoy_standings';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname = 'public' AND viewname = 'aoy_standings'
  ) THEN
    EXECUTE 'DROP VIEW IF EXISTS public.aoy_standings';
  END IF;
END $$;

-- Recreate the view
CREATE OR REPLACE VIEW public.aoy_standings AS
WITH base AS (
  SELECT
    r.member_id,
    COALESCE(NULLIF(TRIM(e.event_date), ''), NULLIF(TRIM(r.event_date), '')) AS raw_date,
    COALESCE(NULLIF(TRIM(r.member_name), ''), r.member_id::text) AS member_name,
    COALESCE(NULLIF(TRIM(r.aoy_points::text), ''), r.points::text) AS pts_text
  FROM public.tournament_results r
  LEFT JOIN public.tournament_events e ON e.event_id = r.event_id
),
seasoned AS (
  SELECT
    member_id,
    member_name,
    raw_date,
    CASE
      WHEN raw_date ~ '([0-9]{4})' THEN (substring(raw_date from '([0-9]{4})'))::int
      WHEN raw_date ~ '([0-9]{2})\s*$' THEN 2000 + (substring(raw_date from '([0-9]{2})\s*$'))::int
      ELSE NULL
    END AS season_year,
    CASE
      WHEN pts_text IS NULL OR pts_text = '' THEN 0
      WHEN pts_text ~ '^[0-9]+$' THEN pts_text::int
      WHEN pts_text ~ '^[0-9]+\.[0-9]+$' THEN round((pts_text::numeric), 0)::int
      ELSE COALESCE((regexp_replace(pts_text, '[^0-9.-]+', '', 'g'))::int, 0)
    END AS pts
  FROM base
),
agg AS (
  SELECT
    member_id,
    MIN(member_name) AS member_name,
    season_year,
    ARRAY_AGG(pts ORDER BY pts DESC) AS pts_arr
  FROM seasoned
  WHERE season_year IS NOT NULL
  GROUP BY member_id, season_year
),
scored AS (
  SELECT
    member_id,
    member_name,
    season_year,
    (SELECT COALESCE(SUM(x), 0)
     FROM UNNEST(pts_arr[1:4]) AS x) AS total_aoy_points
  FROM agg
)
SELECT
  member_id,
  member_name,
  season_year,
  total_aoy_points,
  ROW_NUMBER() OVER (PARTITION BY season_year ORDER BY total_aoy_points DESC, member_name ASC) AS aoy_rank
FROM scored;

COMMENT ON VIEW public.aoy_standings IS 'AOY Best-4 per season computed from tournament_results joined to events for date parsing';
