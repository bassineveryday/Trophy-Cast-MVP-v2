# 🎣 Hero Banner - Quick Reference

**Component:** `components/HeroBanner.tsx`  
**Status:** ✅ LIVE on Home Screen  
**Commit:** a356c56

---

## 📸 What It Looks Like

```
╔═══════════════════════════════════════════════════════════╗
║  🌊 TEAL GRADIENT BACKGROUND (#0891b2 → #22d3ee)        ║
║                                                           ║
║  Welcome back, Tai Hunt!                                  ║
║  Denver Bassmasters Secretary                             ║
║                                                           ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ ║
║  │    🏆    │  │    🎣    │  │    📊    │  │    🏅    │ ║
║  │    2     │  │    8     │  │  6.54    │  │    #3    │ ║
║  │   WINS   │  │   TOUR   │  │   BASS   │  │   AOY    │ ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 🚀 Quick Facts

| Feature | Detail |
|---------|--------|
| **Location** | Top of Home Screen (below header) |
| **Data Source** | Real-time from Supabase via `useDashboard()` |
| **Colors** | Trophy Cast Teal Gradient |
| **Stats** | 4 badges: Wins, Tournaments, Big Bass, AOY Rank |
| **Responsive** | Yes - adapts to mobile/desktop |
| **TypeScript** | ✅ Fully typed, 0 errors |

---

## 🎯 Stats Displayed

### 🏆 **Tournament Wins**
- Counts `place === 1` in 2025 season
- Example: "2"

### 🎣 **Total Tournaments**
- Total tournament_results for member in 2025
- Example: "8"

### 📊 **Big Bass**
- Max `big_fish` weight from season
- Example: "6.54 lbs"

### 🏅 **AOY Rank**
- Current rank from `aoy_standings`
- Example: "#3" or "N/A"

---

## 💻 Usage

### **Basic (Auto Data)**
```tsx
<HeroBanner />
```

### **With Custom Subtitle**
```tsx
<HeroBanner subtitle="Denver Bassmasters Secretary" />
```

### **Override Name**
```tsx
<HeroBanner name="John Smith" subtitle="Tournament Director" />
```

---

## 🎨 Customization

### **Change Colors**
Edit `gradientColors` in `HeroBanner.tsx`:
```tsx
const gradientColors = ['#0891b2', '#06b6d4', '#22d3ee'] as const;
```

### **Change Icons**
Modify icon props in stat badges:
```tsx
<StatBadge icon="trophy" ... />  // Change to any Ionicons name
```

### **Add New Stat**
1. Calculate in `useMemo()`
2. Add `<StatBadge />` to row

---

## 📱 Screens

- ✅ **Home Screen** (FishingThemedHomeScreen.tsx)
- Position: After header, before leaderboard
- Fully integrated with pull-to-refresh

---

## 🔗 Related Files

- **Component:** `components/HeroBanner.tsx`
- **Home Screen:** `screens/FishingThemedHomeScreen.tsx`
- **Data Hook:** `lib/hooks/useQueries.ts` (useDashboard)
- **Auth Context:** `lib/AuthContext.tsx` (profile)
- **Documentation:** `HERO-BANNER-IMPLEMENTATION.md`

---

## ✅ Checklist

- [x] Component created with TypeScript
- [x] Real data integration (useDashboard)
- [x] Platform-specific gradients (web CSS + native LinearGradient)
- [x] Responsive design (mobile + desktop)
- [x] Integrated into home screen
- [x] TypeScript compilation clean
- [x] Documentation complete
- [x] Committed & pushed to GitHub

---

## 🎉 Result

**Users now see a personalized welcome banner with:**
- Their name ("Welcome back, Tai Hunt!")
- Their role/title
- Real tournament stats updated live
- Beautiful Trophy Cast teal gradient
- Modern, professional design

**Perfect for engaging users immediately when they open the app!** 🏆🎣
