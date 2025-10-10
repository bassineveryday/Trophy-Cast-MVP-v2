
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { DashboardSkeleton } from '../components/Skeleton';
import AnimatedCard from '../components/AnimatedCard';

interface TournamentResult {
  event_date: string;
  lake: string;
  tournament_name: string;
  place: number;
  weight_lbs: number;
  aoy_points: number;
  cash_payout: number;
}

interface AOYData {
  aoy_rank: number;
  total_aoy_points: number;
}

interface TournamentEvent {
  event_date: string;
  lake: string;
  tournament_name: string;
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dashboard data
  const [lastTournament, setLastTournament] = useState<TournamentResult | null>(null);
  const [aoy, setAoy] = useState<AOYData | null>(null);
  const [earnings, setEarnings] = useState<number>(0);
  const [nextTournament, setNextTournament] = useState<TournamentEvent | null>(null);
  const [seasonStats, setSeasonStats] = useState<{
    tournaments: number;
    bestFinish: number | null;
    totalWeight: number;
    bigFish: number;
  }>({ tournaments: 0, bestFinish: null, totalWeight: 0, bigFish: 0 });

  const fetchDashboard = useCallback(async () => {
    if (!profile?.member_code) return;
    setLoading(true);
    setError(null);
    try {
      // Last tournament
      const { data: last, error: lastErr } = await supabase
        .from('tournament_results_rows')
        .select('event_date, lake, tournament_name, place, weight_lbs, aoy_points, cash_payout')
        .eq('member_id', profile.member_code)
        .order('event_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (lastErr) throw lastErr;
      setLastTournament(last);

      // AOY
      const { data: aoyData, error: aoyErr } = await supabase
        .from('aoy_standings_rows')
        .select('aoy_rank, total_aoy_points')
        .eq('member_id', profile.member_code)
        .maybeSingle();
      if (aoyErr) throw aoyErr;
      setAoy(aoyData);

      // Earnings 2025
      const { data: earningsRows, error: earnErr } = await supabase
        .from('tournament_results_rows')
        .select('cash_payout')
        .eq('member_id', profile.member_code)
        .gte('event_date', '2025-01-01');
      if (earnErr) throw earnErr;
      setEarnings(earningsRows?.reduce((sum, r) => sum + (parseFloat(r.cash_payout) || 0), 0) || 0);

      // Next tournament
      const { data: next, error: nextErr } = await supabase
        .from('tournament_events_rows')
        .select('lake, event_date, tournament_name')
        .gte('event_date', new Date().toISOString().slice(0, 10))
        .order('event_date', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (nextErr) throw nextErr;
      setNextTournament(next);

      // Season stats
      const { data: statsRows, error: statsErr } = await supabase
        .from('tournament_results_rows')
        .select('place, weight_lbs, big_fish')
        .eq('member_id', profile.member_code)
        .gte('event_date', '2025-01-01');
      if (statsErr) throw statsErr;
      setSeasonStats({
        tournaments: statsRows?.length || 0,
        bestFinish: statsRows?.reduce((min, r) => r.place && (!min || r.place < min) ? r.place : min, null as number | null),
        totalWeight: statsRows?.reduce((sum, r) => sum + (r.weight_lbs || 0), 0) || 0,
        bigFish: statsRows?.reduce((max, r) => r.big_fish && r.big_fish > max ? r.big_fish : max, 0) || 0,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.member_code]);

  useEffect(() => {
    if (profile?.member_code) fetchDashboard();
  }, [profile?.member_code, fetchDashboard]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  // Navigation placeholder
  const handleClubPress = () => {
    Alert.alert('Club Details', 'Navigate to Denver Bassmasters club page (placeholder)');
  };

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchDashboard} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Welcome */}
      <AnimatedCard style={styles.card} delay={0}>
        <Text style={styles.title}>Welcome back, {profile?.name || user?.email}!</Text>
        <Text style={styles.memberCode}>Member: {profile?.member_code}</Text>
      </AnimatedCard>

      {/* Club Card */}
      <AnimatedCard delay={100}>
      <TouchableOpacity style={[styles.card, styles.clubCard]} onPress={handleClubPress}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="trophy" size={24} color="#f39c12" />
          <Text style={styles.clubTitle}>Denver Bassmasters</Text>
        </View>
        <Text style={styles.clubSubtext}>Tap to view club details →</Text>
        <View style={styles.clubStatsRow}>
          <View style={styles.clubStat}><Text style={styles.clubStatLabel}>AOY Rank</Text><Text style={styles.clubStatValue}>{aoy?.aoy_rank ?? 'N/A'}</Text></View>
          <View style={styles.clubStat}><Text style={styles.clubStatLabel}>Points</Text><Text style={styles.clubStatValue}>{aoy?.total_aoy_points ?? 'N/A'}</Text></View>
          <View style={styles.clubStat}><Text style={styles.clubStatLabel}>2025 $</Text><Text style={styles.clubStatValue}>${earnings}</Text></View>
        </View>
      </TouchableOpacity>
      </AnimatedCard>

      {/* Last Tournament */}
      <AnimatedCard style={styles.card} delay={200}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="fish" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>Last Tournament</Text>
        </View>
        {lastTournament ? (
          <>
            <Text style={styles.tourneyText}>{lastTournament.lake} - {lastTournament.event_date}</Text>
            <Text style={styles.tourneyText}>Placement: {lastTournament.place ?? 'N/A'}</Text>
            <Text style={styles.tourneyText}>Weight: {lastTournament.weight_lbs ?? 'N/A'} lbs</Text>
            <Text style={styles.tourneyText}>Points: {lastTournament.aoy_points ?? 'N/A'}</Text>
            <Text style={styles.tourneyText}>Payout: ${lastTournament.cash_payout ?? 0}</Text>
          </>
        ) : <Text style={styles.tourneyText}>No tournaments found.</Text>}
      </AnimatedCard>

      {/* Next Tournament */}
      <AnimatedCard style={styles.card} delay={300}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="calendar" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>Next Tournament</Text>
        </View>
        {nextTournament ? (
          <>
            <Text style={styles.tourneyText}>{nextTournament.lake} - {nextTournament.event_date}</Text>
          </>
        ) : <Text style={styles.tourneyText}>No upcoming tournaments.</Text>}
      </AnimatedCard>

      {/* Season Stats */}
      <AnimatedCard style={styles.card} delay={400}>
        <View style={styles.cardTitleRow}>
          <Ionicons name="stats-chart" size={20} color="#3498db" />
          <Text style={styles.sectionTitle}>2025 Season Stats</Text>
        </View>
        <Text style={styles.tourneyText}>Tournaments Fished: {seasonStats.tournaments}</Text>
        <Text style={styles.tourneyText}>Best Finish: {seasonStats.bestFinish ?? 'N/A'}</Text>
        <Text style={styles.tourneyText}>Total Weight: {seasonStats.totalWeight} lbs</Text>
        <Text style={styles.tourneyText}>Big Fish: {seasonStats.bigFish} lbs</Text>
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4f6fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#2c3e50',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memberCode: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  clubCard: {
    borderColor: '#0066CC',
    borderWidth: 1.5,
    marginBottom: 20,
  },
  clubTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 2,
  },
  clubSubtext: {
    color: '#34495e',
    fontSize: 14,
    marginBottom: 8,
  },
  clubStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  clubStat: {
    alignItems: 'center',
    flex: 1,
  },
  clubStatLabel: {
    color: '#7f8c8d',
    fontSize: 13,
  },
  clubStatValue: {
    color: '#2c3e50',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 6,
  },
  tourneyText: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 2,
  },
});