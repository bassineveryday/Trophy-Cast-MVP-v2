-- Trophy Cast MVP v2 - Supabase Database Setup
-- Run this SQL in your Supabase SQL Editor to set up the database schema

-- Create anglers table
CREATE TABLE IF NOT EXISTS anglers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  club_member_id TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournament_results table
CREATE TABLE IF NOT EXISTS tournament_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  angler_id UUID REFERENCES anglers(id) ON DELETE CASCADE,
  total_weight DECIMAL(6,2) NOT NULL,
  big_fish_weight DECIMAL(5,2),
  placement INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE anglers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read anglers" ON anglers;
DROP POLICY IF EXISTS "Allow authenticated users to read tournaments" ON tournaments;
DROP POLICY IF EXISTS "Allow authenticated users to read results" ON tournament_results;

-- Create RLS policies for read-only access to authenticated users
CREATE POLICY "Allow authenticated users to read anglers" 
ON anglers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read tournaments" 
ON tournaments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read results" 
ON tournament_results FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anglers_user_id ON anglers(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_tournament_id ON tournament_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_angler_id ON tournament_results(angler_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_date ON tournaments(date DESC);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);

-- Insert sample data (optional - remove if you want to start with empty tables)

-- Sample tournaments
INSERT INTO tournaments (name, date, location, status) VALUES
  ('Spring Opener 2024', '2024-04-15', 'Cherry Creek Reservoir', 'completed'),
  ('Summer Classic', '2024-06-20', 'Chatfield Reservoir', 'completed'),
  ('Fall Championship', '2024-09-15', 'Barr Lake', 'upcoming')
ON CONFLICT DO NOTHING;

-- Note: To insert sample anglers and results, you'll need to:
-- 1. Create user accounts through Supabase Auth
-- 2. Get their user IDs
-- 3. Create corresponding angler records
-- 4. Add tournament results
-- 
-- Example (replace with actual user_id from auth.users):
-- INSERT INTO anglers (user_id, first_name, last_name, club_member_id) VALUES
--   ('your-user-uuid-here', 'John', 'Doe', 'DBC001');
