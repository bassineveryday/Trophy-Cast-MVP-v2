-- ============================================
-- CHECK EXISTING DATA FOR TAI HUNT
-- Trophy Cast MVP v2 - October 10, 2025
-- ============================================
-- Run these queries to see what data already exists
-- ============================================

-- 1. Check if you exist in tournament_members
SELECT 
  member_id,
  member_name,
  email_primary,
  boater_status,
  club_name
FROM tournament_members 
WHERE email_primary = 'bassin@bassineveryday.com' 
   OR member_id = 'DBM019'
   OR member_name ILIKE '%tai%hunt%';

-- 2. Check your profile link (for ANY user with bassin@bassineveryday.com)
SELECT 
  p.id,
  p.member_code,
  p.name,
  p.hometown,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'bassin@bassineveryday.com';

-- 3. Check ALL tournament events
SELECT 
  event_id,
  tournament_name,
  event_date,
  lake,
  participants
FROM tournament_events 
ORDER BY event_date DESC 
LIMIT 10;

-- 4. Check if you have tournament results
SELECT 
  member_id,
  tournament_name,
  event_date,
  place,
  weight_lbs,
  big_fish,
  aoy_points,
  payout
FROM tournament_results 
WHERE member_id = 'DBM019'
ORDER BY event_date DESC;

-- 5. Check AOY standings for you
SELECT 
  member_id,
  member_name,
  aoy_rank,
  total_aoy_points,
  season_year,
  boater_status
FROM aoy_standings 
WHERE member_id = 'DBM019';

-- 6. Count all records
SELECT 
  'tournament_members' as table_name, 
  COUNT(*) as record_count 
FROM tournament_members
UNION ALL
SELECT 'tournament_events', COUNT(*) FROM tournament_events
UNION ALL
SELECT 'tournament_results', COUNT(*) FROM tournament_results
UNION ALL
SELECT 'aoy_standings', COUNT(*) FROM aoy_standings
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;
