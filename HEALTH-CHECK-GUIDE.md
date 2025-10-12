# Tournament System Health Check Guide

This guide explains how to run comprehensive health checks on your Trophy Cast tournament system to verify database connectivity, data integrity, and UI functionality.

## Quick Start

### Option 1: Run the Direct Health Check Script (Recommended)

This script directly queries your Supabase database and provides detailed diagnostics:

```bash
npx ts-node scripts/health-check.ts
```

This will perform:
- ✅ Database connection verification
- ✅ Schema validation (tables and columns)
- ✅ Tournament data fetching tests
- ✅ Multi-day aggregation validation
- ✅ Participant count accuracy checks
- ✅ Error handling tests
- ✅ Norton-specific tournament verification

### Option 2: Run Jest Unit Tests

Run the automated test suite (uses mock data):

```bash
npm test
```

Or run specific test files:

```bash
# Run tournament health check tests
npm test -- tournament-health-check.test.ts

# Run aggregation tests
npm test -- aggregation.test.ts

# Run React Query hook tests
npm test -- react-query-hooks.test.tsx
```

## Health Check Categories

### 1. API Connection & Database Integrity

**What it checks:**
- Supabase client is properly initialized
- `tournament_results` table exists and is accessible
- `tournament_events` table exists with correct columns
- Required columns are present in both tables

**Expected Result:**
All tables should be accessible with the correct schema.

### 2. Tournament Data Fetching

**What it checks:**
- Fetch tournament events from database
- Fetch results for specific tournament codes
- Data quality (member_id presence, weight values)
- Lookup by both `tournament_code` and `event_id`

**Expected Result:**
Live data should be returned for all tournament queries, with >90% data completeness.

### 3. Multi-Day Aggregation Logic

**What it checks:**
- Detection of multi-day tournaments (same base name, different dates)
- Aggregation of results across multiple days
- One row per angler in combined results
- Correct summation of weights, fish counts, and AOY points

**Expected Result:**
Multi-day tournaments should be properly identified and aggregated per angler.

### 4. Participant Count Accuracy

**What it checks:**
- Unique participant count matches displayed count
- No duplicate counting of anglers
- Correct handling of multi-day participants

**Expected Result:**
Participant counts should match unique `member_id` values, accounting for multi-day entries.

### 5. UI Component Rendering

**What it checks:**
- Tournament cards display live data
- Detail screens load real results
- All tabs (Overview, Participants, Results) show database data
- No static/fallback/demo data appears

**Expected Result:**
All UI components should render live data from hooks, with no placeholder data visible.

### 6. Data Refresh & Cache Invalidation

**What it checks:**
- Switching tournaments triggers refetch
- Manual refetch works correctly
- Stale cache is invalidated
- Dependent queries update properly

**Expected Result:**
Data should refresh when tournament selection changes, with no stale cache issues.

### 7. Error Handling & Edge Cases

**What it checks:**
- Zero fish/weight scenarios (anglers with no catch)
- Missing data (null values)
- Empty result arrays (tournaments with no results)
- Non-existent tournament codes
- Graceful error messages

**Expected Result:**
System should handle all edge cases without crashing, showing appropriate empty states or error messages.

## Interpreting Results

### ✅ All Tests Pass
Your tournament system is working correctly! All data is flowing properly from database to UI.

### ❌ Some Tests Fail

**Common Issues:**

1. **Database Connection Failures**
   - Check `.env.local` has correct `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Verify internet connectivity
   - Confirm Supabase project is active

2. **Schema Validation Failures**
   - Table names may have changed
   - Required columns may be missing
   - Run SQL migrations in `db/` folder

3. **Data Quality Issues**
   - Missing `member_id` values
   - Null weight values (legitimate for zero fish)
   - Check data import scripts

4. **RLS (Row-Level Security) Issues**
   - Anonymous users may be blocked
   - Check Supabase RLS policies
   - Verify service role key for admin access

5. **Aggregation Failures**
   - Multi-day tournament detection logic needs adjustment
   - Tournament naming conventions may have changed
   - Verify `tournament_code` consistency

## Manual Verification Steps

### Verify Tournament Results Display

1. **Open Tournament Detail Screen**
   - Navigate to Tournaments → Select any tournament
   - Expand the tournament card

2. **Check Live Data**
   - Verify participant count matches database
   - Confirm results table shows real data
   - Check that weights, places, and names are correct

3. **Test Multi-Day Tournaments**
   - Find a multi-day event (e.g., Norton)
   - Open Results tab
   - Verify Day 1, Day 2, and Final tabs appear
   - Confirm Final tab shows aggregated totals

4. **Test Navigation**
   - Switch between tournaments
   - Verify data updates correctly
   - Check no stale data appears

### Database Manual Check

Run these queries in Supabase SQL editor:

```sql
-- Check tournament events
SELECT tournament_code, tournament_name, event_date 
FROM tournament_events 
ORDER BY event_date DESC 
LIMIT 10;

-- Check tournament results
SELECT tournament_code, member_name, weight_lbs, place 
FROM tournament_results 
WHERE tournament_code = 'YOUR-TOURNAMENT-CODE-HERE';

-- Check participant counts
SELECT 
  tournament_code,
  COUNT(*) as total_rows,
  COUNT(DISTINCT member_id) as unique_participants
FROM tournament_results
GROUP BY tournament_code
ORDER BY tournament_code;
```

## Automated CI/CD Health Checks

To run health checks automatically in CI/CD:

```yaml
# .github/workflows/health-check.yml
name: Tournament Health Check

on: [push, pull_request]

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npx ts-node scripts/health-check.ts
        env:
          EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Troubleshooting

### Mock vs Real Data

The Jest tests use mock data. For real database testing, use the `health-check.ts` script.

### Environment Variables

Ensure `.env.local` exists with:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Test Failures

If tests fail consistently:
1. Check console logs for specific error messages
2. Verify database schema matches expected structure
3. Confirm RLS policies allow read access
4. Test queries directly in Supabase dashboard

## Next Steps

After health check passes:
1. ✅ Verify UI displays live data
2. ✅ Test all tournament navigation flows
3. ✅ Validate multi-day aggregation in UI
4. ✅ Check error states (empty tournaments, no fish)
5. ✅ Monitor performance with large datasets

## Support

For issues or questions:
- Check `DEBUGGING-PLAYBOOK.md` for common solutions
- Review `DATABASE-VERIFICATION.md` for schema details
- See `TESTING-CHECKLIST.md` for manual test procedures
