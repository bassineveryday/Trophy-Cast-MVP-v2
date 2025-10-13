import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fishingTheme } from '../lib/designTokens';

export type TrophyType = 'gold' | 'silver' | 'bronze' | 'conservation' | 'bigfish' | 'explorer';

export interface TrophyBadgeProps {
  type: TrophyType;
  size?: number;
  label?: string;
  testID?: string;
}

// Icon and color mappings for each trophy type
const trophyConfig: Record<
  TrophyType,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  gold: { icon: 'trophy', color: '#FFD700' },
  silver: { icon: 'medal', color: '#C0C0C0' },
  bronze: { icon: 'medal-outline', color: '#CD7F32' },
  conservation: { icon: 'leaf', color: '#7CAA5C' },
  bigfish: { icon: 'fish', color: '#4A7FAF' },
  explorer: { icon: 'compass', color: '#3EAAA8' },
};

export const TrophyBadge: React.FC<TrophyBadgeProps> = ({
  type,
  size = 48,
  label,
  testID,
}) => {
  const config = trophyConfig[type];
  const iconSize = Math.round(size * 0.5);

  return (
    <View style={styles.container} testID={testID || `trophy-badge-${type}`}>
      {/* Badge Circle */}
      <View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: `${config.color}26`, // 15% opacity in hex
          },
        ]}
      >
        <Ionicons name={config.icon} size={iconSize} color={config.color} />
      </View>

      {/* Optional Label */}
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: fishingTheme.colors.mutedWhite,
    textAlign: 'center',
    fontWeight: '500',
  },
});
