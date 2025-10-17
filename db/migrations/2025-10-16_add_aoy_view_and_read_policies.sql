BEGIN;

-- View: public.aoy_standings (Best-4 points per season)
-- - season_year derived from first 4 chars of event_date (text 'YYYY-MM-DD')
-- - points sourced from COALESCE(aoy_points, points)
-- - optionally enrich boater_status via LEFT JOIN to tournament_members
CREATE OR REPLACE VIEW public.aoy_standings AS
WITH base AS (
  SELECT
    r.member_id,
    COALESCE(r.member_name, tm.member_name) AS member_name,
    tm.boater_status,
    CASE
      WHEN r.event_date ~ '^[0-9]{4}' THEN LEFT(r.event_date, 4)::int
      ELSE NULL
    END AS season_year,
    COALESCE(r.aoy_points::int, r.points) AS pts
  FROM public.tournament_results r
  LEFT JOIN public.tournament_members tm ON tm.member_id = r.member_id
),
ranked AS (
  SELECT
    member_id,
    member_name,
    boater_status,
    season_year,
    ARRAY_AGG(COALESCE(pts, 0) ORDER BY pts DESC) AS pts_arr
  FROM base
  WHERE season_year IS NOT NULL
  GROUP BY member_id, member_name, boater_status, season_year
),
scored AS (
  SELECT
    member_id,
    member_name,
    boater_status,
    season_year,
    (SELECT COALESCE(SUM(x), 0) FROM UNNEST(pts_arr[1:4]) AS t(x)) AS total_aoy_points
  FROM ranked
)
SELECT
  member_id,
  season_year,
  ROW_NUMBER() OVER (
    PARTITION BY season_year
    ORDER BY total_aoy_points DESC, member_name ASC
  ) AS aoy_rank,
  member_name,
  boater_status,
  total_aoy_points
FROM scored;

-- Prepared read policies (NO-OP until RLS is enabled on the tables)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tournament_events' AND policyname='Public read events'
  ) THEN
    CREATE POLICY "Public read events" ON public.tournament_events FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='tournament_results' AND policyname='Public read results'
  ) THEN
    CREATE POLICY "Public read results" ON public.tournament_results FOR SELECT USING (true);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='tournament_members'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname='public' AND tablename='tournament_members' AND policyname='Public read tournament members'
    ) THEN
      CREATE POLICY "Public read tournament members" ON public.tournament_members FOR SELECT USING (true);
    END IF;
  END IF;
END$$;

-- Helpful indexes for AOY view sourcing
CREATE INDEX IF NOT EXISTS idx_results_member      ON public.tournament_results (member_id);
CREATE INDEX IF NOT EXISTS idx_results_event_year  ON public.tournament_results ((LEFT(event_date, 4)));
CREATE INDEX IF NOT EXISTS idx_results_points      ON public.tournament_results (aoy_points, points);

COMMIT;
