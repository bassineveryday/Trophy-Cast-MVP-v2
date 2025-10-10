-- ============================================
-- PRODUCTION-READY: Link Tai Hunt to DBM019
-- User: bassin@bassineveryday.com
-- User ID: 8338ec05-7839-45b5-9b3a-115d6d485603
-- ============================================
-- This script safely moves DBM019 to the correct profile
-- with proper locking to prevent race conditions
-- ============================================

-- ============================================
-- STEP 1: PRE-FLIGHT CHECKS (Read-Only)
-- ============================================

-- Check 1: Verify auth user exists
SELECT 
  'Auth User Check' as check_type,
  CASE 
    WHEN EXISTS(SELECT 1 FROM auth.users WHERE id = '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid)
    THEN '✅ User exists'
    ELSE '❌ ERROR: User does not exist in auth.users!'
  END as status,
  id,
  email,
  confirmed_at
FROM auth.users 
WHERE id = '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid;

-- Check 2: Show current owner of DBM019 (if any)
SELECT 
  'Current DBM019 Owner' as check_type,
  p.id,
  p.member_code,
  p.name,
  COALESCE(u.email, 'NO AUTH USER') as email,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.member_code = 'DBM019';

-- ============================================
-- STEP 2: ATOMIC MOVE TRANSACTION
-- ============================================
-- This transaction is SAFE and ATOMIC:
-- - Locks rows to prevent race conditions
-- - Clears DBM019 from other profiles
-- - Links DBM019 to correct profile
-- - All or nothing (ROLLBACK on error)
-- ============================================

BEGIN;

-- Lock any profile rows with this member_code (prevents races)
SELECT id 
FROM public.profiles 
WHERE member_code = 'DBM019' 
FOR UPDATE;

-- Clear DBM019 from any other profile
UPDATE public.profiles
SET member_code = NULL
WHERE member_code = 'DBM019' 
  AND id <> '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid
RETURNING id, name, 'Cleared DBM019 from this profile' as action;

-- Upsert the target profile with DBM019
INSERT INTO public.profiles (
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
  hometown = 'Denver, CO'
WHERE
  -- Only update if values actually changed (reduces WAL churn)
  public.profiles.member_code IS DISTINCT FROM 'DBM019'
  OR public.profiles.name IS DISTINCT FROM 'Tai Hunt'
  OR public.profiles.hometown IS DISTINCT FROM 'Denver, CO'
RETURNING id, member_code, name, 'Profile linked to DBM019' as action;

COMMIT;

-- ============================================
-- STEP 3: VERIFICATION (Read-Only)
-- ============================================

-- Verify the link worked - search by email
SELECT 
  '✅ VERIFICATION' as status,
  p.id,
  p.member_code,
  p.name,
  p.hometown,
  u.email,
  p.created_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE LOWER(u.email) = LOWER('bassin@bassineveryday.com');

-- Double-check: Who owns DBM019 now?
SELECT 
  '✅ DBM019 Current Owner' as status,
  p.member_code,
  p.name,
  u.email,
  CASE 
    WHEN u.email = 'bassin@bassineveryday.com' THEN '✅ CORRECT!'
    ELSE '❌ WRONG OWNER!'
  END as validation
FROM public.profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.member_code = 'DBM019';

-- ============================================
-- EXPECTED RESULT:
-- ============================================
-- After running this script, you should see:
-- ✅ member_code: DBM019
-- ✅ email: bassin@bassineveryday.com
-- ✅ name: Tai Hunt
-- ✅ validation: CORRECT!
-- ============================================
