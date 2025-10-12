-- Check Cedar Bluff two-day tournament setup
-- This verifies Cedar Bluff is configured with the same structure as Norton

-- 1. Check tournament events for Cedar Bluff
SELECT 
  event_id,
  tournament_code,
  tournament_name,
  event_date,
  lake,
  location
FROM tournament_events
WHERE tournament_code LIKE 'CEDARBLUFF%'
ORDER BY event_date;

-- Expected output:
-- CEDARBLUFF-20250503 | Cedar 5-3-25 | 2025-05-03 | Cedar Bluff Reservoir
-- CEDARBLUFF-20250504 | Cedar 5-4-25 | 2025-05-04 | Cedar Bluff Reservoir

-- 2. Check results count per day
SELECT 
  tournament_code,
  tournament_name,
  event_date,
  COUNT(*) as result_count,
  COUNT(DISTINCT member_id) as unique_members,
  COUNT(DISTINCT member_name) as unique_names
FROM tournament_results
WHERE tournament_code LIKE 'CEDARBLUFF%'
GROUP BY tournament_code, tournament_name, event_date
ORDER BY event_date;

-- 3. Check member participation across both days
SELECT 
  member_name,
  COUNT(DISTINCT tournament_code) as days_fished,
  STRING_AGG(DISTINCT tournament_code, ', ' ORDER BY tournament_code) as tournament_codes,
  SUM(fish_count) as total_fish,
  SUM(weight_lbs) as total_weight
FROM tournament_results
WHERE tournament_code LIKE 'CEDARBLUFF%'
GROUP BY member_name
ORDER BY total_weight DESC;

-- 4. Compare structure with Norton (for verification)
-- This shows both tournaments side-by-side
SELECT 
  CASE 
    WHEN tournament_code LIKE 'NORTON%' THEN 'Norton'
    WHEN tournament_code LIKE 'CEDARBLUFF%' THEN 'Cedar Bluff'
  END as tournament,
  tournament_code,
  event_date,
  COUNT(*) as participant_count
FROM tournament_results
WHERE tournament_code LIKE 'NORTON%' OR tournament_code LIKE 'CEDARBLUFF%'
GROUP BY tournament, tournament_code, event_date
ORDER BY tournament, event_date;

-- Expected output shows both tournaments with two days each:
-- Cedar Bluff | CEDARBLUFF-20250503 | 2025-05-03 | 21
-- Cedar Bluff | CEDARBLUFF-20250504 | 2025-05-04 | 21 (or similar)
-- Norton      | NORTON-20250802     | 2025-08-02 | 22
-- Norton      | NORTON-20250803     | 2025-08-03 | 22

