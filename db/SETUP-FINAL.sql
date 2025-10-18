-- ============================================================
-- DBM BOARD MEMBERS SETUP - Copy & Run This in Supabase
-- ============================================================

-- Create table
CREATE TABLE IF NOT EXISTS public.dbm_board_members (
  profile_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id text NOT NULL,
  role text NOT NULL CHECK (char_length(role) > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dbm_board_members ENABLE ROW LEVEL SECURITY;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_dbm_board_members_profile_id ON public.dbm_board_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_dbm_board_members_member_id ON public.dbm_board_members(member_id);

-- Create function
CREATE OR REPLACE FUNCTION public.is_dbm_board_member()
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.dbm_board_members WHERE profile_id = auth.uid());
$$;

-- Drop old policies
DROP POLICY IF EXISTS "dbm_board_members_select" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_insert_deny" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_update_deny" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_delete_deny" ON public.dbm_board_members;

-- Create policies
CREATE POLICY "dbm_board_members_select" ON public.dbm_board_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "dbm_board_members_insert_deny" ON public.dbm_board_members FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "dbm_board_members_update_deny" ON public.dbm_board_members FOR UPDATE TO authenticated USING (false);
CREATE POLICY "dbm_board_members_delete_deny" ON public.dbm_board_members FOR DELETE TO authenticated USING (false);

-- Insert Tai Hunt
INSERT INTO public.dbm_board_members (profile_id, member_id, role) VALUES 
  ('8338ec05-7839-45b5-9b3a-115d6d485603'::uuid, 'DBM019', 'DBM Secretary')
ON CONFLICT (profile_id) DO NOTHING;

-- Verify
SELECT * FROM public.dbm_board_members;
