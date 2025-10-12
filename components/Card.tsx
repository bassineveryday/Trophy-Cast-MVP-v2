import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, shadows } from '../lib/designTokens';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  margin?: keyof typeof spacing;
  radius?: keyof typeof borderRadius;
  elevation?: keyof typeof shadows;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const styles = makeStyles((theme) => ({
  card: {
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
}));

/**
 * Reusable Card component with theme support
 * 
 * @example
 * <Card padding="lg" margin="md" radius="lg" elevation="md">
 *   <Text>Card content</Text>
 * </Card>
 */
export default function Card({
  children,
  style,
  padding = 'lg',
  margin,
  radius = 'lg',
  elevation = 'md',
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const { theme } = useTheme();
  const themedStyles = styles(theme);

  const cardStyle: ViewStyle = {
    ...themedStyles.card,
    padding: spacing[padding],
    borderRadius: borderRadius[radius],
    ...shadows[elevation],
    ...(margin && { margin: spacing[margin] }),
    ...(style as any),
  };

  return (
    <View
      style={cardStyle}
      accessible={accessible}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </View>
  );
}
