# Supabase Setup for DBM Board Back Office

## Step 1: Create the Board Members Table

Go to your Supabase project → **SQL Editor** → paste this:

```sql
-- Create board members table
create table if not exists public.dbm_board_members (
  profile_id uuid primary key references auth.users(id) on delete cascade,
  member_id text not null,
  role text not null check (char_length(role) > 0),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.dbm_board_members enable row level security;

-- Create helper function to check board membership
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

-- RLS Policy: Board members can read board members list
create policy "Board can view board members"
  on public.dbm_board_members
  for select
  to authenticated
  using (public.is_dbm_board_member());

-- RLS Policy: Only service role (backend) can insert/update/delete
-- This ensures board membership can only be managed via admin backend
create policy "Admins only"
  on public.dbm_board_members
  for all
  to authenticated
  using (false);
```

Click **Run** to execute.

---

## Step 2: Add Board Members

Still in SQL Editor, replace the UUIDs with your actual auth.users.id values:

```sql
-- Find your users' UUIDs first
select id, email from auth.users;

-- Then insert board members
insert into public.dbm_board_members (profile_id, member_id, role)
values
  ('YOUR_PRESIDENT_UUID_HERE', 'DBM020', 'DBM President'),
  ('YOUR_VP_UUID_HERE', 'DBM021', 'DBM Vice President'),
  ('YOUR_SECRETARY_UUID_HERE', 'DBM019', 'DBM Secretary'),
  ('YOUR_TREASURER_UUID_HERE', 'DBM063', 'DBM Treasurer'),
  ('YOUR_TOURNAMENT_DIR_UUID_HERE', 'DBM004', 'DBM Tournament Director'),
  ('YOUR_CONSERVATION_DIR_UUID_HERE', 'DBM045', 'DBM Conservation Director'),
  ('YOUR_JUNIORS_DIR_UUID_HERE', 'DBM002', 'DBM Juniors Director'),
  ('YOUR_HS_DIR_UUID_HERE', 'DBM014', 'DBM High School Director');
```

---

## Step 3: Verify Setup

Run this query to confirm everything works:

```sql
-- Check board members table
select * from public.dbm_board_members;

-- Test the helper function (replace UUID with a real one)
select public.is_dbm_board_member();
-- Should return: false (because authenticated as service role)

-- View RLS policies
select * from pg_policies 
where tablename = 'dbm_board_members';
```

---

## How It Works in the App

1. **User logs in** → Supabase auth.getUser() captures their UUID
2. **useBoardAccess hook runs** → Queries dbm_board_members with their UUID
3. **If user exists** → `isBoard = true` + `role` is populated
4. **If user doesn't exist** → `isBoard = false`
5. **BoardGuard wraps the screen** → Only renders if `isBoard === true`

---

## Managing Board Members (Admin Tasks)

### Add a new board member:
```sql
insert into public.dbm_board_members (profile_id, member_id, role)
values ('<UUID_FROM_AUTH_USERS>', 'DBMXXX', 'Role Name');
```

### Remove a board member:
```sql
delete from public.dbm_board_members 
where profile_id = '<UUID_FROM_AUTH_USERS>';
```

### Update a board member's role:
```sql
update public.dbm_board_members 
set role = 'New Role Name'
where profile_id = '<UUID_FROM_AUTH_USERS>';
```

### List all board members:
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

## Board Table Schema Reference

| Column | Type | Notes |
|--------|------|-------|
| `profile_id` | UUID | Auth user ID (primary key, links to auth.users.id) |
| `member_id` | TEXT | DBM member ID (e.g., "DBM020") |
| `role` | TEXT | Board role (e.g., "DBM President") |
| `created_at` | TIMESTAMPTZ | Timestamp when added to board |

---

## Security Notes

✅ **What's Protected:**
- Only board members can view the board members list
- Only service role (backend) can modify board membership
- Client-side app cannot add/remove board members
- All board functions will use `is_dbm_board_member()` in their RLS policies

🔐 **Best Practices:**
- Never trust `isBoard` from client—always verify server-side
- All future board-only tables should use `is_dbm_board_member()` function
- Audit log all board actions via database triggers or app logs

---

## Troubleshooting

### "Is user a board member?" returns true but shouldn't
- Check the UUID matches exactly in both auth.users and dbm_board_members
- Verify RLS policy is enabled on the table

### Button doesn't show for board member
- Verify user is logged in with correct UUID
- Check browser console for useBoardAccess hook errors
- Verify dbm_board_members table exists and has data

### "Not Authorized" error appears
- User's auth.users.id is not in dbm_board_members table
- Check that you added the correct UUID (not email)

---

## Next: Future Board Tables

When we build board features, each will need its own Supabase table(s) with RLS policies:

```sql
create table if not exists public.dbm_board_notes (
  id bigserial primary key,
  title text not null,
  body text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

alter table public.dbm_board_notes enable row level security;

-- Only board members can access
create policy "Board can access notes"
  on public.dbm_board_notes
  for all
  to authenticated
  using (public.is_dbm_board_member());
```

---

Ready to go! Let me know when you want to build the first feature. 🚀
