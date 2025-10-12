# 🎯 Your Next Steps - Tournament Health Check

**Current Status**: ✅ Health check test suite created and ready to run  
**Issue Encountered**: TypeScript module resolution for direct script  
**Solution**: Use Jest-based health check instead

---

## 🚀 Immediate Next Steps (Priority Order)

### Step 1: Run the Health Check Tests ⚡

```bash
npm run health-check
```

**What this does:**
- Runs the comprehensive tournament health check test suite
- Tests all 7 critical categories
- Provides detailed pass/fail results
- Takes ~2-3 seconds to complete

**Expected Result:**
```
PASS  __tests__/tournament-health-check.test.ts
  ✓ should verify Supabase client is initialized
  ✓ should fetch live tournament results for a specific tournament code
  ✓ should aggregate results correctly for multi-day tournaments
  ✓ should count unique participants correctly
  ... (21 more tests)

Test Suites: 1 passed, 1 total
Tests:       24 passed, 24 total
```

---

### Step 2: Review Test Results 📊

**If ALL tests pass ✅:**
- Your tournament system is working correctly!
- Database connection is good
- Data fetching works
- Multi-day aggregation is correct
- Go to Step 3

**If SOME tests fail ⚠️:**
Check which category failed and refer to troubleshooting below

---

### Step 3: Verify in the App (Manual Testing) 📱

1. **Start the app:**
   ```bash
   npm start
   ```

2. **Navigate to Tournaments tab**
   - You should see a list of tournaments with participant counts

3. **Open a tournament (e.g., Norton)**
   - Click on any tournament card
   - Verify you see: Overview, Participants, Results tabs

4. **Check Results Tab**
   - For Norton: You should see "Day 1", "Day 2", and "Final" tabs
   - Click "Final" tab - should show combined results with one row per angler
   - Verify weights and fish counts are summed correctly

5. **Check Participants Tab**
   - Participant count should match unique anglers in database
   - Should show member names, not "Loading..." or placeholders

6. **Switch Tournaments**
   - Navigate to a different tournament
   - Data should update (not show stale/cached data from previous tournament)

---

### Step 4: Validate Database Directly (Optional but Recommended) 🔍

**Open Supabase Dashboard → SQL Editor:**

```sql
-- Test 1: Check tournament events exist
SELECT tournament_code, tournament_name, event_date 
FROM tournament_events 
ORDER BY event_date DESC 
LIMIT 10;

-- Test 2: Check Norton tournament specifically
SELECT tournament_code, tournament_name, event_date
FROM tournament_events
WHERE tournament_name ILIKE '%norton%'
ORDER BY event_date;

-- Test 3: Verify tournament results data
SELECT 
  tournament_code,
  COUNT(*) as total_results,
  COUNT(DISTINCT member_id) as unique_participants,
  SUM(weight_lbs) as total_weight
FROM tournament_results
GROUP BY tournament_code
ORDER BY tournament_code DESC
LIMIT 10;

-- Test 4: Check for data quality issues
SELECT 
  tournament_code,
  COUNT(*) as total_rows,
  COUNT(member_id) as rows_with_member_id,
  COUNT(weight_lbs) as rows_with_weight
FROM tournament_results
GROUP BY tournament_code
ORDER BY tournament_code DESC;
```

**Expected Results:**
- At least 10 tournament events should exist
- Norton should show 2 entries (Day 1 and Day 2)
- Each tournament should have >0 results
- >90% of rows should have member_id and weight_lbs

---

## 🔧 Troubleshooting Guide

### Issue: "Cannot find module" or Import Errors

**Solution:** Use the Jest-based test instead:
```bash
npm run health-check
```
This uses the proper test environment without module resolution issues.

---

### Issue: Tests Fail - "No tournament events found"

**Possible Causes:**
1. Database is empty (no data imported)
2. Wrong Supabase project connected
3. Environment variables missing/incorrect

**Solution:**
```bash
# 1. Check environment variables
cat .env.local

# Should show:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here

# 2. Verify in Supabase Dashboard
# - Go to Table Editor
# - Open tournament_events table
# - Should have rows of data

# 3. Import data if needed
# - Run the SQL scripts in db/ folder
# - Or import CSV files from data/ folder
```

---

### Issue: Tests Fail - "Schema validation errors"

**Possible Causes:**
1. Table names don't match (e.g., `tournamentresults` vs `tournament_results`)
2. Required columns missing
3. RLS policies blocking access

**Solution:**
1. **Check table names in Supabase:**
   - Should be: `tournament_events` and `tournament_results`
   - NOT: `tournamentresults` or `tournaments_results`

2. **Verify columns exist:**
   ```sql
   -- In Supabase SQL Editor
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'tournament_results';
   ```
   Should show: `tournament_code`, `member_id`, `member_name`, `weight_lbs`, `place`, etc.

3. **Check RLS policies:**
   - Supabase Dashboard → Authentication → Policies
   - Ensure anonymous users can SELECT from both tables

---

### Issue: Tests Fail - "Aggregation errors"

**Possible Causes:**
1. Multi-day tournaments not properly linked
2. Tournament codes inconsistent
3. Member IDs missing or duplicated

**Solution:**
```sql
-- Check for Norton tournament data
SELECT 
  tournament_code,
  tournament_name,
  event_date,
  COUNT(*) as result_count
FROM tournament_results
WHERE tournament_name ILIKE '%norton%'
GROUP BY tournament_code, tournament_name, event_date;

-- Should show 2 rows (Day 1 and Day 2)
-- Each with >0 results
```

---

### Issue: UI Shows Static/Demo Data

**Possible Causes:**
1. Components using fallback data
2. Hooks not properly connected
3. React Query not initialized

**Solution:**
1. **Check component code:**
   - Look for hardcoded arrays like `const participants = [...]`
   - Should use: `const { data: participants } = useTournamentParticipants(id)`

2. **Verify React Query provider exists:**
   - Open `App.tsx`
   - Should have `<QueryClientProvider>` wrapper

3. **Clear cache and restart:**
   ```bash
   # Clear React Native cache
   npm start -- --clear
   ```

---

### Issue: Participant Counts Don't Match

**Possible Causes:**
1. Counting duplicate entries (multi-day)
2. Missing member_id values
3. Wrong tournament code being queried

**Solution:**
```sql
-- Manual participant count
SELECT 
  tournament_code,
  COUNT(DISTINCT member_id) as unique_participants
FROM tournament_results
WHERE tournament_code = 'YOUR-CODE-HERE'
GROUP BY tournament_code;
```

Compare this to the count shown in the app. Should match exactly.

---

## 📝 What Was Tested

| Test Category | What It Checks | Files Validated |
|---------------|----------------|-----------------|
| **Database Connection** | Supabase client, table access | `lib/supabase.ts` |
| **Data Fetching** | Live results by tournament code | `lib/hooks/useQueries.ts` → `useTournamentResults()` |
| **Multi-Day Aggregation** | Norton Day 1+2 → Final combined | `lib/hooks/useQueries.ts` → `useMultiDayTournamentResults()` |
| **Participant Counts** | Unique member counting | `lib/hooks/useQueries.ts` → `useTournamentParticipants()` |
| **UI Components** | Live data display | `screens/TournamentDetailScreen.tsx` |
| **Cache Refresh** | Data updates on navigation | React Query cache logic |
| **Error Handling** | Zero fish, missing data | All components with EmptyState |

---

## 🎯 Success Criteria

Your system is working correctly if:

- ✅ All 24 health check tests pass
- ✅ Tournament list shows real participant counts
- ✅ Tournament detail shows live data in all tabs
- ✅ Norton (or any multi-day) shows Day 1, Day 2, Final tabs
- ✅ Final tab shows one row per angler with summed totals
- ✅ Switching tournaments updates the displayed data
- ✅ Zero fish shows "0.00 lbs" not blank
- ✅ No "Loading..." or placeholder data visible

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `HEALTH-CHECK-GUIDE.md` | Full testing guide with detailed explanations |
| `HEALTH-CHECK-EXECUTION-SUMMARY.md` | Technical implementation details |
| `HEALTH-CHECK-QUICK-REFERENCE.md` | One-page cheat sheet |
| `TESTING-CHECKLIST.md` | Manual testing procedures |
| `DATABASE-VERIFICATION.md` | Database schema and RLS policies |
| `DEBUGGING-PLAYBOOK.md` | Common issues and solutions |

---

## 🚦 Status Checkpoints

### ✅ Checkpoint 1: Tests Pass
Run `npm run health-check` → All tests green

### ✅ Checkpoint 2: UI Shows Live Data
Open app → Tournaments tab → Verify real participant counts

### ✅ Checkpoint 3: Multi-Day Works
Open Norton → Results tab → See Day 1, Day 2, Final tabs

### ✅ Checkpoint 4: Navigation Works
Switch between tournaments → Data updates correctly

### ✅ Checkpoint 5: No Static Data
No "Sample Tournament" or "Demo Data" visible anywhere

---

## 💡 Quick Wins

If you're short on time, do these 3 things:

1. **Run health check**: `npm run health-check`
2. **Open app**: Navigate to any tournament
3. **Check Norton**: Open Norton → Results → Verify Final tab shows combined data

If all 3 work, you're good to go! ✅

---

## 📞 Need Help?

**Tests are failing?** → Review the specific test output and match it to the troubleshooting section

**UI not showing data?** → Check `.env.local` environment variables

**Data looks wrong?** → Run SQL queries in Supabase to verify source data

**Still stuck?** → Review `DEBUGGING-PLAYBOOK.md` for step-by-step diagnostics

---

**Last Updated**: October 12, 2025  
**Status**: Ready to test  
**Primary Command**: `npm run health-check`
