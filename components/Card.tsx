import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Platform } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, shadows } from '../lib/designTokens';

type CardVariant = 'primary' | 'secondary';

interface BaseCardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  margin?: keyof typeof spacing;
  radius?: keyof typeof borderRadius;
  elevation?: keyof typeof shadows;
  variant?: CardVariant;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

interface CardProps extends BaseCardProps {
  as?: 'div' | 'view';
}

interface CardPressableProps extends BaseCardProps {
  onPress: () => void;
  disabled?: boolean;
}

const styles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: `${theme.border}66`, // 40% opacity
    overflow: 'hidden',
  },
  cardPressable: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: `${theme.border}66`,
    overflow: 'hidden',
  },
}));

/**
 * Reusable Card component with theme support and tactile states
 * 
 * @example
 * <Card padding="lg" margin="md" radius="xl" variant="primary">
 *   <Text>Card content</Text>
 * </Card>
 */
export default function Card({
  children,
  style,
  padding = 'lg',
  margin,
  radius = 'xl',
  elevation = 'card',
  variant = 'primary',
  as = 'view',
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardProps) {
  const { theme } = useTheme();
  const themedStyles = styles(theme);

  const elevationValue = variant === 'secondary' 
    ? { ...shadows[elevation], shadowOpacity: (shadows[elevation]?.shadowOpacity || 0.1) * 0.5 }
    : shadows[elevation];

  const cardStyle: ViewStyle = {
    ...themedStyles.card,
    padding: spacing[padding],
    borderRadius: borderRadius[radius],
    ...elevationValue,
    ...(margin && { margin: spacing[margin] }),
    ...(style as any),
  };

  return (
    <View
      style={cardStyle}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
    >
      {children}
    </View>
  );
}

/**
 * Pressable Card variant with tactile feedback
 * Includes hover shadow, active scale, and press states
 */
export function CardPressable({
  children,
  onPress,
  disabled = false,
  style,
  padding = 'lg',
  margin,
  radius = 'xl',
  elevation = 'card',
  variant = 'primary',
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CardPressableProps) {
  const { theme } = useTheme();
  const themedStyles = styles(theme);

  const elevationValue = variant === 'secondary'
    ? { ...shadows[elevation], shadowOpacity: (shadows[elevation]?.shadowOpacity || 0.1) * 0.5 }
    : shadows[elevation];

  const baseStyle: ViewStyle = {
    ...themedStyles.cardPressable,
    padding: spacing[padding],
    borderRadius: borderRadius[radius],
    ...elevationValue,
    ...(margin && { margin: spacing[margin] }),
    ...(style as any),
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      testID={testID}
      style={({ pressed }) => [
        baseStyle,
        // Active/pressed state
        pressed && !disabled && {
          transform: [{ scale: 0.98 }],
          opacity: 0.9,
        },
        disabled && {
          opacity: 0.5,
        },
      ]}
    >
      {children}
    </Pressable>
  );
}
