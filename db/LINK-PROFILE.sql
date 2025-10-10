-- ============================================
-- LINK TAI HUNT AUTH USER TO REAL MEMBER CODE
-- Trophy Cast MVP v2 - October 10, 2025
-- ============================================
-- REAL EMAIL: bassin@bassineveryday.com
-- MEMBER CODE: DBM019
-- NAME: Tai Hunt
-- ============================================

-- Step 1: Find your auth user ID from email
-- (This query shows your user ID - copy it for Step 2)
SELECT 
  id as user_id,
  email,
  confirmed_at
FROM auth.users 
WHERE email = 'bassin@bassineveryday.com';

-- Step 2: Link your auth user to DBM019
-- IMPORTANT: Replace 'YOUR-USER-ID-HERE' with the ID from Step 1
-- Example: '8b8e7f4a-1234-5678-90ab-cdef12345678'

/*
INSERT INTO profiles (
  id,
  member_code,
  name,
  hometown
)
VALUES (
  'YOUR-USER-ID-HERE',  -- ← PASTE YOUR USER ID HERE from Step 1
  'DBM019',             -- Your real member code
  'Tai Hunt',           -- Your name
  'Denver, CO'          -- Your hometown
)
ON CONFLICT (id) 
DO UPDATE SET
  member_code = EXCLUDED.member_code,
  name = EXCLUDED.name;
*/

-- Step 3: Verify the link was created
-- (Uncomment and run after Step 2)
/*
SELECT 
  p.id,
  p.member_code,
  p.name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'bassin@bassineveryday.com';
*/
