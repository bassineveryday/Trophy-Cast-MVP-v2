# Trophy Cast MVP v2

AI-powered grassroots fishing tournament platform with club management, private AI coaching, and conservation focus. Where Every Cast Counts.

## Overview

Trophy Cast is a React Native Expo app designed for the Denver Bassmasters fishing club. It connects to Supabase to authenticate club members and display tournament statistics, leaderboard rankings, and angler profiles with a clean, read-only UI.

## Features

- 🔐 **Authentication**: Secure login/signup for Denver Bassmasters club members
- 🏆 **Tournament Stats**: View all tournaments with status, date, and location
- 📊 **Leaderboard**: See rankings based on points and performance
- 👤 **Angler Profiles**: Detailed stats including tournaments fished, total points, best finish, and more
- 🔄 **Pull to Refresh**: Update data on demand
- 📱 **Cross-platform**: Works on iOS, Android, and Web

## Tech Stack

- **React Native** with Expo SDK 54
- **TypeScript** for type safety
- **Supabase** for backend (authentication + database)
- **React Navigation** for app navigation
- **Async Storage** for persistent authentication

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account with a project set up

## Supabase Setup

### Required Database Tables

Create the following tables in your Supabase project:

#### 1. `anglers` table
```sql
CREATE TABLE anglers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  club_member_id TEXT,
  profile_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. `tournaments` table
```sql
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed')) DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `tournament_results` table
```sql
CREATE TABLE tournament_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  angler_id UUID REFERENCES anglers(id) ON DELETE CASCADE,
  total_weight DECIMAL(6,2) NOT NULL,
  big_fish_weight DECIMAL(5,2),
  placement INTEGER NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

Enable RLS on all tables and create read-only policies for authenticated users:

```sql
-- Enable RLS
ALTER TABLE anglers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_results ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to read
CREATE POLICY "Allow authenticated users to read anglers" 
ON anglers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read tournaments" 
ON tournaments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to read results" 
ON tournament_results FOR SELECT TO authenticated USING (true);
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bassineveryday/Trophy-Cast-MVP-v2.git
   cd Trophy-Cast-MVP-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase project details:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### Development

```bash
# Start Expo dev server
npm start

# Run on iOS simulator (macOS only)
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Testing with Expo Go

1. Install Expo Go on your mobile device
2. Scan the QR code from the terminal/browser
3. The app will load on your device

## Project Structure

```
Trophy-Cast-MVP-v2/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Loading.tsx
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/          # App screens
│   │   ├── LoginScreen.tsx
│   │   ├── TournamentStatsScreen.tsx
│   │   ├── LeaderboardScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/         # External services
│   │   ├── supabase.ts   # Supabase client config
│   │   └── auth.tsx      # Authentication context
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── App.tsx               # Main app entry point
├── package.json
└── README.md
```

## Usage

1. **Sign Up / Login**: Create an account or login with existing credentials
2. **Browse Tournaments**: View upcoming, active, and completed tournaments
3. **Check Leaderboard**: See rankings and compare with other anglers
4. **View Profile**: Check your personal statistics and achievements

## Security Notes

- Never commit your `.env` file with real credentials
- Use environment variables for all sensitive data
- The app uses Supabase RLS for database security
- Authentication tokens are stored securely in Async Storage

## Contributing

This is a private club management app. For feature requests or bug reports, please contact the club administrator.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Expo documentation: https://docs.expo.dev
- Contact club administrator

---

**Denver Bassmasters** - Where Every Cast Counts 🎣
