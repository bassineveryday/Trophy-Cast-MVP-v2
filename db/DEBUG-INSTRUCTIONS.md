# DEBUGGING BLANK HOME SCREEN - STEP BY STEP

## What Changed
I added explicit debug logging to `HomeScreen.tsx` so you can see exactly what's happening.

## Steps to Diagnose (DO THESE IN ORDER)

### 1. Open the App in Browser
- Navigate to `http://localhost:8081` (or whatever port Metro is using)
- Log in with your account: `bassin@bassineveryday.com`

### 2. Open Browser Console
- Press **F12** (or right-click → Inspect → Console tab)
- Look for the section that says: **🏠 HomeScreen Data Debug**

### 3. Copy Console Output
Copy the entire debug group output and share it with me. It should show:
```
🏠 HomeScreen Data Debug
  Profile: {...}
  Member Code: DBM019 (or undefined)
  Raw dashboard data: {...}
  Loading state: false
  Error: null
```

### 4. Run SQL Diagnostic in Supabase
Open Supabase SQL Editor and run the file `db/DIAGNOSTIC-CHECK.sql`:

```sql
-- 1. Check your profile
SELECT id, member_code, name, hometown, created_at
FROM profiles
WHERE id = '8338ec05-7839-45b5-9b3a-115d6d485603'::uuid;

-- 2. Check if DBM019 has tournament data
SELECT COUNT(*) as result_count
FROM tournament_results
WHERE member_id = 'DBM019';

-- 3. Check if DBM019 has AOY data
SELECT * FROM aoy_standings WHERE member_id = 'DBM019';

-- 4. Test the exact query the dashboard uses
SELECT event_date, lake, tournament_name, place, weight_lbs, aoy_points, payout
FROM tournament_results 
WHERE member_id = 'DBM019'
ORDER BY event_date DESC 
LIMIT 1;
```

Copy the results of each query.

### 5. Check What the Home Screen Shows

The screen should now show one of these states:

- **Loading...** → Dashboard skeleton shows
- **Error message** → Shows the error with a Retry button
- **⚠️ No Dashboard Data** → Query returned nothing
- **Actual data** → Welcome back message with stats

Take a screenshot or describe what you see.

## What I Need From You

1. **Console output** from the 🏠 HomeScreen Data Debug group
2. **SQL results** from running DIAGNOSTIC-CHECK.sql in Supabase
3. **Screenshot** or description of what the Home screen displays

Once I have these three things, I can tell you **exactly** what's wrong and fix it permanently.

## Common Issues & Fixes

### If Member Code is undefined/null
→ Profile is not linked to DBM019. Need to re-run linking script.

### If Dashboard data is null/empty
→ Database has no tournament results for DBM019. Need to seed data.

### If Error shows "RLS policy"
→ Row Level Security is blocking access. Need to adjust policies.

### If Loading never stops
→ Query is hanging. Check network tab for failed requests.

## DO NOT run npm start again - just refresh the browser!
The app is already running. Just refresh the page (Ctrl+R or F5) and check the console.
