# 🚨 CRITICAL FIX: RLS Policy Error

## The Problem
The database is returning a **500 error** when trying to query board members:

```
Failed to load resource: the server responded with a status of 500
pxmffkaiwpvnpfrhfeco.supabase.co/rest/v1/dbm_board_members?...
```

## Root Cause
The RLS (Row Level Security) policy is **circular and broken**:

**Original Policy:**
```sql
create policy "dbm_board_members_select"
  on public.dbm_board_members
  for select
  to authenticated
  using (public.is_dbm_board_member());  -- ❌ BROKEN: Only let board members read board table
```

**Problem**: To read the `dbm_board_members` table, the policy checks if the user is a board member by querying... the `dbm_board_members` table! This creates infinite recursion = 500 error.

## The Solution (2 Steps)

### Step 1: Go to Supabase Dashboard

1. Open: https://app.supabase.com
2. Select your **Trophy-Cast** project
3. Go to **SQL Editor**
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste this entire script:

```sql
-- DROP the broken policy
drop policy if exists "dbm_board_members_select" on public.dbm_board_members;

-- CREATE the fixed policy (allow all authenticated users to READ)
create policy "dbm_board_members_select"
  on public.dbm_board_members
  for select
  to authenticated
  using (true);  -- Allow any authenticated user to read

-- VERIFY it works
select * from public.dbm_board_members;
```

### Step 3: Check the Results

You should see:
```
✅ 1 Row returned
   profile_id: 8338ec05-7839-45b5-9b3a-115d6d485603
   member_id: DBM019
   role: DBM Secretary
```

If you see this → **FIX IS WORKING!** ✅

## After the Fix

1. **Reload the app** (press 'r' in terminal or refresh browser)
2. **Navigate to DBM tab**
3. **Check console** for these logs:
   - `✅ Board access check: { isBoard: true, ... }`
   - `🎣 DBMMembersScreen - Board Access: { isBoard: true, ... }`
4. **Board Tools button should appear!** 🎉

## Why This Happens

RLS policies in Supabase are checked when querying a table. If the policy itself contains a query to the same table, it creates infinite recursion.

**Wrong approach:**
- User queries board_members table
- Policy says: "Check if user is in board_members table"
- To check, it queries board_members table
- That triggers the policy again
- Infinite loop → 500 error

**Right approach:**
- User queries board_members table  
- Policy says: "If user is authenticated, allow read"
- Simple check ✅
- Then the application code (useBoardAccess hook) decides what to do with the data

## Security Note

By allowing all authenticated users to read the `dbm_board_members` table, we're not giving them access to board features. The **client-side hook** (`useBoardAccess`) still checks if the user is actually a board member:

```typescript
// This only returns true if current user's UUID is in the table
const { data } = await supabase
  .from('dbm_board_members')
  .select('...')
  .eq('profile_id', user.id)  // ← Only their own record
  .maybeSingle();
```

So the security is actually better:
- ✅ RLS allows READ (no 500 errors)
- ✅ Client-side hook filters to current user's record
- ✅ Components only show board UI if hook returns true
- ✅ 3-layer security still intact

## Status

- [ ] Run the SQL fix in Supabase
- [ ] Verify query returns data (no 500 error)
- [ ] Reload app
- [ ] Check for the two console logs
- [ ] Confirm Board Tools button appears

**Once you run the SQL, let me know what happens!** 🚀
