-- Insert Day-2 Norton rows only (do not delete Day-1)
BEGIN;

-- Ensure pgcrypto is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert Day 2 rows from hard-coded values; this will not touch Day-1 rows.
INSERT INTO tournament_results (result_id, tournament_code, event_date, tournament_name, member_name, fish_count, weight_lbs, place)
SELECT gen_random_uuid(), v.tournament_code, v.event_date, v.tournament_name, v.member_name, v.fish_count, v.weight_lbs, v.place
FROM (
  VALUES
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Nick Melcher',5,12.00::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Randy Moyer',5,11.55::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Jeremiah Hofstetter',5,10.62::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Harry Chang',5,10.50::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Andrew Bowman',5,10.78::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Steve Vaughn',5,9.32::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Skyler Elbaum',5,8.14::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Cody Ralph',5,9.82::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Gabe Paznokas',3,5.72::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Patrick Devereaux',5,8.84::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Bobby Martin',2,4.06::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Scott Tracy',2,3.62::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Howard Binkley',5,8.26::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Jonathan Sharpe',5,7.78::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Shawn Diaga',3,2.22::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Howie Wong',3,4.24::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Thomas Demillion',4,4.14::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Jon McDaniels',2,2.40::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','James Barber',2,3.48::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Zach Jacobs',4,5.82::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Travis Barday',0,0.00::numeric,NULL::bigint),
    ('NORTON-20250803','2025-08-03'::date,'Norton 8-3-25','Colbey Peterson',1,0.90::numeric,NULL::bigint)
) AS v(tournament_code, event_date, tournament_name, member_name, fish_count, weight_lbs, place)
-- Only insert if a row for the same tournament/date/member doesn't already exist (protect Day-1)
WHERE NOT EXISTS (
  SELECT 1 FROM tournament_results tr
  WHERE tr.tournament_code = v.tournament_code
    -- cast both sides to text to avoid operator/type mismatch when event_date is stored as text
    AND tr.event_date::text = v.event_date::text
    AND tr.member_name = v.member_name
);

COMMIT;
