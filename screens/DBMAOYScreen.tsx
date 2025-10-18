/**
 * DBM AOY (Angler of the Year) Screen
 * 
 * Displays current AOY standings with:
 * - AOY rank and points
 * - Last tournament results
 * - Top angler highlight
 * - Real-time updates as tournaments are uploaded
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Colors matching Trophy Cast theme
const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  error: '#FF6B6B',
  success: '#4CAF50',
};

interface AOYStanding {
  member_id: string;
  member_name: string;
  aoy_rank: number;
  total_aoy_points: number;
  season_year: number;
}

interface LastTournament {
  member_id: string;
  tournament_name: string;
  event_date: string;
  place: number;
  weight_lbs: number;
  aoy_points: number;
}

export function DBMAOYScreen() {
  const navigation = useNavigation();
  const [standings, setStandings] = useState<AOYStanding[]>([]);
  const [lastTournaments, setLastTournaments] = useState<Record<string, LastTournament>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAOYData();
  }, []);

  const fetchAOYData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch AOY standings ordered by rank
      const { data: standingsData, error: standingsError } = await supabase
        .from('aoy_standings')
        .select('member_id, member_name, aoy_rank, total_aoy_points, season_year')
        .eq('season_year', new Date().getFullYear())
        .order('aoy_rank', { ascending: true });

      if (standingsError) throw standingsError;

      if (standingsData) {
        setStandings(standingsData as AOYStanding[]);

        // For each top 10, fetch their last tournament
        const lastTournamentMap: Record<string, LastTournament> = {};
        
        for (const member of standingsData.slice(0, 10)) {
          const { data: tournamentData, error: tourError } = await supabase
            .from('tournament_results')
            .select('member_id, tournament_name, event_date, place, weight_lbs, aoy_points')
            .eq('member_id', member.member_id)
            .order('event_date', { ascending: false })
            .limit(1);

          if (!tourError && tournamentData && tournamentData.length > 0) {
            lastTournamentMap[member.member_id] = tournamentData[0] as LastTournament;
          }
        }

        setLastTournaments(lastTournamentMap);
      }
    } catch (err: any) {
      console.error('Error fetching AOY data:', err);
      setError(err.message || 'Failed to load AOY standings');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAOYData();
  };

  const renderAOYCard = ({ item, index }: { item: AOYStanding; index: number }) => {
    const lastTourney = lastTournaments[item.member_id];
    const getMedalEmoji = (rank: number) => {
      if (rank === 1) return '🥇';
      if (rank === 2) return '🥈';
      if (rank === 3) return '🥉';
      return '';
    };

    return (
      <Pressable
        style={styles.aoyCard}
        onPress={() => {
          (navigation as any).navigate('MemberProfile', {
            member_id: item.member_id,
            member_name: item.member_name,
          });
        }}
      >
        {/* Rank Badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{getMedalEmoji(item.aoy_rank)} #{item.aoy_rank}</Text>
        </View>

        {/* Member Info */}
        <View style={styles.memberContent}>
          {/* Name and Points */}
          <View style={styles.nameSection}>
            <Text style={styles.memberName}>{item.member_name}</Text>
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsLabel}>AOY Points:</Text>
              <Text style={styles.pointsValue}>{item.total_aoy_points}</Text>
            </View>
          </View>

          {/* Last Tournament Info */}
          {lastTourney && (
            <View style={styles.lastTourneySection}>
              <Text style={styles.lastTourneyLabel}>Last Tournament:</Text>
              <View style={styles.tourneyDetails}>
                <Text style={styles.tourneyName}>{lastTourney.tournament_name}</Text>
                <View style={styles.tourneyStats}>
                  <Text style={styles.statBadge}>
                    🎣 Wt: {typeof lastTourney.weight_lbs === 'number' 
                      ? lastTourney.weight_lbs.toFixed(1) 
                      : (parseFloat(lastTourney.weight_lbs as string) || 0).toFixed(1)} lbs
                  </Text>
                  <Text style={styles.statBadge}>
                    📊 Place: {lastTourney.place}
                  </Text>
                  <Text style={styles.pointsBadge}>
                    ⭐ {lastTourney.aoy_points} pts
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Arrow */}
        <Ionicons name="chevron-forward" size={24} color={COLORS.gold} />
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading AOY standings...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Error Loading AOY</Text>
          <Text style={styles.errorDetail}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchAOYData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (standings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={48} color={COLORS.gold} />
          <Text style={styles.emptyText}>No AOY standings available</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Angler of the Year</Text>
        <Text style={styles.headerSubtitle}>2025 Season Standings</Text>
      </View>

      {/* Top Angler Highlight */}
      {standings.length > 0 && (
        <View style={styles.topAnglerContainer}>
          <View style={styles.topAnglerBadge}>
            <Text style={styles.topAnglerEmoji}>🏆</Text>
            <Text style={styles.topAnglerLabel}>Top Angler</Text>
          </View>
          <Text style={styles.topAnglerName}>{standings[0].member_name}</Text>
          <Text style={styles.topAnglerPoints}>{standings[0].total_aoy_points} Points</Text>
        </View>
      )}

      {/* AOY Rankings List */}
      <View style={styles.listContainer}>
        <FlatList
          data={standings}
          renderItem={renderAOYCard}
          keyExtractor={(item) => item.member_id}
          scrollEnabled={false}
        />
      </View>

      {/* Footer Spacer */}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.navyBorder,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  topAnglerContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.navyBorder,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: 12,
    alignItems: 'center',
  },
  topAnglerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  topAnglerEmoji: {
    fontSize: 32,
  },
  topAnglerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  topAnglerName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  topAnglerPoints: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gold,
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  aoyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: COLORS.navyBorder,
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    borderRadius: 8,
    gap: 12,
  },
  rankBadge: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
  },
  memberContent: {
    flex: 1,
  },
  nameSection: {
    marginBottom: 8,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsLabel: {
    fontSize: 11,
    color: COLORS.textGray,
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gold,
  },
  lastTourneySection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.navy,
  },
  lastTourneyLabel: {
    fontSize: 10,
    color: COLORS.textGray,
    marginBottom: 6,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  tourneyDetails: {
    gap: 6,
  },
  tourneyName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  tourneyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statBadge: {
    fontSize: 10,
    color: COLORS.textGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.navy,
    borderRadius: 4,
  },
  pointsBadge: {
    fontSize: 10,
    color: COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.navy,
    borderRadius: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textLight,
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  errorDetail: {
    color: COLORS.textGray,
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
    marginTop: 12,
    fontSize: 14,
  },
});
