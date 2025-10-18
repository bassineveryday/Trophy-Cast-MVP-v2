# 🚀 CREATE & DEPLOY DBM BOARD TABLE

## ✅ Current Status

✅ **Table Ready**: `dbm_board_members` created
✅ **Function Ready**: `is_dbm_board_member()` created  
✅ **RLS Ready**: All 4 policies configured
✅ **Tai Hunt**: Already registered (DBM019) - READY TO TEST
⏳ **Other 7 Board Members**: Awaiting sign-up (will add when they register)

---

## Ready to Deploy - Copy & Paste

### Step 1: Go to Supabase
1. Open your Supabase project
2. Go to **SQL Editor**
3. Click **New Query**

### Step 2: Copy This Complete SQL

```sql
-- ============================================================
-- DBM BOARD BACK OFFICE - COMPLETE SETUP
-- Run this entire script in Supabase SQL Editor at once
-- ============================================================

-- 1. CREATE TABLE
create table if not exists public.dbm_board_members (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  member_id text not null,
  role text not null check (char_length(role) > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.dbm_board_members is 'Denver Bassmasters board member access control';
alter table public.dbm_board_members enable row level security;
create index if not exists idx_dbm_board_members_profile_id on public.dbm_board_members(profile_id);
create index if not exists idx_dbm_board_members_member_id on public.dbm_board_members(member_id);

-- 2. CREATE HELPER FUNCTION
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

-- 3. CREATE RLS POLICIES
drop policy if exists "dbm_board_members_select" on public.dbm_board_members;
drop policy if exists "dbm_board_members_insert_deny" on public.dbm_board_members;
drop policy if exists "dbm_board_members_update_deny" on public.dbm_board_members;
drop policy if exists "dbm_board_members_delete_deny" on public.dbm_board_members;

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

-- 4. ADD TAI HUNT (Only registered board member so far)
insert into public.dbm_board_members (profile_id, member_id, role)
values 
  ('8338ec05-7839-45b5-9b3a-115d6d485603', 'DBM019', 'DBM Secretary')
on conflict (profile_id) do nothing;

-- When other board members sign up, add them:
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('<THEIR_UUID>', 'DBMXXX', 'Their Role');

-- 5. VERIFY
select * from public.dbm_board_members;
```

### Step 3: Paste & Run
1. Paste the SQL above into the SQL Editor
2. Click **Run**
3. ✅ Done!

---

## ✅ What This Creates

| Item | Status |
|------|--------|
| `dbm_board_members` table | ✅ Created |
| `is_dbm_board_member()` function | ✅ Created |
| RLS Policies (4 total) | ✅ Created |
| Tai Hunt (DBM019) | ✅ Added |
| Other 7 board members | ⏳ Will add when they sign up |

---

## 👥 Board Members Status

| # | Name | Member ID | Role | Status |
|---|------|-----------|------|--------|
| 1 | Jeremiah Hofstetter | DBM001 | President | ⏳ Not registered yet |
| 2 | Bobby Martin | DBM002 | Vice President | ⏳ Not registered yet |
| 3 | **Tai Hunt** | **DBM019** | **Secretary** | ✅ **ACTIVE** |
| 4 | Gordon Phair | DBM004 | Treasurer | ⏳ Not registered yet |
| 5 | Howard Binkley | DBM005 | Tournament Director | ⏳ Not registered yet |
| 6 | Justin Apfel | DBM006 | Conservation Director | ⏳ Not registered yet |
| 7 | Cliff Purslow | DBM007 | Juniors Director | ⏳ Not registered yet |
| 8 | Bill Cancellieri | DBM008 | High School Director | ⏳ Not registered yet |

---

## 🔄 Adding Other Board Members Later

When board members sign up and register in Trophy Cast:

### 1. Find their UUID
```sql
select id from auth.users where email = 'their@email.com';
```

### 2. Add them
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<UUID>', 'DBMXXX', 'Role Name');
```

### 3. Examples

**Jeremiah Hofstetter (when he signs up):**
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<JEREMIAH_UUID>', 'DBM001', 'DBM President');
```

**Bobby Martin (when he signs up):**
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<BOBBY_UUID>', 'DBM002', 'DBM Vice President');
```

And so on for the other 5...

### 4. Verify
```sql
select * from public.dbm_board_members;
```

---

## ✨ Result

After running the SQL:

✅ **Table created** with Tai Hunt as DBM Secretary
✅ **Function works** to check board membership
✅ **RLS policies active** for security
✅ **Ready to test** in Trophy Cast app

**Next**: Test access control with Tai Hunt's account! 🎣
