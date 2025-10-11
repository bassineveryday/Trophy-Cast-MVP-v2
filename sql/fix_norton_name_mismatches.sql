-- Fix the 4 people with slightly different names between Day 1 and Day 2
BEGIN;

-- Howard Wong / Howie Wong
UPDATE tournament_results 
SET member_id = 'DBM039'
WHERE tournament_code = 'NORTON-20250803' 
  AND member_name = 'Howie Wong' 
  AND member_id IS NULL;

-- Jon McDaniel / Jon McDaniels (note the 's')
UPDATE tournament_results 
SET member_id = 'DBM013'
WHERE tournament_code = 'NORTON-20250803' 
  AND member_name = 'Jon McDaniels' 
  AND member_id IS NULL;

-- Randal J Moyer / Randy Moyer
UPDATE tournament_results 
SET member_id = 'DBM005'
WHERE tournament_code = 'NORTON-20250803' 
  AND member_name = 'Randy Moyer' 
  AND member_id IS NULL;

-- Shawn Daiga / Shawn Diaga (spelling difference)
UPDATE tournament_results 
SET member_id = 'DBM048'
WHERE tournament_code = 'NORTON-20250803' 
  AND member_name = 'Shawn Diaga' 
  AND member_id IS NULL;

-- Verify all Day 2 rows now have member_ids
SELECT 
  member_id,
  member_name,
  fish_count,
  weight_lbs
FROM tournament_results
WHERE tournament_code = 'NORTON-20250803'
  AND member_id IS NULL;
-- Should return 0 rows

-- Show the corrected pairings
SELECT 
  tournament_code,
  member_id,
  member_name,
  fish_count,
  weight_lbs
FROM tournament_results
WHERE tournament_code IN ('NORTON-20250802', 'NORTON-20250803')
  AND member_id IN ('DBM039', 'DBM013', 'DBM005', 'DBM048')
ORDER BY member_id, tournament_code;

COMMIT;
