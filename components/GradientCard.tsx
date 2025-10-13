import React from 'react';
import { View, Text, Image, StyleSheet, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fishingTheme } from '../lib/designTokens';

export type GradientVariant = 'gold' | 'green' | 'teal' | 'blue';

export interface GradientCardProps {
  variant: GradientVariant;
  rank: number;
  avatar?: string;
  name: string;
  points: number;
  fishCount: number;
  onPress?: () => void;
  testID?: string;
}

// Gradient color mappings for each variant
const gradientColors: Record<GradientVariant, [string, string]> = {
  gold: ['#F5C842', '#E8A735'],
  green: ['#7CAA5C', '#5A8A4A'],
  teal: ['#3EAAA8', '#2A8B89'],
  blue: ['#4A7FAF', '#35678F'],
};

export const GradientCard: React.FC<GradientCardProps> = ({
  variant,
  rank,
  avatar,
  name,
  points,
  fishCount,
  onPress,
  testID,
}) => {
  const colors = gradientColors[variant];
  const showTrophy = rank === 1;

  const CardContent = (
    <View style={styles.contentContainer}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* Name and Points */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          {showTrophy && <Text style={styles.trophy}>🏆</Text>}
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
        </View>
        <Text style={styles.points}>{points.toLocaleString()} pts</Text>
      </View>

      {/* Fish Count Badge */}
      <View style={styles.fishBadge}>
        <Text style={styles.fishEmoji}>🐟</Text>
        <Text style={styles.fishCount}>{fishCount}</Text>
      </View>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      testID={testID || `gradient-card-${variant}`}
      style={({ pressed }) => [
        styles.pressable,
        pressed && styles.pressed,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${name}, rank ${rank}, ${points} points, ${fishCount} fish`}
    >
      {Platform.OS === 'web' ? (
        <View
          style={[
            styles.card,
            {
              background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
            } as any,
          ]}
        >
          {CardContent}
        </View>
      ) : (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {CardContent}
        </LinearGradient>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    marginBottom: 12,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  card: {
    borderRadius: 16,
    padding: 16,
    minHeight: 80,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: fishingTheme.colors.white,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trophy: {
    fontSize: 18,
    marginRight: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: fishingTheme.colors.white,
    flex: 1,
  },
  points: {
    fontSize: 14,
    color: fishingTheme.colors.mutedWhite,
    fontWeight: '500',
  },
  fishBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 56,
    justifyContent: 'center',
  },
  fishEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  fishCount: {
    fontSize: 14,
    fontWeight: '700',
    color: fishingTheme.colors.white,
  },
});
