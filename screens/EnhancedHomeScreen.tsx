import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useDashboard, useTournaments, useAOYStandings } from '../lib/hooks/useQueries';
import Skeleton, { DashboardSkeleton, CardSkeleton } from '../components/Skeleton';
import AnimatedCard from '../components/AnimatedCard';
import ThemeToggle from '../components/ThemeToggle';
import { showSuccess } from '../utils/toast';

const { width } = Dimensions.get('window');

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

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  screen: string;
  description?: string;
}

export default function EnhancedHomeScreen() {
  console.log('🏠 Enhanced HomeScreen rendering');
  
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { data: tournaments } = useTournaments();
  const { data: standings } = useAOYStandings();
  
  console.log('Auth state:', { user: user?.email, profile: profile?.member_code });
  
  // Use React Query hook for dashboard data
  const { data: dashboard, isLoading, error, refetch, isRefetching } = useDashboard(profile?.member_code);

  console.log('Dashboard query state:', {
    hasData: !!dashboard,
    isLoading,
    error: error?.message,
    memberCode: profile?.member_code,
  });

  // Extract data from React Query response
  const lastTournament = dashboard?.lastTournament || null;
  const aoy = dashboard?.aoyData || null;
  const earnings = dashboard?.earnings || 0;
  const nextTournament = dashboard?.nextTournament || null;
  const seasonStats = dashboard?.seasonStats || { tournaments: 0, bestFinish: null, totalWeight: 0, bigFish: 0 };

  const earningsNumber = Number(earnings) || 0;

  // Quick actions for easy navigation
  const quickActions: QuickAction[] = [
    {
      id: 'tournaments',
      title: 'Tournaments',
      icon: 'fish',
      color: '#4CAF50',
      screen: 'Tournaments',
      description: 'Browse & register'
    },
    {
      id: 'aoy',
      title: 'AOY Standings',
      icon: 'trophy',
      color: '#FFD700',
      screen: 'AOY',
      description: 'View rankings'
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: 'person',
      color: '#2196F3',
      screen: 'Profile',
      description: 'Manage account'
    },
    {
      id: 'club',
      title: 'Club Info',
      icon: 'people',
      color: '#9C27B0',
      screen: 'Club',
      description: 'Denver BM'
    }
  ];

  // Helper: try to match a dashboard tournament object to an event in the tournaments list
  const findEventId = (t: { tournament_name?: string; event_date?: string; lake?: string } | null) => {
    if (!t || !tournaments || tournaments.length === 0) return null;
    return (
      tournaments.find((ev: any) => {
        if (!ev) return false;
        // match by name and date if possible
        const sameName = ev.tournament_name && t.tournament_name && ev.tournament_name.trim().toLowerCase() === t.tournament_name.trim().toLowerCase();
        const sameDate = ev.event_date && t.event_date && new Date(ev.event_date).toISOString().slice(0,10) === new Date(t.event_date || '').toISOString().slice(0,10);
        const sameLake = ev.lake && t.lake && ev.lake.trim().toLowerCase() === t.lake.trim().toLowerCase();
        return (sameName && (sameDate || sameLake)) || sameName;
      }) || null
    )?.event_id || null;
  };

  const handleStatPress = (target: 'aoy' | 'points' | 'earnings') => {
    if (target === 'aoy' || target === 'points') {
      (navigation as any).navigate('AOY');
    } else if (target === 'earnings') {
      (navigation as any).navigate('Profile');
    }
  };

  const handlePerformancePress = () => {
    const eventId = findEventId(lastTournament as any);
    if (eventId) {
      (navigation as any).navigate('TournamentDetail', { tournamentId: eventId });
    } else {
      (navigation as any).navigate('Tournaments');
    }
  };

  const handleUpcomingPress = () => {
    const eventId = findEventId(nextTournament as any);
    if (eventId) {
      (navigation as any).navigate('TournamentDetail', { tournamentId: eventId });
    } else {
      (navigation as any).navigate('Tournaments');
    }
  };

  const onRefresh = () => {
    refetch();
  };

  const handleQuickAction = (action: QuickAction) => {
    (navigation as any).navigate(action.screen);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getRankSuffix = (rank: number) => {
    if (!rank) return '';
    if (rank % 10 === 1 && rank % 100 !== 11) return 'st';
    if (rank % 10 === 2 && rank % 100 !== 12) return 'nd';
    if (rank % 10 === 3 && rank % 100 !== 13) return 'rd';
    return 'th';
  };

  const getProgressPercentage = (current: number, total: number) => {
    if (!total || total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  // Loading state
  if (isLoading && !dashboard) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Trophy Cast</Text>
          <Text style={styles.headerSubtitle}>Loading your dashboard...</Text>
        </View>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#E91E63" />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!dashboard) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Trophy Cast</Text>
          <Text style={styles.headerSubtitle}>Welcome to your fishing dashboard</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.emptyStateContainer}>
            <Ionicons name="fish-outline" size={64} color="#666" />
            <Text style={styles.emptyStateTitle}>No Data Available</Text>
            <Text style={styles.emptyStateText}>
              Your tournament data will appear here once you participate in events.
            </Text>
            <Text style={styles.memberInfoText}>
              Member: {profile?.member_code || 'Not Set'}
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.refreshButton}>
              <Ionicons name="refresh" size={18} color="#4CAF50" />
              <Text style={styles.refreshButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl 
          refreshing={isRefetching} 
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={[styles.headerContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.welcomeSection}>
            {/* show skeletons while refreshing for perceived performance */}
            {isRefetching ? (
              <>
                <Skeleton width={180} height={28} borderRadius={6} />
                <Skeleton width={120} height={18} borderRadius={6} style={{ marginTop: 8 }} />
              </>
            ) : (
              <>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Welcome back!</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {profile?.name || user?.email?.split('@')[0] || 'Angler'}
                </Text>
              </>
            )}
          </View>
        <View style={styles.headerActions}>
          <ThemeToggle compact />
          <View style={[styles.memberBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="card" size={16} color={theme.primary} />
            <Text style={[styles.memberCode, { color: theme.text }]}>{profile?.member_code || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Overview */}
      <View style={styles.statsOverview}>
        {isRefetching ? (
          // show three lightweight skeleton stat cards while refreshing
          <>
            <View style={styles.statCard}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={26} style={{ marginTop: 12 }} />
            </View>
            <View style={styles.statCard}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={26} style={{ marginTop: 12 }} />
            </View>
            <View style={styles.statCard}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={26} style={{ marginTop: 12 }} />
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.85}
              onPress={() => handleStatPress('aoy')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={aoy?.aoy_rank ? `AOY rank ${aoy.aoy_rank}` : 'AOY rank not available'}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={24} color="#FFD700" />
              </View>
              <Text style={styles.statLabel}>AOY Rank</Text>
              <Text style={styles.statValue}>
                {aoy?.aoy_rank ? `#${aoy.aoy_rank}` : 'N/A'}
              </Text>
              {aoy?.aoy_rank && (
                <Text style={styles.statSuffix}>
                  {getRankSuffix(aoy.aoy_rank)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.85}
              onPress={() => handleStatPress('points')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Total points ${aoy?.total_aoy_points || 0}`}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statLabel}>Points</Text>
              <Text style={styles.statValue}>
                {aoy?.total_aoy_points || '0'}
              </Text>
              <Text style={styles.statSuffix}>pts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statCard}
              activeOpacity={0.85}
              onPress={() => handleStatPress('earnings')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Earnings ${earningsNumber.toFixed(0)} dollars`}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="cash" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statLabel}>Earnings</Text>
              <Text style={styles.statValue}>
                ${earningsNumber.toFixed(0)}
              </Text>
              <Text style={styles.statSuffix}>2025</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => handleQuickAction(action)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${action.title} - ${action.description}`}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="#fff" accessibilityLabel={`${action.title} icon`} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Tournament Performance */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Performance</Text>
        <TouchableOpacity onPress={handlePerformancePress} activeOpacity={0.9} accessible accessibilityRole="button" accessibilityLabel="Open last tournament details">
          <AnimatedCard style={styles.performanceCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="fish" size={20} color="#4CAF50" />
              <Text style={styles.cardTitle}>Last Tournament</Text>
            </View>
            {lastTournament && (
              <View style={styles.placementBadge}>
                <Text style={styles.placementText}>
                  #{lastTournament.place || 'N/A'}
                </Text>
              </View>
            )}
          </View>
          
          {lastTournament ? (
            <View style={styles.tournamentDetails}>
              <Text style={styles.tournamentName}>{lastTournament.tournament_name}</Text>
              <Text style={styles.tournamentLocation}>
                📍 {lastTournament.lake} • {formatDate(lastTournament.event_date)}
              </Text>
              
              <View style={styles.performanceStats}>
                <View style={styles.performanceStat}>
                  <Ionicons name="scale-outline" size={16} color="#666" />
                  <Text style={styles.performanceLabel}>Weight</Text>
                  <Text style={styles.performanceValue}>
                    {lastTournament.weight_lbs || 'N/A'} lbs
                  </Text>
                </View>
                
                <View style={styles.performanceStat}>
                  <Ionicons name="star-outline" size={16} color="#666" />
                  <Text style={styles.performanceLabel}>Points</Text>
                  <Text style={styles.performanceValue}>
                    {lastTournament.aoy_points || '0'}
                  </Text>
                </View>
                
                <View style={styles.performanceStat}>
                  <Ionicons name="cash-outline" size={16} color="#666" />
                  <Text style={styles.performanceLabel}>Payout</Text>
                  <Text style={styles.performanceValue}>
                    ${Number(lastTournament?.payout) || 0}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyTournament}>
              <Ionicons name="calendar-outline" size={32} color="#999" />
              <Text style={styles.emptyTournamentText}>
                No tournament results yet
              </Text>
              <Text style={styles.emptyTournamentSubtext}>
                Your performance will show here after your first tournament
              </Text>
            </View>
          )}
          </AnimatedCard>
        </TouchableOpacity>
      </View>

      {/* Upcoming Tournament */}
      {nextTournament && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Coming Up</Text>
          <TouchableOpacity onPress={handleUpcomingPress} activeOpacity={0.9} accessible accessibilityRole="button" accessibilityLabel={`Open details for ${nextTournament.tournament_name}`}>
            <AnimatedCard style={styles.upcomingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="calendar" size={20} color="#FF9800" />
                <Text style={styles.cardTitle}>Next Tournament</Text>
              </View>
              <View style={styles.upcomingBadge}>
                <Ionicons name="time" size={12} color="#FF9800" />
                <Text style={styles.upcomingText}>Soon</Text>
              </View>
            </View>
            
            <View style={styles.upcomingDetails}>
              <Text style={styles.upcomingName}>{nextTournament.tournament_name}</Text>
              <Text style={styles.upcomingLocation}>
                📍 {nextTournament.lake} • {formatDate(nextTournament.event_date)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.registerButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Register for ${nextTournament.tournament_name} on ${formatDate(nextTournament.event_date)}`}
              onPress={() => {
                // placeholder for registration flow; show success feedback for now
                showSuccess('Registered', `You are registered for ${nextTournament.tournament_name}`);
              }}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.registerButtonText}>Register Now</Text>
            </TouchableOpacity>
            </AnimatedCard>
          </TouchableOpacity>
        </View>
      )}

      {/* Season Progress */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>2025 Season Progress</Text>
        <AnimatedCard style={styles.progressCard}>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{seasonStats.tournaments}</Text>
              <Text style={styles.progressLabel}>Tournaments</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getProgressPercentage(seasonStats.tournaments, 12)}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>
                {seasonStats.bestFinish ? `#${seasonStats.bestFinish}` : 'N/A'}
              </Text>
              <Text style={styles.progressLabel}>Best Finish</Text>
            </View>
            
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{seasonStats.totalWeight}</Text>
              <Text style={styles.progressLabel}>Total Weight</Text>
            </View>
            
            <View style={styles.progressStat}>
              <Text style={styles.progressValue}>{seasonStats.bigFish}</Text>
              <Text style={styles.progressLabel}>Big Fish</Text>
            </View>
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  memberCode: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statIconContainer: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statSuffix: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  performanceCard: {
    marginHorizontal: 20,
  },
  upcomingCard: {
    marginHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  progressCard: {
    marginHorizontal: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  placementBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  placementText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tournamentDetails: {
    // No additional styles needed
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  tournamentLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  emptyTournament: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTournamentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
    marginTop: 12,
  },
  emptyTournamentSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 4,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 4,
  },
  upcomingDetails: {
    marginBottom: 16,
  },
  upcomingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  upcomingLocation: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 12,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStat: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f8f9fa',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  memberInfoText: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 6,
  },
});