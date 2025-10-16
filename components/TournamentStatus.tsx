import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';

export type TournamentStatusValue = 'completed' | 'upcoming' | 'scheduled' | 'pending';

export function getTournamentStatusValue(eventDate?: string | null): { status: TournamentStatusValue; daysDiff: number | null } {
  if (!eventDate) return { status: 'pending', daysDiff: null };
  const event = new Date(eventDate);
  const today = new Date();
  // Normalize to date only to avoid timezone shenanigans
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = startOf(event).getTime() - startOf(today).getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { status: 'completed', daysDiff: diffDays };
  if (diffDays <= 7) return { status: 'upcoming', daysDiff: diffDays };
  return { status: 'scheduled', daysDiff: diffDays };
}

export function getTournamentStatusText(value: TournamentStatusValue, daysDiff: number | null): string {
  switch (value) {
    case 'completed':
      return 'Completed';
    case 'upcoming':
      if (daysDiff === 0) return 'Today';
      if (typeof daysDiff === 'number' && daysDiff > 0) return `${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
      // Fallback for edge cases
      return 'Upcoming';
    case 'scheduled':
      return 'Scheduled';
    default:
      return 'Pending';
  }
}

type TournamentStatusProps = {
  eventDate?: string | null;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
};

export default function TournamentStatus({ eventDate, style, textStyle, testID }: TournamentStatusProps) {
  const { theme } = useTheme();
  const { status, daysDiff } = useMemo(() => getTournamentStatusValue(eventDate), [eventDate]);
  const text = useMemo(() => getTournamentStatusText(status, daysDiff), [status, daysDiff]);

  const badgeColor = theme.primary;
  const iconName: keyof typeof Ionicons.glyphMap =
    status === 'completed' ? 'checkmark-circle-outline' : status === 'upcoming' ? 'warning-outline' : status === 'scheduled' ? 'calendar-outline' : 'time-outline';

  return (
    <View style={[styles.badge, { backgroundColor: badgeColor }, style]} testID={testID || `status.${status}`}>
      <Ionicons name={iconName} size={12} color="white" />
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});
