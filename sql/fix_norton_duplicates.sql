-- Remove duplicate Norton Day-2 entries
-- Keep only one row per member_name for NORTON-20250803

BEGIN;

-- First, let's see what we have (for reference)
-- SELECT member_name, COUNT(*) as cnt
-- FROM tournament_results
-- WHERE tournament_code = 'NORTON-20250803'
-- GROUP BY member_name
-- HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only the row with the lowest result_id (first inserted)
DELETE FROM tournament_results
WHERE result_id IN (
  SELECT result_id
  FROM (
    SELECT 
      result_id,
      ROW_NUMBER() OVER (
        PARTITION BY tournament_code, member_name 
        ORDER BY result_id
      ) as rn
    FROM tournament_results
    WHERE tournament_code = 'NORTON-20250803'
  ) sub
  WHERE rn > 1
);

-- Verify the fix
SELECT 
  member_name, 
  COUNT(*) as count,
  SUM(weight_lbs) as total_weight,
  SUM(fish_count) as total_fish
FROM tournament_results
WHERE tournament_code = 'NORTON-20250803'
GROUP BY member_name
ORDER BY member_name;

COMMIT;
