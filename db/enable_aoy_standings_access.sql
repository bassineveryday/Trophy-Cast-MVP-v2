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