# Cedar Bluff Two-Day Tournament Setup

## Overview
Cedar Bluff is configured as a **two-day tournament** with the same structure and logic as the Norton tournament. This ensures consistent daily scoring, reporting, movement tracking, and combined final results.

## Tournament Structure

### Cedar Bluff (Two-Day)
- **Day 1**: `CEDARBLUFF-20250503` - Cedar 5-3-25 (May 3, 2025)
- **Day 2**: `CEDARBLUFF-20250504` - Cedar 5-4-25 (May 4, 2025)
- **Location**: Cedar Bluff Reservoir

### Norton Reference (Two-Day)
- **Day 1**: `NORTON-20250802` - Norton 8-2-25 (August 2, 2025)
- **Day 2**: `NORTON-20250803` - Norton 8-3-25 (August 3, 2025)
- **Location**: Norton Lake

### Single-Day Tournaments (For Comparison)
These remain as single-day events:
- **Lake 16-1-25**: Single day tournament
- **Lake 5-31-25**: Single day tournament (back-to-back with another event, but not multi-day)

## How It Works

### 1. Data Structure
Both days share the same base tournament name but have:
- Sequential dates (Day 1: 5-3-25, Day 2: 5-4-25)
- Unique tournament codes (CEDARBLUFF-20250503, CEDARBLUFF-20250504)
- Separate result entries per day in `tournament_results` table

### 2. Automatic Detection
The `useMultiDayTournamentResults` hook in `/lib/hooks/useQueries.ts`:
- Detects events with the same base name within 3 days
- Fetches all results for both days
- Aggregates data for combined view
- Tracks member participation across days

### 3. UI Features

#### Day 1 Tab
- Shows Day 1 results only
- Standard numeric rankings (1, 2, 3...)
- Individual day fish counts and weights

#### Day 2 Tab
- Shows Day 2 results only
- **Movement indicators** (▲/▼) showing rank changes vs Day 1
  - Green ▲ with +number = improved position
  - Red ▼ with number = dropped position
  - Gray — = no change
- Individual day fish counts and weights

#### Final Tab (Combined)
- Aggregates both days' results
- Shows per-day breakdown (Day 1 #/Wt, Day 2 #/Wt)
- Displays total fish count and total weight
- **Trophy icons** for top 3 finishers:
  - 🥇 1st place: Gold trophy
  - 🥈 2nd place: Silver trophy
  - 🥉 3rd place: Bronze trophy
- AOY points column

## Setup Instructions

### Step 1: Insert Day 2 Data
Run the SQL script to add Day 2 results:
```bash
# Execute the script in Supabase SQL editor or via CLI
psql <connection-string> -f sql/insert_day2_cedarbluff.sql
```

**Important**: Update the placeholder data in `insert_day2_cedarbluff.sql` with actual Day 2 results before running!

### Step 2: Verify Setup
Check that both days are properly configured:
```bash
psql <connection-string> -f sql/check_cedarbluff_twoday.sql
```

Expected output:
- Two event rows in `tournament_events` (Day 1 and Day 2)
- Results in `tournament_results` for both tournament codes
- Member names matching across both days for proper movement tracking

### Step 3: Test in App
1. Navigate to Tournaments screen
2. Tap on Cedar Bluff tournament
3. Verify you see three tabs: Day 1, Day 2, Final
4. Check Day 2 shows movement indicators
5. Check Final shows trophy icons for top 3

## Member Matching Logic

For movement indicators to work correctly, member names must match exactly across both days:
- Use consistent name spelling (e.g., "Harry chang" vs "Harry Chang")
- The system uses name normalization to handle minor differences
- Member IDs are preferred when available for more reliable matching

## Database Tables

### tournament_events
```sql
event_id        | UUID (unique per day)
tournament_code | CEDARBLUFF-20250503 / CEDARBLUFF-20250504
tournament_name | Cedar 5-3-25 / Cedar 5-4-25
event_date      | 2025-05-03 / 2025-05-04
lake            | Cedar Bluff Reservoir
```

### tournament_results
```sql
result_id       | UUID (unique per result row)
tournament_code | CEDARBLUFF-20250503 / CEDARBLUFF-20250504
event_date      | 2025-05-03 / 2025-05-04
tournament_name | Cedar 5-3-25 / Cedar 5-4-25
member_name     | Angler name
member_id       | DBM number (preferred for matching)
fish_count      | Number of fish caught that day
weight_lbs      | Total weight that day
place           | NULL (calculated dynamically)
```

## Code References

### Multi-Day Hook
`/lib/hooks/useQueries.ts` - `useMultiDayTournamentResults()`
- Line 262: Hook definition
- Detects sibling events by name and date proximity
- Aggregates results and builds combined view
- Handles member matching and deduplication

### Tournament Detail Screen
`/screens/TournamentDetailScreen.tsx`
- Line 73: Uses `useMultiDayTournamentResults` hook
- Line 478-700: `renderResults()` function with multi-day logic
- Day 2 movement indicators (lines 630-665)
- Final trophy icons (lines 605-610)

## Troubleshooting

### Problem: Only showing one day
**Solution**: Verify both events exist in `tournament_events` with names that match when date is stripped (e.g., "Cedar" matches both "Cedar 5-3-25" and "Cedar 5-4-25")

### Problem: Movement indicators not showing
**Solution**: Check member names match exactly between Day 1 and Day 2 results

### Problem: Wrong members in combined view
**Solution**: Verify member_id values are consistent or use exact name matching

## Additional Notes

- The system automatically detects multi-day tournaments - no code changes needed
- Adding Day 2 data is sufficient to enable two-day features
- The same logic works for any future multi-day tournaments
- Lake tournaments mentioned as single-day will remain separate events

