# 📋 Member Profile Screen Component - Design Preview

**Status:** Information Only (Not Yet Implemented)  
**Date:** October 18, 2025

---

## 🔍 RESEARCH FINDINGS - Supabase Data Structure

### Database Tables with Member Data:

**1. `aoy_standings` Table** ✅ (Has member names)
```sql
- member_id (text) - e.g., "DBM019"
- member_name (text) - e.g., "Tai Hunt"
- aoy_rank (number) - Current season rank
- total_aoy_points (number) - Points accumulated
- season_year (number) - e.g., 2025
- club_id (optional)
```

**2. `tournament_results` Table** ✅ (Performance data)
```sql
- member_id (text)
- event_date (date)
- lake (string)
- tournament_name (string)
- place (number) - Tournament placement
- weight_lbs (number) - Total catch weight
- aoy_points (number)
- cash_payout (string/number)
- big_fish (number)
```

**3. `tournament_members` Table** ✅
```sql
- member_id (text PRIMARY KEY)
- name (text)
- hometown (text)
- email (text)
- phone (text)
- created_at (timestamp)
```

**4. `profiles` Table**
```sql
- id (UUID)
- member_code (text) - e.g., "DBM019"
- name (text)
- hometown (text)
- avatar_url (optional)
- created_at (timestamp)
```

---

## 🎨 Member Profile Screen Component

### Location & Structure:
**File:** `screens/MemberProfileScreen.tsx` (NEW FILE)

### Component Signature:
```tsx
interface MemberProfileScreenProps {
  route?: {
    params?: {
      member_id: string;  // e.g., "DBM019"
      member_name?: string; // e.g., "Tai Hunt"
    }
  }
}

export function MemberProfileScreen({ route }: MemberProfileScreenProps) {
  const member_id = route?.params?.member_id;
  // ...
}
```

---

## 📐 UI Layout & Sections

### **SECTION 1: HERO HEADER**
```
┌─────────────────────────────────────┐
│                                     │
│      [Member Avatar/Photo]          │
│                                     │
│  Member Name (e.g., Tai Hunt)       │
│  DBM019 • DBM Secretary             │ ← From board role
│                                     │
│  ⭐ AOY Rank: #2 (1,250 pts)        │ ← From aoy_standings
│                                     │
└─────────────────────────────────────┘
```

**Data Fetched:**
- From `aoy_standings`: member_name, aoy_rank, total_aoy_points
- From ClubInfo BOARD_MEMBERS: member_role (if board member)

---

### **SECTION 2: STATS GRID** (2x2 or 1x4)
```
┌──────────────────────────────────────┐
│  🎣 Total Catches    │  🏆 Best Place    │
│       15              │       2nd         │
│                       │                   │
├──────────────────────┼──────────────────┤
│  ⚖️  Best Weight      │  💰 Earnings      │
│    18.5 lbs          │    $450.00        │
│                      │                   │
└──────────────────────┴──────────────────┘
```

**Data Fetched:**
- Total Catches: COUNT from tournament_results where member_id = "DBM019"
- Best Place: MIN(place) from tournament_results
- Best Weight: MAX(weight_lbs) from tournament_results
- Earnings: SUM(cash_payout) from tournament_results

---

### **SECTION 3: TOURNAMENT HISTORY**
```
┌─────────────────────────────────────┐
│  Tournament Results (Scrollable)    │
├─────────────────────────────────────┤
│ 🎣 Pueblo Lake Championship        │
│    Oct 12, 2025 • Pueblo Lake       │
│    2nd Place • 18.5 lbs • 50 pts    │
│    Earnings: $250                   │
├─────────────────────────────────────┤
│ 🎣 Cherry Creek Open               │
│    Sep 28, 2025 • Cherry Creek      │
│    5th Place • 15.2 lbs • 35 pts    │
│    Earnings: $100                   │
├─────────────────────────────────────┤
│ 🎣 Bear Lake Tournament             │
│    Sep 14, 2025 • Bear Lake         │
│    3rd Place • 16.8 lbs • 42 pts    │
│    Earnings: $180                   │
└─────────────────────────────────────┘
```

**Data Fetched:**
- From `tournament_results`: 
  - Ordered by event_date DESC (most recent first)
  - Limit: 10-15 results
  - Fields: tournament_name, event_date, lake, place, weight_lbs, aoy_points, cash_payout

---

### **SECTION 4: SEASON SUMMARY** (Optional)
```
┌─────────────────────────────────────┐
│  2025 Season Summary                │
├─────────────────────────────────────┤
│  Total Tournaments: 8               │
│  Average Place: 3.5                 │
│  Total Weight: 127.3 lbs            │
│  Season Earnings: $1,050.00         │
│  AOY Points: 1,250                  │
│  Current Rank: #2                   │
└─────────────────────────────────────┘
```

---

## 🔌 React Query Hooks Needed

### **New Hook: `useMemberProfile(memberId: string)`**
```tsx
export function useMemberProfile(memberId: string) {
  return useQuery({
    queryKey: ['member-profile', memberId],
    queryFn: async () => {
      // Get AOY standing
      const { data: aoyData } = await fetchAOYStandingsByMember(memberId);
      
      // Get tournament results
      const { data: results } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('member_id', memberId)
        .order('event_date', { ascending: false });
      
      return {
        aoy: aoyData,
        tournaments: results || [],
      };
    },
  });
}
```

### **Where to Add:**
File: `lib/hooks/useQueries.ts` (already has similar hooks)

---

## 🧩 Component Implementation Outline

```tsx
/**
 * MemberProfileScreen.tsx - Individual member profile & tournament history
 * 
 * Displays:
 * - Member info (name, role, avatar)
 * - AOY rank & points
 * - Performance stats (catches, best place, earnings, etc)
 * - Tournament history list
 * - Season summary
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useMemberProfile } from '../lib/hooks/useQueries';
import { COLORS } from '../theme/colors'; // Navy + Gold theme

export function MemberProfileScreen({ route }) {
  const memberId = route?.params?.member_id;
  const { data: profile, isLoading, error } = useMemberProfile(memberId);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Failed to load member profile</Text>
      </View>
    );
  }

  const { aoy, tournaments } = profile;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. HERO HEADER */}
      <View style={styles.heroSection}>
        <Text style={styles.memberName}>{aoy?.member_name}</Text>
        <Text style={styles.memberId}>{memberId}</Text>
        <Text style={styles.memberRole}>DBM Secretary</Text>
        
        <View style={styles.aoyBadge}>
          <Text style={styles.aoyText}>
            ⭐ Rank #{aoy?.aoy_rank} • {aoy?.total_aoy_points} pts
          </Text>
        </View>
      </View>

      {/* 2. STATS GRID */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🎣"
          label="Total Catches"
          value={tournaments?.length || 0}
        />
        <StatCard
          icon="🏆"
          label="Best Place"
          value={Math.min(...tournaments.map(t => t.place)) || 'N/A'}
        />
        <StatCard
          icon="⚖️"
          label="Best Weight"
          value={`${Math.max(...tournaments.map(t => t.weight_lbs || 0))} lbs`}
        />
        <StatCard
          icon="💰"
          label="Total Earnings"
          value={`$${tournaments.reduce((sum, t) => sum + (t.cash_payout || 0), 0).toFixed(2)}`}
        />
      </View>

      {/* 3. TOURNAMENT HISTORY */}
      <View style={styles.tournamentsSection}>
        <Text style={styles.sectionTitle}>Tournament History</Text>
        {tournaments.map((tournament, idx) => (
          <TournamentResultCard key={idx} result={tournament} />
        ))}
      </View>

      {/* 4. SEASON SUMMARY */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>2025 Season</Text>
        <SummaryRow label="Tournaments" value={tournaments.length} />
        <SummaryRow 
          label="Total Weight" 
          value={`${tournaments.reduce((sum, t) => sum + (t.weight_lbs || 0), 0)} lbs`} 
        />
        <SummaryRow 
          label="Earnings" 
          value={`$${tournaments.reduce((sum, t) => sum + (t.cash_payout || 0), 0).toFixed(2)}`} 
        />
      </View>
    </ScrollView>
  );
}

// Sub-components...
function StatCard({ icon, label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TournamentResultCard({ result }) {
  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.tournamentName}>{result.tournament_name}</Text>
        <Text style={styles.place}>Place: #{result.place}</Text>
      </View>
      <Text style={styles.resultMeta}>
        {result.event_date} • {result.lake}
      </Text>
      <View style={styles.resultStats}>
        <Text style={styles.weight}>{result.weight_lbs} lbs</Text>
        <Text style={styles.points}>{result.aoy_points} pts</Text>
        <Text style={styles.earnings}>${result.cash_payout || 0}</Text>
      </View>
    </View>
  );
}

// Styles...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  // ... define all styles here
});
```

---

## 🔗 Navigation Integration

### **Where to Add Route:**

**File:** `app.json` or `RootNavigator.tsx`

```tsx
// Add to stack navigator or modal:
<Stack.Screen
  name="MemberProfile"
  component={MemberProfileScreen}
  options={{
    headerShown: true,
    headerTitle: 'Member Profile',
    headerTintColor: COLORS.gold,
    headerStyle: { backgroundColor: COLORS.navy },
  }}
/>
```

### **How to Navigate from Board Member:**

**In ClubInfo.tsx (inside board member press handler):**
```tsx
const navigation = useNavigation();

const handleBoardMemberPress = (memberName: string) => {
  navigation.navigate('MemberProfile', {
    member_id: memberIdLookup[memberName], // Need to map names to IDs
    member_name: memberName,
  });
};
```

---

## 📊 Data Flow Diagram

```
MemberProfileScreen (component)
    ↓
useMemberProfile(member_id) (hook)
    ↓
┌─────────────────────┐
│  fetchAOYStandings  │ ← Get rank, points, member_name
│  (existing hook)    │
└─────────────────────┘
    ↓
┌─────────────────────┐
│ tournament_results  │ ← Get all tournaments for member
│ .eq('member_id')    │
│ .order('event_date')│
└─────────────────────┘
    ↓
Display in UI:
- Hero section (name, rank, points)
- Stats grid (catches, best place, earnings)
- Tournament list (scrollable history)
- Season summary (totals)
```

---

## ✅ What's Already Available

These reusable utilities already exist:

1. **Query Functions:**
   - `fetchAOYStandings()` - gets standings with member names ✅
   - `fetchAOYStandingsByMember(memberId)` - gets single member ranking ✅

2. **Hooks (useQueries.ts):**
   - `useAOYStandings()` - React Query wrapper ✅
   - Similar query patterns already established ✅

3. **Components:**
   - Card components with Navy + Gold theme ✅
   - TopBar with back button ✅
   - ScrollView layouts ✅

4. **Navigation:**
   - useNavigation hook available ✅
   - BottomTabs already set up ✅

---

## 🎯 Summary

### To Implement Member Profiles:

**New Files Needed:**
1. `screens/MemberProfileScreen.tsx` (main component)
2. Update `lib/hooks/useQueries.ts` (add useMemberProfile hook)

**Files to Modify:**
1. `features/club/ClubInfo.tsx` (add press handlers to board members)
2. Navigation config (add MemberProfile route)

**Data Already Available:**
- ✅ All required Supabase tables exist
- ✅ Query functions are ready
- ✅ Theme colors defined
- ✅ UI component patterns established

**User Flow:**
```
User taps board member in Club tab
    ↓
Pressed: "Tai Hunt" (DBM019)
    ↓
Navigate to MemberProfileScreen
    ↓
Load: AOY ranking + tournament history
    ↓
Display: Profile card + stats + tournament list
```

---

## 💡 Key Design Decisions

1. **Reuse existing hooks** - No need to reinvent data fetching
2. **Navy + Gold theme** - Match existing app styling
3. **Scrollable list** - Handle many tournament results
4. **Loading states** - Show spinner while fetching
5. **Error handling** - Graceful fallback if data missing

This design leverages what's already built and follows the established patterns in your app! 🎣
