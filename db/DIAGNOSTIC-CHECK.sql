-- ============================================
-- DIAGNOSTIC: Check Current Profile State
-- ============================================

-- 1. Check your profile
SELECT 
  id,
  member_code,
  name,
  hometown,
  created_at
FROM profiles
WHERE id = '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid;

-- 2. Check if DBM019 has tournament data
SELECT COUNT(*) as result_count
FROM tournament_results
WHERE member_id = 'DBM019';

-- 3. Check if DBM019 has AOY data
SELECT *
FROM aoy_standings
WHERE member_id = 'DBM019';

-- 4. Test the exact query the dashboard uses
SELECT 
  event_date, 
  lake, 
  tournament_name, 
  place, 
  weight_lbs, 
  aoy_points, 
  payout
FROM tournament_results 
WHERE member_id = 'DBM019'
ORDER BY event_date DESC 
LIMIT 1;
