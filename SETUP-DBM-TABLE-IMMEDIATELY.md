# ⚡ IMMEDIATE FIX: Table Not Found

## The Problem
```
ERROR: 42P01: relation "public.dbm_board_members" does not exist
```

The database table was **never created**. You need to run the setup SQL.

---

## ✅ SOLUTION (3 steps, 2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Select your **Trophy Cast** project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

---

### Step 2: Copy & Paste This SQL

Open the file: `db/SETUP-DBM-BOARD-NOW.sql`

Copy the **entire contents** and paste into Supabase SQL Editor.

Or manually copy this:

```sql
-- CREATE TABLE
CREATE TABLE IF NOT EXISTS public.dbm_board_members (
  profile_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id text NOT NULL,
  role text NOT NULL CHECK (char_length(role) > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.dbm_board_members ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_dbm_board_members_profile_id ON public.dbm_board_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_dbm_board_members_member_id ON public.dbm_board_members(member_id);

CREATE OR REPLACE FUNCTION public.is_dbm_board_member()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dbm_board_members m
    WHERE m.profile_id = auth.uid()
  );
$$;

DROP POLICY IF EXISTS "dbm_board_members_select" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_insert_deny" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_update_deny" ON public.dbm_board_members;
DROP POLICY IF EXISTS "dbm_board_members_delete_deny" ON public.dbm_board_members;

CREATE POLICY "dbm_board_members_select"
  ON public.dbm_board_members
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "dbm_board_members_insert_deny"
  ON public.dbm_board_members FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "dbm_board_members_update_deny"
  ON public.dbm_board_members FOR UPDATE TO authenticated
  USING (false);

CREATE POLICY "dbm_board_members_delete_deny"
  ON public.dbm_board_members FOR DELETE TO authenticated
  USING (false);

-- INSERT TAI HUNT
INSERT INTO public.dbm_board_members (profile_id, member_id, role, created_at)
VALUES ('8338ec05-7839-45b5-9b3a-115d6d485603'::uuid, 'DBM019', 'DBM Secretary', now())
ON CONFLICT (profile_id) DO NOTHING;

-- VERIFICATION
SELECT * FROM public.dbm_board_members;
```

---

### Step 3: Run & Verify

1. Click **Run** button in Supabase SQL Editor
2. You should see:
   - ✅ Query executed successfully
   - ✅ Result showing Tai Hunt's record:
     ```
     profile_id: 8338ec05-7839-45b5-9b3a-115d6d485603
     member_id: DBM019
     role: DBM Secretary
     ```

---

## 🎯 After Setup: Test in App

1. **Refresh your browser** at http://localhost:8082

2. **Check the console** (F12 → Console tab) for:
   ```
   ✅ Board access check COMPLETE: {isBoard: true, role: 'DBM Secretary', ...}
   ```

3. **On screen**: Look for green checkmark next to "Board Tools (TEST)" card

4. **Try clicking** the Board Tools card to navigate

---

## 📋 Expected Result

After setup, you should see:

1. **Home Dashboard**
   - Board Tools card visible (with TEST label)
   - Green checkmark showing `isBoard: true`

2. **Console Output**
   ```
   🎣 Dev mode enabled - logged in as Tai Hunt (DBM019)
   ✅ Board access check COMPLETE: {isBoard: true, role: 'DBM Secretary', userId: '8338ec05-7839-45b5-9b3a-115d6d485603', ...}
   🎯 Board Tools clicked! Navigating to BoardBackOffice...
   ```

3. **Navigation Works**
   - Clicking Board Tools card navigates to BoardBackOffice screen

---

## ⚠️ If Still Issues

After running the SQL setup, if it STILL says table doesn't exist:

1. **Refresh the page** in Supabase (F5)
2. **Check schema** - go to Tables tab and look for `dbm_board_members`
3. **Run verification** query:
   ```sql
   SELECT * FROM public.dbm_board_members;
   ```

If this returns data → Table exists, issue is in app logic  
If this errors → SQL didn't run properly, try again

---

## ✅ Once This Works

The board feature foundation is complete! Next:
- [ ] Commit: "feat: Create DBM board members table and RLS policies"
- [ ] Clean up debug UI in EnhancedDashboard
- [ ] Build first board feature (Board Notes or Member Management)
