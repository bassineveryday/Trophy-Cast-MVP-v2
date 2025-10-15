# AOY Cleanup: Remove Static Sheet, Compute from Top 4

Date: 2025-10-14

This change removes the old aoy_standings_rows “sheet/table” and replaces it with a computed SQL view aoy_standings that derives standings from tournament_results_rows. The rules follow Denver Bassmasters guidelines:

- Per event AOY points: 101 - placement
- Only best 4 tournaments per member per season count toward total
- Tie-breakers: (1) most first-place finishes, (2) best finish (lowest place), (3) member name A→Z

## What changed

- Dropped table: public.aoy_standings_rows
- Added view: public.aoy_standings
- View columns: member_id, season_year, aoy_rank, member_name, boater_status, total_aoy_points
- Read access granted to anon and authenticated

## How to apply

1) Open Supabase SQL Editor and run the migration script:
- db/migrations/2025-10-14_aoy_cleanup.sql

2) Verify results:
- SELECT * FROM public.aoy_standings ORDER BY season_year DESC, aoy_rank ASC;
- Confirm ranks, totals, and tie-breaks look correct

3) Remove any old references to aoy_standings_rows (if any remain)

## Frontend compatibility

The app queries the table name 'aoy_standings'. This view provides the exact columns used by the app’s AOY screens and hooks, so no frontend code changes are required. If you had custom admin tools inserting into aoy_standings_rows, please delete them—standings are now derived solely from tournament_results_rows.

## Data hygiene tips

- Ensure tournament_results_rows has event_date, member_id, place, and aoy_points filled per event
- If aoy_points is missing but place is present, backfill with 101 - place
- Confirm one row per event per member (avoid duplicates)

## Rollback

If you need to revert, you can recreate aoy_standings_rows with db/create_aoy_standings_rows.sql, but we recommend staying with the computed view to prevent drift.

## FAQ

- Does two-day event logic work? The view sums per result rows; if you record two separate results (one per day) with proper aoy_points, the top-4 rule still applies—they compete with other tournaments/days.
- Can we store historical seasons? Yes. season_year is derived from event_date, so you can compute standings per year automatically.

---

Owner: Data team
Status: Complete