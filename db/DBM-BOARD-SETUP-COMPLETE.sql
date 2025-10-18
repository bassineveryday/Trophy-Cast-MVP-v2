-- ============================================================
-- DBM BOARD BACK OFFICE - COMPLETE SETUP
-- Denver Bassmasters Board Management System
-- Run this entire script in Supabase SQL Editor at once
-- ============================================================

-- ============================================================
-- 1. CREATE TABLE
-- ============================================================
create table if not exists public.dbm_board_members (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  member_id text not null,
  role text not null check (char_length(role) > 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.dbm_board_members is 'Denver Bassmasters board member access control. Each row represents a board member with access to the DBM board back office.';

alter table public.dbm_board_members enable row level security;

create index if not exists idx_dbm_board_members_profile_id on public.dbm_board_members(profile_id);
create index if not exists idx_dbm_board_members_member_id on public.dbm_board_members(member_id);

-- ============================================================
-- 2. CREATE HELPER FUNCTION
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

comment on function public.is_dbm_board_member() is 'Returns TRUE if current user is a DBM board member, FALSE otherwise. Used by RLS policies and client-side access checks.';

-- ============================================================
-- 3. CREATE RLS POLICIES
-- ============================================================
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

-- ============================================================
-- 4. ADD BOARD MEMBERS (All 8 Denver Bassmasters Officers)
-- ============================================================

-- ✅ Tai Hunt - CONFIRMED USER
insert into public.dbm_board_members (profile_id, member_id, role)
values 
  ('8338ec05-7839-45b5-9b3a-115d6d485603', 'DBM019', 'DBM Secretary')
on conflict (profile_id) do nothing;

-- ⏳ OTHER BOARD MEMBERS - AWAITING SETUP
-- When these users sign up in Supabase, get their UUIDs from auth.users
-- Then uncomment and update these inserts:

-- Jeremiah Hofstetter - DBM President
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM001', 'DBM President')
-- on conflict (profile_id) do nothing;

-- Bobby Martin - DBM Vice President
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM002', 'DBM Vice President')
-- on conflict (profile_id) do nothing;

-- Gordon Phair - DBM Treasurer
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM004', 'DBM Treasurer')
-- on conflict (profile_id) do nothing;

-- Howard Binkley - DBM Tournament Director
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM005', 'DBM Tournament Director')
-- on conflict (profile_id) do nothing;

-- Justin Apfel - DBM Conservation Director
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM006', 'DBM Conservation Director')
-- on conflict (profile_id) do nothing;

-- Cliff Purslow - DBM Juniors Director
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM007', 'DBM Juniors Director')
-- on conflict (profile_id) do nothing;

-- Bill Cancellieri - DBM High School Director
-- insert into public.dbm_board_members (profile_id, member_id, role)
-- values ('GET-UUID-FROM-AUTH-USERS', 'DBM008', 'DBM High School Director')
-- on conflict (profile_id) do nothing;

-- ============================================================
-- 5. VERIFY SETUP
-- ============================================================

-- Check the table was created
select 'Table Created' as check_type, count(*) as row_count from public.dbm_board_members;

-- Check the function works
select 'Function Works' as check_type, public.is_dbm_board_member() as result;

-- Check RLS policies exist
select 'RLS Policies' as check_type, policyname, qual from pg_policies 
where tablename = 'dbm_board_members'
order by policyname;

-- List all current board members
select 
  'Board Members' as check_type,
  m.member_id,
  m.role,
  u.email,
  m.created_at
from public.dbm_board_members m
left join auth.users u on m.profile_id = u.id
order by m.member_id;

-- ============================================================
-- STATUS: ✅ Setup complete with Tai Hunt added
-- 
-- NEXT STEPS:
-- 1. Invite other 7 board members to sign up in Trophy Cast
-- 2. Get their UUIDs from auth.users table
-- 3. Uncomment and fill in their insert statements above
-- 4. Run the updated inserts to add them
-- 5. Test access control in app
-- ============================================================
