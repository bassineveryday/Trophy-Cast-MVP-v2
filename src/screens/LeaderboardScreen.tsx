import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { supabase } from '../services/supabase';
import { LeaderboardEntry } from '../types';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';

export const LeaderboardScreen: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      // This query would need to be adjusted based on your actual database schema
      // For now, we'll fetch tournament results with anglers
      const { data, error } = await supabase
        .from('tournament_results')
        .select(`
          *,
          angler:anglers(*)
        `)
        .order('points', { ascending: false });

      if (error) throw error;

      // Aggregate data by angler
      const anglerMap = new Map<string, LeaderboardEntry>();
      
      data?.forEach((result: any) => {
        const anglerId = result.angler_id;
        if (!anglerMap.has(anglerId)) {
          anglerMap.set(anglerId, {
            angler_id: anglerId,
            angler: result.angler,
            total_points: 0,
            tournaments_fished: 0,
            total_weight: 0,
            best_finish: 999,
          });
        }
        
        const entry = anglerMap.get(anglerId)!;
        entry.total_points += result.points || 0;
        entry.tournaments_fished += 1;
        entry.total_weight += result.total_weight || 0;
        entry.best_finish = Math.min(entry.best_finish, result.placement || 999);
      });

      const leaderboardData = Array.from(anglerMap.values())
        .sort((a, b) => b.total_points - a.total_points);

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `${position}.`;
    }
  };

  const renderLeaderboardEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => (
    <Card>
      <View style={styles.entryContainer}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{getMedalEmoji(index + 1)}</Text>
        </View>
        <View style={styles.anglerInfo}>
          <Text style={styles.anglerName}>
            {item.angler.first_name} {item.angler.last_name}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>
              {item.tournaments_fished} tournament{item.tournaments_fished !== 1 ? 's' : ''}
            </Text>
            <Text style={styles.statText}>•</Text>
            <Text style={styles.statText}>Best: #{item.best_finish}</Text>
          </View>
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{item.total_points}</Text>
          <Text style={styles.pointsLabel}>pts</Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <Loading message="Loading leaderboard..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardEntry}
        keyExtractor={(item) => item.angler_id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No leaderboard data</Text>
            <Text style={styles.emptySubtext}>Complete tournaments to see rankings!</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    paddingVertical: 8,
  },
  entryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  anglerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  anglerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  pointsContainer: {
    alignItems: 'center',
    marginLeft: 12,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
