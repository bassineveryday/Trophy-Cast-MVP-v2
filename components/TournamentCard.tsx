import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';
import type { BrandTheme } from '../lib/ThemeContext';

export type TournamentCardProps = {
  id?: string | number;
  title: string;
  lake?: string;
  date?: string;
  location?: string;
  attending?: number;
  variant?: 'gold' | 'green' | 'teal' | 'blue';
  onPress?: (id?: string | number) => void;
  testID?: string;
};

const getVariantGradient = (theme: BrandTheme, variant: string): [string, string] => {
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

export default function TournamentCard({
  id,
  title,
  lake,
  date,
  location,
  attending = 0,
  variant = 'teal',
  onPress,
  testID,
}: TournamentCardProps) {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const colors = getVariantGradient(theme, variant);

  const content = (
    <View style={styles.inner}>
      <View style={styles.left}>
        <View style={styles.thumbPlaceholder}>
          <Ionicons name="fish" size={28} color={theme.onPrimary} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {!!lake && <Text style={styles.meta}>{lake}{location ? ` • ${location}` : ''}</Text>}
        {!!date && <Text style={styles.meta}>{date}</Text>}
      </View>

      <View style={styles.right}>
        <View style={styles.attendBadge}>
          <Text style={styles.attendText}>{attending}</Text>
        </View>
      </View>
    </View>
  );

  return Platform.OS === 'web' ? (
    <Pressable
      onPress={() => onPress?.(id)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${title} tournament card`}
      accessibilityHint="Opens tournament details"
      style={[styles.container, { backgroundColor: theme.primary }]}
    >
      {content}
    </Pressable>
  ) : (
    <LinearGradient colors={colors} start={[0,0]} end={[1,1]} style={styles.nativeGradient}>
      <Pressable
        onPress={() => onPress?.(id)}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${title} tournament card`}
        accessibilityHint="Opens tournament details"
        style={styles.pressable}
      >
        {content}
      </Pressable>
    </LinearGradient>
  );
}

function withAlpha(hexOrRgb: string, alpha: number) {
  if (hexOrRgb.startsWith('#')) {
    const hex = hexOrRgb.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrRgb;
}

function createStyles(theme: BrandTheme) {
  return StyleSheet.create({
    container: {
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      padding: 12,
    },
    nativeGradient: {
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    pressable: {
      padding: 12,
    },
    inner: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    left: {
      marginRight: 12,
    },
    thumbPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 8,
      backgroundColor: withAlpha(theme.onPrimary, 0.08),
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      flex: 1,
    },
    title: {
      color: theme.onPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    meta: {
      color: withAlpha(theme.onPrimary, 0.85),
      fontSize: 12,
    },
    right: {
      marginLeft: 8,
    },
    attendBadge: {
      backgroundColor: withAlpha(theme.onPrimary, 0.12),
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
    },
    attendText: {
      color: theme.onPrimary,
      fontWeight: '700',
    },
  });
}
