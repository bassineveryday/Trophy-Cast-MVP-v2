-- ============================================
-- CHECK WHO HAS DBM019 MEMBER CODE
-- ============================================

-- Step 1: Find which user currently has DBM019
SELECT 
  p.id,
  p.member_code,
  p.name,
  p.hometown,
  p.created_at,
  u.email,
  u.confirmed_at
FROM profiles p
LEFT JOIN auth.users u ON u.id = p.id
WHERE p.member_code = 'DBM019';

-- Step 2: Check your current profile (if exists)
SELECT 
  p.id,
  p.member_code,
  p.name,
  u.email
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.id = '8338ec05-7839-45b5-9b3a-115d6d485603';
