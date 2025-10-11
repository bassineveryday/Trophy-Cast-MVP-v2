-- Final Day-2 Norton insert using exact schema column names (no snake_case conversion)
BEGIN;

-- Ensure we can generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Backup existing Norton rows for safety
DROP TABLE IF EXISTS backup_tournament_results_norton_20250803;
CREATE TABLE backup_tournament_results_norton_20250803 AS
SELECT * FROM tournament_results WHERE tournament_code = 'NORTON-20250803';

-- Insert Day 2 rows with generated result_id, NULL for event_id and member_id
-- Using the exact column names from your schema
INSERT INTO tournament_results (result_id, event_id, tournament_code, event_date, tournament_name, member_id, member_name, fish_count, weight_lbs, place)
VALUES
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Nick Melcher', 5, 12.00, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Randy Moyer', 5, 11.55, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Jeremiah Hofstetter', 5, 10.62, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Harry Chang', 5, 10.50, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Andrew Bowman', 5, 10.78, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Steve Vaughn', 5, 9.32, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Skyler Elbaum', 5, 8.14, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Cody Ralph', 5, 9.82, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Gabe Paznokas', 3, 5.72, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Patrick Devereaux', 5, 8.84, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Bobby Martin', 2, 4.06, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Scott Tracy', 2, 3.62, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Howard Binkley', 5, 8.26, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Jonathan Sharpe', 5, 7.78, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Shawn Diaga', 3, 2.22, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Howie Wong', 3, 4.24, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Thomas Demillion', 4, 4.14, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Jon McDaniels', 2, 2.40, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'James Barber', 2, 3.48, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Zach Jacobs', 4, 5.82, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Travis Barday', 0, 0.00, NULL),
(uuid_generate_v4(), NULL, 'NORTON-20250803', '2025-08-03', 'Norton 8-3-25', NULL, 'Colbey Peterson', 1, 0.90, NULL);

COMMIT;
