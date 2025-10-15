-- DEPRECATED: 2025-10-14
-- aoy_standings_rows is no longer used. We now expose a computed view `public.aoy_standings`.
-- Views inherit RLS from base tables. Ensure read policies exist on:
--   - public.tournament_results_rows
--   - public.tournament_members_rows
-- If you still need to rollback to the table approach, re-enable policies below.

-- Enable RLS on the table
alter table aoy_standings_rows enable row level security;

-- Create a policy that allows anyone to read the standings
create policy "Anyone can view AOY standings"
  on aoy_standings_rows
  for select
  to anon
  using (true);

-- Verify the policy
select * from pg_policies where tablename = 'aoy_standings_rows';