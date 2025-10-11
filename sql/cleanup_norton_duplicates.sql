-- Cleanup script for Norton duplicates and null member_id mapping
-- 1) Backup current Norton rows
-- 2) Try to map member_id by exact member_name match from `members` table
-- 3) Deduplicate rows keeping a single canonical row per angler/day

BEGIN;

-- Backup
CREATE TABLE IF NOT EXISTS backup_tournament_results_norton_post_insert AS
SELECT * FROM tournament_results WHERE tournament_code = 'NORTON-20250803';

-- Attempt to map member_id for rows where member_id is null by matching member_name (exact match)
-- WARNING: this uses exact string matching. Review before applying to production.
UPDATE tournament_results tr
SET member_id = m.member_id
FROM members m
WHERE tr.tournament_code = 'NORTON-20250803'
  AND (tr.member_id IS NULL OR tr.member_id = '')
  AND lower(trim(tr.member_name)) = lower(trim(m.member_name))
  AND m.member_id IS NOT NULL;

-- Create a staging table enumerating duplicates
CREATE TEMP TABLE tmp_norton_ranked AS
SELECT
  tr.*,
  ROW_NUMBER() OVER (
    PARTITION BY COALESCE(tr.member_id, tr.member_name), tr.event_date
    ORDER BY (CASE WHEN tr.member_id IS NOT NULL THEN 0 ELSE 1 END), -- prefer rows with member_id
             COALESCE(tr.weight_lbs, 0) DESC, -- prefer larger weight
             COALESCE(tr.place, 999) ASC -- prefer lower place
  ) AS rn
FROM tournament_results tr
WHERE tr.tournament_code = 'NORTON-20250803';

-- Delete duplicate rows (keep rn = 1)
DELETE FROM tournament_results tr
USING tmp_norton_ranked tmp
WHERE tr.result_id = tmp.result_id
  AND tmp.rn > 1;

-- Optional: after deletion, ensure there are no rows with member_id still null where a mapping exists in members
-- (list remaining unmapped rows for review)
SELECT * FROM tournament_results WHERE tournament_code = 'NORTON-20250803' AND (member_id IS NULL OR member_id = '');

COMMIT;

-- After running, verify:
-- SELECT count(*) FROM tournament_results WHERE tournament_code = 'NORTON-20250803';
-- SELECT result_id, member_id, member_name, weight_lbs, fish_count, place FROM tournament_results WHERE tournament_code = 'NORTON-20250803' ORDER BY member_name;
-- SELECT * FROM backup_tournament_results_norton_post_insert LIMIT 10;
