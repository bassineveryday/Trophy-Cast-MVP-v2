-- ============================================
-- LINK TAI HUNT (bassin@bassineveryday.com) TO DBM019
-- User ID: 8338ec05-7839-45b5-9b3a-115d6d485603
-- ============================================

-- Step 1: Check if DBM019 is already used by another profile
SELECT 
  p.id,
  p.member_code,
  p.name,
  u.email as current_email,
  p.created_at
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.member_code = 'DBM019';

-- Step 2: Clear DBM019 from any other profile, then link to your account
-- This transaction ensures DBM019 is moved to your correct user ID
BEGIN;

-- Remove DBM019 from any other profile (if it exists)
UPDATE profiles
SET member_code = NULL
WHERE member_code = 'DBM019' 
  AND id <> '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid;

-- Now safely insert/update your profile with DBM019
INSERT INTO profiles (
  id,
  member_code,
  name,
  hometown
)
VALUES (
  '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid,
  'DBM019',
  'Tai Hunt',
  'Denver, CO'
)
ON CONFLICT (id) 
DO UPDATE SET
  member_code = 'DBM019',
  name = 'Tai Hunt',
  hometown = 'Denver, CO';

COMMIT;

-- Step 3: Verify the link worked
SELECT 
  p.id,
  p.member_code,
  p.name,
  p.hometown,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'bassin@bassineveryday.com';
