# 🔍 Supabase Schema Research - Trophy Cast MVP

**Date:** October 17, 2025  
**Status:** Research Complete  
**Findings:** Schema Identified, Gaps Documented

---

## 📊 Existing Tables & Current Usage

### 1. **`tournament_results`** ✅ ACTIVE
**Current Purpose:** Tournament placement & performance data  
**Used In:** 
- `useDashboard()` - fetches last tournament, season stats, earnings
- `useMemberResults()` - all member tournament results
- `useTournamentResults()` - results by event

**Existing Fields:**
```sql
- member_id (string)
- member_name (string)
- event_date (date)
- lake (string)
- tournament_name (string)
- place (number)
- weight_lbs (number)
- aoy_points (number)
- cash_payout (string | number)
- big_fish (number)
- tournament_code (string)
- event_id (string)
```

**Current Status:**
- ✅ Data populated (from CSV imports in `/sql`)
- ✅ Queries working
- ⚠️ **PROBLEM:** No more DBM tournaments this season

---

### 2. **`events_public`** ✅ ACTIVE
**Current Purpose:** Upcoming events/tournaments  
**Used In:**
- `useDashboard()` - fetches next tournament
- Tournament calendar screens

**Existing Fields:**
```sql
- lake (string)
- event_date (date)
- tournament_name (string)
```

**Current Status:**
- ✅ Queryable
- ⚠️ **PROBLEM:** No future DBM tournaments (season over)

---

### 3. **`aoy_standings`** ✅ ACTIVE
**Current Purpose:** Annual Points-of-Year standings  
**Used In:**
- `useAOYStandings()` - AOY leaderboard

**Existing Fields:**
```sql
- member_id (string)
- aoy_rank (number)
- total_aoy_points (number)
- season_year (number)
```

**Current Status:**
- ✅ Data populated
- ✅ Used for leaderboards
- ⚠️ **PROBLEM:** Only tournament-based (no more tournaments this year)

---

### 4. **`profiles`** ✅ ACTIVE
**Current Purpose:** User authentication & profile data  
**Used In:**
- `AuthContext.tsx` - user profile management

**Existing Fields:**
```sql
- id (UUID)
- member_code (string)
- name (string)
- hometown (string)
- created_at (timestamp)
- avatar_url? (string)
```

**Recent Additions:**
```sql
- first_login_at? (timestamp)   [Added for MVP nav]
- is_complete? (boolean)        [Added for MVP nav]
```

**Current Status:**
- ✅ Working
- ✅ Extended for onboarding flow

---

## 🚨 Critical Gaps for Dashboard

### Gap 1: **No `catches` Table** ❌
**Problem:** Can't show "Catches this month" stat  
**Needed Fields:**
```sql
catches:
  - id (UUID, primary key)
  - angler_id (string, foreign key to profiles)
  - species (string) -- "Largemouth Bass", "Walleye", etc
  - weight_lbs (decimal)
  - location (string) -- "Lake Monroe", "Bear Lake"
  - caught_at (timestamp)
  - photo_url? (string) -- for Trophy Room
  - created_at (timestamp)
  
INDEX: (angler_id, caught_at DESC)
```

**Current State:** **NOT EXISTS**  
**Solution:** Create table + data upload

---

### Gap 2: **No `trips` / `fishing_trips` Table** ❌
**Problem:** Can't show "Plans: 2 upcoming trips" stat  
**Needed Fields:**
```sql
fishing_trips:
  - id (UUID, primary key)
  - angler_id (string, foreign key to profiles)
  - trip_name (string) -- "Lake Monroe with crew"
  - location (string)
  - planned_date (date)
  - attendees (array<string>) -- list of member_codes
  - status (enum: 'planned', 'completed', 'cancelled')
  - created_at (timestamp)

INDEX: (angler_id, planned_date DESC)
```

**Current State:** **NOT EXISTS**  
**Solution:** Create table + seed data

---

### Gap 3: **No `quests` / `challenges` Table** ❌
**Problem:** Can't show "Next Quest: Land a Marlin" with progress  
**Needed Fields:**
```sql
quests:
  - id (UUID, primary key)
  - angler_id (string, foreign key to profiles)
  - quest_name (string) -- "Land a Marlin"
  - description (string)
  - steps_total (number) -- 5
  - steps_completed (number) -- 3
  - status (enum: 'active', 'completed', 'archived')
  - reward? (string) -- badge, points
  - created_at (timestamp)
  - completed_at? (timestamp)

INDEX: (angler_id, status, created_at DESC)
```

**Current State:** **NOT EXISTS** (currently hardcoded in component)  
**Solution:** Create table + migrate to DB

---

### Gap 4: **No `activity_feed` Table** ❌
**Problem:** Can't show "Recent Catches" feed  
**Needed Fields:**
```sql
activity_feed:
  - id (UUID, primary key)
  - angler_id (string, foreign key)
  - activity_type (enum: 'catch', 'trophy', 'quest', 'tournament')
  - activity_data (jsonb) -- stores dynamic data
  - created_at (timestamp)

Example activity_data:
{
  "type": "catch",
  "species": "Largemouth Bass",
  "weight": 4.1,
  "location": "Lake Monroe",
  "photo_url": "..."
}

INDEX: (angler_id, created_at DESC)
```

**Current State:** **NOT EXISTS**  
**Solution:** Create table or compute from catches table

---

## 🎯 What Dashboard Really Needs (Post-Tournament Season)

### Current Stat Cards (Tournament-Based)
```
❌ Catches: 5          ← Works: Use NEW catches table
❌ Plans: 2            ← Works: Use NEW trips table
❌ Tournaments: 1      ← FAILS: No more tournaments
❌ Performance: ↑ 8%   ← Works: Calculate from catches
```

---

## 📝 Recommended Dashboard Pivot (No Tournaments)

### New Focus: **Personal Fishing Stats**

```
Row 1:
┌─────────────────────────┐
│ 🎣 LAST CATCH          │
│ 4.1 lb Largemouth      │
│ Oct 14 @ Lake Monroe   │
└─────────────────────────┘

Row 2:
┌──────────────┬──────────────┐
│ TOTAL CATCHES│ PERSONAL BEST│
│     12       │  5.2 lbs     │
└──────────────┴──────────────┘

Row 3:
┌──────────────┬──────────────┐
│ NEXT TRIP    │ RECENT AVG   │
│ Oct 22       │ 3.4 lbs      │
│ Lake Monroe  │ (last 5)     │
└──────────────┴──────────────┘

Row 4:
┌──────────────────────────────┐
│ ACTIVE QUEST: Land a Marlin  │
│ 3/5 Steps Complete           │
│ [Complete Step]              │
└──────────────────────────────┘

Recent Activity:
├─ Oct 14: 4.1 lb Largemouth 🎉
├─ Oct 12: Personal Best Updated 📈
└─ Oct 10: Completed Quest: 50+ Catch Streak
```

---

## 🛠️ Implementation Roadmap

### Phase 1: Create Essential Tables (TODAY)
```
CREATE TABLE catches (...)
CREATE TABLE fishing_trips (...)
CREATE TABLE quests (...)
```

### Phase 2: Upload Your Data
```
INSERT INTO catches VALUES (...)
INSERT INTO fishing_trips VALUES (...)
INSERT INTO quests VALUES (...)
```

### Phase 3: Wire Dashboard Queries
```
Update useDashboardStats() to query:
- catches (this month count)
- catches (personal best)
- fishing_trips (next trip)
- quests (active quest)
```

### Phase 4: Build Features
```
- Log Catch screen (insert into catches)
- Trip Planner (insert into fishing_trips)
- Quest Tracker (update quests table)
- Activity Feed (read from catches + activity_feed)
```

---

## 📊 Current Data Model Analysis

### What You HAVE
✅ Tournaments (historic, season over)  
✅ AOY Standings (tournament-based)  
✅ Profiles (users)  
✅ Tournament Results (archive)

### What You NEED
❌ Catches (daily fishing logs)  
❌ Trips (planned/completed fishing trips)  
❌ Quests (personal challenges/goals)  
❌ Activity Feed (social engagement)

---

## 🎣 Real Data You Need to Upload

### 1. **Member Catches**
- What fish did each member catch?
- When and where?
- Weight, species, photo?
- Personal best records?

**Source:** Members' fishing logs, photos, past catch records

### 2. **Planned Trips**
- What trips do members have scheduled?
- Who's going together?
- Where and when?
- Who confirmed?

**Source:** Members' calendar, group chats, trip planning

### 3. **Quests/Goals**
- What personal goals?
- What achievements?
- What milestones?
- Seasonal targets?

**Source:** Members' goals, club challenges, achievements

---

## 💾 Next Steps for You

### Immediate (This Session)
1. ✅ **Confirm:** You want to pivot from tournament-focus to personal fishing stats
2. ✅ **Share:** What catch/trip/quest data do you have available?
3. ✅ **Create:** I'll build the new tables in Supabase

### Short Term (Next Session)
1. Upload your real catches data
2. Upload member trip plans
3. Create quest/challenge definitions
4. Wire dashboard queries to new tables

### Medium Term
1. Build catch logging feature (with camera)
2. Build trip planning feature
3. Build quest tracking
4. Launch activity feed

---

## 🎯 What Should Dashboard Show WITHOUT Tournaments?

**Option A: Personal Achievement Focus**
- "You're crushing it! 12 catches this month"
- "Personal best: 5.2 lbs"
- "Next trip: Oct 22"

**Option B: Social/Crew Focus**
- "3 crew members fishing today"
- "Recent catches from your crew"
- "Who's available this weekend?"

**Option C: Goal/Quest Focus**
- "Land a Marlin (3/5 complete)"
- "50+ Catch Streak (47 so far!)"
- "Trophy Room (3 entries)"

---

## ❓ Questions to Answer

1. **Catches:** Do you have historical catch data for members?
2. **Trips:** Do you track planned fishing trips?
3. **Quests:** What personal challenges should exist?
4. **Activity:** What should the activity feed show?
5. **Social:** How should members share/compete without tournaments?

---

## 📋 Schema Summary

| Table | Status | Problem | Solution |
|-------|--------|---------|----------|
| tournament_results | ✅ | No more tournaments | Archive it |
| events_public | ✅ | No future events | Archive it |
| aoy_standings | ✅ | Tournament-based only | Keep for history |
| profiles | ✅ | Missing features | OK as-is |
| **catches** | ❌ | MISSING | Create + upload data |
| **fishing_trips** | ❌ | MISSING | Create + upload data |
| **quests** | ❌ | MISSING | Create + upload data |
| **activity_feed** | ❌ | MISSING | Create or compute |

---

**Next Step:** Answer the 5 questions above, and I'll:
1. Create the new tables
2. Design queries for dashboard
3. Update stat cards to use real data

What data do you have available? 🎣
