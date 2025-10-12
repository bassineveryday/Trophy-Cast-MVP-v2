# Component Refactoring - Card & ListRow

## Overview
Created reusable `Card` and `ListRow` components using theme tokens, then refactored AOYScreen and TournamentsListScreen to use them with improved accessibility and consistent styling.

## New Components

### 1. Card Component (`components/Card.tsx`)

A flexible, theme-aware container component for wrapping content.

**Features:**
- ✅ Theme-aware background color
- ✅ Customizable padding, margin, border radius
- ✅ Configurable elevation/shadow
- ✅ Built-in accessibility support
- ✅ Uses design tokens for consistency

**Props:**
```typescript
interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'huge' | 'massive' | 'giant';
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'huge' | 'massive' | 'giant';
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'circle';
  elevation?: 'sm' | 'md' | 'lg';
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
```

**Usage Example:**
```tsx
<Card padding="lg" margin="md" radius="lg" elevation="md">
  <Text>Card content here</Text>
</Card>
```

### 2. ListRow Component (`components/ListRow.tsx`)

A comprehensive list item component with avatar/icon, content, and right-aligned values.

**Features:**
- ✅ Avatar support (image, text initials, or icon)
- ✅ Title, subtitle, and metadata display
- ✅ Badge support with custom colors
- ✅ Right-aligned value and label
- ✅ Optional chevron indicator
- ✅ Minimum touch height of 56px (accessibility standard)
- ✅ Full accessibility support with labels and hints
- ✅ Theme-aware colors
- ✅ Touchable with visual feedback

**Props:**
```typescript
interface ListRowProps {
  // Avatar/Icon
  avatarSource?: ImageSourcePropType | string;
  avatarText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  
  // Content
  title: string;
  subtitle?: string;
  metadata?: string;
  badge?: string;
  badgeColor?: string;
  
  // Right side
  rightValue?: string | number;
  rightLabel?: string;
  rightColor?: string;
  
  // Interaction
  onPress?: () => void;
  disabled?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Style
  showChevron?: boolean;
}
```

**Usage Examples:**

**With Avatar Initials:**
```tsx
<ListRow
  avatarText="JD"
  title="John Doe"
  subtitle="Member ID: 123"
  rightValue="250"
  rightLabel="points"
  onPress={() => navigate('Profile')}
  accessibilityLabel="John Doe, 250 points"
/>
```

**With Icon:**
```tsx
<ListRow
  icon="trophy"
  iconColor={theme.warning}
  title="Lake Tournament"
  subtitle="📍 Lake Norman"
  metadata="📅 Oct 15, 2025"
  rightValue="$50"
  rightLabel="entry fee"
  showChevron
  onPress={() => navigate('TournamentDetail')}
/>
```

**With Badge:**
```tsx
<ListRow
  avatarText="TD"
  title="Tom Davis"
  subtitle="Member ID: 456"
  badge="🥇"
  badgeColor={theme.gold}
  rightValue="500"
  rightLabel="points"
/>
```

## Refactored Screens

### AOYScreen.tsx

**Before:**
- Hard-coded styles with fixed layouts
- No avatars or visual hierarchy
- Basic accessibility support
- Custom rendering logic

**After:**
- ✅ Uses `Card` and `ListRow` components
- ✅ Avatar initials for each member (e.g., "JD" for John Doe)
- ✅ Medal badges for top 3 positions (🥇🥈🥉)
- ✅ Right-aligned points with "points" label
- ✅ Better color coding (gold/silver/bronze for top 3)
- ✅ Min touch height 56px for accessibility
- ✅ Comprehensive accessibility labels
- ✅ Cleaner, more maintainable code

**Features Added:**
- `getInitials()` - Extracts initials from member names
- `getRankBadge()` - Returns medal emoji for top 3
- `getRankBadgeColor()` - Returns theme color for rank
- Enhanced accessibility labels with rank, name, and points

**Accessibility Example:**
```
Label: "#1, John Doe, 500 points"
Hint: "AOY standing for 2025 season"
```

### TournamentsListScreen.tsx

**Before:**
- Basic card with plain text
- No visual indicators
- Limited date formatting
- Basic accessibility

**After:**
- ✅ Uses `Card` and `ListRow` components
- ✅ Trophy icon for each tournament (warning color for upcoming, muted for past)
- ✅ Better formatted dates (e.g., "Fri, Oct 15, 2025")
- ✅ Right-aligned entry fee with label
- ✅ Chevron indicator showing it's tappable
- ✅ Min touch height 56px for accessibility
- ✅ Comprehensive accessibility labels
- ✅ Emoji indicators for lake (📍) and date (📅)

**Features Added:**
- `formatDate()` - Formats dates in readable format
- `isUpcoming()` - Determines if tournament is in the future
- Color-coded icons based on tournament status
- Enhanced accessibility labels with all details

**Accessibility Example:**
```
Label: "Norton Bass Tournament at Lake Norman, Fri, Oct 15, 2025, entry fee $50"
Hint: "Tap to view tournament details"
```

## Accessibility Improvements

### Minimum Touch Height
Both screens now guarantee **56px minimum touch height** per accessibility guidelines (WCAG 2.1 Level AAA - 44px minimum, we use 56px for extra comfort).

### Comprehensive Labels
All interactive elements have:
- **accessibilityLabel**: Describes what the element is
- **accessibilityHint**: Describes what happens when tapped
- **accessibilityRole**: Identifies the element type (button, etc.)

### Screen Reader Support
All content is properly structured for screen readers:
- Names, IDs, and points are announced together
- Tournament details include lake, date, and fee
- Status indicators are included in labels

## Design Token Usage

Both components use design tokens consistently:

**Spacing:**
- `spacing.xs` (4px) - Minimal gaps
- `spacing.sm` (8px) - Small spacing
- `spacing.md` (12px) - Medium spacing
- `spacing.lg` (16px) - Standard spacing

**Border Radius:**
- `borderRadius.circle` - Perfect circles for avatars
- `borderRadius.md` - Small rounded corners for badges
- `borderRadius.lg` - Standard card rounding

**Font Sizes:**
- `fontSize.xs` (12px) - Metadata, labels
- `fontSize.sm` (14px) - Subtitles
- `fontSize.md` (16px) - Body text, titles
- `fontSize.lg` (18px) - Values, emphasized text

**Colors:**
- `theme.text` - Primary text
- `theme.textSecondary` - Secondary text
- `theme.textMuted` - Muted/disabled text
- `theme.success` - Success states (points)
- `theme.accent` - Links, emphasis (fees)
- `theme.gold/silver/bronze` - Rankings

## Benefits

### For Users
- 📱 Better touch targets (easier to tap)
- 👁️ Clearer visual hierarchy
- ♿ Improved screen reader support
- 🎨 Consistent, polished design
- 🌓 Automatic dark mode support

### For Developers
- 🧩 Reusable components (DRY principle)
- 🎯 Single source of truth for list items
- 📝 Better maintainability
- 🔧 Easy to extend and customize
- ✅ Type-safe with TypeScript

## Files Created/Modified

**Created:**
1. ✅ `components/Card.tsx`
2. ✅ `components/ListRow.tsx`

**Modified:**
3. ✅ `screens/AOYScreen.tsx`
4. ✅ `screens/TournamentsListScreen.tsx`

**All changes:**
- ✅ Zero TypeScript errors
- ✅ All accessibility standards met
- ✅ Consistent theme token usage
- ✅ No mock data introduced
- ✅ Original functionality preserved

## Next Steps (Optional)

These components can now be used throughout the app:
- Profile screen for user details
- Club officers list
- Results/leaderboards
- Registration forms
- Any list-based UI

**Example uses:**
- Member directory with avatars
- Tournament results with rankings
- Payment history with amounts
- Notification list with timestamps
