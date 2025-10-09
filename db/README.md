How to create the `aoy_standings_rows` table in Supabase

1) Open your Supabase project and go to SQL Editor -> New Query
2) Paste the contents of `create_aoy_standings_rows.sql` and run it.

Optional: Add a quick test row by running the INSERT lines in that file (they're commented out).

Granting public SELECT for quick testing (temporary)

In Supabase SQL Editor, run:

-- Enable RLS off (for quick test only, not recommended for production)
ALTER TABLE public.aoy_standings_rows DISABLE ROW LEVEL SECURITY;

-- Or create a simple policy to allow public SELECT:
CREATE POLICY "Allow public select" ON public.aoy_standings_rows
FOR SELECT USING (true);

Note: If you enable RLS in future, you'll need to create appropriate policies that allow the correct roles to read the table. The above policy is for temporary testing only.

Security reminder: Do not leave permissive policies in production; use role-based policies and authenticated access.