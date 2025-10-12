# 🏥 Tournament Health Check - Quick Reference

## 🚀 Quick Commands

```bash
# Run full health check (recommended)
npx ts-node scripts/health-check.ts

# Run all Jest tests
npm test

# Run specific test suite
npm test -- tournament-health-check.test.ts

# Run with coverage report
npm test -- --coverage
```

## ✅ What's Being Tested

| Category | What It Checks | Pass Criteria |
|----------|----------------|---------------|
| **1. Database Connection** | Supabase connectivity, table access | All tables accessible |
| **2. Data Fetching** | Live tournament results, event codes | Non-empty results returned |
| **3. Multi-Day Aggregation** | Norton/multi-day tournament merging | One row per angler with correct totals |
| **4. Participant Counts** | Unique member counting | Count matches unique member_ids |
| **5. UI Rendering** | Live data display, no static fallbacks | All components show database data |
| **6. Cache & Refresh** | Data updates on navigation | No stale data persists |
| **7. Error Handling** | Zero fish, missing data, empty results | Graceful handling, no crashes |

## 📊 Expected Results

### ✅ Success Indicators
- All tables accessible with correct schema
- Tournament results return live data
- Participant counts are accurate
- Multi-day aggregation produces one row per angler
- UI displays database data (no placeholders)
- Navigation refreshes data correctly
- Zero fish and missing data handled gracefully

### ❌ Failure Indicators
- Connection errors or missing tables
- Empty result sets for existing tournaments
- Duplicate member entries in combined results
- Static/demo data visible in UI
- Stale data after navigation
- App crashes on missing data

## 🔧 Common Issues & Fixes

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| Connection failure | Missing env vars | Check `.env.local` for `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| Empty results | Wrong tournament code | Verify tournament_code matches database |
| Schema errors | Table/column mismatch | Run SQL migrations in `db/` folder |
| RLS policy errors | Anonymous access blocked | Check Supabase RLS policies |
| Duplicate entries | Aggregation bug | Review `useMultiDayTournamentResults` logic |
| Static data showing | Fallback data activated | Check component props, remove default/mock data |

## 📁 Key Files

```
Trophy-Cast-MVP-v2/
├── scripts/
│   └── health-check.ts          ← Direct database health check script
├── __tests__/
│   └── tournament-health-check.test.ts  ← Jest unit tests
├── HEALTH-CHECK-GUIDE.md        ← Full documentation
├── HEALTH-CHECK-EXECUTION-SUMMARY.md   ← This run's summary
└── lib/hooks/
    └── useQueries.ts            ← Tournament data hooks
```

## 🎯 Quick Manual Verification

1. **Open app** → Navigate to Tournaments tab
2. **Expand any tournament** → Check participant count
3. **Open tournament detail** → Verify Overview, Participants, Results tabs load
4. **For Norton** → Check Day 1, Day 2, and Final tabs appear
5. **Switch tournaments** → Confirm data updates (no stale cache)
6. **Look for zeros** → Verify zero fish shows "0.00 lbs" not blank

## 📞 Support

- **Detailed Guide**: See `HEALTH-CHECK-GUIDE.md`
- **Database Issues**: See `db/README.md` and `DATABASE-VERIFICATION.md`
- **Testing**: See `TESTING-CHECKLIST.md`
- **Debugging**: See `DEBUGGING-PLAYBOOK.md`

---

**Last Updated**: October 12, 2025  
**Status**: ✅ Health Check Infrastructure Complete  
**Run Command**: `npx ts-node scripts/health-check.ts`
