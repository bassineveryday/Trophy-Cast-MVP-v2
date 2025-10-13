import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card, { CardPressable } from './Card';
import Skeleton from './Skeleton';
import { useReducedMotion } from '../hooks/useReducedMotion';

export type HeroStats = {
  aoyRank?: number;
  totalPoints?: number;
  tournaments?: number;
  wins?: number;
  top10s?: number;
  pbLbs?: number;
};

type HeroDashboardProps = {
  stats?: HeroStats;
  loading?: boolean;
  onViewProfile?: () => void;
  testID?: string;
};

const HeroDashboard: React.FC<HeroDashboardProps> = ({ stats, loading, onViewProfile, testID }) => {
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <Card padding="xl" variant="primary" testID={`${testID ?? 'home.hero'}.skeleton`} style={styles.card}>
        <Skeleton width="55%" height={28} />
        <View style={{ height: 12 }} />
        <Skeleton width="80%" height={18} />
      </Card>
    );
  }

  return (
    <CardPressable
      variant="primary"
      onPress={() => onViewProfile?.()}
      testID={testID ?? 'home.hero'}
      style={styles.card}
    >
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title}>You’re crushing it, angler 🎣</Text>
          <Text style={styles.subtitle}>
            AOY Rank #{stats?.aoyRank ?? '—'} • {stats?.totalPoints ?? 0} pts
          </Text>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats?.tournaments ?? 0}</Text>
              <Text style={styles.statLabel}>Tournaments</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats?.wins ?? 0}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{stats?.pbLbs ?? 0} lb</Text>
              <Text style={styles.statLabel}>Personal Best</Text>
            </View>
          </View>
        </View>

        <View style={styles.trophy}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <Text style={styles.trophyLabel}>Trophies</Text>
        </View>
      </View>
    </CardPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: '#9CA3AF',
  },
  statRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  stat: {
    minWidth: 84,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6B7280',
    marginTop: 4,
    fontSize: 12,
  },
  trophy: {
    marginLeft: 16,
    alignItems: 'center',
    width: 72,
  },
  trophyEmoji: {
    fontSize: 36,
    color: '#D4AF37',
  },
  trophyLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },
});

export default HeroDashboard;
