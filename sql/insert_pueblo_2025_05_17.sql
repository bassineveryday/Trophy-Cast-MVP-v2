-- Trophy Cast MVP v2 — Upload Pueblo Tournament Results (2025-05-17)
-- Safe to run multiple times (idempotent-ish): upserts event, replaces results for this event_id

-- 0) Optional: enable extension for name normalization if you plan to improve matching later
-- CREATE EXTENSION IF NOT EXISTS unaccent;

-- 1) Upsert tournament event row (schedule)
INSERT INTO public.tournament_events_rows (event_id, tournament_code, tournament_name, event_date, lake, participants)
VALUES (
  'PUEBLO-20250517',
  'PUEBLO-20250517',
  'Pueblo 5-17-25',
  DATE '2025-05-17',
  'Pueblo Reservoir',
  30
)
ON CONFLICT (event_id) DO UPDATE SET
  tournament_code = EXCLUDED.tournament_code,
  tournament_name = EXCLUDED.tournament_name,
  event_date = EXCLUDED.event_date,
  lake = EXCLUDED.lake,
  participants = EXCLUDED.participants;

-- 2) Remove any previous results for the same event_id to avoid duplicates
DELETE FROM public.tournament_results_rows WHERE event_id = 'PUEBLO-20250517';

-- 3) Insert results from pasted sheet (place, angler, fish, weight, big_bass, aoy_points)
WITH evt AS (
  SELECT e.event_id, e.tournament_name, e.lake, e.event_date
  FROM public.tournament_events_rows e
  WHERE e.event_id = 'PUEBLO-20250517'
), src(place, member_name, fish_count, weight_lbs, big_fish, aoy_points) AS (
  VALUES
  (1,  'Jeremiah Hofstetter', 5, 10.16, 2.66, 100),
  (2,  'Harry Chang',         5,  8.82, 1.90,  99),
  (3,  'Jason Carpenter',     5,  8.65, 1.94,  98),
  (4,  'Jeff Winnicki',       5,  8.40, 2.50,  97),
  (5,  'Travis Sneith',       5,  8.38, 2.00,  96),
  (6,  'Mike Scott',          5,  8.14, 2.68,  95),
  (7,  'Justin Apfel',        5,  7.84, 1.94,  94),
  (8,  'Richard Crine',       5,  7.70, 1.92,  93),
  (9,  'Mark Warren',         5,  7.62, 1.66,  92),
  (10, 'Thomas DeMillion',    5,  7.60, 1.88,  91),
  (11, 'Howard Binkley',      5,  7.48, 2.18,  90),
  (12, 'Cody Ralph',          5,  6.96, 2.76,  89),
  (13, 'Shawn Daiga',         5,  6.56, 1.46,  88),
  (14, 'Randy Moyer',         5,  6.48, 1.72,  87),
  (15, 'Shontelle Lara',      5,  6.46, 2.06,  86),
  (16, 'Nick Melcher',        5,  6.44, 1.96,  85),
  (17, 'Bill Cancellieri',    5,  6.26, 1.72,  84),
  (18, 'Steve Vaughn',        5,  6.24, 1.72,  83),
  (19, 'Colbey Peterson',     5,  6.24, 1.70,  82),
  (20, 'Gary Schipporeit',    5,  6.20, 1.80,  81),
  (21, 'Skyler Elbaum',       5,  6.16, 1.74,  80),
  (22, 'Gabe Paznokas',       5,  5.94, 1.32,  79),
  (23, 'Jon Pollock',         5,  5.68, 2.06,  78),
  (24, 'Samuel Underwood',    5,  5.46, 1.58,  77),
  (25, 'Zach Jacobs',         5,  4.90, 1.20,  76),
  (26, 'Howard Wong jr',      5,  4.81, 1.50,  75),
  (27, 'Isaac Benavidez',     3,  3.12, 1.74,  74),
  (28, 'Steve Murullo',       2,  2.94, 1.72,  73),
  (29, 'Brandon Genova',      2,  2.59, 1.80,  72),
  (30, 'Jon McDaniel',        1,  0.56, 0.56,  71)
)
INSERT INTO public.tournament_results_rows (
  event_id,
  member_id,
  member_name,
  tournament_name,
  lake,
  event_date,
  place,
  weight_lbs,
  big_fish,
  aoy_points
)
SELECT
  e.event_id,
  m.member_id,
  s.member_name,
  e.tournament_name,
  e.lake,
  e.event_date,
  s.place,
  s.weight_lbs,
  s.big_fish,
  s.aoy_points
FROM src s
CROSS JOIN evt e
LEFT JOIN public.tournament_members_rows m
  ON lower(trim(m.member_name)) = lower(trim(s.member_name));

-- 4) Update participants to reflect number of rows loaded for the event
UPDATE public.tournament_events_rows e
SET participants = (
  SELECT COUNT(*) FROM public.tournament_results_rows r WHERE r.event_id = e.event_id
)
WHERE e.event_id = 'PUEBLO-20250517';

-- Done. Verify with:
-- SELECT * FROM public.tournament_events WHERE event_id = 'PUEBLO-20250517';
-- SELECT place, member_name, weight_lbs, big_fish, aoy_points FROM public.tournament_results WHERE event_id = 'PUEBLO-20250517' ORDER BY place;
