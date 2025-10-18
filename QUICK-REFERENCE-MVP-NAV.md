# 🎣 MVP Navigation Quick Reference

## 📋 New Files Created

1. **`navigation/BottomTabs.tsx`** - Main 5-tab navigation
2. **`hooks/useEntryRoute.ts`** - Smart routing logic
3. **`components/OnboardingSheet.tsx`** - First-login form
4. **`components/ScreenHeader.tsx`** - Reusable header with settings
5. **`docs/MVP-NAVIGATION-IMPLEMENTATION.md`** - Full guide (this repo)

## 🔧 Files Modified

1. **`App.tsx`** - Integrated BottomTabs + OnboardingSheet
2. **`lib/AuthContext.tsx`** - Extended Profile interface

## 🚀 Quick Start

### For Developers

```bash
# No new dependencies needed! Uses existing:
# - @react-navigation/bottom-tabs
# - @expo/vector-icons
# - @react-native-async-storage/async-storage
```

### Testing the Flow

1. **Clear app data** to simulate first-time user
2. **Run app** → should see `Onboarding Sheet` on Home tab
3. **Fill in name + hometown** → submit
4. **See 5 tabs** at bottom with "Coming Soon" placeholders

### Wiring Features (Next Phase)

```tsx
// In BottomTabs.tsx, replace Coming Soon component:
<Tab.Screen name="LogCatch">
  <LogCatchScreen />  // ← Replace this
</Tab.Screen>
```

---

## 🎯 Tab Bar Heights & Labels

| Height | Pros | Cons |
|--------|------|------|
| **70px** ✅ | Compact, labels fit nicely | Slightly tighter touch targets |
| 80px | Spacious | Uses more screen real estate |
| 60px | Very compact | Labels may truncate on narrow devices |

**Chosen: 70px with always-visible labels**

---

## ⚙️ Configuration (if needed)

### Change Tab Bar Height

```tsx
// In BottomTabs.tsx, screenOptions:
tabBarStyle: {
  height: 80,  // ← Change here (default 70)
  paddingBottom: 10,
}
```

### Change Tab Colors

```tsx
tabBarActiveTintColor: '#FFD700',  // ← Active tab color
tabBarInactiveTintColor: '#555',   // ← Inactive tab color
```

### Hide/Show Labels

```tsx
tabBarShowLabel: false,  // ← Set to false to hide labels
```

---

## 🔗 Deep Link Example (Future)

```tsx
// Somewhere in your deep link handler:
import { storePendingRedirect } from '@/hooks/useEntryRoute';

// Handle `app://log-catch`
await storePendingRedirect('LogCatch', {
  initialFocus: 'cameraInput'
});

// After user logs in, they'll be sent directly to LogCatch tab
```

---

## 🛠️ Troubleshooting

### "Profile is undefined after onboarding"
→ Check that `createProfile()` in AuthContext is updating state correctly

### "Settings icon not showing"
→ Make sure `ScreenHeader` is imported in your screen component

### "Tabs not showing at bottom"
→ Verify `MainTabs` is set as initial route in Stack Navigator

### "Coming Soon screens not appearing"
→ Make sure tab name matches the import/export in BottomTabs

---

## 📊 Component Hierarchy

```
App
├── AppNavigator
│   ├── MainTabs (BottomTabs)
│   │   ├── Home → FishingThemedHomeScreen
│   │   ├── LogCatch → ComingSoon
│   │   ├── AICoach → ComingSoon
│   │   ├── Community → ComingSoon
│   │   └── TrophyRoom → ComingSoon
│   ├── Modal Screens
│   │   ├── Tournaments
│   │   ├── TournamentDetail
│   │   ├── Profile
│   │   └── AOY
│   └── OnboardingSheet (overlay)
```

---

## ✅ Validation Checklist

Before committing:

- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] App compiles: `expo start`
- [ ] Can navigate all 5 tabs
- [ ] Settings icon works
- [ ] Onboarding appears on first login
- [ ] No console errors

---

## 📞 Support

For questions about this implementation:
1. See `docs/MVP-NAVIGATION-IMPLEMENTATION.md` (full guide)
2. Review inline comments in each file
3. Check React Navigation docs: https://reactnavigation.org/docs/bottom-tab-navigator

---

**Last Updated:** October 17, 2025  
**Status:** 🟢 Production Ready
