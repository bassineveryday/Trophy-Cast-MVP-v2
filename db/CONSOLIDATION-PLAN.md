# Supabase Consolidation Plan

Goal: simplify to the minimal tables the app actually uses right now.

Keep (required by app):
- profiles (auth link to member)
- tournament_events (schedule list consumed by Tournaments screens and hooks)
- tournament_results (all dashboard/results/AOY aggregates derive from this)
- aoy_standings (directly queried by AOY screens and hooks)

Optional/Defer (not required for current MVP screens):
- tournament_members (nice to have member metadata; not directly queried by UI now)
- community_posts, community_chat, members (only used by SocialScreen prototype; safe to drop if you want to trim)
- club_officers, club_events (admin features; not used by app yet)

Delete in Supabase now (to reduce clutter; verify not used by external tools):
- any *_rows shadow tables (e.g., aoy_standings_rows) — app is standardized on base tables
- staging/import helper tables you created during CSV imports

Code references by table:
- profiles: lib/AuthContext.tsx (profile load by user id)
- tournament_events: lib/supabase.ts fetchTournamentEvents; lib/hooks/useQueries.ts useTournaments and grouping; multiple screens
- tournament_results: used across dashboard, participants, results aggregation, health-check scripts
- aoy_standings: used for AOY list and member rank fetch

SQL migration outline:
1) Drop proto/social tables (optional):
```sql
-- optional cleanup if SocialScreen not needed
DROP TABLE IF EXISTS community_posts;
DROP TABLE IF EXISTS community_chat;
DROP TABLE IF EXISTS members;
```

2) Ensure core tables exist with minimal columns:
```sql
-- tournament_events
CREATE TABLE IF NOT EXISTS public.tournament_events (
  event_id text PRIMARY KEY,
  tournament_code text,
  tournament_name text,
  event_date date,
  lake text,
  participants int
);

-- tournament_results
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

-- aoy_standings
CREATE TABLE IF NOT EXISTS public.aoy_standings (
  member_id text,
  season_year int,
  aoy_rank int,
  member_name text,
  boater_status text,
  total_aoy_points int
);
```

3) Remove “_rows” tables and views:
```sql
DROP TABLE IF EXISTS public.aoy_standings_rows;
DROP TABLE IF EXISTS public.tournament_events_rows;
DROP TABLE IF EXISTS public.tournament_results_rows;
```

4) Standardize column names the app expects via aliases or renames:
```sql
-- keep db as `payout`; app now reads payout OR cash_payout when present
-- if you previously had cash_payout, you can coalesce in views (optional)
```

5) Policies: read-only public for MVP data
```sql
ALTER TABLE public.tournament_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aoy_standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read events" ON public.tournament_events
  FOR SELECT USING (true);
CREATE POLICY "Public read results" ON public.tournament_results
  FOR SELECT USING (true);
CREATE POLICY "Public read aoy" ON public.aoy_standings
  FOR SELECT USING (true);
```

Local repo cleanup to perform:
- Delete db/create_aoy_standings_rows.sql and db/README.md that reference *_rows
- Remove screens/fetchStandings.tmp (old scratch)

Verification checklist:
- Tournaments screens load from tournament_events
- Dashboard shows lastTournament, season stats from tournament_results
- AOY tab loads from aoy_standings
- Participant counts and multi-day aggregation still work
