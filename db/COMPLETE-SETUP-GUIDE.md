# 🗄️ Supabase Database Setup Guide

**Trophy Cast MVP v2 - Complete Database Configuration**

---

## 📋 Prerequisites

1. ✅ Supabase account created
2. ✅ Project created at https://supabase.com
3. ✅ SQL Editor access (Dashboard → SQL Editor)

---

## 🚀 Quick Setup (Copy & Paste Each Section)

### Step 1: Create Tournament Tables

Run this first to create the core tournament data tables:

```sql
-- ============================================
-- TOURNAMENT TABLES SETUP
-- ============================================

-- Tournament Members (Club roster)
CREATE TABLE IF NOT EXISTS public.tournament_members_rows (
  member_id text NOT NULL PRIMARY KEY,
  member_name text NOT NULL,
  boater_status text,
  join_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tournament Events
CREATE TABLE IF NOT EXISTS public.tournament_events_rows (
  event_id text NOT NULL PRIMARY KEY,
  tournament_name text NOT NULL,
  tournament_code text UNIQUE,
  event_date date NOT NULL,
  lake text NOT NULL,
  location text,
  participants integer DEFAULT 0,
  entry_fee numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- Tournament Results
CREATE TABLE IF NOT EXISTS public.tournament_results_rows (
  result_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id text REFERENCES tournament_events_rows(event_id),
  member_id text REFERENCES tournament_members_rows(member_id),
  tournament_name text,
  lake text,
  event_date date NOT NULL,
  place integer,
  weight_lbs numeric(10,2),
  big_fish numeric(10,2),
  aoy_points integer,
  cash_payout numeric(10,2) DEFAULT 0,
  big_bass_payout numeric(10,2) DEFAULT 0,
  boat_weight_payout numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournament_results_member ON tournament_results_rows(member_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_event ON tournament_results_rows(event_id);
CREATE INDEX IF NOT EXISTS idx_tournament_results_date ON tournament_results_rows(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_tournament_events_date ON tournament_events_rows(event_date DESC);

COMMENT ON TABLE tournament_members_rows IS 'Club roster - all Denver Bassmasters members';
COMMENT ON TABLE tournament_events_rows IS 'Tournament schedule - past and upcoming events';
COMMENT ON TABLE tournament_results_rows IS 'Individual tournament results and payouts';
```

---

### Step 2: Create AOY Standings Table

```sql
-- ============================================
-- AOY STANDINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.aoy_standings_rows (
  member_id text NOT NULL PRIMARY KEY,
  season_year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  aoy_rank integer,
  member_name text,
  boater_status text,
  total_aoy_points integer DEFAULT 0,
  tournaments_fished integer DEFAULT 0,
  best_finish integer,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aoy_standings_rank ON aoy_standings_rows(aoy_rank);
CREATE INDEX IF NOT EXISTS idx_aoy_standings_year ON aoy_standings_rows(season_year);

COMMENT ON TABLE aoy_standings_rows IS 'Angler of the Year rankings - calculated from best 4 tournaments';
```

---

### Step 3: Create User Profiles Table

```sql
-- ============================================
-- USER PROFILES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  member_code text NOT NULL UNIQUE,
  name text,
  hometown text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_member_code ON profiles(member_code);

COMMENT ON TABLE profiles IS 'User profiles linking Supabase auth to club members';
```

---

### Step 4: Create Club Management Tables

```sql
-- ============================================
-- CLUB MANAGEMENT TABLES
-- ============================================

-- Club Officers
CREATE TABLE IF NOT EXISTS public.club_officers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('President', 'Vice President', 'Secretary', 'Treasurer', 'Tournament Director')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  email text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Club Events
CREATE TABLE IF NOT EXISTS public.club_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  location text,
  event_type text NOT NULL CHECK (event_type IN ('Tournament', 'Meeting', 'Social', 'Other')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE club_officers IS 'Current and past club leadership';
COMMENT ON TABLE club_events IS 'Club calendar - meetings, socials, tournaments';
```

---

### Step 5: Set Up Row Level Security (RLS)

```sql
-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_members_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_events_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_results_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aoy_standings_rows ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view/edit own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Tournament data: Public read access
CREATE POLICY "Public read tournament members" ON tournament_members_rows
  FOR SELECT USING (true);

CREATE POLICY "Public read tournament events" ON tournament_events_rows
  FOR SELECT USING (true);

CREATE POLICY "Public read tournament results" ON tournament_results_rows
  FOR SELECT USING (true);

CREATE POLICY "Public read AOY standings" ON aoy_standings_rows
  FOR SELECT USING (true);

-- Club officers: Public read access
CREATE POLICY "Public read club officers" ON club_officers
  FOR SELECT USING (true);

-- Club events: Public read access
CREATE POLICY "Public read club events" ON club_events
  FOR SELECT USING (true);

-- Admin write policies (officers can modify data)
CREATE POLICY "Officers can modify tournament data" ON tournament_results_rows
  FOR ALL USING (
    auth.uid() IN (
      SELECT member_id FROM club_officers 
      WHERE role IN ('President', 'Tournament Director', 'Secretary')
      AND (end_date IS NULL OR end_date > CURRENT_DATE)
    )
  );
```

---

### Step 6: Insert Test Data

```sql
-- ============================================
-- TEST DATA FOR DEVELOPMENT
-- ============================================

-- Insert test members
INSERT INTO tournament_members_rows (member_id, member_name, boater_status, join_date) VALUES
  ('DBM019', 'Tai Hunt', 'B', '2023-01-15'),
  ('DBM001', 'John Smith', 'B', '2022-01-01'),
  ('DBM002', 'Jane Doe', 'C', '2022-03-15'),
  ('DBM003', 'Bob Johnson', 'B', '2023-06-01'),
  ('DBM004', 'Sarah Williams', 'C', '2024-01-10')
ON CONFLICT (member_id) DO NOTHING;

-- Insert test tournament events
INSERT INTO tournament_events_rows (event_id, tournament_name, tournament_code, event_date, lake, participants) VALUES
  ('T2025-01', 'Spring Classic', 'SC2025', '2025-04-15', 'Cherry Creek Reservoir', 12),
  ('T2025-02', 'Summer Showdown', 'SS2025', '2025-06-20', 'Chatfield Reservoir', 15),
  ('T2025-03', 'Fall Championship', 'FC2025', '2025-09-10', 'Bear Creek Lake', 18),
  ('T2024-12', 'Winter Warm-Up', 'WW2024', '2024-12-05', 'Cherry Creek Reservoir', 10)
ON CONFLICT (event_id) DO NOTHING;

-- Insert test results for Tai Hunt
INSERT INTO tournament_results_rows (event_id, member_id, tournament_name, lake, event_date, place, weight_lbs, big_fish, aoy_points, cash_payout) VALUES
  ('T2024-12', 'DBM019', 'Winter Warm-Up', 'Cherry Creek Reservoir', '2024-12-05', 3, 15.75, 4.25, 98, 150.00),
  ('T2025-01', 'DBM019', 'Spring Classic', 'Cherry Creek Reservoir', '2025-04-15', 1, 22.50, 6.75, 100, 500.00)
ON CONFLICT DO NOTHING;

-- Insert AOY standings
INSERT INTO aoy_standings_rows (member_id, season_year, aoy_rank, member_name, boater_status, total_aoy_points, tournaments_fished) VALUES
  ('DBM019', 2025, 1, 'Tai Hunt', 'B', 198, 2),
  ('DBM001', 2025, 2, 'John Smith', 'B', 185, 3),
  ('DBM002', 2025, 3, 'Jane Doe', 'C', 175, 3),
  ('DBM003', 2025, 4, 'Bob Johnson', 'B', 160, 2),
  ('DBM004', 2025, 5, 'Sarah Williams', 'C', 145, 2)
ON CONFLICT (member_id) DO UPDATE SET
  aoy_rank = EXCLUDED.aoy_rank,
  total_aoy_points = EXCLUDED.total_aoy_points,
  tournaments_fished = EXCLUDED.tournaments_fished,
  updated_at = now();

-- Insert club officers
INSERT INTO club_officers (role, email, start_date) VALUES
  ('President', 'president@denverbassmasters.com', '2025-01-01'),
  ('Vice President', 'vp@denverbassmasters.com', '2025-01-01'),
  ('Secretary', 'secretary@denverbassmasters.com', '2025-01-01'),
  ('Treasurer', 'treasurer@denverbassmasters.com', '2025-01-01')
ON CONFLICT DO NOTHING;
```

---

### Step 7: Grant Permissions

```sql
-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant read access to anonymous users (for public data)
GRANT SELECT ON tournament_members_rows TO anon, authenticated;
GRANT SELECT ON tournament_events_rows TO anon, authenticated;
GRANT SELECT ON tournament_results_rows TO anon, authenticated;
GRANT SELECT ON aoy_standings_rows TO anon, authenticated;
GRANT SELECT ON club_officers TO anon, authenticated;
GRANT SELECT ON club_events TO anon, authenticated;

-- Grant profile management to authenticated users
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
```

---

## ✅ Verification Queries

Run these to verify everything is set up correctly:

```sql
-- Check table counts
SELECT 'tournament_members' as table_name, COUNT(*) as row_count FROM tournament_members_rows
UNION ALL
SELECT 'tournament_events', COUNT(*) FROM tournament_events_rows
UNION ALL
SELECT 'tournament_results', COUNT(*) FROM tournament_results_rows
UNION ALL
SELECT 'aoy_standings', COUNT(*) FROM aoy_standings_rows
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'club_officers', COUNT(*) FROM club_officers;

-- View Tai Hunt's data
SELECT * FROM tournament_results_rows WHERE member_id = 'DBM019' ORDER BY event_date DESC;

-- View AOY standings
SELECT aoy_rank, member_name, total_aoy_points FROM aoy_standings_rows ORDER BY aoy_rank;

-- View upcoming tournaments
SELECT tournament_name, event_date, lake FROM tournament_events_rows 
WHERE event_date >= CURRENT_DATE 
ORDER BY event_date;
```

---

## 🔧 Troubleshooting

### If tables already exist:
```sql
-- Drop and recreate (BE CAREFUL - this deletes data!)
DROP TABLE IF EXISTS tournament_results_rows CASCADE;
DROP TABLE IF EXISTS tournament_events_rows CASCADE;
DROP TABLE IF EXISTS tournament_members_rows CASCADE;
DROP TABLE IF EXISTS aoy_standings_rows CASCADE;
DROP TABLE IF EXISTS club_events CASCADE;
DROP TABLE IF EXISTS club_officers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Then run the setup steps again
```

### Check RLS policies:
```sql
-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Test permissions:
```sql
-- As anon user (should work)
SET ROLE anon;
SELECT * FROM tournament_events_rows LIMIT 1;
RESET ROLE;

-- As authenticated user (should work)
SET ROLE authenticated;
SELECT * FROM tournament_results_rows LIMIT 1;
RESET ROLE;
```

---

## 📊 Expected Results

After setup, you should have:

- ✅ **5 tournament members** including Tai Hunt (DBM019)
- ✅ **4 tournament events** (3 in 2025, 1 in 2024)
- ✅ **2 tournament results** for Tai Hunt
- ✅ **5 AOY standings** entries
- ✅ **4 club officers** with roles
- ✅ **All RLS policies** active and working

---

## 🚀 Next Steps

1. ✅ **Run all SQL scripts** in order
2. ✅ **Verify data** with verification queries
3. ✅ **Test app** - It should now load real data!
4. ✅ **Create profile** - Register with email and link to member code
5. ✅ **Test pull-to-refresh** - React Query caching in action!

---

## 📝 Notes

- **Test data** includes Tai Hunt (DBM019) with 2 tournament results
- **RLS policies** allow public read access for testing
- **Permissions** are set for both anonymous and authenticated users
- **Indexes** are created for optimal query performance
- **Foreign keys** ensure data integrity

---

## 🔐 Production Checklist

Before going to production:

- [ ] Review and tighten RLS policies
- [ ] Add proper admin roles
- [ ] Enable audit logging
- [ ] Set up database backups
- [ ] Add data validation triggers
- [ ] Implement soft deletes
- [ ] Add created_by/updated_by tracking

---

**Ready to set up? Copy each section to Supabase SQL Editor and run!** 🎯
