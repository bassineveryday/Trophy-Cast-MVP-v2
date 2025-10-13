# Denver Bassmasters (DBM) Branding Guide

## Official Branding from denverbassmasters.com

### Club Identity
- **Official Name**: Denver Bassmasters (DBM)
- **Founded**: 1977 (website says "Established 1975" in one place, but club history shows 1977)
- **Tagline**: "Colorado's Premier Bass Fishing Club"

### Logo
The Denver Bassmasters logo features a gold/bronze bass jumping out of a trophy, representing competitive bass fishing excellence. The logo has been provided in the attachment and should be:
- Placed in: `assets/images/dbm-logo.png`
- Colors: Gold (#D4AF37 or similar) on dark navy/black background
- Used in the Club page header

### Brand Colors (from website analysis)
- **Primary Gold**: #D4AF37 (trophy/bass color)
- **Navy/Dark Blue**: #1a2332 or similar (background)
- **White**: #FFFFFF (text on dark backgrounds)
- **Green accents**: For "ACTIVE" badges and success states

### Mission Statement
"To stimulate public awareness of bass fishing as a major sport. To improve our skill as bass anglers through a fellowship of friendly exchange of bass catching techniques and ideas, and to promote and encourage youth fishing. To exemplify sportsmanship and ethics in all activities representing the Chapter and/or B.A.S.S."

### 2025 Club Officers (from website)
1. **President**: Jeremiah Hofstetter
2. **Vice President**: Bobby Martin
3. **Secretary**: Tai Hunt
4. **Treasurer**: Gordon Phair
5. **Tournament Director**: Howard Binkley - (720) 375-4270
6. **Conservation Director**: Justin Apfel - (757) 817-4267
7. **Juniors Director**: Cliff Purslow - (720) 980-9090
8. **High School Director**: Bill Cancellieri - (303) 521-8216

---

## Proposed Changes to ClubScreen.tsx

### 1. Header/Hero Section
**Current**:
```tsx
<Text style={themedStyles.clubName}>Denver Bassmasters</Text>
<Text style={themedStyles.clubTagline}>Established 1975 • Colorado's Premier Bass Fishing Club</Text>
```

**Proposed**:
```tsx
{/* DBM Logo */}
<Image 
  source={require('../assets/images/dbm-logo.png')} 
  style={themedStyles.clubLogo}
  resizeMode="contain"
/>
<Text style={themedStyles.clubName}>Denver Bassmasters (DBM)</Text>
<View style={themedStyles.statusBadge}>
  <Text style={themedStyles.statusBadgeText}>ACTIVE</Text>
</View>
<Text style={themedStyles.clubTagline}>Founded 1977 • Colorado's Premier Bass Fishing Club</Text>
```

### 2. About Section
**Current**:
```tsx
<Text style={themedStyles.cardContent}>
  Founded in 1977, Denver Bassmasters is a premier fishing club in Colorado dedicated to promoting bass fishing, conservation, and sportsmanship.
</Text>
```

**Proposed** (add mission statement):
```tsx
<Text style={themedStyles.cardContent}>
  Founded in 1977, Denver Bassmasters is Colorado's premier bass fishing club and proud chapter of B.A.S.S. (Bass Anglers Sportsman Society).
</Text>

<Text style={themedStyles.sectionTitle}>Mission</Text>
<Text style={themedStyles.cardContent}>
  To stimulate public awareness of bass fishing as a major sport, improve our skills through fellowship and exchange of techniques, promote youth fishing, and exemplify sportsmanship and ethics in all activities.
</Text>
```

### 3. Theme Colors for DBM
Add DBM-specific theme colors (optional):
```typescript
// In ThemeContext or designTokens
const dbmColors = {
  gold: '#D4AF37',
  navy: '#1a2332',
  green: '#4CAF50',
};
```

### 4. Logo Styling
```typescript
clubLogo: {
  width: 80,
  height: 80,
  marginBottom: spacing.md,
},
```

---

## Trophy Cast App Branding - NOT CHANGED YET

The Trophy Cast app branding (app name, primary branding, TopBar, etc.) remains unchanged as requested. This document focuses only on the Club-specific page.

**Current Trophy Cast Branding**:
- App Name: "Trophy Cast"
- Primary Color: Teal/Blue theme
- Logo: Trophy icon (🏆)

**Discussion Points**:
1. Should Trophy Cast app adopt DBM branding colors (gold/navy)?
2. Should the app be renamed to "Denver Bassmasters Trophy Cast" or remain generic?
3. Should the app logo incorporate the DBM bass logo?
4. Should theme colors shift to match DBM's gold/navy palette?

---

## Implementation Steps (For Club Page Only)

1. **Save DBM Logo**
   - Save the provided logo image as `assets/images/dbm-logo.png`
   - Ensure proper resolution (suggest 512x512 or similar)

2. **Update ClubScreen.tsx**
   - Import the logo
   - Update club name to "Denver Bassmasters (DBM)"
   - Add logo to hero header
   - Update tagline from 1975 to 1977
   - Add mission statement section
   - Verify officer names and contact info match website

3. **Optional Theme Enhancements**
   - Add DBM gold accent color
   - Use gold for "ACTIVE" badge
   - Use gold for section headers on Club page

4. **Test**
   - Verify logo displays correctly on both light/dark themes
   - Check responsive sizing on different devices
   - Confirm all links work (website, email, phone)

---

## Files to Edit (Club Page Only)

- `screens/ClubScreen.tsx` - Main club page
- `assets/images/dbm-logo.png` - Add logo file (from attachment)
- `lib/designTokens.ts` - Optional: add DBM gold color

## Files NOT to Edit (Per Request)

- `App.tsx` - App-level branding
- `components/TopBar.tsx` - App header
- `lib/ThemeContext.tsx` - App-wide theme (unless adding DBM-specific colors)
- Any other screens (Home, Tournaments, AOY, etc.)

---

## Next Steps

**Before implementing**:
1. User to confirm logo file location and resolution
2. Discuss Trophy Cast app-level branding changes (separate conversation)
3. Verify all officer contact information is correct
4. Confirm mission statement wording

**Ready to implement**: Club page updates only, keeping Trophy Cast app branding unchanged.
