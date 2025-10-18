# Supabase Setup for DBM Board Back Office

## Overview

This guide sets up a **DBM-specific** board management system in Supabase. The `DBM_` prefix ensures:
- Clear Denver Bassmasters ownership
- Easy multi-club expansion (each club gets their own tables)
- No conflicts with other club data
- Scalable architecture

When other clubs join Trophy Cast, they'll have:
- `CLUB_` tables (generic club features)
- `DBM_` tables (Denver Bassmasters specific)
- `AURORA_` tables (Aurora Club specific)
- etc.

---

## Step 1: Create DBM Board Members Table

Go to your Supabase project → **SQL Editor** → Copy and paste this:

```sql
-- ============================================================
-- DBM Board Members Table
-- Stores Denver Bassmasters board member access control
-- ============================================================

create table if not exists public.dbm_board_members (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  member_id text not null,
  role text not null check (char_length(role) > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add table description
comment on table public.dbm_board_members is 'Denver Bassmasters board member access control. Each row represents a board member who has access to the DBM board back office.';

-- Enable Row Level Security
alter table public.dbm_board_members enable row level security;

-- Create index on profile_id for faster lookups
create index idx_dbm_board_members_profile_id on public.dbm_board_members(profile_id);

-- Create index on member_id for faster lookups
create index idx_dbm_board_members_member_id on public.dbm_board_members(member_id);
```

**Click Run** to execute.

---

## Step 2: Create DBM Board Helper Function

Still in SQL Editor, add this function:

```sql
-- ============================================================
-- DBM Board Member Check Function
-- Reusable function to verify if user is a DBM board member
-- ============================================================

create or replace function public.is_dbm_board_member()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.dbm_board_members m
    where m.profile_id = auth.uid()
  );
$$;

-- Add function description
comment on function public.is_dbm_board_member() is 'Returns TRUE if current user is a DBM board member, FALSE otherwise. Used by RLS policies and client-side access checks.';
```

**Click Run** to execute.

---

## Step 3: Create RLS Policies for DBM Board Members

Still in SQL Editor, add these policies:

```sql
-- ============================================================
-- RLS Policies for DBM Board Members Table
-- ============================================================

-- Policy 1: Board members can read the board members list
create policy "dbm_board_members_select"
  on public.dbm_board_members
  for select
  to authenticated
  using (public.is_dbm_board_member());

comment on policy "dbm_board_members_select" on public.dbm_board_members 
  is 'Only DBM board members can view the board members list';

-- Policy 2: Prevent authenticated users from inserting (service role only)
create policy "dbm_board_members_insert_deny"
  on public.dbm_board_members
  for insert
  to authenticated
  with check (false);

comment on policy "dbm_board_members_insert_deny" on public.dbm_board_members
  is 'Prevents app users from adding board members. Only service role (backend) can do this.';

-- Policy 3: Prevent authenticated users from updating (service role only)
create policy "dbm_board_members_update_deny"
  on public.dbm_board_members
  for update
  to authenticated
  using (false);

comment on policy "dbm_board_members_update_deny" on public.dbm_board_members
  is 'Prevents app users from modifying board members. Only service role (backend) can do this.';

-- Policy 4: Prevent authenticated users from deleting (service role only)
create policy "dbm_board_members_delete_deny"
  on public.dbm_board_members
  for delete
  to authenticated
  using (false);

comment on policy "dbm_board_members_delete_deny" on public.dbm_board_members
  is 'Prevents app users from removing board members. Only service role (backend) can do this.';
```

**Click Run** to execute.

---

## Step 4: Add DBM Board Members

Still in SQL Editor, first find your users' UUIDs:

```sql
-- Find your users in auth
select id, email from auth.users limit 10;
```

**Copy the UUID** of each person you want to add as a board member.

Then insert board members (replace UUIDs with your actual user IDs):

```sql
-- ============================================================
-- Insert DBM Board Members
-- Denver Bassmasters Board of Directors
-- ============================================================

insert into public.dbm_board_members (profile_id, member_id, role)
values
  -- Tai Hunt - DBM Secretary (verified user)
  ('8338ec05-7839-45b5-9b3a-115d6d485603', 'DBM019', 'DBM Secretary'),
  
  -- Board Members (add UUIDs when available)
  -- Jeremiah Hofstetter - DBM President
  -- ('UUID_JEREMIAH_HERE', 'DBM001', 'DBM President'),
  
  -- Bobby Martin - DBM Vice President  
  -- ('UUID_BOBBY_HERE', 'DBM002', 'DBM Vice President'),
  
  -- Gordon Phair - DBM Treasurer
  -- ('UUID_GORDON_HERE', 'DBM004', 'DBM Treasurer'),
  
  -- Howard Binkley - DBM Tournament Director
  -- ('UUID_HOWARD_HERE', 'DBM005', 'DBM Tournament Director'),
  
  -- Justin Apfel - DBM Conservation Director
  -- ('UUID_JUSTIN_HERE', 'DBM006', 'DBM Conservation Director'),
  
  -- Cliff Purslow - DBM Juniors Director
  -- ('UUID_CLIFF_HERE', 'DBM007', 'DBM Juniors Director'),
  
  -- Bill Cancellieri - DBM High School Director
  -- ('UUID_BILL_HERE', 'DBM008', 'DBM High School Director');
```

**Next**: Get the UUIDs from your Supabase `auth.users` table and uncomment/fill in the board members above.

**To find UUIDs**:
```sql
select id, email from auth.users 
where email in (
  'jeremiah@email.com',
  'bobby@email.com', 
  'gordon@email.com',
  'howard@email.com',
  'justin@email.com',
  'cliff@email.com',
  'bill@email.com'
);
```

**Click Run** to execute the insert.

---

## Step 5: Verify Setup

Run this verification query:

```sql
-- ============================================================
-- Verification Queries
-- ============================================================

-- Check the table exists and has data
select * from public.dbm_board_members;

-- Check the function works (should return false for service role context)
select public.is_dbm_board_member();

-- Check RLS policies exist
select * from pg_policies 
where tablename = 'dbm_board_members'
order by policyname;

-- View all board members with their email
select 
  m.profile_id,
  m.member_id,
  m.role,
  u.email,
  m.created_at
from public.dbm_board_members m
left join auth.users u on m.profile_id = u.id
order by m.created_at desc;
```

**Expected results**:
- ✅ `dbm_board_members` table with your members
- ✅ `is_dbm_board_member()` function exists
- ✅ 4 RLS policies shown
- ✅ All board members listed with emails

---

## Database Schema Reference

### `public.dbm_board_members` Table

| Column | Type | Notes |
|--------|------|-------|
| `profile_id` | UUID | Auth user ID (primary key) |
| `member_id` | TEXT | DBM member ID (e.g., "DBM020") |
| `role` | TEXT | Board role (e.g., "DBM President") |
| `created_at` | TIMESTAMPTZ | When added to board |
| `updated_at` | TIMESTAMPTZ | Last modified |

### `public.is_dbm_board_member()` Function

**Returns**: BOOLEAN
- `TRUE` if current user is in `dbm_board_members` table
- `FALSE` if current user is NOT a board member
- `FALSE` if user is not authenticated

**Usage**: 
- Used by RLS policies
- Used by client-side access checks

---

## Managing Board Members

### Add a New Board Member

```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<UUID_FROM_AUTH_USERS>', 'DBMXXX', 'Role Name');
```

### Remove a Board Member

```sql
delete from public.dbm_board_members 
where profile_id = '<UUID_FROM_AUTH_USERS>';
```

### Update a Board Member's Role

```sql
update public.dbm_board_members 
set role = 'New Role Name'
where profile_id = '<UUID_FROM_AUTH_USERS>';
```

### Find a User's UUID by Email

```sql
select id, email from auth.users 
where email = 'president@dbm.com';
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
order by m.created_at desc;
```

---

## Security Guarantees

### What's Protected ✅

✅ **Read Access**
- Only board members can query `dbm_board_members` table
- Non-board members get zero rows (not an error)
- Anonymous users get zero rows

✅ **Write Access**
- Only service role can insert board members
- Only service role can update board members
- Only service role can delete board members
- App users cannot modify board membership

✅ **Data Isolation**
- Each club has their own tables (`DBM_`, `AURORA_`, etc.)
- No cross-club data leakage
- Clear ownership per club

### Trust Model

```
Security Priority (Trusted → Least Trusted):
1. RLS Policies (Database level) ← MOST SECURE
2. Supabase Auth (Session level)
3. Client-side checks (UX only)
```

---

## Troubleshooting

### "Board Tools button doesn't show up"

**Check**:
1. User is logged in
2. User's UUID exists in `dbm_board_members` table
3. RLS policies are enabled on the table

**Test**:
```sql
-- Verify user UUID
select id from auth.users where email = 'your@email.com';

-- Verify user is in board members
select * from public.dbm_board_members 
where profile_id = 'YOUR_UUID_HERE';
```

### "Getting 'Not Authorized' error"

**Check**:
1. User's UUID is correct
2. User is in `dbm_board_members` table
3. RLS policies are configured correctly

**Test**:
```sql
-- Test RLS policy
select * from public.dbm_board_members 
where public.is_dbm_board_member();
```

### "Function is_dbm_board_member doesn't exist"

**Fix**:
- Go back to Step 2 and run the function creation SQL

### "Table already exists error"

**This is normal**. The `if not exists` clause prevents errors on re-runs.

---

## Future: Adding Other Clubs

When you add another club (e.g., Aurora Bass Club):

```sql
-- Create Aurora tables with AURORA_ prefix
create table public.aurora_board_members (...);
create function public.is_aurora_board_member() (...);

-- Create Aurora RLS policies
create policy "aurora_board_members_select"
  on public.aurora_board_members
  for select
  to authenticated
  using (public.is_aurora_board_member());
```

Each club gets their own:
- Tables (prefixed with club code)
- Helper functions
- RLS policies
- Board member lists

**No conflicts. Completely isolated.**

---

## Complete Schema Script (All at Once)

If you want to run everything at once, use this:

```sql
-- ============================================================
-- DBM BOARD BACK OFFICE COMPLETE SCHEMA
-- Denver Bassmasters Board Management System
-- ============================================================

-- 1. Create DBM Board Members Table
create table if not exists public.dbm_board_members (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  member_id text not null,
  role text not null check (char_length(role) > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.dbm_board_members is 'Denver Bassmasters board member access control';

alter table public.dbm_board_members enable row level security;

create index idx_dbm_board_members_profile_id on public.dbm_board_members(profile_id);
create index idx_dbm_board_members_member_id on public.dbm_board_members(member_id);

-- 2. Create Helper Function
create or replace function public.is_dbm_board_member()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.dbm_board_members m
    where m.profile_id = auth.uid()
  );
$$;

comment on function public.is_dbm_board_member() is 'Returns TRUE if current user is a DBM board member';

-- 3. Create RLS Policies
create policy "dbm_board_members_select"
  on public.dbm_board_members
  for select
  to authenticated
  using (public.is_dbm_board_member());

create policy "dbm_board_members_insert_deny"
  on public.dbm_board_members
  for insert
  to authenticated
  with check (false);

create policy "dbm_board_members_update_deny"
  on public.dbm_board_members
  for update
  to authenticated
  using (false);

create policy "dbm_board_members_delete_deny"
  on public.dbm_board_members
  for delete
  to authenticated
  using (false);

-- 4. Add Board Members
-- Tai Hunt - verified user (already has UUID)
insert into public.dbm_board_members (profile_id, member_id, role)
values
  ('8338ec05-7839-45b5-9b3a-115d6d485603', 'DBM019', 'DBM Secretary');

-- To add other board members, get their UUIDs first:
-- select id, email from auth.users;
-- Then uncomment and fill in:
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values
--   ('<UUID_JEREMIAH>', 'DBM001', 'DBM President'),
--   ('<UUID_BOBBY>', 'DBM002', 'DBM Vice President'),
--   ('<UUID_GORDON>', 'DBM004', 'DBM Treasurer'),
--   ('<UUID_HOWARD>', 'DBM005', 'DBM Tournament Director'),
--   ('<UUID_JUSTIN>', 'DBM006', 'DBM Conservation Director'),
--   ('<UUID_CLIFF>', 'DBM007', 'DBM Juniors Director'),
--   ('<UUID_BILL>', 'DBM008', 'DBM High School Director');
```

---

## Next Steps

✅ **Done**:
- Create `dbm_board_members` table
- Set up helper function
- Configure RLS policies
- Add test board members

⏳ **Next**:
1. Run the SQL from Step 1-4 above
2. Add your board members
3. Test access control in the app
4. Pick first feature to build

---

## Quick Reference

### Key Tables & Functions
- `public.dbm_board_members` - Board member data
- `public.is_dbm_board_member()` - Check if user is board member

### Key Roles
- `DBM020` - DBM President
- `DBM021` - DBM Vice President
- `DBM019` - DBM Secretary
- `DBM063` - DBM Treasurer
- `DBM004` - DBM Tournament Director
- `DBM045` - DBM Conservation Director
- `DBM002` - DBM Juniors Director
- `DBM014` - DBM High School Director

### Key RLS Policies
- `dbm_board_members_select` - Only board members can read
- `dbm_board_members_*_deny` - Only service role can write

---

## Support

**Questions about setup?**
- Check Supabase docs: https://supabase.com/docs
- Check our docs: `BOARD-BACKOFFICE-ARCHITECTURE.md`

**Need to modify schema?**
- All operations are documented above
- Use SQL Editor to test changes
- Test RLS policies before deployment

---

**Status**: ✅ Ready to set up

**Next**: Run the SQL above in Supabase, then test in the app!
