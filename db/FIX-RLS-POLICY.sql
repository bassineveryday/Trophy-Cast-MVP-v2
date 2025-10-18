-- ============================================================
-- FIX: DBM Board Members RLS Policy
-- ============================================================
-- The original policy was circular - it checked if user is a board member
-- to allow reading the board members table. This caused 500 errors.
-- 
-- Solution: Allow all authenticated users to READ the table
-- (they just can't modify it)
--
-- Run this in Supabase SQL Editor to fix the issue
-- ============================================================

-- Drop the problematic select policy
drop policy if exists "dbm_board_members_select" on public.dbm_board_members;

-- Create a new policy that allows all authenticated users to READ
create policy "dbm_board_members_select"
  on public.dbm_board_members
  for select
  to authenticated
  using (true);  -- Allow all authenticated users to read

-- Verify the policy works
select * from public.dbm_board_members;

-- If that works, you should see:
-- | profile_id | member_id | role | created_at |
-- | 8338ec05-7839-45b5-9b3a-115d6d485603 | DBM019 | DBM Secretary | [timestamp] |
