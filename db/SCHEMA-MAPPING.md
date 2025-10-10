# 🗺️ Schema Mapping: Existing Database → App Code

**Trophy Cast MVP v2 - Database Schema Analysis**

---

## 📊 Table Name Mismatches (CRITICAL)

### Current App Code Uses:
```
tournament_results_rows
tournament_events_rows
aoy_standings_rows
```

### Actual Database Tables:
```
tournament_results
tournament_events
aoy_standings
```

**Action Required:** Update all queries in app code to remove `_rows` suffix.

---

## 🔍 Column Mapping Analysis

### `tournament_results` (Existing) → App Usage

| Existing Column | Type | App Expects | Match? | Notes |
|----------------|------|-------------|--------|-------|
| `result_id` | text (PK) | ✅ | ✅ | Primary key |
| `member_id` | text | `member_id` | ✅ | FK to tournament_members |
| `tournament_code` | text | `tournament_code` | ✅ | Event identifier |
| `tournament_name` | text | `tournament_name` | ✅ | Event name |
| `event_date` | text | `event_date` | ✅ | Date (stored as text) |
| `lake` | text | `lake` | ✅ | Venue |
| `place` | bigint | `place` | ✅ | Finish position |
| `weight_lbs` | double precision | `weight_lbs` | ✅ | Total weight |
| `big_bass_lbs` | text | `big_fish` | ⚠️ | **Name mismatch** |
| `aoy_points` | bigint | `aoy_points` | ✅ | Points earned |
| `payout` | numeric (0) | `cash_payout` | ⚠️ | **Name mismatch** |
| `total_weight` | numeric | ❓ | ❓ | Duplicate of weight_lbs? |
| `big_fish` | numeric | ❓ | ❓ | Duplicate of big_bass_lbs? |
| `points` | integer | ❓ | ❓ | Duplicate of aoy_points? |

**Issue:** Column names inconsistent (`big_bass_lbs` vs `big_fish`, `payout` vs `cash_payout`)

---

### `tournament_events` (Existing) → App Usage

| Existing Column | Type | App Expects | Match? | Notes |
|----------------|------|-------------|--------|-------|
| `event_id` | text (PK) | ✅ | ✅ | Primary key |
| `tournament_code` | text | ✅ | ✅ | Code identifier |
| `tournament_name` | text | `tournament_name` | ✅ | Event name |
| `event_date` | text | `event_date` | ✅ | Date (text format) |
| `lake` | text | `lake` | ✅ | Venue |
| `participants` | bigint | ❓ | ✅ | Count of anglers |

**Status:** ✅ Compatible

---

### `aoy_standings` (Existing) → App Usage

| Existing Column | Type | App Expects | Match? | Notes |
|----------------|------|-------------|--------|-------|
| `member_id` | text (PK) | `member_id` | ✅ | FK to tournament_members |
| `season_year` | bigint | `season_year` | ✅ | Year |
| `aoy_rank` | bigint | `aoy_rank` | ✅ | Ranking position |
| `member_name` | text | `member_name` | ✅ | Angler name |
| `boater_status` | text | `boater_status` | ✅ | B/C status |
| `total_aoy_points` | bigint | `total_aoy_points` | ✅ | Total points |

**Status:** ✅ Compatible

---

### `tournament_members` (Existing)

| Column | Type | Notes |
|--------|------|-------|
| `member_id` | text (PK) | e.g., "DBM019" |
| `member_name` | text | Full name |
| `member_name_clean` | text | Normalized name |
| `email_primary` | text | Contact email |
| `mobile_phone` | text | Contact phone |
| `bass_number` | text | B.A.S.S. membership |
| `boater_status` | text | "B" or "C" |
| `club_name` | text | Default: "Denver Bassmasters" |
| `club_id` | text | Default: "DBM" |

**Status:** ✅ Not currently used by app (profiles table used instead)

---

### `profiles` (Existing)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | FK to auth.users.id |
| `member_code` | text (unique) | Links to tournament_members.member_id |
| `name` | text | Display name |
| `hometown` | text | Location |

**Status:** ✅ Used by app for auth mapping

---

## 🐛 Critical Issues to Fix

### 1. Table Name Suffix
**Problem:** App uses `_rows` suffix, database doesn't have it.

**Files to Update:**
- `lib/supabase.ts` - fetchAOYStandings, fetchTournamentEvents functions
- `lib/hooks/useQueries.ts` - All Supabase queries

**Fix:**
```typescript
// OLD (wrong):
.from('tournament_results_rows')
.from('tournament_events_rows')
.from('aoy_standings_rows')

// NEW (correct):
.from('tournament_results')
.from('tournament_events')
.from('aoy_standings')
```

---

### 2. Column Name Mismatches

#### `tournament_results` Table

**Problem:** App expects `big_fish` but database has `big_bass_lbs` (text) AND `big_fish` (numeric)

**Solution Options:**
A. **Use `big_fish` (numeric)** - Preferred, standardized type
B. **Use `big_bass_lbs` (text)** - Requires casting in queries
C. **Add alias in query:** `SELECT big_fish as big_bass_lbs`

**Recommended:** Use `big_fish` (numeric) in app queries.

---

**Problem:** App expects `cash_payout` but database has `payout` (numeric, default 0)

**Solution Options:**
A. **Use `payout`** - Update app code
B. **Add alias:** `SELECT payout as cash_payout`
C. **Rename column in DB:** `ALTER TABLE tournament_results RENAME COLUMN payout TO cash_payout`

**Recommended:** Use query alias for backward compatibility.

---

## ✅ Recommended Query Updates

### Dashboard Query (useDashboard hook)

```typescript
// Last tournament result
const { data: lastTournament } = await supabase
  .from('tournament_results') // ← Remove _rows
  .select(`
    event_date,
    lake,
    tournament_name,
    place,
    weight_lbs,
    aoy_points,
    payout as cash_payout
  `) // ← Add alias
  .eq('member_id', memberCode)
  .order('event_date', { ascending: false })
  .limit(1)
  .maybeSingle();

// AOY standing
const { data: aoyData } = await supabase
  .from('aoy_standings') // ← Remove _rows
  .select('aoy_rank, total_aoy_points')
  .eq('member_id', memberCode)
  .maybeSingle();

// Season earnings
const { data: earningsRows } = await supabase
  .from('tournament_results') // ← Remove _rows
  .select('payout as cash_payout') // ← Add alias
  .eq('member_id', memberCode)
  .gte('event_date', '2025-01-01');

// Next tournament
const { data: nextTournament } = await supabase
  .from('tournament_events') // ← Remove _rows
  .select('lake, event_date, tournament_name')
  .gte('event_date', new Date().toISOString().slice(0, 10))
  .order('event_date', { ascending: true })
  .limit(1)
  .maybeSingle();

// Season stats
const { data: statsRows } = await supabase
  .from('tournament_results') // ← Remove _rows
  .select('place, weight_lbs, big_fish') // ← Use big_fish (numeric)
  .eq('member_id', memberCode)
  .gte('event_date', '2025-01-01');
```

---

### Tournaments Query (useTournaments hook)

```typescript
const { data, error } = await supabase
  .from('tournament_events') // ← Remove _rows
  .select('*')
  .order('event_date', { ascending: false });
```

---

### AOY Standings Query (useAOYStandings hook)

```typescript
const { data, error } = await supabase
  .from('aoy_standings') // ← Remove _rows
  .select('*')
  .order('aoy_rank', { ascending: true });
```

---

## 🔄 Migration Strategy

### Option 1: Update App Code (Recommended)
✅ No database changes required  
✅ Uses existing schema as-is  
✅ Fastest implementation  

**Steps:**
1. Update `lib/supabase.ts` - Remove `_rows` suffix
2. Update `lib/hooks/useQueries.ts` - Remove `_rows`, add aliases
3. Test queries with existing data
4. Verify dashboard loads correctly

---

### Option 2: Rename Database Columns
⚠️ Requires database migration  
⚠️ May break other apps/integrations  

**Steps:**
```sql
-- Add _rows suffix to tables
ALTER TABLE tournament_results RENAME TO tournament_results_rows;
ALTER TABLE tournament_events RENAME TO tournament_events_rows;
ALTER TABLE aoy_standings RENAME TO aoy_standings_rows;

-- Rename payout column
ALTER TABLE tournament_results_rows 
RENAME COLUMN payout TO cash_payout;
```

**Not Recommended** - App should adapt to existing schema.

---

## 🎯 Next Steps

1. ✅ **Update app queries** to match existing schema
2. ✅ **Test with existing data** (if available)
3. ✅ **Add test data** for Tai Hunt (DBM019) if missing
4. ✅ **Verify all screens load** with real database
5. ✅ **Update TypeScript types** to match actual columns

---

## 📝 Test Data Needed

Check if these records exist for **Tai Hunt (DBM019)**:

```sql
-- Check member exists
SELECT * FROM tournament_members WHERE member_id = 'DBM019';

-- Check tournament results
SELECT * FROM tournament_results WHERE member_id = 'DBM019';

-- Check AOY standing
SELECT * FROM aoy_standings WHERE member_id = 'DBM019';

-- Check profile
SELECT * FROM profiles WHERE member_code = 'DBM019';
```

If missing, we'll need to add test data.

---

## 🔐 RLS Considerations

Existing policies allow public SELECT:
- ✅ `tournament_members` - Public read
- ✅ `tournament_events` - Public read  
- ✅ `tournament_results` - Public read
- ✅ `aoy_standings` - Public read

**No changes needed** for testing phase.

---

## 📊 Summary

| Issue | Impact | Fix Required | Priority |
|-------|--------|--------------|----------|
| Table name `_rows` suffix | 🔴 Critical | Update 3 files | 🔥 High |
| Column `payout` vs `cash_payout` | 🟡 Medium | Add alias | 🔥 High |
| Column `big_fish` type | 🟢 Low | Use numeric version | ⏳ Medium |
| Missing test data | 🟡 Medium | Insert records | ⏳ Medium |

**Estimated Fix Time:** 15-20 minutes

---

**Ready to implement fixes!** 🚀
