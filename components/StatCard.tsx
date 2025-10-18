/**
 * StatCard.tsx - Reusable stat card component
 *
 * A flexible card that displays a labeled statistic with optional:
 * - Icon
 * - Value (number or string)
 * - Sublabel
 * - Loading state
 * - Pressable action
 *
 * Brand colors: Navy #0B1A2F, Border #1A2A3F, Gold #C9A646
 */

import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';

type StatCardProps = {
  /** Label text (e.g., "Catches") */
  label: string;

  /** Main value to display (e.g., "12", "↑ 8%") */
  value?: string | number;

  /** Optional sublabel (e.g., "this month") */
  sublabel?: string;

  /** Optional icon component (e.g., <Ionicons />) */
  icon?: React.ReactNode;

  /** Show loading spinner instead of value */
  loading?: boolean;

  /** Optional press handler (card becomes interactive if provided) */
  onPress?: () => void;

  /** Test identifier for QA */
  testID?: string;
};

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  loading,
  onPress,
  testID,
}: StatCardProps) {
  // Conditionally use Pressable if onPress provided, otherwise plain View
  const Wrapper: React.ComponentType<any> = onPress ? Pressable : View;

  const handlePress = onPress ? () => onPress() : undefined;

  return (
    <Wrapper
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={`${label}${value ? ` ${value}` : ''}${sublabel ? ` ${sublabel}` : ''}`.trim()}
      accessibilityHint={onPress ? 'Double tap to view details' : undefined}
      testID={testID}
      onPress={handlePress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.card,
        onPress && pressed && styles.cardPressed,
      ]}
    >
      {/* Label + Icon Row */}
      <View style={styles.labelRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>

      {/* Value or Loading */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#C9A646" />
        </View>
      ) : (
        <Text style={styles.value}>{value ?? '–'}</Text>
      )}

      {/* Sublabel */}
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F2238',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1A2A3F',
  },
  cardPressed: {
    backgroundColor: '#152a3f',
    borderColor: '#C9A646',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#9AA4B2',
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    color: '#E7ECF2',
    fontSize: 22,
    fontWeight: '700',
  },
  sublabel: {
    color: '#9AA4B2',
    fontSize: 12,
  },
  loadingContainer: {
    height: 28,
    justifyContent: 'center',
  },
});
