-- ============================================
-- VERIFY EXISTING DATA & ADD TEST DATA
-- Trophy Cast MVP v2 - October 2025
-- ============================================

-- Step 1: Check if Tai Hunt (DBM019) exists in tournament_members
SELECT 'Checking tournament_members for DBM019...' as status;
SELECT * FROM tournament_members WHERE member_id = 'DBM019';

-- If not found, insert Tai Hunt:
INSERT INTO tournament_members (member_id, member_name, boater_status, club_id, club_name)
VALUES ('DBM019', 'Tai Hunt', 'B', 'DBM', 'Denver Bassmasters')
ON CONFLICT (member_id) DO NOTHING;

-- Step 2: Check for existing tournament events
SELECT 'Checking tournament_events...' as status;
SELECT event_id, tournament_name, event_date, lake FROM tournament_events 
WHERE event_date >= '2024-01-01' 
ORDER BY event_date DESC 
LIMIT 5;

-- If no recent events exist, add some test events:
INSERT INTO tournament_events (event_id, tournament_code, tournament_name, event_date, lake, participants)
VALUES 
  ('T2025-10', 'SC2025', 'Fall Championship', '2025-10-15', 'Cherry Creek Reservoir', 12),
  ('T2025-06', 'SS2025', 'Summer Showdown', '2025-06-20', 'Chatfield Reservoir', 15),
  ('T2025-04', 'SC2025', 'Spring Classic', '2025-04-15', 'Cherry Creek Reservoir', 14),
  ('T2024-12', 'WW2024', 'Winter Warm-Up', '2024-12-05', 'Cherry Creek Reservoir', 10)
ON CONFLICT (event_id) DO NOTHING;

-- Step 3: Check for tournament results for DBM019
SELECT 'Checking tournament_results for DBM019...' as status;
SELECT * FROM tournament_results 
WHERE member_id = 'DBM019' 
ORDER BY event_date DESC;

-- If no results exist, add test data:
INSERT INTO tournament_results (
  result_id, 
  event_id, 
  member_id, 
  tournament_name, 
  lake, 
  event_date, 
  place, 
  weight_lbs, 
  big_fish, 
  aoy_points, 
  payout
)
VALUES 
  (
    'R2025-10-DBM019',
    'T2025-10',
    'DBM019',
    'Fall Championship',
    'Cherry Creek Reservoir',
    '2025-10-15',
    2,
    18.50,
    5.25,
    99,
    350.00
  ),
  (
    'R2025-06-DBM019',
    'T2025-06',
    'DBM019',
    'Summer Showdown',
    'Chatfield Reservoir',
    '2025-06-20',
    1,
    22.75,
    6.50,
    100,
    500.00
  ),
  (
    'R2025-04-DBM019',
    'T2025-04',
    'DBM019',
    'Spring Classic',
    'Cherry Creek Reservoir',
    '2025-04-15',
    3,
    15.25,
    4.00,
    98,
    150.00
  )
ON CONFLICT (result_id) DO NOTHING;

-- Step 4: Check AOY standings
SELECT 'Checking aoy_standings for DBM019...' as status;
SELECT * FROM aoy_standings WHERE member_id = 'DBM019';

-- If no AOY standing exists, add one:
INSERT INTO aoy_standings (
  member_id, 
  season_year, 
  aoy_rank, 
  member_name, 
  boater_status, 
  total_aoy_points,
  tournaments_fished
)
VALUES (
  'DBM019',
  2025,
  1,
  'Tai Hunt',
  'B',
  297,
  3
)
ON CONFLICT (member_id) 
DO UPDATE SET
  aoy_rank = EXCLUDED.aoy_rank,
  total_aoy_points = EXCLUDED.total_aoy_points,
  tournaments_fished = EXCLUDED.tournaments_fished;

-- Step 5: Check profiles table
SELECT 'Checking profiles for member_code DBM019...' as status;
SELECT * FROM profiles WHERE member_code = 'DBM019';

-- Note: Profiles are created when users register, so we can't pre-create them
-- The user will need to register with email/password and link to DBM019

-- Step 6: Verify all data is ready
SELECT '=== VERIFICATION SUMMARY ===' as status;

SELECT 'Members:' as category, COUNT(*) as count FROM tournament_members WHERE member_id = 'DBM019'
UNION ALL
SELECT 'Events:', COUNT(*) FROM tournament_events WHERE event_date >= '2024-01-01'
UNION ALL
SELECT 'Results (DBM019):', COUNT(*) FROM tournament_results WHERE member_id = 'DBM019'
UNION ALL
SELECT 'AOY Standings (DBM019):', COUNT(*) FROM aoy_standings WHERE member_id = 'DBM019'
UNION ALL
SELECT 'Profiles (DBM019):', COUNT(*) FROM profiles WHERE member_code = 'DBM019';

-- Step 7: Test the exact queries the app will run
SELECT '=== TESTING APP QUERIES ===' as status;

-- Dashboard query: Last tournament for DBM019
SELECT 'Last Tournament:' as query_type;
SELECT event_date, lake, tournament_name, place, weight_lbs, aoy_points, payout
FROM tournament_results
WHERE member_id = 'DBM019'
ORDER BY event_date DESC
LIMIT 1;

-- Dashboard query: AOY standing
SELECT 'AOY Standing:' as query_type;
SELECT aoy_rank, total_aoy_points
FROM aoy_standings
WHERE member_id = 'DBM019';

-- Dashboard query: Season earnings (2025)
SELECT 'Season Earnings:' as query_type;
SELECT SUM(payout) as total_earnings
FROM tournament_results
WHERE member_id = 'DBM019'
AND event_date >= '2025-01-01';

-- Dashboard query: Next tournament (after today)
SELECT 'Next Tournament:' as query_type;
SELECT lake, event_date, tournament_name
FROM tournament_events
WHERE event_date >= CURRENT_DATE
ORDER BY event_date ASC
LIMIT 1;

-- Tournaments screen: All events
SELECT 'All Tournaments:' as query_type;
SELECT COUNT(*) as event_count FROM tournament_events;

-- AOY screen: All standings
SELECT 'AOY Standings:' as query_type;
SELECT COUNT(*) as angler_count FROM aoy_standings;

-- ============================================
-- Expected Results:
-- ============================================
-- Members: 1 (DBM019 exists)
-- Events: 4+ (test tournaments)
-- Results (DBM019): 3 (Fall, Summer, Spring 2025)
-- AOY Standings (DBM019): 1 (Rank 1, 297 points)
-- Profiles (DBM019): 0 or 1 (depending on user registration)
--
-- Last Tournament: Fall Championship, Place 2, $350
-- AOY Standing: Rank 1, 297 points
-- Season Earnings: $1000 (350 + 500 + 150)
-- Next Tournament: (depends on current date)
-- ============================================

SELECT '✅ Verification complete! Run app and test dashboard.' as final_status;
