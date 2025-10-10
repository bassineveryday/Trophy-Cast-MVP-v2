# Denver Bassmasters Tournament Logic

## Overview
This document outlines the official tournament rules, scoring system, and prize structure for Denver Bassmasters (DBM) as implemented in the Trophy Cast app.

## 🏆 Tournament Structure

### Individual Tournament Format
- **Duration**: Single day events (occasional two-day tournaments)
- **Scoring**: Based on total weight of fish caught
- **Species**: Bass only (largemouth, smallmouth, spotted bass)
- **Participants**: Club members with valid DBM member codes

### Big Bass Competition
- One big bass winner per tournament day
- For two-day tournaments: One big bass winner per day
- Weight recorded in `big_bass_lbs` field
- Winner receives `big_bass_payout` bonus

### Boat Team Competition
- Teams consist of one boater + one co-angler
- Combined total weight of both anglers
- Winning boat team splits `boat_weight_payout`

## 🏅 AOY (Angler of the Year) Competition

### Point System
- Points awarded based on tournament placement
- Formula: `101 - placement`
  - 1st place = 100 points
  - 2nd place = 99 points
  - 3rd place = 98 points
  - etc.

### AOY Calculation Rules
- Only best 4 tournaments count toward AOY total
- Highest point total wins AOY title
- Tiebreaker: Most first-place finishes

Example:
```
Travis's Season:
Tournament 1: 1st place → 100 points ✅ (counts)
Tournament 2: 5th place → 96 points  ✅ (counts)
Tournament 3: 15th place → 86 points ✅ (counts)
Tournament 4: 3rd place → 98 points  ✅ (counts)
Tournament 5: 20th place → 81 points ❌ (dropped - worst)

AOY Total: 100 + 96 + 86 + 98 = 380 points
```

## 💰 Prize Structure

### Tournament Prizes
1. **Main Tournament Placement**
   - Based on total weight
   - Paid via `cash_payout` field

2. **Big Bass Prize**
   - One winner per tournament day
   - Paid via `big_bass_payout` field

3. **Boat Team Bonus**
   - Split between winning boater/co-angler team
   - Paid via `boat_weight_payout` field

## 📊 Data Model

### Tournament Results Table
Key fields in `tournament_results`:

| Field | Purpose | Notes |
|-------|---------|-------|
| `placement` | Final tournament position | Used for AOY points |
| `total_weight` | Total weight of fish | Primary ranking metric |
| `big_bass_lbs` | Weight of angler's biggest bass | One potential winner per day |
| `aoy_points` | Points for AOY race | 101 - placement |
| `cash_payout` | Main tournament winnings | Based on placement |
| `big_bass_payout` | Big bass bonus | Winner only |
| `boat_weight_payout` | Team competition bonus | Split between team |

## 📱 Trophy Cast Implementation

### Key Screens
1. **Tournament Results**
   - Shows placement, weight, earnings
   - Highlights big bass winner
   - Displays boat team winners

2. **AOY Standings**
   - Current rankings based on best 4
   - Points breakdown by tournament
   - Progress toward full season

3. **Member Profile**
   - Season earnings summary
   - Tournament history
   - Achievement records

---

*This document represents the official tournament logic for Denver Bassmasters. Other clubs using Trophy Cast may have different rules and scoring systems.*