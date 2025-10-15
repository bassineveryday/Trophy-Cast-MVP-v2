# Brand Configuration System - Quick Reference Guide

**🎯 The Power of Centralized Branding**

With the new `brandConfig.ts` file, you can now update **every screen in the app** by editing just ONE file! No more hunting through dozens of components.

---

## 📍 Where Everything Lives

```
lib/
├── brandConfig.ts          ← EDIT THIS to change branding
└── ThemeContext.tsx        ← Imports from brandConfig (no need to edit)
```

---

## 🎨 How to Change Colors (The Easy Way)

### Want to change the primary green color?

**Before (the hard way):** Edit 20+ files, search for `#2E8B57`, hope you found them all

**Now (the easy way):** Open `lib/brandConfig.ts` and change ONE line:

```typescript
export const BRAND_COLORS = {
  primary: '#NEW_COLOR',  // ← Change this
  accent: '#65C18C',
  // ... rest stays the same
}
```

**Result:** Every button, every tab, every highlight across ALL screens updates instantly! ✨

---

## 🚀 Common Branding Changes

### 1️⃣ Change Brand Colors

```typescript
// lib/brandConfig.ts

export const BRAND_COLORS = {
  primary: '#2E8B57',      // Main brand color (buttons, tabs, highlights)
  accent: '#65C18C',       // Secondary color (badges, numbers, accents)
  success: '#4CAF50',      // Success states
  warning: '#FF9800',      // Warning states
  error: '#F44336',        // Error states
  info: '#2196F3',         // Info states
}
```

**What updates automatically:**
- ✅ Active tabs
- ✅ Button backgrounds
- ✅ Participant numbers
- ✅ AOY points
- ✅ Big Bass badges
- ✅ Hero gradients
- ✅ Chip badges
- ✅ Icon colors
- ✅ Navigation bar tint

---

### 2️⃣ Change Fonts

```typescript
// lib/brandConfig.ts

export const BRAND_FONTS = {
  regular: 'Inter_400Regular',   // Body text
  medium: 'Inter_600SemiBold',   // Medium weight text
  bold: 'Inter_700Bold',         // Headers, labels
}
```

**Example:** Switch to Roboto

```typescript
// 1. Install fonts
npm install @expo-google-fonts/roboto

// 2. Update App.tsx imports
import {
  Roboto_400Regular,
  Roboto_600SemiBold,
  Roboto_700Bold
} from '@expo-google-fonts/roboto';

// 3. Update brandConfig.ts
export const BRAND_FONTS = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_600SemiBold',
  bold: 'Roboto_700Bold',
}
```

**Result:** Every text element across all screens uses new font! 🎯

---

### 3️⃣ Adjust Spacing/Sizing

```typescript
// lib/brandConfig.ts

export const SPACING = {
  xs: 6,    // ← Make everything more compact
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
}

export const FONT_SIZES = {
  h1: 28,   // ← Make headers bigger/smaller
  h2: 24,
  h3: 20,
  body: 16,
  label: 14,
  caption: 11,
}
```

**What updates automatically:**
- ✅ Padding on all cards
- ✅ Margins between sections
- ✅ Text sizes everywhere
- ✅ Button heights
- ✅ Input fields

---

### 4️⃣ Change Gradients

```typescript
// lib/brandConfig.ts

export const BRAND_GRADIENTS = {
  hero: ['#2E8B57', '#65C18C'],     // Profile hero backgrounds
  card: ['#3A9D6B', '#4CAF79'],     // Special cards
  accent: ['#65C18C', '#7ED5A3'],   // Accent elements
}
```

**Where gradients appear:**
- Profile hero sections
- Member profile headers
- Special feature cards
- Achievement badges

---

## 🔄 Real-World Example: Complete Rebrand

**Scenario:** Company rebrand from green to blue

### Step 1: Update Colors (2 minutes)

```typescript
// lib/brandConfig.ts

export const BRAND_COLORS = {
  primary: '#1E3A8A',      // Royal blue (was SeaGreen)
  accent: '#3B82F6',       // Light blue (was MintGreen)
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
}

export const BRAND_GRADIENTS = {
  hero: ['#1E3A8A', '#3B82F6'],     // Blue gradient
  card: ['#2563EB', '#3B82F6'],
  accent: ['#3B82F6', '#60A5FA'],
}
```

### Step 2: Test the App

```bash
npm start
```

### Step 3: Done! 🎉

**What changed:**
- ✅ ALL 7 screens updated
- ✅ ALL tabs, buttons, badges
- ✅ ALL hero sections
- ✅ ALL highlights and accents
- ✅ Light AND dark mode

**Files edited:** 1 (brandConfig.ts)  
**Time taken:** 2 minutes  
**Old way:** Would have taken hours and touched 20+ files!

---

## 📋 Complete Brand Color Reference

### Current Trophy Cast Colors

```typescript
Primary:   #2E8B57  (SeaGreen)
Accent:    #65C18C  (MintGreen)
Success:   #4CAF50
Warning:   #FF9800
Error:     #F44336
Info:      #2196F3
```

### Light Theme Colors

```typescript
Background:      #F5F5F5
Surface:         #FFFFFF
Border:          #E0E0E0
Text:            #1A1A1A
Text Secondary:  #666666
```

### Dark Theme Colors

```typescript
Background:      #121212
Surface:         #1E1E1E
Border:          #333333
Text:            #FFFFFF
Text Secondary:  #B0B0B0
```

---

## 🎯 What Gets Updated Automatically

When you change `brandConfig.ts`, these screens update:

### ✅ Home Screen
- Logo accent color
- Challenge cards
- Leaderboard highlights
- Trophy rack

### ✅ Tournaments List
- Active filters
- Tournament status colors
- Card backgrounds
- Icon colors

### ✅ Tournament Detail
- Active tabs (was teal, now uses accent)
- Participant numbers (was teal, now uses accent)
- Registration buttons
- Status indicators

### ✅ Tournament Results
- AOY point highlights (green accent)
- Big Bass badges (green accent)
- Payout amounts (green accent)
- Table headers and borders

### ✅ AOY Rankings
- Rank indicators
- Active filters
- Profile chips
- Score highlights

### ✅ Profile Screen
- Hero gradient (was blue, now green)
- Active tabs (was blue, now green)
- Stat card accents
- Achievement badges
- Settings buttons

### ✅ Member Profile
- Hero gradient
- Trophy chips
- Stat displays
- Achievement sections

---

## 🛠️ Advanced Customization

### Create Theme Variants

Want a "premium" theme for special features?

```typescript
// lib/brandConfig.ts

export const PREMIUM_GRADIENTS = {
  hero: ['#FFD700', '#FFA500'],  // Gold gradient
  card: ['#DAA520', '#FF8C00'],
}

// Then in your component:
<LinearGradient colors={BRAND_CONFIG.gradients.premium}>
```

### Seasonal Themes

```typescript
// Halloween theme
export const HALLOWEEN_COLORS = {
  primary: '#FF6B00',  // Orange
  accent: '#8B00FF',   // Purple
}

// Christmas theme
export const CHRISTMAS_COLORS = {
  primary: '#C41E3A',  // Red
  accent: '#165B33',   // Green
}
```

---

## 📱 Testing Your Changes

### 1. Visual Test

```bash
npm start
```

Navigate through:
1. Home → Check logo, cards, highlights
2. Tournaments → Check filters, status colors
3. Tournament Detail → Check tabs, buttons
4. Results → Check table colors
5. AOY → Check filters, ranks
6. Profile → Check hero, tabs, stats

### 2. Dark Mode Test

- Change system settings to dark mode
- Verify colors look good
- Check text contrast

### 3. TypeScript Check

```bash
npx tsc --noEmit
```

Should show: `No errors found`

---

## 🚨 Important Notes

### DO Edit:
- ✅ `lib/brandConfig.ts` - All brand values

### DON'T Edit (Unless You Know What You're Doing):
- ❌ `lib/ThemeContext.tsx` - Already imports from brandConfig
- ❌ Individual screen files - They use theme tokens

### Excluded from Theming:
- 🚫 ClubScreen (Denver Bass Masters) - Uses separate styling per request

---

## 💡 Pro Tips

### Tip 1: Use Color Variables
```typescript
// Define once, use everywhere
const TROPHY_CAST_GREEN = '#2E8B57';
const MINT_HIGHLIGHT = '#65C18C';

export const BRAND_COLORS = {
  primary: TROPHY_CAST_GREEN,
  accent: MINT_HIGHLIGHT,
}
```

### Tip 2: Keep a Color Palette
```typescript
// Document your full palette
const COLOR_PALETTE = {
  // Greens
  darkGreen: '#1F6B42',
  seaGreen: '#2E8B57',   // PRIMARY
  mintGreen: '#65C18C',  // ACCENT
  lightMint: '#7ED5A3',
  
  // Grays
  charcoal: '#1A1A1A',
  slate: '#666666',
  silver: '#E0E0E0',
}
```

### Tip 3: Test in Small Increments
```typescript
// Change one thing at a time
// 1. Change primary color → test
// 2. Change accent color → test
// 3. Change gradients → test
```

---

## 🎓 Quick Reference

**Q: Where do I change button colors?**  
**A:** `BRAND_COLORS.primary` in brandConfig.ts

**Q: Where do I change font sizes?**  
**A:** `FONT_SIZES` object in brandConfig.ts

**Q: Where do I change spacing?**  
**A:** `SPACING` object in brandConfig.ts

**Q: How do I add a new color?**  
**A:** Add it to `BRAND_COLORS`, then use `theme.yourNewColor` in components

**Q: Do I need to restart the app after changes?**  
**A:** Yes, restart with `npm start` to see changes

**Q: Will this break anything?**  
**A:** No! TypeScript will catch errors. If it compiles, it works.

---

## ✨ Summary

### The Old Way (Painful)
1. Search for color values across 20+ files
2. Edit each file individually
3. Hope you didn't miss any
4. Spend hours debugging inconsistencies

### The New Way (Easy)
1. Edit `lib/brandConfig.ts`
2. Change one value
3. Restart app
4. Done! All screens updated! 🎉

---

**Last Updated:** October 14, 2025  
**System Version:** 2.0 (Centralized Brand Config)  
**Maintained By:** Trophy Cast Development Team
