-- Cedar Bluff is a TWO-DAY tournament
-- Day 1: CEDARBLUFF-20250503 (May 3, 2025) - Cedar 5-3-25 [EXISTING DATA]
-- Day 2: CEDARBLUFF-20250504 (May 4, 2025) - Cedar 5-4-25 [NEW DATA TO INSERT]
--
-- This follows the same two-day structure and logic as Norton tournament:
-- Norton Day 1: NORTON-20250802 (August 2, 2025)
-- Norton Day 2: NORTON-20250803 (August 3, 2025)
--
-- The multi-day logic in useMultiDayTournamentResults will detect both days,
-- aggregate results, show movement indicators on Day 2, and trophy icons in Final tab.

BEGIN;

-- Ensure pgcrypto is available for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert Day 2 Cedar Bluff results
-- IMPORTANT: Update these values with actual Day 2 results data
-- The structure must match Day 1 participants for proper movement tracking
INSERT INTO tournament_results (result_id, tournament_code, event_date, tournament_name, member_name, fish_count, weight_lbs, place)
SELECT gen_random_uuid(), v.tournament_code, v.event_date, v.tournament_name, v.member_name, v.fish_count, v.weight_lbs, v.place
FROM (
  VALUES
    -- Format: ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Member Name',fish_count,weight_lbs,NULL::bigint)
    -- UPDATE THE VALUES BELOW WITH ACTUAL DAY 2 RESULTS:
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Travis Sneith',5,11.50::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Johnathan Lee Roberts',5,13.20::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Tai Hunt',5,12.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Harry chang',5,10.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Bobby Martin',5,9.50::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Jason Carpenter',5,11.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Justin Apfel',5,8.80::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Brandon Genova',5,7.50::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Jeremiah Hofstetter',5,9.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Jonathan Sharpe',5,8.20::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Larry Triplet',5,8.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Howard Binkley',5,6.50::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Andrew Bowman',5,8.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Howard Wong',5,7.50::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Gabe Paznokas',5,7.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Steve Vaughn',5,6.80::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Nick Melcher',5,7.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Zach Jacobs',4,4.50::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Donavon  Sparrow',3,2.00::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Jon McDaniel',2,3.20::numeric,NULL::bigint),
    ('CEDARBLUFF-20250504','2025-05-04'::date,'Cedar 5-4-25','Travis Barday',1,1.50::numeric,NULL::bigint)
) AS v(tournament_code, event_date, tournament_name, member_name, fish_count, weight_lbs, place)
-- Only insert if a row for the same tournament/date/member doesn't already exist (prevents duplicates)
WHERE NOT EXISTS (
  SELECT 1 FROM tournament_results tr
  WHERE tr.tournament_code = v.tournament_code
    AND tr.event_date::text = v.event_date::text
    AND tr.member_name = v.member_name
);

-- Optionally: Create or update tournament_events entry for Day 2
-- This ensures the event is properly registered in the system
INSERT INTO tournament_events (event_id, tournament_code, tournament_name, event_date, lake, location)
VALUES (
  gen_random_uuid(),
  'CEDARBLUFF-20250504',
  'Cedar 5-4-25',
  '2025-05-04'::date,
  'Cedar Bluff Reservoir',
  'Cedar Bluff State Park'
)
ON CONFLICT (tournament_code) DO NOTHING;

-- Update Day 1 event if needed to ensure consistency
INSERT INTO tournament_events (event_id, tournament_code, tournament_name, event_date, lake, location)
VALUES (
  gen_random_uuid(),
  'CEDARBLUFF-20250503',
  'Cedar 5-3-25',
  '2025-05-03'::date,
  'Cedar Bluff Reservoir',
  'Cedar Bluff State Park'
)
ON CONFLICT (tournament_code) DO NOTHING;

COMMIT;

-- After running this script, the app will automatically:
-- 1. Detect Cedar Bluff as a two-day tournament (like Norton)
-- 2. Show Day 1, Day 2, and Final tabs in tournament detail view
-- 3. Display movement indicators (▲/▼) on Day 2 showing rank changes vs Day 1
-- 4. Display trophy icons (🏆) for top 3 in Final combined results
-- 5. Aggregate total fish counts, weights, and AOY points across both days

