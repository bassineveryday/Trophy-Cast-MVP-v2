# 📊 Stat Cards - Quick Reference

**Status:** ✅ Complete and Ready  
**Files Created:** 3  
**Lines of Code:** ~242  
**No Breaking Changes:** ✅

---

## 🎯 What You Get

### StatCard Component
```tsx
import { StatCard } from '@/components/StatCard';

<StatCard
  label="Catches"
  value={12}
  sublabel="this month"
  icon={<Ionicons name="fish" size={18} color="#C9A646" />}
  loading={false}
  onPress={() => console.log('Tapped!')}
  testID="stat-catches"
/>
```

### DashboardStats Grid
```tsx
import { DashboardStats } from '@/features/home/DashboardStats';

<DashboardStats />
// Renders 2×2 grid automatically
```

### Hook for Data
```tsx
import { useDashboardStats } from '@/features/home/useDashboardStats';

const { data, loading } = useDashboardStats();
// data.catches, data.plans, data.tournaments, data.performanceText
```

---

## 📁 Files

```
components/
  └─ StatCard.tsx              (84 lines)

features/
  └─ home/
     ├─ DashboardStats.tsx     (69 lines)
     └─ useDashboardStats.ts   (89 lines)

docs/
  └─ STAT-CARDS-IMPLEMENTATION.md  (Full guide)
```

---

## 🚀 Integration (5 minutes)

### Step 1: Import
```tsx
import { DashboardStats } from '@/features/home/DashboardStats';
```

### Step 2: Add to Home Screen
```tsx
export default function HomeScreen() {
  return (
    <ScrollView>
      <HeroBanner />
      <DashboardStats />  {/* ← Add this */}
      {/* Rest of screen */}
    </ScrollView>
  );
}
```

### Step 3: Done!
The grid will:
- ✅ Show 4 stat cards
- ✅ Display loading spinners
- ✅ Navigate on tap
- ✅ Work with accessibility

---

## 📊 Grid Layout

```
┌──────────────┬──────────────┐
│ 🎣 Catches   │ 📅 Plans    │
│    5         │    2        │
│ this month   │ upcoming    │
├──────────────┼──────────────┤
│ 🏆 Tourney   │ 📈 Perform  │
│    1         │   ↑ 8%      │
│ next 30d     │ last 5 trips│
└──────────────┴──────────────┘
```

---

## 🎨 Styling

**Colors:**
- Background: `#0F2238` (dark navy)
- Border: `#1A2A3F` (lighter navy)
- Icon: `#C9A646` (gold)
- Text: `#E7ECF2` (light)
- Label: `#9AA4B2` (gray)

**Sizes:**
- Card padding: `14px`
- Border radius: `16px`
- Gap between cards: `12px`
- Icon size: `18px`
- Value font: `22px / 700 weight`

---

## ✅ Features

- ✅ Reusable `StatCard` component
- ✅ 2×2 responsive grid
- ✅ Loading state (spinner)
- ✅ Pressable (highlight on tap)
- ✅ Full accessibility (WCAG)
- ✅ testIDs for QA
- ✅ Mock data included
- ✅ Ready for Supabase
- ✅ Brand colors throughout
- ✅ Zero breaking changes

---

## 🔌 Wire Real Data

Replace mock in `useDashboardStats.ts`:

```tsx
// TODO: Replace with Supabase queries
const mockStats = {
  catches: 5,    // ← Query catches this month
  plans: 2,      // ← Query trips next 30d
  tournaments: 1, // ← Query tournaments next 30d
  performanceText: '↑ 8%', // ← Calculate from last-5 vs prev-5
  performanceSub: 'last 5 trips',
};
```

**Queries in docs/STAT-CARDS-IMPLEMENTATION.md**

---

## 🧪 Test It

```bash
npm start
# Should see 4 cards with values
# Tap each → console logs
# Loading spinner appears briefly
```

---

**Ready to integrate!** 🎉
