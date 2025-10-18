# Board Access Diagnostic Guide

## Problem
The "Board Tools" button isn't appearing on the DBM Members tab or home dashboard, even though Tai Hunt (DBM019) is registered in the database.

## Root Cause Analysis
The issue is likely one of these:

1. **UUID Mismatch**: The current logged-in user's UUID doesn't match what's in the `dbm_board_members` table
2. **RLS Policy Issue**: Database row-level security policies aren't allowing the query to work
3. **Authentication Issue**: User is authenticated but the UUID isn't properly stored in the profile

## How to Diagnose

### Step 1: Open the Diagnostic Screen
```
In the app, navigate to: Settings/Profile → scroll to "Board Access Diagnostic"
Or press 'j' in the web debugger to open the Inspector and navigate to BoardAccessDiagnostic
```

### Step 2: Check the Current User UUID
When the diagnostic screen loads, you'll see:

```
👤 Current User
  UUID (profile_id): <YOUR-UUID>
  Email: <YOUR-EMAIL>
```

**Copy this UUID.** This is critical.

### Step 3: Check the Hook Results
```
🎣 useBoardAccess Hook
  isBoard: [✓ TRUE or ✗ FALSE]
  role: [Your role or null]
  Error: [Any error message]
```

- If `isBoard = TRUE` → Board access is working! Button should appear.
- If `isBoard = FALSE` → Continue to next step.

### Step 4: Check Your Board Member Data
```
📊 Board Member Data (This User)
```

- If it shows your member info → Data is in DB but query failed (RLS issue)
- If it says "⚠ No board member record found" → Your UUID isn't in the database

### Step 5: Check All Board Members in Database
```
📋 All Board Members in DB
  Found 1 board member(s):
  - DBM019 (DBM Secretary)
    UUID: 8338ec05-7839-45b5-9b3a-115d6d485603
```

**Compare:**
- **If your UUID matches 8338ec05-7839-45b5-9b3a-115d6d485603** → You ARE Tai Hunt, should work
- **If your UUID is different** → You're NOT Tai Hunt's profile

## Solutions by Diagnosis

### Solution A: UUID Mismatch (Most Common)
**Symptom**: Your UUID is different from the one in the database

**Fix**:
1. Copy your current UUID from the diagnostic screen
2. Go to Supabase Dashboard → SQL Editor
3. Run this query:
```sql
-- Delete the old entry (if needed)
DELETE FROM public.dbm_board_members 
WHERE profile_id = '8338ec05-7839-45b5-9b3a-115d6d485603';

-- Insert with YOUR UUID
INSERT INTO public.dbm_board_members (profile_id, member_id, role)
VALUES ('<YOUR-UUID-HERE>', 'DBM019', 'DBM Secretary')
ON CONFLICT (profile_id) DO NOTHING;

-- Verify it worked
SELECT * FROM public.dbm_board_members WHERE member_id = 'DBM019';
```

4. Reload the app
5. Check the diagnostic screen again

### Solution B: RLS Policy Issue
**Symptom**: Diagnostic shows data in DB but `isBoard = FALSE` and error message

**Fix**:
1. Go to Supabase Dashboard → Authentication → Users
2. Verify your user is there and authenticated
3. Go to SQL Editor and run:
```sql
-- Check if RLS is blocking reads
SELECT * FROM public.dbm_board_members;
```

If you see no results or an error, RLS policies are blocking read access.

**Quick Fix - Enable Read Access Policy**:
```sql
-- Enable the select policy for board members
CREATE POLICY "dbm_board_members_select"
ON public.dbm_board_members
FOR SELECT
TO authenticated
USING (true);  -- Allow all authenticated users to read

-- Verify
SELECT * FROM public.dbm_board_members;
```

### Solution C: Multiple Profiles (Advanced)
**Symptom**: You created multiple test accounts and get confused about which UUID is which

**Fix**:
1. Go to Supabase Dashboard → Authentication → Users
2. Note your account's email
3. In diagnostic screen, verify the email matches
4. If email is correct but UUID is different, it's a test account issue

**Reset**:
```sql
-- List all board members
SELECT member_id, profile_id, role FROM public.dbm_board_members;

-- If you see multiple entries, pick the right one or delete test ones
DELETE FROM public.dbm_board_members 
WHERE member_id IN ('DBM999', 'DBM998'); -- test entries

-- Keep only real board member
SELECT * FROM public.dbm_board_members WHERE member_id = 'DBM019';
```

## Testing After Fix

### Test 1: Diagnostic Screen Shows Correct Data
```
✓ isBoard = TRUE
✓ role = "DBM Secretary"
✓ UUID matches database entry
```

### Test 2: Board Tools Button Appears
1. Log out and log back in
2. Navigate to DBM Members tab
3. **Should see** "Board Tools" button in header with member count
4. Tap it → Should navigate to Board Back Office

### Test 3: Home Dashboard Shows Board Card
1. Go to Home tab
2. **Should see** blue "Board Tools" card below "Last Catch" section
3. Tap it → Should navigate to Board Back Office

### Test 4: Non-Board Members Don't See Anything
1. Log in with a different account (not DBM019)
2. Navigate to DBM Members tab
3. **Should NOT see** "Board Tools" button
4. Go to Home tab
5. **Should NOT see** "Board Tools" card

## Console Logs for Debugging

The app logs to the browser console. Look for:

```
✅ Board access check: { isBoard: true, role: "DBM Secretary", userId: "YOUR-UUID", data: {...} }
```

- If you see this log → hook is working
- If log shows `isBoard: false` → query returned no data
- If no log appears → hook isn't being called

## Manual SQL Query Test

In Supabase SQL Editor, run:

```sql
-- Test 1: See if data exists
SELECT * FROM public.dbm_board_members WHERE member_id = 'DBM019';

-- Test 2: Check RLS can read it
SELECT public.is_dbm_board_member() as is_board;

-- Test 3: Check current user
SELECT auth.uid() as current_user_id;

-- Test 4: Full query simulation
SELECT profile_id, member_id, role 
FROM public.dbm_board_members 
WHERE profile_id = auth.uid();
```

Expected results:
```
Test 1: 1 row returned (Tai Hunt's profile)
Test 2: true (if you're logged in as Tai Hunt)
Test 3: Your UUID
Test 4: 1 row (if your UUID matches Tai Hunt's)
```

## Quick Checklist

- [ ] Opened diagnostic screen
- [ ] Copied current UUID
- [ ] Compared UUID with database (8338ec05-7839-45b5-9b3a-115d6d485603)
- [ ] If different, updated database with correct UUID
- [ ] Reloaded app
- [ ] Verified `isBoard = TRUE` in diagnostic
- [ ] Saw Board Tools button on DBM tab
- [ ] Saw Board Card on home tab
- [ ] Clicked button/card → navigated to Board Back Office

## Still Stuck?

Check these in order:

1. **Supabase status**: Is Supabase up? (check supabase.com status)
2. **Network**: Are you connected to internet? Try refresh
3. **Cache**: Clear browser cache or app cache
4. **Re-authenticate**: Log out completely, log back in
5. **Different device**: Test on another device/browser to confirm

## Board Access Architecture

```
App (EnhancedDashboard / DBMMembersScreen)
    ↓
useBoardAccess Hook
    ↓
Supabase Query: SELECT * FROM dbm_board_members WHERE profile_id = auth.uid()
    ↓
RLS Policies (Must allow authenticated user to read)
    ↓
Database Table (public.dbm_board_members)
```

For the button to appear:
1. ✅ Authenticated (logged in)
2. ✅ Query returns data (UUID in table)
3. ✅ RLS allows read (select policy enabled)
4. ✅ Hook sets isBoard = true
5. ✅ Component renders button

If any step fails → Button won't show

## File Locations

- **Diagnostic Component**: `components/BoardAccessDiagnostic.tsx`
- **useBoardAccess Hook**: `hooks/useBoardAccess.ts`
- **Database Schema**: `db/DBM-BOARD-SETUP-COMPLETE.sql`
- **DBM Screen**: `screens/DBMMembersScreen.tsx`
- **Dashboard**: `features/home/EnhancedDashboard.tsx`

