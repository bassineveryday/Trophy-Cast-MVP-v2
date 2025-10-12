
import React from 'react';
import { StyleSheet, Text, View, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';
import { useDashboard, useRecentTournamentResults } from '../lib/hooks/useQueries';
import { DashboardSkeleton } from '../components/Skeleton';
import AnimatedCard from '../components/AnimatedCard';

interface TournamentResult {
  event_date: string;
  lake: string;
  tournament_name: string;
  place: number;
  weight_lbs: number;
  aoy_points: number;
  payout: number;
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
  console.log('🏠 HomeScreen rendering');
  
  const { user, profile } = useAuth();
  console.log('Auth state:', { user: user?.email, profile: profile?.member_code });
  
  // Use React Query hook for dashboard data (rename `data` to `dashboard` to match TournamentsScreen pattern)
  const { data: dashboard, isLoading, error, refetch, isRefetching } = useDashboard(profile?.member_code);

  console.log('Dashboard query state:', {
    hasData: !!dashboard,
    isLoading,
    error: error?.message,
    memberCode: profile?.member_code,
  });

  // 🔍 EXPLICIT DEBUG OUTPUT - Check browser console for this
  console.group('🏠 HomeScreen Data Debug');
  console.log('Profile:', profile);
  console.log('Member Code:', profile?.member_code);
  console.log('Raw dashboard data:', dashboard);
  console.log('Loading state:', isLoading);
  console.log('Error:', error);
  console.groupEnd();

  // Extract data from React Query response
  const lastTournament = dashboard?.lastTournament || null;
  const aoy = dashboard?.aoyData || null;
  const earnings = dashboard?.earnings || 0;
  const nextTournament = dashboard?.nextTournament || null;
  const seasonStats = dashboard?.seasonStats || { tournaments: 0, bestFinish: null, totalWeight: 0, bigFish: 0 };

  const earningsNumber = Number(earnings) || 0;

  const onRefresh = () => {
    refetch();
  };

  // Quick QA hook: recent results across the DB to verify uploaded rows are visible
  const { data: recentResults } = useRecentTournamentResults(5);

  // Navigation placeholder
  const handleClubPress = () => {
    Alert.alert('Club Details', 'Navigate to Denver Bassmasters club page (placeholder)');
  };

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Loading your dashboard...</Text>
        </View>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Text style={styles.tourneyText}>Check the console for details (F12)</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state - only show when there's absolutely no dashboard payload.
  // Previously we hid the dashboard when lastTournament was missing; that
  // caused valid AOY/earnings to be hidden. Only bail out if `data` is falsy.
  if (!dashboard) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>⚠️ No Dashboard Data</Text>
          <Text style={styles.tourneyText}>
            Your query returned no results. Check the browser console (F12) for details.
          </Text>
          <Text style={[styles.tourneyText, { marginTop: 12 }]}>
            Member Code: {profile?.member_code || 'NOT SET'}
          </Text>
          <Text style={styles.tourneyText}>
            Database may be empty or RLS policies may be blocking access.
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Welcome */}
      <AnimatedCard style={styles.card} delay={0} animation="slideUp">
        <Text style={styles.title}>Welcome back, {profile?.name || user?.email}!</Text>
        <Text style={styles.memberCode}>Member: {profile?.member_code}</Text>
      </AnimatedCard>

      {/* Club Card */}
      <TouchableOpacity
        style={[styles.card, styles.clubCard]}
        onPress={handleClubPress}
        accessibilityRole="button"
        accessibilityLabel="View Denver Bassmasters club details"
        accessibilityHint={`Shows your AOY rank of ${aoy?.aoy_rank ?? 'N/A'}, ${aoy?.total_aoy_points ?? 'N/A'} points, and $${earningsNumber.toFixed(2)} earnings`}
      >
        <AnimatedCard style={{ margin: 0 }} delay={60} animation="slideUp" enabled>
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
        </AnimatedCard>
      </TouchableOpacity>

      {/* Last Tournament */}
      <AnimatedCard style={styles.card} delay={120} animation="slideUp">
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
            <Text style={styles.tourneyText}>Payout: ${(() => {
              const lt: any = lastTournament as any;
              const raw = lt?.payout != null ? lt.payout : lt?.cash_payout;
              const n = raw == null ? 0 : Number(String(raw).replace(/[^0-9.-]+/g, ''));
              return Number.isFinite(n) ? n : 0;
            })()}</Text>
          </>
        ) : <Text style={styles.tourneyText}>No tournaments found.</Text>}
      </AnimatedCard>

      {/* Dev-only debug panel showing raw dashboard payload to diagnose blank-screen */}
      {typeof __DEV__ !== 'undefined' && __DEV__ && (
        <AnimatedCard style={styles.card} delay={180} animation="fade" enabled>
          <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Debug (dev only)</Text>
          <ScrollView style={{ maxHeight: 160 }}>
            <Text style={styles.tourneyText}>{JSON.stringify(dashboard, null, 2)}</Text>
          </ScrollView>
        </AnimatedCard>
      )}

      {/* Recent Results (dev QA) */}
      <AnimatedCard style={styles.card} delay={200} animation="slideUp">
        <View style={styles.cardTitleRow}>
          <Ionicons name="list" size={18} color="#2c3e50" />
          <Text style={styles.sectionTitle}>Recent Results (QA)</Text>
        </View>
        {recentResults && recentResults.length > 0 ? (
          recentResults.map((r: any, idx: number) => (
            <Text key={idx} style={styles.tourneyText}>{r.event_date} — {r.tournament_name} @ {r.lake} — {r.weight_lbs || '0'} lbs</Text>
          ))
        ) : (
          <Text style={styles.tourneyText}>No recent results found.</Text>
        )}
      </AnimatedCard>

      {/* Next Tournament */}
      <AnimatedCard style={styles.card} delay={240} animation="slideUp">
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
      <AnimatedCard style={styles.card} delay={300} animation="slideUp">
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