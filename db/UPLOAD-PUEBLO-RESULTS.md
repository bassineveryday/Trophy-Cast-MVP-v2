# Upload Pueblo Tournament (2025-05-17) to Supabase

This guide loads the Pueblo 5-17-25 results and updates the schedule. It uses numeric `big_fish` and `aoy_points` for app-wide features (AOY, dashboards, multi-day aggregation).

## Prereqs
- Supabase project is set up (see `db/COMPLETE-SETUP-GUIDE.md`).
- Roster table `public.tournament_members_rows` is populated with member_id + member_name.
- Environment variables are configured (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

## Steps (SQL Editor)
1) Open Supabase → SQL Editor.
2) Paste and run the contents of `sql/insert_pueblo_2025_05_17.sql`.
   - This will:
     - Upsert the event `PUEBLO-20250517` into `tournament_events_rows`.
     - Delete any existing results for that event to avoid duplicates.
     - Insert all 30 rows with place, weight, big fish, and aoy points.
     - Link results to members by exact name match (case-insensitive) where possible.
     - Update participants count on the event.

Optional: if any member didn’t match (NULL member_id), add/normalize the member in `tournament_members_rows` and re-run the script.

## Verify in the App
- Tournaments tab:
  - Find “Pueblo 5-17-25” (Pueblo Reservoir). Participant badge should show 30.
  - Expand card → Details shows participants and status.
- Tournament Detail:
  - Open the Pueblo event → results table shows places in ascending order.
- AOY tab:
  - Points and ranks reflect the newly loaded `aoy_points`.
- Home/Dashboard:
  - Recent tournament and season stats (total weight, big fish, wins) include this event.

## Troubleshooting
- Missing participants: ensure `tournament_results_rows.event_id = 'PUEBLO-20250517'` rows exist.
- Member linking:
  - The script matches `lower(trim(member_name))` to roster names. Update roster entries if spelling differs.
- Big fish / points:
  - App reads numeric `big_fish` and integer `aoy_points`. Confirm columns have values in `tournament_results_rows`.

## Rollback (if needed)
- Remove results for this event:
  ```sql
  DELETE FROM public.tournament_results_rows WHERE event_id = 'PUEBLO-20250517';
  ```
- Remove event:
  ```sql
  DELETE FROM public.tournament_events_rows WHERE event_id = 'PUEBLO-20250517';
  ```

## Notes
- The script is safe to re-run; it deletes and re-inserts results for the event.
- If you later add member IDs for unmatched names, re-run the script to backfill `member_id` on those rows.