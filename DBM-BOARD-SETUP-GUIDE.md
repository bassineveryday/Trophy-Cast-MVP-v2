# DBM Board Setup - Complete Implementation Guide

## 🎯 Overview

We've set up a **DBM-prefixed** board management system that:

✅ Uses `dbm_board_members` table (Denver Bassmasters specific)
✅ Queries via `is_dbm_board_member()` function
✅ Protected by RLS policies at database level
✅ Ready for multi-club expansion
✅ Works with your Trophy Cast app

---

## 📋 What's Ready

### Code ✅
- `hooks/useBoardAccess.ts` - Already queries `dbm_board_members`
- `components/BoardGuard.tsx` - Uses the hook
- `screens/BoardBackOfficeScreen.tsx` - Protected dashboard
- `App.tsx` - Navigation integrated

### Database Schema ✅
- `SUPABASE-DBM-BOARD-SETUP.md` - Complete SQL for setup

---

## 🚀 Quick Start (15 minutes)

### Step 1: Open Supabase (2 min)
1. Go to your Supabase project
2. Click **SQL Editor**
3. Click **New Query**

### Step 2: Copy & Paste the Complete Schema (5 min)
1. Open: `SUPABASE-DBM-BOARD-SETUP.md`
2. Scroll to: "Complete Schema Script (All at Once)"
3. Copy the entire SQL block
4. Paste into Supabase SQL Editor
5. Click **Run**

✅ This creates:
- `dbm_board_members` table
- `is_dbm_board_member()` function
- RLS policies

### Step 3: Add Test Board Member (5 min)
1. In Supabase, go to **Authentication** → **Users**
2. Find a test user and copy their **UUID**
3. Go back to SQL Editor
4. Run this query (replace UUID):

```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<YOUR_UUID_HERE>', 'DBM020', 'DBM President');
```

5. Click **Run**

### Step 4: Verify It Worked (3 min)
Run this query:

```sql
select * from public.dbm_board_members;
```

✅ Should see your test board member

---

## 🧪 Test in Trophy Cast App

### Test 1: Board Member Access ✅

**Setup**: Logged in as the user you added to `dbm_board_members`

**Steps**:
1. Go to **DBM tab**
2. Should see **gold "Board Tools" button**
3. Click it
4. Should see **Board Back Office Dashboard**

✅ **Expected**: See 8 menu items (Board Notes, Members, Tournaments, etc.)

### Test 2: Non-Board Member Access ✅

**Setup**: Logged in as a different user (not in `dbm_board_members`)

**Steps**:
1. Go to **DBM tab**
2. Should **NOT** see "Board Tools" button
3. Try to navigate directly to board office (if possible)

✅ **Expected**: See "Not Authorized" message

---

## 📊 Database Schema Explained

### `dbm_board_members` Table

```
profile_id (UUID)  → Links to auth.users.id
member_id (TEXT)   → DBM member ID (e.g., "DBM020")
role (TEXT)        → Board role (e.g., "DBM President")
created_at         → Timestamp when added
updated_at         → Timestamp when modified
```

### `is_dbm_board_member()` Function

**What it does**: Returns TRUE/FALSE

**Used by**:
- RLS policies (database security)
- Client-side access checks (UX)

**Example usage**:
```sql
select is_dbm_board_member();
-- Returns: true (if user is board member) or false
```

### RLS Policies

**Policy 1**: `dbm_board_members_select`
- Board members can READ the table
- Non-board get zero rows (not error)

**Policies 2-4**: `*_deny` policies
- Only service role can INSERT/UPDATE/DELETE
- App users cannot modify board membership

---

## 🔐 How It Works

### Access Flow

```
User tries to access Board Back Office
        ↓
useBoardAccess hook checks:
  1. Get auth.users.id
  2. Query dbm_board_members table
  3. RLS policy enforced:
     - If user in table → see data, isBoard = true
     - If user NOT in table → see nothing, isBoard = false
        ↓
BoardGuard component checks isBoard:
  - If true → Render dashboard ✅
  - If false → Render "Not Authorized" ❌
```

### Security Layers

```
Layer 1: Client-Side Check (UX)
  └─ useBoardAccess hook
     └─ BoardGuard component

Layer 2: Auth Layer (Identity)
  └─ Supabase JWT token
     └─ auth.users verification

Layer 3: Database RLS (Authorization) ← TRUSTED
  └─ PostgreSQL enforces at query level
     └─ No bypass possible
```

---

## 👥 Managing Board Members

### Add a Board Member

```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<USER_UUID>', 'DBM020', 'DBM President');
```

### Remove a Board Member

```sql
delete from public.dbm_board_members 
where profile_id = '<USER_UUID>';
```

### Update a Board Member's Role

```sql
update public.dbm_board_members 
set role = 'DBM Vice President'
where profile_id = '<USER_UUID>';
```

### Find a User by Email

```sql
select id, email from auth.users 
where email = 'president@denver-bassmasters.com';
```

### List All Board Members

```sql
select 
  m.profile_id,
  m.member_id,
  m.role,
  u.email,
  m.created_at
from public.dbm_board_members m
left join auth.users u on m.profile_id = u.id
order by m.role;
```

---

## 🐛 Troubleshooting

### "Board Tools button doesn't show"

**Check these**:
1. ✅ App is running
2. ✅ Logged in as a user
3. ✅ User's UUID is in `dbm_board_members` table

**Test**:
```sql
-- Find your user's UUID
select id from auth.users where email = 'your@email.com';

-- Check if they're in board members
select * from public.dbm_board_members 
where profile_id = 'PASTE_UUID_HERE';
```

### "Getting 'Not Authorized'"

**Means**: User is not in `dbm_board_members` table

**Fix**: Add them using the SQL above

### "RLS policy not working"

**Check**:
1. ✅ Table has RLS enabled: `alter table dbm_board_members enable row level security;`
2. ✅ Policies are created: Run the policy creation SQL from Step 3

**Test**:
```sql
-- This should show all policies
select * from pg_policies 
where tablename = 'dbm_board_members';
```

### "Table doesn't exist"

**Fix**: Run the complete schema from `SUPABASE-DBM-BOARD-SETUP.md`

---

## 🔄 Multi-Club Expansion

When you add another club (e.g., Aurora Bass Club):

### Create Aurora Tables

```sql
-- Create Aurora board members table
create table public.aurora_board_members (
  profile_id uuid primary key references auth.users(id),
  member_id text not null,
  role text not null,
  created_at timestamptz default now()
);

alter table aurora_board_members enable row level security;

-- Create Aurora helper function
create or replace function public.is_aurora_board_member()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.aurora_board_members 
    where profile_id = auth.uid()
  );
$$;

-- Create Aurora RLS policies
create policy "aurora_select"
  on aurora_board_members
  for select
  to authenticated
  using (is_aurora_board_member());

-- ... similar for insert, update, delete
```

### Update Trophy Cast App

- Create `hooks/useAuroraAccess.ts` (similar to `useBoardAccess.ts`)
- Create Aurora back office screen
- Add to navigation

### Result

- Denver Bassmasters: `DBM_` tables & functions
- Aurora Bass Club: `AURORA_` tables & functions
- Each club completely isolated
- No data conflicts

---

## 📝 Reference

### DBM Board Member Roles

| Code | Role |
|------|------|
| DBM020 | DBM President |
| DBM021 | DBM Vice President |
| DBM019 | DBM Secretary |
| DBM063 | DBM Treasurer |
| DBM004 | DBM Tournament Director |
| DBM045 | DBM Conservation Director |
| DBM002 | DBM Juniors Director |
| DBM014 | DBM High School Director |

### Key Files

| File | Purpose |
|------|---------|
| `SUPABASE-DBM-BOARD-SETUP.md` | SQL setup guide |
| `hooks/useBoardAccess.ts` | Client-side access check |
| `components/BoardGuard.tsx` | Access control wrapper |
| `screens/BoardBackOfficeScreen.tsx` | Dashboard UI |

---

## ✅ Checklist

- [ ] Read `SUPABASE-DBM-BOARD-SETUP.md`
- [ ] Create Supabase table (run SQL)
- [ ] Add test board member
- [ ] Verify in SQL Editor
- [ ] Log in as test board member
- [ ] See "Board Tools" button
- [ ] Click to see Board Back Office
- [ ] Log in as non-board member
- [ ] Confirm "Board Tools" hidden

---

## 🎯 Next Steps

✅ **Done**: Set up DBM-specific Supabase schema

⏳ **Next**: 
1. Run SQL from `SUPABASE-DBM-BOARD-SETUP.md`
2. Add test board member
3. Test in app
4. Pick first feature to build (recommend: Board Notes)

---

## 📞 Support

**For Supabase help**: https://supabase.com/docs
**For app help**: See `BOARD-BACKOFFICE-README.md`
**For SQL help**: See `SUPABASE-DBM-BOARD-SETUP.md`

---

**Status**: ✅ Ready for Supabase setup

**Next**: Open `SUPABASE-DBM-BOARD-SETUP.md` and run the SQL!
