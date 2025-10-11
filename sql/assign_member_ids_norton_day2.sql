-- Assign member_id values to Day 2 Norton rows based on matching names from Day 1
-- This ensures Day 1 and Day 2 rows for the same person have the same member_id

BEGIN;

-- Update Day 2 rows to get member_id from matching Day 1 rows
UPDATE tournament_results AS day2
SET member_id = day1.member_id
FROM tournament_results AS day1
WHERE 
  -- Match Day 2 rows (no member_id) with Day 1 rows (has member_id)
  day2.tournament_code = 'NORTON-20250803'
  AND day2.member_id IS NULL
  AND day1.tournament_code = 'NORTON-20250802'
  AND day1.member_id IS NOT NULL
  -- Match by normalized name (case-insensitive, trimmed)
  AND LOWER(TRIM(day2.member_name)) = LOWER(TRIM(day1.member_name));

-- Verify the update
SELECT 
  tournament_code,
  member_id,
  member_name,
  fish_count,
  weight_lbs
FROM tournament_results
WHERE tournament_code IN ('NORTON-20250802', 'NORTON-20250803')
ORDER BY member_name, tournament_code;

COMMIT;
