# Design Tokens Reference

Quick reference guide for the design tokens available in `lib/designTokens.ts`.

## Spacing Scale

Use these for padding, margin, and gaps:

```typescript
spacing.xs      // 4px  - Tiny gaps
spacing.sm      // 8px  - Small spacing
spacing.md      // 12px - Medium spacing
spacing.lg      // 16px - Large spacing (most common)
spacing.xl      // 20px - Extra large
spacing.xxl     // 24px - Double extra large
spacing.xxxl    // 32px - Triple extra large
spacing.huge    // 40px - Huge spacing
spacing.massive // 48px - Massive spacing
spacing.giant   // 60px - Giant spacing (for headers)
```

## Border Radius

Use these for rounded corners:

```typescript
borderRadius.sm     // 6px   - Subtle rounding
borderRadius.md     // 8px   - Small cards
borderRadius.lg     // 12px  - Standard cards
borderRadius.xl     // 16px  - Large cards
borderRadius.xxl    // 20px  - Badges/pills
borderRadius.circle // 9999px - Perfect circles
```

## Font Sizes

Use these for text:

```typescript
fontSize.xs   // 12px - Tiny text, captions
fontSize.sm   // 14px - Small text, metadata
fontSize.md   // 16px - Body text (default)
fontSize.lg   // 18px - Subheadings
fontSize.xl   // 20px - Section titles
fontSize.xxl  // 24px - Page titles
fontSize.xxxl // 28px - Hero titles
```

## Font Weights

Use these for text emphasis:

```typescript
fontWeight.regular  // '400' - Normal text
fontWeight.medium   // '500' - Slightly emphasized
fontWeight.semibold // '600' - Bold-ish (most headings)
fontWeight.bold     // '700' - Very bold (main titles)
```

## Shadows

Use these for elevation:

```typescript
shadows.sm  // Subtle shadow (1dp elevation)
shadows.md  // Medium shadow (2dp elevation)
shadows.lg  // Strong shadow (3dp elevation)
```

Each includes both iOS (shadowColor, shadowOffset, shadowOpacity, shadowRadius) and Android (elevation) properties.

## Opacity

Use these for visual effects:

```typescript
opacity.disabled // 0.5 - Disabled elements
opacity.subtle   // 0.6 - Very faded
opacity.medium   // 0.7 - Somewhat faded
opacity.strong   // 0.8 - Slightly faded
opacity.full     // 1.0 - No transparency
```

## Theme Colors

Access from the `theme` object via `useTheme()`:

### Background Colors
```typescript
theme.background // Main app background
theme.surface    // Card/surface color
theme.card       // Card background
```

### Text Colors
```typescript
theme.text          // Primary text
theme.textSecondary // Secondary text
theme.textMuted     // Muted/disabled text
```

### Brand Colors
```typescript
theme.primary      // Main brand color (green)
theme.primaryLight // Lighter variant
theme.primaryDark  // Darker variant
```

### Semantic Colors
```typescript
theme.accent   // Accent/link color (blue)
theme.success  // Success state (green)
theme.warning  // Warning state (orange)
theme.error    // Error state (red/pink)
```

### UI Colors
```typescript
theme.border  // Border color
theme.shadow  // Shadow color
theme.overlay // Overlay/modal backdrop
```

### Special Colors
```typescript
theme.gold   // Trophy/1st place (#FFD700)
theme.silver // 2nd place (#C0C0C0)
theme.bronze // 3rd place (#CD7F32)
```

### Status Colors
```typescript
theme.active   // Active state
theme.inactive // Inactive state
```

## Usage Example

```typescript
import { makeStyles, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/designTokens';
import { useTheme } from '../lib/ThemeContext';

const styles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.background,
    padding: spacing.lg,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
  },
}));

export default function MyScreen() {
  const { theme } = useTheme();
  const themedStyles = styles(theme);
  
  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.card}>
        <Text style={themedStyles.title}>Hello</Text>
        <Text style={themedStyles.subtitle}>World</Text>
      </View>
    </View>
  );
}
```

## Tips

1. **Always use tokens** - Never hard-code spacing or colors
2. **Be consistent** - Use the same token for similar UI elements
3. **Follow the scale** - Don't skip sizes (e.g., don't use xs then xl)
4. **Theme awareness** - Always get colors from `theme` object
5. **Shadows include elevation** - No need to add elevation separately
