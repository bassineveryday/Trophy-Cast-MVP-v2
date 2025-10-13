/**
 * DashboardCards - 2x2 Grid of Dashboard Stat Cards
 * 
 * Features:
 * - Catches This Month
 * - Active Plans/Quest
 * - Upcoming Tournaments
 * - Notifications
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface DashboardCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  onPress?: () => void;
}

/**
 * Individual Dashboard Card
 */
function DashboardCard({ icon, title, value, subtitle, color, onPress }: DashboardCardProps) {
  const isWeb = Platform.OS === 'web';
  const gradientColors = [color, color] as const;

  const content = (
    <>
      {isWeb ? (
        <View style={[styles.gradient, { backgroundColor: color }]} />
      ) : (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      )}
      
      <View style={styles.cardContent}>
        <Ionicons name={icon} size={32} color="#ffffff" style={styles.icon} />
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.card}>{content}</View>;
}

interface DashboardCardsProps {
  catchesThisMonth: number;
  catchesChange?: string;
  activePlan?: string;
  nextTournament?: string;
  nextTournamentDate?: string;
  notificationCount?: number;
  onCatchesPress?: () => void;
  onPlanPress?: () => void;
  onTournamentsPress?: () => void;
  onNotificationsPress?: () => void;
}

/**
 * Dashboard Cards Component
 */
export default function DashboardCards({
  catchesThisMonth,
  catchesChange,
  activePlan = 'Active Plans',
  nextTournament,
  nextTournamentDate,
  notificationCount = 0,
  onCatchesPress,
  onPlanPress,
  onTournamentsPress,
  onNotificationsPress,
}: DashboardCardsProps) {
  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        {/* Catches This Month */}
        <DashboardCard
          icon="fish"
          title="Catches This Month"
          value={catchesThisMonth}
          subtitle={catchesChange}
          color="#22d3ee"
          onPress={onCatchesPress}
        />

        {/* Active Plans */}
        <DashboardCard
          icon="compass"
          title={activePlan}
          value="3"
          subtitle={nextTournament ? `Next: ${nextTournament}` : 'Next: Lake Guntersville'}
          color="#22d3ee"
          onPress={onPlanPress}
        />
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {/* Upcoming Tournaments */}
        <DashboardCard
          icon="calendar"
          title="Tournaments"
          value="3"
          subtitle={nextTournamentDate || '3 Upcoming'}
          color="#22d3ee"
          onPress={onTournamentsPress}
        />

        {/* Notifications */}
        <DashboardCard
          icon="notifications"
          title="Performance"
          value="94%"
          subtitle="Strong trend"
          color="#22d3ee"
          onPress={onNotificationsPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    minHeight: 140,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  icon: {
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ffffff',
    opacity: 0.7,
    marginTop: 4,
  },
});
