-- Create club_officers table
create table public.club_officers (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references auth.users(id),
  role text not null,
  start_date date not null default now(),
  end_date date,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint club_officers_role_check check (
    role in ('President', 'Vice President', 'Secretary', 'Treasurer', 'Tournament Director')
  )
);

-- RLS Policies
alter table public.club_officers enable row level security;

-- Anyone can view officers
create policy "Anyone can view club officers"
  on public.club_officers for select
  using (true);

-- Only admins can modify officers
create policy "Only admins can modify club officers"
  on public.club_officers for all
  using (auth.uid() in (
    select member_id from club_officers 
    where role in ('President', 'Vice President', 'Secretary', 'Tournament Director')
    and end_date is null
  ));

-- Create club_events table
create table public.club_events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  event_date timestamptz not null,
  location text,
  event_type text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint club_events_type_check check (
    event_type in ('Tournament', 'Meeting', 'Social', 'Other')
  )
);

-- RLS Policies
alter table public.club_events enable row level security;

-- Anyone can view events
create policy "Anyone can view club events"
  on public.club_events for select
  using (true);

-- Only officers can modify events
create policy "Only officers can modify club events"
  on public.club_events for all
  using (auth.uid() in (
    select member_id from club_officers 
    where end_date is null
  ));