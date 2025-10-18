-- ============================================================
-- COMPLETE DBM BOARD MEMBERS SETUP
-- Run this ENTIRE script in Supabase SQL Editor at once
-- ============================================================

-- Step 1: CREATE TABLE
CREATE TABLE IF NOT EXISTS public.dbm_board_members (
  profile_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id text NOT NULL,
  role text NOT NULL CHECK (char_length(role) > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: ENABLE ROW LEVEL SECURITY
ALTER TABLE public.dbm_board_members ENABLE ROW LEVEL SECURITY;

-- Step 3: CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_dbm_board_members_profile_id ON public.dbm_board_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_dbm_board_members_member_id ON public.dbm_board_members(member_id);

-- Step 4: CREATE HELPER FUNCTION
CREATE OR REPLACE FUNCTION public.is_dbm_board_member()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.dbm_board_members m
    WHERE m.profile_id = auth.uid()
  );
$$;

-- Step 5: DROP OLD POLICIES (if they exist)
DROP POLICY IF EXISTS "dbm_board_members_select" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_insert_deny" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_update_deny" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_delete_deny" ON public.dbm_board_members;

-- Step 6: CREATE RLS POLICIES
-- Allow ALL authenticated users to READ (client-side hook filters)
CREATE POLICY "dbm_board_members_select"
  ON public.dbm_board_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Deny all writes (insert, update, delete)
CREATE POLICY "dbm_board_members_insert_deny"
  ON public.dbm_board_members
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "dbm_board_members_update_deny"
  ON public.dbm_board_members
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "dbm_board_members_delete_deny"
  ON public.dbm_board_members
  FOR DELETE
  TO authenticated
  USING (false);

-- Step 7: ADD BOARD MEMBERS
-- Tai Hunt - DBM Secretary (CONFIRMED USER)
INSERT INTO public.dbm_board_members (profile_id, member_id, role, created_at)
VALUES ('8338ec05-7839-45b5-9b3a-115d6d485603'::uuid, 'DBM019', 'DBM Secretary', now())
ON CONFLICT (profile_id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES - Run these to confirm setup worked
-- ============================================================

-- Should show 1 row (Tai Hunt)
SELECT '✅ Table created and populated' as status;
SELECT * FROM public.dbm_board_members;

-- Should show Tai Hunt's record
SELECT '✅ Tai Hunt record:' as check_name;
SELECT profile_id, member_id, role FROM public.dbm_board_members WHERE member_id = 'DBM019';

-- Should show RLS policies exist
SELECT '✅ RLS Policies:' as check_name;
SELECT policyname, qual FROM pg_policies WHERE tablename = 'dbm_board_members' ORDER BY policyname;
