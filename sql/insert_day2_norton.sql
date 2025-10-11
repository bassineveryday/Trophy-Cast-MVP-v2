-- Backup existing Norton rows
BEGIN;
CREATE TABLE IF NOT EXISTS backup_tournament_results_norton AS
SELECT * FROM tournament_results WHERE tournament_code = 'NORTON-20250803';

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert Day 2 rows (Norton 8-3-25)
-- We'll insert by selecting from a VALUES list and left-joining members to populate member_id when possible.
-- Delete any existing rows that look like the old "final" for this date (so Day 2 replaces them)
-- We rely on tournament_code + event_date to identify the rows to remove for this final-day replacement.
DELETE FROM tournament_results
WHERE tournament_code = 'NORTON-20250803'
	AND event_date = '2025-08-03';

-- Note: backup was created earlier as backup_tournament_results_norton; if you want finer control
-- consider restoring from that backup instead of blanket delete.
INSERT INTO tournament_results (result_id, tournament_code, event_date, tournament_name, member_name, fish_count, weight_lbs, place)
SELECT
	gen_random_uuid() AS result_id,
	v.tournament_code,
	v.event_date,
	v.tournament_name,
	v.member_name,
	v.fish_count,
	v.weight_lbs,
	v.place
FROM (
	VALUES
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Nick Melcher',5,12.00,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Randy Moyer',5,11.55,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Jeremiah Hofstetter',5,10.62,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Harry Chang',5,10.50,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Andrew Bowman',5,10.78,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Steve Vaughn',5,9.32,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Skyler Elbaum',5,8.14,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Cody Ralph',5,9.82,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Gabe Paznokas',3,5.72,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Patrick Devereaux',5,8.84,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Bobby Martin',2,4.06,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Scott Tracy',2,3.62,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Howard Binkley',5,8.26,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Jonathan Sharpe',5,7.78,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Shawn Diaga',3,2.22,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Howie Wong',3,4.24,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Thomas Demillion',4,4.14,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Jon McDaniels',2,2.40,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','James Barber',2,3.48,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Zach Jacobs',4,5.82,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Travis Barday',0,0.00,NULL),
		('NORTON-20250803','2025-08-03','Norton 8-3-25','Colbey Peterson',1,0.90,NULL)
	) AS v(tournament_code, event_date, tournament_name, member_name, fish_count, weight_lbs, place)
-- Avoid inserting rows that already exist for the same tournament_code + event_date + member_name
WHERE NOT EXISTS (
	SELECT 1 FROM tournament_results tr
	WHERE tr.tournament_code = v.tournament_code
		AND tr.event_date = v.event_date
		AND tr.member_name = v.member_name
);

COMMIT;
