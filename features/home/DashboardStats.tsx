/**
 * DashboardStats.tsx - 2×2 grid of dashboard statistics
 *
 * Four cards:
 * 1. Catches (this month)
 * 2. Plans (upcoming trips)
 * 3. Tournaments (next 30 days)
 * 4. Performance (last 5 trips trend)
 *
 * Each card is pressable and navigates to relevant screens.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '../../components/StatCard';
import { useDashboardStats } from './useDashboardStats';

export function DashboardStats() {
  const { data, loading } = useDashboardStats();

  return (
    <View style={styles.container}>
      {/* Row 1: Catches & Plans */}
      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <StatCard
            label="Catches"
            value={data?.catches ?? 0}
            sublabel="this month"
            loading={loading}
            icon={<Ionicons name="fish" size={18} color="#C9A646" />}
            onPress={data?.onOpenTrophyRoom}
            testID="stat-catches"
          />
        </View>
        <View style={styles.cardContainer}>
          <StatCard
            label="Plans"
            value={data?.plans ?? 0}
            sublabel="upcoming trips"
            loading={loading}
            icon={<Ionicons name="calendar" size={18} color="#C9A646" />}
            onPress={data?.onOpenPlans}
            testID="stat-plans"
          />
        </View>
      </View>

      {/* Row 2: Tournaments & Performance */}
      <View style={styles.row}>
        <View style={styles.cardContainer}>
          <StatCard
            label="Tournaments"
            value={data?.tournaments ?? 0}
            sublabel="next 30 days"
            loading={loading}
            icon={<Ionicons name="trophy" size={18} color="#C9A646" />}
            onPress={data?.onOpenTournaments}
            testID="stat-tournaments"
          />
        </View>
        <View style={styles.cardContainer}>
          <StatCard
            label="Performance"
            value={data?.performanceText ?? '—'}
            sublabel={data?.performanceSub ?? 'last 5 trips'}
            loading={loading}
            icon={<Ionicons name="trending-up" size={18} color="#C9A646" />}
            onPress={data?.onOpenCoach}
            testID="stat-performance"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cardContainer: {
    flex: 1,
  },
});
