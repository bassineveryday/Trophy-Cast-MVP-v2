# 🎣 Hero Banner Component - Implementation Guide

**Date:** October 12, 2025  
**Component:** `components/HeroBanner.tsx`  
**Status:** ✅ **COMPLETE & INTEGRATED**

---

## 📋 **Overview**

The Hero Banner is a personalized dashboard component that welcomes the user and displays their key tournament statistics at a glance. It features Trophy Cast's signature teal gradient background with four stat badges showing real-time data from the Supabase database.

---

## 🎨 **Design Features**

### **Visual Design**
- **Teal Gradient Background:** Trophy Cast's brand colors (#0891b2 → #06b6d4 → #22d3ee)
- **Rounded Corners:** 16px border radius for modern look
- **Shadow Depth:** Enhanced shadows for card elevation
- **White Stat Badges:** Semi-transparent white badges with subtle shadows
- **Icon Integration:** Ionicons for visual hierarchy

### **Layout Structure**
```
┌─────────────────────────────────────────────────────┐
│  Welcome back, Tai Hunt!                            │
│  Denver Bassmasters Secretary                       │
│                                                     │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                  │
│  │ 🏆 │  │ 🎣 │  │ 📊 │  │ 🏅 │                  │
│  │  2 │  │  8 │  │6.54│  │ #3 │                  │
│  │Wins│  │Tour│  │Bass│  │AOY │                  │
│  └────┘  └────┘  └────┘  └────┘                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 **Component API**

### **Props Interface**

```typescript
interface HeroBannerProps {
  /**
   * Override for welcome name (defaults to profile name)
   */
  name?: string;
  
  /**
   * Achievement subtitle (defaults to "Denver Bassmasters Member")
   */
  subtitle?: string;
}
```

### **Usage Examples**

#### **Basic Usage (Auto Data)**
```tsx
import HeroBanner from '../components/HeroBanner';

function HomeScreen() {
  return <HeroBanner />;
}
```

#### **Custom Subtitle**
```tsx
<HeroBanner subtitle="Denver Bassmasters Secretary" />
```

#### **Override Name**
```tsx
<HeroBanner 
  name="John Smith" 
  subtitle="Tournament Director"
/>
```

---

## 📊 **Data Integration**

### **Real-Time Stats**

The component pulls live data from Supabase using React Query hooks:

#### **1. Tournament Wins (🏆)**
- **Source:** `useDashboard` hook → `seasonStats.wins`
- **Query:** Counts `place === 1` in 2025 tournament_results
- **Display:** Integer count (e.g., "2")

#### **2. Total Tournaments (🎣)**
- **Source:** `useDashboard` hook → `seasonStats.tournaments`
- **Query:** Total tournament_results entries for 2025
- **Display:** Integer count (e.g., "8")

#### **3. Big Bass (📊)**
- **Source:** `useDashboard` hook → `seasonStats.bigFish`
- **Query:** Max `big_fish` weight from tournament_results
- **Display:** Decimal pounds (e.g., "6.54 lbs")
- **Note:** Currently shows season best, can be updated to all-time best

#### **4. AOY Rank (🏅)**
- **Source:** `useDashboard` hook → `aoyData.aoy_rank`
- **Query:** `aoy_standings` table for current member
- **Display:** Rank with # prefix (e.g., "#3") or "N/A"

### **Data Flow Diagram**

```
AuthContext (profile.member_code)
         ↓
  useDashboard(member_code)
         ↓
    Supabase Queries:
    ├─ tournament_results (2025 season)
    │  ├─ Count wins (place === 1)
    │  ├─ Count tournaments
    │  └─ Max big_fish weight
    └─ aoy_standings
       └─ Get current rank
         ↓
   HeroBanner Display
```

---

## 🎯 **Color Palette**

### **Gradient (Trophy Cast Teal)**
```typescript
['#0891b2', '#06b6d4', '#22d3ee']
// Cyan 600 → Cyan 500 → Cyan 400 (Tailwind equivalents)
```

### **Text Colors**
- **Welcome Text:** `#ffffff` (white with shadow)
- **Subtitle:** `rgba(255, 255, 255, 0.95)` (off-white)
- **Stat Values:** `#0f172a` (slate 900)
- **Stat Labels:** `#64748b` (slate 500)

### **Badge Colors**
- **Background:** `rgba(255, 255, 255, 0.95)` (semi-transparent white)
- **Icon Container:** `rgba(8, 145, 178, 0.1)` (10% teal)
- **Icon Color:** `#0891b2` (Trophy Cast teal)

---

## 📱 **Responsive Design**

### **Breakpoints**

#### **Mobile (< 768px)**
- Full width layout
- 12px gap between stat badges
- Smaller padding (24px)
- Stack badges in row with equal flex

#### **Tablet/Desktop (≥ 768px)**
- Max width: 1200px centered
- 20px gap between stat badges
- Larger badges with more breathing room
- Maintains horizontal row layout

### **Platform-Specific Rendering**

#### **Web**
```tsx
// Uses CSS gradient
<View style={styles.gradientWeb} />
// background: 'linear-gradient(135deg, ...)'
```

#### **Native (iOS/Android)**
```tsx
// Uses expo-linear-gradient
<LinearGradient
  colors={gradientColors}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
/>
```

---

## 🎨 **Styling Details**

### **Shadow System**

#### **Container Shadow**
```typescript
shadowColor: '#000'
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.15
shadowRadius: 12
elevation: 6  // Android
```

#### **Stat Badge Shadow**
```typescript
shadowColor: '#000'
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 4
elevation: 3  // Android
```

### **Typography**

#### **Welcome Text**
- **Size:** 28px
- **Weight:** 700 (bold)
- **Color:** White with text shadow
- **Shadow:** `rgba(0, 0, 0, 0.2)` at 1px offset

#### **Subtitle**
- **Size:** 16px
- **Weight:** 500 (medium)
- **Color:** Off-white with text shadow

#### **Stat Value**
- **Size:** 20px
- **Weight:** 700 (bold)
- **Color:** Slate 900

#### **Stat Label**
- **Size:** 11px
- **Weight:** 600 (semi-bold)
- **Color:** Slate 500
- **Transform:** Uppercase
- **Letter Spacing:** 0.5px

---

## 🏗️ **Component Architecture**

### **Component Structure**

```tsx
HeroBanner (Main Component)
├─ useAuth() - Get current user profile
├─ useDashboard() - Fetch tournament stats
├─ useAOYStandings() - Get rank data (fallback)
├─ useMemo() - Calculate stats from data
└─ Render:
    ├─ Container with gradient
    ├─ Header (welcome + subtitle)
    └─ Stats Row
        ├─ StatBadge (Wins)
        ├─ StatBadge (Tournaments)
        ├─ StatBadge (Big Bass)
        └─ StatBadge (AOY Rank)
```

### **Sub-Components**

#### **StatBadge**
```tsx
interface StatBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
}
```

**Features:**
- White card with rounded corners
- Circular icon container with teal background
- Value displayed prominently
- Uppercase label below

---

## 🚀 **Integration**

### **Added to FishingThemedHomeScreen**

```tsx
// screens/FishingThemedHomeScreen.tsx

import HeroBanner from '../components/HeroBanner';

export default function FishingThemedHomeScreen() {
  // ... existing code ...

  return (
    <View style={styles.container}>
      <FishingDecorations />
      
      {/* Header */}
      <View style={styles.header}>...</View>

      {/* Main Content */}
      <ScrollView>
        {/* 🆕 Hero Banner - ADDED HERE */}
        <HeroBanner subtitle="Denver Bassmasters Secretary" />

        {/* Rest of dashboard content... */}
        <Animated.View>
          {/* Leaderboard, widgets, etc. */}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
```

### **Position in UI Hierarchy**
1. **Header** (Logo + Theme Toggle)
2. **Hero Banner** ← YOU ARE HERE
3. **Two-Column Layout**
   - Left: Top Anglers Leaderboard
   - Right: Daily Challenge + Trophy Rack

---

## 🔄 **Data Updates**

### **Real-Time Refresh**

The component automatically updates when:
1. **Parent triggers refetch:** ScrollView's RefreshControl calls `useDashboard().refetch()`
2. **React Query cache updates:** 5-minute stale time (default)
3. **User navigates back:** Query re-runs on screen focus

### **Manual Refresh**
Users can pull-to-refresh on the home screen to update all data including the Hero Banner stats.

---

## 🎯 **Future Enhancements**

### **Planned Features**
1. **Animated Counter:** Smooth count-up animation when stats load
2. **Trophy Icons:** Show gold/silver/bronze icons for wins
3. **Big Bass Image:** Optional fish species icon next to weight
4. **Tap Actions:** Make badges tappable to navigate to details
5. **Seasonal Themes:** Different gradients for spring/summer/fall/winter
6. **Achievement Badges:** Show unlock badges in banner

### **Data Enhancements**
1. **All-Time Big Bass:** Toggle between season best and career best
2. **Win Percentage:** Calculate win rate from tournament count
3. **Recent Trend:** Up/down arrow for rank movement
4. **Earnings Display:** Add total season earnings stat

---

## 📝 **Customization Guide**

### **Change Gradient Colors**

```tsx
// In HeroBanner.tsx
const gradientColors = [
  '#0891b2',  // Start color
  '#06b6d4',  // Middle color
  '#22d3ee',  // End color
] as const;
```

**Suggested Alternatives:**
- **Blue:** `['#1e40af', '#3b82f6', '#60a5fa']`
- **Green:** `['#047857', '#10b981', '#34d399']`
- **Purple:** `['#7c3aed', '#8b5cf6', '#a78bfa']`

### **Change Stat Icons**

```tsx
// In HeroBanner return statement
<StatBadge icon="trophy" ... />      // Change to any Ionicons name
<StatBadge icon="fish" ... />
<StatBadge icon="analytics" ... />
<StatBadge icon="podium" ... />
```

**Icon Options:**
- `star` - Rating/favorite
- `ribbon` - Award
- `medal` - Achievement
- `flame` - Hot streak
- `trending-up` - Progress

### **Add New Stat Badge**

```tsx
// 1. Calculate stat in useMemo
const stats = React.useMemo(() => {
  return {
    // ... existing stats ...
    earnings: dashboardData?.earnings || 0,  // NEW STAT
  };
}, [dashboardData]);

// 2. Add to stats row
<StatBadge
  icon="cash"
  value={`$${stats.earnings}`}
  label="Earnings"
/>
```

---

## ✅ **Completion Checklist**

- [x] Component created (`components/HeroBanner.tsx`)
- [x] TypeScript interfaces defined
- [x] Real data integration via `useDashboard`
- [x] Platform-specific gradient rendering
- [x] Responsive design for mobile/desktop
- [x] Integrated into FishingThemedHomeScreen
- [x] TypeScript compilation verified (0 errors)
- [x] Documentation complete

---

## 🎉 **Summary**

**The Hero Banner component is:**
- ✅ **Live & Integrated** - Added to home screen at the top
- ✅ **Data-Driven** - Pulls real stats from Supabase
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Brand-Aligned** - Uses Trophy Cast teal gradient
- ✅ **Production-Ready** - Zero TypeScript errors

**Users now see:**
- Personalized welcome message with their name
- Their role/title (e.g., "Denver Bassmasters Secretary")
- Real-time tournament stats (wins, tournaments, big bass, AOY rank)
- Beautiful teal gradient matching Trophy Cast branding

---

**🎣 The Hero Banner brings Trophy Cast's home screen to life with personalized, data-driven greetings! 🏆**
