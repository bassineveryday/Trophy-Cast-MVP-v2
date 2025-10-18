-- ============================================================
-- VERIFY DBM Board Members Setup
-- Run this in Supabase SQL Editor to check current state
-- ============================================================

-- 1. Check if table exists and has data
SELECT 
  'Table Status' as check_type,
  (SELECT count(*) FROM public.dbm_board_members) as total_records,
  (SELECT count(*) FROM public.dbm_board_members WHERE member_id = 'DBM019') as tai_hunt_records;

-- 2. Show ALL records in the table
SELECT 
  '--- ALL BOARD MEMBERS ---' as info;
SELECT 
  profile_id,
  member_id,
  role,
  created_at,
  updated_at
FROM public.dbm_board_members
ORDER BY created_at DESC;

-- 3. Specifically look for Tai Hunt
SELECT 
  '--- TAI HUNT SPECIFIC ---' as info;
SELECT 
  'Looking for Tai Hunt with UUID: 8338ec05-7839-45b5-9b3a-115d6d485603' as search_info;

SELECT 
  'Exact Match Search' as search_type,
  profile_id,
  member_id,
  role,
  created_at
FROM public.dbm_board_members
WHERE profile_id = '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid;

-- 4. Check if record exists by member_id
SELECT 
  'By Member ID (DBM019)' as search_type,
  profile_id,
  member_id,
  role,
  created_at
FROM public.dbm_board_members
WHERE member_id = 'DBM019';

-- 5. Check RLS policy exists
SELECT 
  '--- RLS POLICY STATUS ---' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'dbm_board_members'
ORDER BY policyname;

-- 6. Test the is_dbm_board_member() function
SELECT 
  '--- FUNCTION TEST ---' as info;
SELECT 
  'is_dbm_board_member() returns:' as test_name,
  public.is_dbm_board_member() as result;

-- 7. Test if SELECT works (with true policy)
SELECT 
  '--- SELECT QUERY TEST ---' as info;
SELECT 
  profile_id,
  member_id, 
  role
FROM public.dbm_board_members
LIMIT 5;
