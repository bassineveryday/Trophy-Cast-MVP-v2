# Quick Setup Guide

This guide will help you get the Trophy Cast app running quickly.

## Prerequisites

Make sure you have the following installed:
- Node.js 18 or higher
- npm or yarn
- Expo CLI (optional, but recommended)

## Step 1: Clone and Install

```bash
git clone https://github.com/bassineveryday/Trophy-Cast-MVP-v2.git
cd Trophy-Cast-MVP-v2
npm install
```

## Step 2: Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. In the Supabase dashboard, go to **SQL Editor**
4. Copy and paste the contents of `supabase-setup.sql` from this repository
5. Run the SQL script to create tables and policies

## Step 3: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to your Supabase project settings
   - Click on **API** in the sidebar
   - Copy your **Project URL** and **anon public** key

3. Edit `.env` and add your credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 4: Run the App

```bash
npm start
```

This will open the Expo Dev Tools in your browser. From there you can:
- Press `i` to run on iOS simulator (macOS only)
- Press `a` to run on Android emulator
- Press `w` to run in web browser
- Scan the QR code with the Expo Go app on your phone

## Step 5: Create Test Accounts

1. Run the app and tap "Sign Up"
2. Create an account with your email and password
3. Check your email for verification (if enabled in Supabase)
4. After signing up, create an angler profile:
   - Go to Supabase dashboard → **Table Editor**
   - Open the `anglers` table
   - Click **Insert** → **Insert row**
   - Fill in:
     - `user_id`: Your user ID from the `auth.users` table
     - `first_name`: Your first name
     - `last_name`: Your last name
     - `club_member_id`: Optional member ID (e.g., "DBC001")

## Step 6: Add Sample Data (Optional)

To test the app with data:

1. Add tournaments in the `tournaments` table
2. Add tournament results in the `tournament_results` table

See `supabase-setup.sql` for examples.

## Troubleshooting

### "Invalid API credentials" error
- Double-check your `.env` file has the correct Supabase URL and key
- Make sure the `.env` file is in the root directory
- Restart the Expo server after changing `.env`

### "Cannot find profile" error
- Make sure you've created an angler record linked to your user account
- Check that the `user_id` in the `anglers` table matches your auth user ID

### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Run `npx tsc --noEmit` to check for type errors

### Metro bundler issues
- Clear the cache: `expo start -c`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review Supabase docs: https://supabase.com/docs
- Review Expo docs: https://docs.expo.dev

---

**Denver Bassmasters** 🎣
