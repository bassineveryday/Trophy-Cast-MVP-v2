-- Create profiles table to link Supabase auth users with tournament members
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  member_code text not null unique,
  name text,
  hometown text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable row level security
alter table public.profiles enable row level security;

-- Create policy to allow users to view their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Create policy to allow users to create their own profile once
create policy "Users can create own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Grant necessary permissions
grant select, insert on profiles to authenticated;
grant select on tournament_members_rows to anon;
grant select on tournament_members_rows to authenticated;
grant select on tournament_results_rows to authenticated;
grant select on aoy_standings_rows to authenticated;