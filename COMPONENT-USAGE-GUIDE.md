# Card & ListRow Component Guide

Quick reference for using the new reusable components.

## Card Component

### Basic Usage
```tsx
import Card from '../components/Card';

<Card>
  <Text>Simple card content</Text>
</Card>
```

### With Custom Props
```tsx
<Card 
  padding="lg"        // xs, sm, md, lg, xl, xxl, xxxl, huge, massive, giant
  margin="md"         // Same options as padding
  radius="xl"         // sm, md, lg, xl, xxl, circle
  elevation="lg"      // sm, md, lg (controls shadow)
>
  <Text>Custom styled card</Text>
</Card>
```

### With Accessibility
```tsx
<Card 
  accessible={true}
  accessibilityLabel="User profile card"
  accessibilityHint="Contains user details and actions"
>
  <Text>Accessible card</Text>
</Card>
```

## ListRow Component

### Avatar with Initials
```tsx
import ListRow from '../components/ListRow';

<ListRow
  avatarText="JD"                    // Shows initials in circle
  title="John Doe"
  subtitle="Professional Angler"
  rightValue="1,245"
  rightLabel="points"
/>
```

### Avatar with Image
```tsx
<ListRow
  avatarSource={{ uri: 'https://...' }}  // Or require('./avatar.png')
  title="Jane Smith"
  subtitle="Tournament Director"
  rightValue="$2,500"
  rightLabel="earnings"
  rightColor={theme.success}
/>
```

### Icon Instead of Avatar
```tsx
<ListRow
  icon="trophy"                      // Any Ionicons name
  iconColor={theme.warning}
  title="Championship Tournament"
  subtitle="Lake Norman"
  rightValue="$100"
  rightLabel="entry"
  showChevron                        // Shows > arrow
  onPress={() => navigate('Detail')}
/>
```

### With Badge
```tsx
<ListRow
  avatarText="TD"
  title="Tom Davis"
  subtitle="Member #123"
  badge="🥇"                          // Any emoji or text
  badgeColor={theme.gold}
  rightValue="500"
  rightLabel="points"
/>
```

### Full Featured Example
```tsx
<ListRow
  avatarSource={{ uri: profileUrl }}
  title="Sarah Johnson"
  subtitle="Senior Member"
  metadata="Joined Jan 2023"         // Third line of text
  badge="VIP"
  badgeColor={theme.accent}
  rightValue="3,450"
  rightLabel="total points"
  rightColor={theme.success}
  onPress={() => viewProfile()}
  showChevron={true}
  accessibilityLabel="Sarah Johnson, VIP member, 3450 total points"
  accessibilityHint="Tap to view profile details"
/>
```

### Non-Interactive (Display Only)
```tsx
<ListRow
  avatarText="AB"
  title="Alex Brown"
  subtitle="Member #456"
  rightValue="150"
  rightLabel="points"
  // No onPress = not tappable
/>
```

### Disabled State
```tsx
<ListRow
  icon="calendar"
  title="Past Tournament"
  subtitle="This event has ended"
  rightValue="Completed"
  disabled={true}                    // Grayed out, not tappable
/>
```

## Combining Card + ListRow

### Simple List
```tsx
<FlatList
  data={members}
  renderItem={({ item }) => (
    <Card padding="xs" margin="sm" elevation="md">
      <ListRow
        avatarText={getInitials(item.name)}
        title={item.name}
        subtitle={`ID: ${item.id}`}
        rightValue={item.points}
        rightLabel="points"
        onPress={() => viewMember(item.id)}
      />
    </Card>
  )}
/>
```

### Grouped List with Headers
```tsx
<ScrollView>
  <Text style={styles.sectionHeader}>Active Members</Text>
  {activeMembers.map(member => (
    <Card key={member.id} padding="xs" margin="sm">
      <ListRow
        avatarText={member.initials}
        title={member.name}
        rightValue={member.points}
        rightLabel="points"
      />
    </Card>
  ))}
  
  <Text style={styles.sectionHeader}>Inactive Members</Text>
  {inactiveMembers.map(member => (
    <Card key={member.id} padding="xs" margin="sm">
      <ListRow
        avatarText={member.initials}
        title={member.name}
        rightValue={member.points}
        rightLabel="points"
        disabled={true}
      />
    </Card>
  ))}
</ScrollView>
```

## Common Patterns

### Tournament List
```tsx
<ListRow
  icon="trophy"
  iconColor={isUpcoming ? theme.warning : theme.textMuted}
  title={tournament.name}
  subtitle={`📍 ${tournament.lake}`}
  metadata={`📅 ${formatDate(tournament.date)}`}
  rightValue={`$${tournament.fee}`}
  rightLabel="entry"
  rightColor={theme.accent}
  showChevron
  onPress={() => viewTournament(tournament.id)}
/>
```

### Leaderboard Entry
```tsx
<ListRow
  avatarText={getInitials(angler.name)}
  title={angler.name}
  subtitle={`Member #${angler.id}`}
  badge={getRankBadge(angler.rank)}      // 🥇 🥈 🥉
  badgeColor={getRankColor(angler.rank)} // gold, silver, bronze
  rightValue={angler.points}
  rightLabel="points"
  rightColor={theme.success}
/>
```

### Settings/Navigation Item
```tsx
<ListRow
  icon="settings"
  iconColor={theme.primary}
  title="Account Settings"
  subtitle="Privacy, notifications, preferences"
  showChevron
  onPress={() => navigate('Settings')}
/>
```

### Status Item
```tsx
<ListRow
  icon="checkmark-circle"
  iconColor={theme.success}
  title="Registration Complete"
  subtitle="Tournament: Bass Masters 2025"
  metadata="Confirmed on Oct 10, 2025"
  rightValue="✓"
/>
```

## Theme Integration

All components automatically use theme colors:

```tsx
import { useTheme } from '../lib/ThemeContext';

function MyScreen() {
  const { theme } = useTheme();
  
  return (
    <Card>
      <ListRow
        icon="trophy"
        iconColor={theme.warning}        // Uses theme color
        title="Tournament"
        rightColor={theme.success}       // Uses theme color
        badgeColor={theme.gold}          // Uses theme color
      />
    </Card>
  );
}
```

## Accessibility Best Practices

### Always Provide Labels
```tsx
<ListRow
  title="John Doe"
  rightValue="250"
  accessibilityLabel="John Doe, 250 points"  // What screen reader announces
  accessibilityHint="Tap to view profile"    // What happens when tapped
/>
```

### Use Descriptive Hints
```tsx
// ✅ Good
accessibilityHint="Tap to view full tournament details"

// ❌ Too vague
accessibilityHint="Tap for more"
```

### Include All Important Info
```tsx
// ✅ Good - includes all context
accessibilityLabel="Norton Bass Tournament at Lake Norman, October 15, entry fee $50"

// ❌ Missing context
accessibilityLabel="Norton Bass Tournament"
```

## Min Touch Height

Both Card and ListRow ensure minimum touch height of **56px** for accessibility:
- Easier to tap on mobile devices
- Meets WCAG 2.1 Level AAA guidelines (44px minimum)
- Better user experience for all users

## Tips

1. **Use padding="xs"** on Card when wrapping ListRow (ListRow has its own padding)
2. **Always provide accessibilityLabel** for interactive items
3. **Use theme colors** instead of hard-coded colors
4. **showChevron** indicates the item is tappable
5. **disabled** grays out the item and prevents interaction
6. **Badge** is perfect for status indicators or medals
7. **metadata** is for tertiary information (third line)
