# Trophy Cast — Consolidation & AOY View (Best‑4)

Where Every Cast Counts.

## What we added
- db/migrations/2025-10-16_add_aoy_view_and_read_policies.sql
  - Creates public.aoy_standings as a computed view using Best‑4 rule
  - Prepares read policies (no RLS change yet)
  - Adds helpful indexes to tournament_results
- db/migrations/2025-10-16_archive_legacy_tables.sql
  - Non‑destructive: moves legacy/social tables to archive schema if present
- scripts/check-supabase-usage.js
  - Lists all tables referenced in code (from supabase.from and raw SQL)
- scripts/ping-supabase.js
  - Pings core objects with your anon key to confirm readable

## Core tables/views the app relies on
- tournament_events
- tournament_results
- aoy_standings (view)
- profiles
- Optional: tournament_members (registration)

## How to apply (Supabase SQL Editor)
1) Run db/migrations/2025-10-16_add_aoy_view_and_read_policies.sql
2) (Optional) Run db/migrations/2025-10-16_archive_legacy_tables.sql

## Verify locally
- PowerShell (Windows):
  - node scripts\\check-supabase-usage.js
  - $env:SUPABASE_URL="<your-url>"; $env:SUPABASE_ANON_KEY="<your-anon>"
  - node scripts\\ping-supabase.js
- Expected:
  - aoy_standings returns rows with aoy_rank and total_aoy_points
  - All core objects read OK (no RLS errors on events/results)

## AOY logic
- season_year: derived via LEFT(event_date, 4) when event_date looks like YYYY-...
- points: COALESCE(aoy_points, points)
- total: sum of top 4 points per member per season
- rank: ROW_NUMBER by total DESC, member_name ASC

## Notes on RLS posture
- We did NOT enable RLS on events/results in this pass. Prepared policies exist if you enable later.

## Next steps (optional)
- Confirm if Registration (tournament_members) is in-scope
- Decide on Social prototypes (community_posts/chat/members) and archive as needed
- Remove or feature-flag code paths that hit archived tables

Where Every Cast Counts.

## Features in scope (MVP)
- The app only queries these core objects:
  - public.tournament_events
  - public.tournament_results
  - public.aoy_standings (view)
  - public.profiles
- Social (community_posts, community_chat, members) is disabled in UI.
- Enhanced Registration (validation against tournament_members) is disabled by default.

## Re-enable later (5‑step runbook)
1) In Supabase, add SELECT policy on public.tournament_members appropriate for your audience.
2) Flip the flag in App.tsx: set ENABLE_ENHANCED_REGISTRATION = true.
3) (Optional) Re-introduce Social tab and ensure social tables exist or reverse the archive migration.
4) Run npm run lint; npm test to verify.
5) Smoke test: Register flow validates member codes; Social loads without errors.