# 🔍 Board Member to Profile Linking - Research Complete

**Date:** October 18, 2025  
**Status:** Research Complete ✅  
**Goal:** Link Board of Directors members to member profiles

---

## 📊 Current Board Members Data

**Location:** `features/club/ClubInfo.tsx` (lines 38-125)

**Currently Hardcoded as:**
```tsx
const BOARD_MEMBERS = [
  {
    id: 1,
    name: 'Jeremiah Hofstetter',
    role: 'DBM President',
    imageUrl: '...'
  },
  {
    id: 2,
    name: 'Bobby Martin',
    role: 'DBM Vice President',
    imageUrl: '...'
  },
  {
    id: 3,
    name: 'Tai Hunt',           // ✅ Your profile - DBM019
    role: 'DBM Secretary',
    imageUrl: '...'
  },
  {
    id: 4,
    name: 'Gordon Phair',
    role: 'DBM Treasurer',
    imageUrl: '...'
  },
  {
    id: 5,
    name: 'Howard Binkley',
    role: 'DBM Tournament Director',
    imageUrl: '...'
  },
  {
    id: 6,
    name: 'Justin Apfel',
    role: 'DBM Conservation Director',
    imageUrl: '...'
  },
  {
    id: 7,
    name: 'Cliff Purslow',
    role: 'DBM Juniors Director',
    imageUrl: '...'
  },
  {
    id: 8,
    name: 'Bill Cancellieri',
    role: 'DBM High School Director',
    imageUrl: '...'
  },
]
```

---

## 🗄️ Supabase Database Tables

### **1. `profiles` Table** ✅
**Location:** Database - public.profiles  
**Structure:**
```sql
- id (UUID)
- member_code (text) - e.g., "DBM019", "DBM001"
- name (text) - e.g., "Tai Hunt"
- hometown (text)
- created_at (timestamp)
- avatar_url? (string, optional)
- first_login_at? (timestamp)
- is_complete? (boolean)
```

**Where Used:**
- `AuthContext.tsx` - user authentication
- `FishingThemedHomeScreen` - home dashboard
- All profile-related screens

**Sample Data:**
```
member_code: "DBM019"
name: "Tai Hunt"
hometown: "Denver, CO"
```

### **2. `tournament_members` Table** ✅
**Location:** Database - public.tournament_members  
**Structure:**
```sql
- member_id (text PRIMARY KEY) - e.g., "DBM019"
- name (text)
- hometown (text)
- email (text)
- phone (text)
- created_at (timestamp)
```

**Purpose:** General member information for tournament participation

### **3. `aoy_standings` Table** ✅
**Location:** Database - public.aoy_standings  
**Structure:**
```sql
- member_id (text PRIMARY KEY)
- aoy_rank (number)
- total_aoy_points (number)
- season_year (number)
- member_name (text, optional)
```

**Purpose:** Annual Points-of-Year standings/leaderboard

---

## 🔗 Current Architecture

### **File Structure:**
```
lib/
  └── supabase.ts                 # Supabase client configuration
hooks/
  └── useQueries.ts              # React Query hooks for data fetching
features/
  ├── club/
  │   └── ClubInfo.tsx            # Club info + Board Members (hardcoded)
  └── board/
      └── BoardOfDirectors.tsx    # Separate board screen (currently unused)
screens/
  └── FishingThemedHomeScreen.tsx # Main dashboard
```

### **Supabase Client Setup:**
**Location:** `lib/supabase.ts`
```tsx
// Uses environment variables:
// - EXPO_PUBLIC_SUPABASE_URL
// - EXPO_PUBLIC_SUPABASE_ANON_KEY

// Exports: supabase client object with:
// - supabase.from(table).select(...)
// - supabase.auth.*
```

### **React Query Hooks:**
**Location:** `lib/hooks/useQueries.ts`
- `useAOYStandings()` - all standings
- `useAOYStandingsByMember(memberId)` - single member
- `useDashboard(memberId)` - dashboard data
- `useMemberResults(memberId)` - tournament results

---

## 🎯 What We Need to Do

### **Goal:**
Make each Board Member clickable → Navigate to their profile screen

### **Implementation Steps:**

1. **Add member_id to BOARD_MEMBERS data**
   ```tsx
   const BOARD_MEMBERS = [
     {
       id: 1,
       name: 'Jeremiah Hofstetter',
       role: 'DBM President',
       member_id: 'DBM001',  // ← ADD THIS
       imageUrl: '...'
     },
     // ... etc
     {
       id: 3,
       name: 'Tai Hunt',
       role: 'DBM Secretary',
       member_id: 'DBM019',  // ← YOUR ID
       imageUrl: '...'
     },
   ]
   ```

2. **Create Board Member Card Component** (inside ClubInfo.tsx)
   - Display member photo, name, role
   - Make it a Pressable/TouchableOpacity
   - Pass `member_id` to onPress handler

3. **Create Member Profile Screen** (if doesn't exist)
   - Show member details: name, role, stats
   - Fetch member data from `profiles` + `aoy_standings`
   - Link to tournament results

4. **Add Navigation Route**
   - Add to `RootNavigator` or appropriate stack
   - Route to MemberProfileScreen with `member_id` parameter

5. **Update ClubInfo.tsx**
   - Import useNavigation hook
   - Navigate when board member is tapped
   - Pass member_id to the route

---

## 📱 Existing Navigation Structure

**File:** `navigation/BottomTabs.tsx`
**Current Tabs:**
1. Home - FishingThemedHomeScreen
2. Log Catch - Coming Soon
3. AI Coach - Coming Soon  
4. DBM - ClubInfo (Board in this screen)
5. Trophy Room - Coming Soon

**How Navigation Works:**
- Uses `@react-navigation/bottom-tabs` for tab navigator
- Main navigator in `app.json` or RootNavigator
- Can add modal/stack screens for member profiles

---

## 🔑 Key Member IDs to Map

Based on the hardcoded board members and tests:

| Name | Member ID | Current Role |
|------|-----------|--------------|
| Jeremiah Hofstetter | DBM001(?) | DBM President |
| Bobby Martin | DBM002(?) | DBM Vice President |
| Tai Hunt | **DBM019** ✅ | DBM Secretary |
| Gordon Phair | DBM004(?) | DBM Treasurer |
| Howard Binkley | DBM005(?) | DBM Tournament Director |
| Justin Apfel | DBM006(?) | DBM Conservation Director |
| Cliff Purslow | DBM007(?) | DBM Juniors Director |
| Bill Cancellieri | DBM008(?) | DBM High School Director |

**Note:** Need to verify exact member IDs in Supabase `profiles` table

---

## ✅ Required Supabase Tables

All tables exist and are ready:
- ✅ `profiles` - User authentication & basic info
- ✅ `tournament_members` - Tournament participation data
- ✅ `aoy_standings` - Leaderboard/ranking data
- ✅ `tournament_results` - Performance data

---

## 🚀 Next Steps

1. **Verify member IDs** in Supabase database
2. **Update BOARD_MEMBERS** with correct member_ids
3. **Create MemberProfileScreen** component
4. **Add navigation** from board member → profile
5. **Make board members clickable** in ClubInfo
6. **Test navigation** - click Tai Hunt → see DBM019 profile

---

## 📞 Files to Modify

**Priority Order:**
1. `features/club/ClubInfo.tsx` - Add member_id, make clickable
2. `screens/MemberProfileScreen.tsx` - Create (new file)
3. `navigation/` - Add route for member profile
4. `lib/hooks/useQueries.ts` - Add member profile hook if needed

**Already Set Up (No changes needed):**
- `lib/supabase.ts` - Supabase client ✅
- `profiles` table - User data storage ✅
- React Query - Data fetching framework ✅
