-- Consolidate schema to minimal core tables used by app
-- Safe by default: IF EXISTS/IF NOT EXISTS guards

-- Optional: drop social prototype tables
DROP TABLE IF EXISTS public.community_posts;
DROP TABLE IF EXISTS public.community_chat;
DROP TABLE IF EXISTS public.members;

-- Drop any *_rows shadows
DROP TABLE IF EXISTS public.aoy_standings_rows;
DROP TABLE IF EXISTS public.tournament_events_rows;
DROP TABLE IF EXISTS public.tournament_results_rows;

-- Ensure core tables exist with minimal required columns
CREATE TABLE IF NOT EXISTS public.tournament_events (
  event_id text PRIMARY KEY,
  tournament_code text,
  tournament_name text,
  event_date date,
  lake text,
  participants int
);

CREATE TABLE IF NOT EXISTS public.tournament_results (
  result_id text PRIMARY KEY,
  event_id text,
  tournament_code text,
  tournament_name text,
  event_date date,
  lake text,
  member_id text,
  member_name text,
  place int,
  weight_lbs numeric,
  big_fish numeric,
  aoy_points int,
  payout numeric default 0
);

CREATE TABLE IF NOT EXISTS public.aoy_standings (
  member_id text,
  season_year int,
  aoy_rank int,
  member_name text,
  boater_status text,
  total_aoy_points int
);

-- RLS read-only policies for MVP
ALTER TABLE public.tournament_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aoy_standings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read events" ON public.tournament_events FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read results" ON public.tournament_results FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Public read aoy" ON public.aoy_standings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
