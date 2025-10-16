import React from 'react';
import { View, Text, Image, StyleSheet, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../lib/ThemeContext';
import type { BrandTheme } from '../lib/ThemeContext';

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

// Map variant to theme-derived gradient pairs
const getVariantGradient = (theme: BrandTheme, variant: GradientVariant): [string, string] => {
  switch (variant) {
    case 'gold':
      return theme.gradients.accent;
    case 'green':
      return [theme.success, theme.primary];
    case 'teal':
      return theme.gradients.hero;
    case 'blue':
    default:
      return [theme.primaryLight, theme.primary];
  }
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
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const colors = getVariantGradient(theme, variant);
  const showTrophy = rank === 1;

  // Fishing-themed avatar emojis for placeholder
  const avatarEmojis = ['🎣', '🐟', '🏆', '⚓', '🐠', '🎯'];
  const placeholderEmoji = avatarEmojis[rank % avatarEmojis.length];

  const CardContent = (
    <View style={styles.contentContainer}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarEmoji}>{placeholderEmoji}</Text>
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
      style={({ pressed, hovered }: any) => [
        styles.pressable,
        pressed && styles.pressed,
        Platform.OS === 'web' && hovered && styles.hovered,
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

function withAlpha(hexOrRgb: string, alpha: number) {
  if (hexOrRgb.startsWith('#')) {
    const hex = hexOrRgb.replace('#', '');
    const bigint = parseInt(hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // assume already rgba/var; fallback to provided
  return hexOrRgb;
}

function createStyles(theme: BrandTheme) {
  return StyleSheet.create({
    pressable: {
      marginBottom: 12,
      transition: 'all 0.2s ease',
    } as any,
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.97 }],
    },
    hovered: {
      transform: [{ scale: 1.02 }],
      shadowOpacity: 0.35,
    } as any,
    card: {
      borderRadius: 16,
      padding: 16,
      minHeight: 80,
      // Enhanced shadow for 3D depth effect
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
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
      borderColor: withAlpha(theme.onPrimary, 0.3),
    },
    avatarPlaceholder: {
      backgroundColor: withAlpha(theme.onPrimary, 0.2),
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.onPrimary,
    },
    avatarEmoji: {
      fontSize: 26,
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
      color: theme.onPrimary,
      flex: 1,
    },
    points: {
      fontSize: 14,
      color: withAlpha(theme.onPrimary, 0.8),
      fontWeight: '500',
    },
    fishBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: withAlpha(theme.onPrimary, 0.2),
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
      color: theme.onPrimary,
    },
  });
}
