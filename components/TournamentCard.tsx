import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fishingTheme } from '../lib/designTokens';

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

const VARIANT_COLORS: Record<string, [string, string]> = {
  gold: ['#F5C842', '#E8A735'],
  green: ['#7CAA5C', '#5A8A4A'],
  teal: ['#3EAAA8', '#2A8B89'],
  blue: ['#4A7FAF', '#35678F'],
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
  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.teal;

  const content = (
    <View style={styles.inner}>
      <View style={styles.left}>
        <View style={styles.thumbPlaceholder}>
          <Ionicons name="fish" size={28} color={fishingTheme.colors.cream} />
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
      style={[styles.container, { backgroundColor: fishingTheme.colors.navyTeal }]}
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

const styles = StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  title: {
    color: fishingTheme.colors.deepOcean,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: fishingTheme.colors.mutedWhite,
    fontSize: 12,
  },
  right: {
    marginLeft: 8,
  },
  attendBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  attendText: {
    color: fishingTheme.colors.cream,
    fontWeight: '700',
  },
});
