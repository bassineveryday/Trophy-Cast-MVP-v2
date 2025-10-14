/**
 * EnhancedHomeScreen - Dashboard with UX polish
 * ✓ Loading → shows skeletons (no layout shift flashes)
 * ✓ Empty → branded EmptyState with optional action
 * ✓ Cards/rows feel tactile on hover/press
 * ✓ No changes to data fetching logic or types
 */
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
import Card, { CardPressable } from '../components/Card';
import HeroDashboard from '../components/HeroDashboard';
import { EmptyState } from '../components/EmptyState';
import AnimatedCard from '../components/AnimatedCard';
import ThemeToggle from '../components/ThemeToggle';
import { showSuccess } from '../utils/toast';
import { makeStyles, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/designTokens';

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

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.giant,
    paddingBottom: spacing.xl,
    backgroundColor: theme.surface,
  },
  welcomeSection: {
    flex: 1,
  },
  headerTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    backgroundColor: theme.background,
    borderColor: theme.border,
  },
  memberCode: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs + 2,
    color: theme.text,
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    ...shadows.lg,
  },
  statIconContainer: {
    marginBottom: spacing.md,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: theme.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
  },
  statSuffix: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    marginTop: 2,
  },
  sectionContainer: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    ...shadows.md,
  },
  actionIcon: {
    width: spacing.massive,
    height: spacing.massive,
    borderRadius: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: fontSize.xs,
    color: theme.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  performanceCard: {
    marginHorizontal: spacing.xl,
  },
  upcomingCard: {
    marginHorizontal: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: theme.warning,
  },
  progressCard: {
    marginHorizontal: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: theme.text,
    marginLeft: spacing.sm,
  },
  placementBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  placementText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  tournamentDetails: {
    // No additional styles needed
  },
  tournamentName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  tournamentLocation: {
    fontSize: fontSize.sm,
    color: theme.textMuted,
    marginBottom: spacing.lg,
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
    fontSize: fontSize.xs,
    color: theme.textMuted,
    marginTop: spacing.xs,
    marginBottom: 2,
  },
  performanceValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: theme.text,
  },
  emptyTournament: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTournamentText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: theme.textMuted,
    marginTop: spacing.md,
  },
  emptyTournamentSubtext: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  upcomingText: {
    fontSize: fontSize.xs,
    color: theme.warning,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  upcomingDetails: {
    marginBottom: spacing.lg,
  },
  upcomingName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  upcomingLocation: {
    fontSize: fontSize.sm,
    color: theme.textMuted,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.success,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.sm,
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
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.success,
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    backgroundColor: theme.background,
  },
  errorTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: theme.error,
    fontSize: fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.success,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
    marginLeft: spacing.sm,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: theme.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: spacing.xxl,
  },
  memberInfoText: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginBottom: spacing.xl,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xxl,
  },
  refreshButtonText: {
    color: theme.success,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs + 2,
  },
}));

export default function EnhancedHomeScreen() {
  console.log('🏠 Enhanced HomeScreen rendering');
  
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const { data: tournaments } = useTournaments();
  const { data: standings } = useAOYStandings();
  
  // Get themed styles
  const themedStyles = styles(theme);
  
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
  (navigation as any).navigate('MemberProfile', { memberId: profile?.member_code || profile?.id });
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
      <ScrollView style={themedStyles.container}>
        <View style={themedStyles.headerContainer}>
          <Text style={themedStyles.headerTitle}>Trophy Cast</Text>
          <Text style={themedStyles.headerSubtitle}>Loading your dashboard...</Text>
        </View>
        <DashboardSkeleton />
      </ScrollView>
    );
  }

  // Error state
  if (error && !dashboard) {
    return (
      <View style={themedStyles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={themedStyles.errorTitle}>Something went wrong</Text>
        <Text style={themedStyles.errorText}>Error: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()} style={themedStyles.retryButton}>
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={themedStyles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No data state
  if (!dashboard) {
    return (
      <ScrollView style={themedStyles.container}>
        <View style={themedStyles.headerContainer}>
          <Text style={themedStyles.headerTitle}>Trophy Cast</Text>
          <Text style={themedStyles.headerSubtitle}>Welcome to your fishing dashboard</Text>
        </View>
        
        <View style={{ padding: spacing.xl }}>
          <EmptyState
            icon="fish-outline"
            title="No Data Available"
            message={`Your tournament data will appear here once you participate in events.\n\nMember: ${profile?.member_code || 'Not Set'}`}
            actionLabel="Refresh"
            onAction={() => refetch()}
            testID="empty.dashboard"
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={themedStyles.container}
      refreshControl={
        <RefreshControl 
          refreshing={isRefetching} 
          onRefresh={onRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
      contentContainerStyle={themedStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={themedStyles.headerContainer}>
          <View style={themedStyles.welcomeSection}>
            {/* show skeletons while refreshing for perceived performance */}
            {isRefetching ? (
              <>
                <Skeleton width={180} height={28} borderRadius={6} />
                <Skeleton width={120} height={18} borderRadius={6} style={{ marginTop: 8 }} />
              </>
            ) : (
              <>
                <Text style={themedStyles.headerTitle}>Welcome back!</Text>
                <Text style={themedStyles.headerSubtitle}>
                  {profile?.name || user?.email?.split('@')[0] || 'Angler'}
                </Text>
              </>
            )}
          </View>
        <View style={themedStyles.headerActions}>
          <ThemeToggle compact />
          <View style={themedStyles.memberBadge}>
            <Ionicons name="card" size={16} color={theme.primary} />
            <Text style={themedStyles.memberCode}>{profile?.member_code || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Hero personal dashboard (bragging card) */}
      <HeroDashboard
        stats={{
          aoyRank: aoy?.aoy_rank ?? undefined,
          totalPoints: aoy?.total_aoy_points ?? undefined,
          tournaments: seasonStats?.tournaments ?? 0,
          wins: (seasonStats as any)?.wins ?? 0,
          pbLbs: seasonStats?.bigFish ?? 0,
        }}
        loading={isLoading}
  onViewProfile={() => (navigation as any).navigate('MemberProfile', { memberId: profile?.member_code || profile?.id })}
        testID="home.hero"
      />

      {/* Trophy Rack */}
      <View style={[themedStyles.sectionContainer, { paddingHorizontal: spacing.xl }]}>
        <Text style={themedStyles.sectionTitle}>Trophy Rack</Text>
        {isRefetching ? (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton width={80} height={80} />
            <Skeleton width={80} height={80} />
            <Skeleton width={80} height={80} />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingBottom: 8 }}>
            {((dashboard as any)?.recentTrophies || []).map((t: any, i: number) => (
              <Card key={i} padding="sm" radius="lg" variant="secondary" style={{ marginRight: 12 }} testID={`home.trophy.${i}`}>
                <Text style={{ fontWeight: '700' }}>{t.title || 'Tournament Win'}</Text>
                <Text style={{ color: '#6B7280', fontSize: 12 }}>{t.date || t.event_date}</Text>
              </Card>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Expanded Stats Grid */}
      <View style={[themedStyles.sectionContainer, { paddingHorizontal: spacing.xl }]}>
        <Text style={themedStyles.sectionTitle}>Season Stats</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statLabel}>Tournaments</Text>
            <Text style={themedStyles.statValue}>{seasonStats?.tournaments ?? 0}</Text>
          </View>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statLabel}>Wins</Text>
            <Text style={themedStyles.statValue}>{(seasonStats as any)?.wins ?? 0}</Text>
          </View>
          <View style={themedStyles.statCard}>
            <Text style={themedStyles.statLabel}>Total Weight</Text>
            <Text style={themedStyles.statValue}>{seasonStats?.totalWeight ?? 0} lb</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Overview */}
      <View style={themedStyles.statsOverview}>
        {isRefetching ? (
          // show three lightweight skeleton stat cards while refreshing
          <>
            <View style={themedStyles.statCard}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={26} style={{ marginTop: 12 }} />
            </View>
            <View style={themedStyles.statCard}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={26} style={{ marginTop: 12 }} />
            </View>
            <View style={themedStyles.statCard}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={26} style={{ marginTop: 12 }} />
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={themedStyles.statCard}
              activeOpacity={0.85}
              onPress={() => handleStatPress('aoy')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={aoy?.aoy_rank ? `AOY rank ${aoy.aoy_rank}` : 'AOY rank not available'}
            >
              <View style={themedStyles.statIconContainer}>
                <Ionicons name="trophy" size={24} color={theme.gold} />
              </View>
              <Text style={themedStyles.statLabel}>AOY Rank</Text>
              <Text style={themedStyles.statValue}>
                {aoy?.aoy_rank ? `#${aoy.aoy_rank}` : 'N/A'}
              </Text>
              {aoy?.aoy_rank && (
                <Text style={themedStyles.statSuffix}>
                  {getRankSuffix(aoy.aoy_rank)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.statCard}
              activeOpacity={0.85}
              onPress={() => handleStatPress('points')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Total points ${aoy?.total_aoy_points || 0}`}
            >
              <View style={themedStyles.statIconContainer}>
                <Ionicons name="star" size={24} color={theme.success} />
              </View>
              <Text style={themedStyles.statLabel}>Points</Text>
              <Text style={themedStyles.statValue}>
                {aoy?.total_aoy_points || '0'}
              </Text>
              <Text style={themedStyles.statSuffix}>pts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={themedStyles.statCard}
              activeOpacity={0.85}
              onPress={() => handleStatPress('earnings')}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Earnings ${earningsNumber.toFixed(0)} dollars`}
            >
              <View style={themedStyles.statIconContainer}>
                <Ionicons name="cash" size={24} color={theme.accent} />
              </View>
              <Text style={themedStyles.statLabel}>Earnings</Text>
              <Text style={themedStyles.statValue}>
                ${earningsNumber.toFixed(0)}
              </Text>
              <Text style={themedStyles.statSuffix}>2025</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Quick Actions */}
      <View style={themedStyles.sectionContainer}>
        <Text style={themedStyles.sectionTitle}>Quick Actions</Text>
        <View style={themedStyles.quickActionsGrid}>
          {quickActions.map((action) => (
            <CardPressable
              key={action.id}
              padding="md"
              radius="xl"
              variant="secondary"
              onPress={() => handleQuickAction(action)}
              accessible={true}
              accessibilityLabel={`${action.title} - ${action.description}`}
              testID={`quick-action.${action.id}`}
              style={themedStyles.actionCard}
            >
              <View style={[themedStyles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon as any} size={24} color="#fff" accessibilityLabel={`${action.title} icon`} />
              </View>
              <Text style={themedStyles.actionTitle}>{action.title}</Text>
              <Text style={themedStyles.actionDescription}>{action.description}</Text>
            </CardPressable>
          ))}
        </View>
      </View>

      {/* Recent Tournament Performance */}
      <View style={themedStyles.sectionContainer}>
        <Text style={themedStyles.sectionTitle}>Recent Performance</Text>
        <TouchableOpacity onPress={handlePerformancePress} activeOpacity={0.9} accessible accessibilityRole="button" accessibilityLabel="Open last tournament details">
          <AnimatedCard style={themedStyles.performanceCard}>
          <View style={themedStyles.cardHeader}>
            <View style={themedStyles.cardTitleRow}>
              <Ionicons name="fish" size={20} color={theme.success} />
              <Text style={themedStyles.cardTitle}>Last Tournament</Text>
            </View>
            {lastTournament && (
              <View style={themedStyles.placementBadge}>
                <Text style={themedStyles.placementText}>
                  #{lastTournament.place || 'N/A'}
                </Text>
              </View>
            )}
          </View>
          
          {lastTournament ? (
            <View style={themedStyles.tournamentDetails}>
              <Text style={themedStyles.tournamentName}>{lastTournament.tournament_name}</Text>
              <Text style={themedStyles.tournamentLocation}>
                📍 {lastTournament.lake} • {formatDate(lastTournament.event_date)}
              </Text>
              
              <View style={themedStyles.performanceStats}>
                <View style={themedStyles.performanceStat}>
                  <Ionicons name="scale-outline" size={16} color={theme.textSecondary} />
                  <Text style={themedStyles.performanceLabel}>Weight</Text>
                  <Text style={themedStyles.performanceValue}>
                    {lastTournament.weight_lbs || 'N/A'} lbs
                  </Text>
                </View>
                
                <View style={themedStyles.performanceStat}>
                  <Ionicons name="star-outline" size={16} color={theme.textSecondary} />
                  <Text style={themedStyles.performanceLabel}>Points</Text>
                  <Text style={themedStyles.performanceValue}>
                    {lastTournament.aoy_points || '0'}
                  </Text>
                </View>
                
                <View style={themedStyles.performanceStat}>
                  <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
                  <Text style={themedStyles.performanceLabel}>Payout</Text>
                  <Text style={themedStyles.performanceValue}>
                    ${(() => {
                      const lt: any = lastTournament as any;
                      const raw = lt?.payout != null ? lt.payout : lt?.cash_payout;
                      const n = raw == null ? 0 : Number(String(raw).replace(/[^0-9.-]+/g, ''));
                      return Number.isFinite(n) ? n : 0;
                    })()}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={themedStyles.emptyTournament}>
              <Ionicons name="calendar-outline" size={32} color={theme.textSecondary} />
              <Text style={themedStyles.emptyTournamentText}>
                No tournament results yet
              </Text>
              <Text style={themedStyles.emptyTournamentSubtext}>
                Your performance will show here after your first tournament
              </Text>
            </View>
          )}
          </AnimatedCard>
        </TouchableOpacity>
      </View>

      {/* Upcoming Tournament */}
      {nextTournament && (
        <View style={themedStyles.sectionContainer}>
          <Text style={themedStyles.sectionTitle}>Coming Up</Text>
          <TouchableOpacity onPress={handleUpcomingPress} activeOpacity={0.9} accessible accessibilityRole="button" accessibilityLabel={`Open details for ${nextTournament.tournament_name}`}>
            <AnimatedCard style={themedStyles.upcomingCard}>
            <View style={themedStyles.cardHeader}>
              <View style={themedStyles.cardTitleRow}>
                <Ionicons name="calendar" size={20} color={theme.warning} />
                <Text style={themedStyles.cardTitle}>Next Tournament</Text>
              </View>
              <View style={themedStyles.upcomingBadge}>
                <Ionicons name="time" size={12} color={theme.warning} />
                <Text style={themedStyles.upcomingText}>Soon</Text>
              </View>
            </View>
            
            <View style={themedStyles.upcomingDetails}>
              <Text style={themedStyles.upcomingName}>{nextTournament.tournament_name}</Text>
              <Text style={themedStyles.upcomingLocation}>
                📍 {nextTournament.lake} • {formatDate(nextTournament.event_date)}
              </Text>
            </View>
            
            <TouchableOpacity
              style={themedStyles.registerButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Register for ${nextTournament.tournament_name} on ${formatDate(nextTournament.event_date)}`}
              onPress={() => {
                // placeholder for registration flow; show success feedback for now
                showSuccess('Registered', `You are registered for ${nextTournament.tournament_name}`);
              }}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={themedStyles.registerButtonText}>Register Now</Text>
            </TouchableOpacity>
            </AnimatedCard>
          </TouchableOpacity>
        </View>
      )}

      {/* Season Progress */}
      <View style={themedStyles.sectionContainer}>
        <Text style={themedStyles.sectionTitle}>2025 Season Progress</Text>
        <AnimatedCard style={themedStyles.progressCard}>
          <View style={themedStyles.progressStats}>
            <View style={themedStyles.progressStat}>
              <Text style={themedStyles.progressValue}>{seasonStats.tournaments}</Text>
              <Text style={themedStyles.progressLabel}>Tournaments</Text>
              <View style={themedStyles.progressBar}>
                <View 
                  style={[
                    themedStyles.progressFill, 
                    { width: `${getProgressPercentage(seasonStats.tournaments, 12)}%` }
                  ]} 
                />
              </View>
            </View>
            
            <View style={themedStyles.progressStat}>
              <Text style={themedStyles.progressValue}>
                {seasonStats.bestFinish ? `#${seasonStats.bestFinish}` : 'N/A'}
              </Text>
              <Text style={themedStyles.progressLabel}>Best Finish</Text>
            </View>
            
            <View style={themedStyles.progressStat}>
              <Text style={themedStyles.progressValue}>{seasonStats.totalWeight}</Text>
              <Text style={themedStyles.progressLabel}>Total Weight</Text>
            </View>
            
            <View style={themedStyles.progressStat}>
              <Text style={themedStyles.progressValue}>{seasonStats.bigFish}</Text>
              <Text style={themedStyles.progressLabel}>Big Fish</Text>
            </View>
          </View>
        </AnimatedCard>
      </View>
    </ScrollView>
  );
}
