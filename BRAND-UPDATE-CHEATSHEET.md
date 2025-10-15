# Brand Update Cheat Sheet

**⚡ Ultra-Fast Reference - Bookmark This!**

---

## 🎨 Change Primary Color (buttons, tabs, highlights)

```typescript
// lib/brandConfig.ts line 22
primary: '#YOUR_COLOR',
```

---

## 🎨 Change Accent Color (badges, numbers, highlights)

```typescript
// lib/brandConfig.ts line 25
accent: '#YOUR_COLOR',
```

---

## 🎨 Change Hero Gradient (profile backgrounds)

```typescript
// lib/brandConfig.ts line 75
hero: ['#START_COLOR', '#END_COLOR'],
```

---

## 📝 Change Font Family

```typescript
// lib/brandConfig.ts lines 100-102
regular: 'YourFont_400Regular',
medium: 'YourFont_600SemiBold',
bold: 'YourFont_700Bold',
```

Don't forget to:
1. `npm install @expo-google-fonts/yourfont`
2. Update imports in `App.tsx`

---

## 📏 Change Font Sizes

```typescript
// lib/brandConfig.ts lines 110-116
h1: 28,    // Page titles
h2: 24,    // Section headers
h3: 20,    // Subsection headers
body: 16,  // Body text
label: 14, // Labels
caption: 11, // Small text
```

---

## 📐 Change Spacing (padding, margins)

```typescript
// lib/brandConfig.ts lines 135-140
xs: 6,
sm: 8,
md: 12,
lg: 16,
xl: 20,
xxl: 24,
```

---

## 🌓 Change Light Mode Background

```typescript
// lib/brandConfig.ts line 42
background: '#F5F5F5',
```

---

## 🌓 Change Dark Mode Background

```typescript
// lib/brandConfig.ts line 57
background: '#121212',
```

---

## 🔄 After Making Changes

```bash
# 1. Save file
# 2. Restart app
npm start
```

---

## 🎯 Most Common Updates

### Rebrand to Different Color
1. Change `BRAND_COLORS.primary`
2. Change `BRAND_COLORS.accent`
3. Change `BRAND_GRADIENTS.hero`
4. Restart app
5. Done!

### Make Text Bigger/Smaller
1. Change values in `FONT_SIZES`
2. Restart app
3. Done!

### Add More/Less Padding
1. Change values in `SPACING`
2. Restart app
3. Done!

### Switch Fonts
1. Install new font package
2. Update `App.tsx` imports
3. Change `BRAND_FONTS` values
4. Restart app
5. Done!

---

## 📍 File Locations

```
lib/brandConfig.ts           ← EDIT THIS for all changes
lib/ThemeContext.tsx         ← Don't touch (auto-imports)
App.tsx                      ← Only edit for font imports
```

---

## ✅ What Updates Automatically

When you edit `brandConfig.ts`:

- ✅ Home Screen
- ✅ Tournaments List
- ✅ Tournament Detail (all tabs)
- ✅ Tournament Results
- ✅ AOY Rankings
- ✅ Profile (all tabs)
- ✅ Member Profile
- ✅ Navigation bars
- ✅ Light mode
- ✅ Dark mode

**Total:** 7 screens, 50+ components, 1 file to edit!

---

## 🚨 Quick Troubleshooting

### Problem: Changes not showing
**Solution:** Restart app with `npm start`

### Problem: TypeScript errors
**Solution:** Check color format is '#RRGGBB'

### Problem: Font not loading
**Solution:** Check font name matches installed package

### Problem: Colors look wrong in dark mode
**Solution:** Update `DARK_THEME_COLORS` too

---

**Save This File!** You'll reference it every time you need to update branding.
