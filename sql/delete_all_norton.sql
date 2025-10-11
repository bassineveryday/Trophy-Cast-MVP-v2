-- Backup and delete all Norton rows
BEGIN;

-- Create a full backup table for Norton rows (timestamped)
CREATE TABLE IF NOT EXISTS backup_tournament_results_norton_full AS
SELECT now() AS backup_at, * FROM tournament_results WHERE tournament_code = 'NORTON-20250803';

-- Delete all Norton rows so we can re-insert clean data
DELETE FROM tournament_results WHERE tournament_code = 'NORTON-20250803';

COMMIT;
