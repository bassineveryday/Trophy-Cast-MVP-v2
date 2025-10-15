/**
 * FishingThemedHomeScreen - Trophy Cast Dashboard with Fishing Theme
 * Features:
 * - Two-column responsive layout (leaderboard + widgets)
 * - Gradient leaderboard cards for top 4 anglers
 * - Daily challenge widget with progress
 * - Trophy rack for achievements
 * - Deep ocean themed background
 */
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { useDashboard, useAOYStandings } from '../lib/hooks/useQueries';
import { useTheme } from '../lib/ThemeContext';
import HeroBanner from '../components/HeroBanner';
import DashboardCards from '../components/DashboardCards';
import TrophyRoom from '../components/TrophyRoom';
import { TrophyRack, Trophy } from '../components/TrophyRack';
import { DailyChallenge } from '../components/DailyChallenge';
import { FishingDecorations } from '../components/FishingDecorations';
import Skeleton from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { useReducedMotion } from '../hooks/useReducedMotion';

// Mock trophy data (will be replaced with real data later)
const MOCK_TROPHIES: Trophy[] = [
  { type: 'gold', label: 'Champion' },
  { type: 'conservation', label: 'Conservationist' },
  { type: 'bigfish', label: 'Big Fish' },
];

export default function FishingThemedHomeScreen() {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const prefersReducedMotion = useReducedMotion();
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // Data queries
  const dashboardQuery = useDashboard(profile?.member_code);
  const aoyQuery = useAOYStandings();

  // Responsive breakpoint
  const isMobile = width < 768;

  // Entrance animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    if (prefersReducedMotion) {
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, prefersReducedMotion]);

  // Calculate daily challenge progress (mock for now)
  const dailyProgress = 68; // TODO: Connect to real data

  // Refresh handler
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      dashboardQuery.refetch(),
      aoyQuery.refetch(),
    ]);
    setRefreshing(false);
  }, [dashboardQuery, aoyQuery]);

  // Loading state
  if (dashboardQuery.isLoading || aoyQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Skeleton width={180} height={32} />
            <Skeleton width={120} height={20} style={{ marginTop: 8 }} />
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={isMobile ? styles.singleColumn : styles.twoColumn}>
            <View style={styles.leftColumn}>
              <Skeleton width={150} height={20} style={{ marginBottom: 16 }} />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={80} style={{ marginBottom: 12 }} />
              ))}
            </View>
            {!isMobile && (
              <View style={styles.rightColumn}>
                <Skeleton height={200} />
                <Skeleton height={180} style={{ marginTop: 16 }} />
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Decorative Background Elements */}
      <FishingDecorations />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.logoText}>TROPHY CAST</Text>
          <Text style={styles.tagline}>Where Every Cast Counts</Text>
        </View>
        
        {/* Hero Banner under header */}
        <HeroBanner subtitle="DBM Secretary" />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Dashboard Cards - 2x2 Grid */}
        <DashboardCards
          catchesThisMonth={dashboardQuery.data?.seasonStats?.tournaments || 23}
          catchesChange="+5 from last month"
          activePlan="Active Plans"
          nextTournament={dashboardQuery.data?.nextTournament?.lake || "Lake Guntersville"}
          nextTournamentDate="Sept 28"
          notificationCount={0}
        />

        <Animated.View
          style={[
            isMobile ? styles.singleColumn : styles.twoColumn,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Left Column - Trophy Room */}
          <View style={styles.leftColumn}>
            <TrophyRoom
              onAddCatch={() => {
                // TODO: Navigate to add catch screen
                console.log('Add catch clicked');
              }}
              onViewCatch={(catchId) => {
                // TODO: Navigate to catch detail
                console.log('View catch:', catchId);
              }}
            />
          </View>

          {/* Right Column - Widgets */}
          <View style={styles.rightColumn}>
            {/* Daily Challenge */}
            <DailyChallenge
              progress={dailyProgress}
              fishTypes={['🐟', '🐠', '🐡']}
              testID="home.dailyChallenge"
            />

            {/* Trophy Rack */}
            <TrophyRack
              trophies={MOCK_TROPHIES}
              maxDisplay={6}
              testID="home.trophyRack"
            />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'column',
    paddingHorizontal: theme.layout.spacing.lg,
    paddingTop: theme.layout.spacing.md,
    paddingBottom: 0,
    backgroundColor: theme.surface,
    borderBottomWidth: 2,
    borderBottomColor: theme.accent,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: theme.layout.spacing.sm,
  },
  logoText: {
    fontSize: theme.typography.sizes.h1,
    fontFamily: theme.typography.family.bold,
    color: theme.accent,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.medium,
    color: theme.text,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  scrollContent: {
    paddingHorizontal: theme.layout.spacing.md,
    paddingTop: theme.layout.spacing.md,
    paddingBottom: theme.layout.spacing.xxl,
  },
  singleColumn: {
    flexDirection: 'column',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: theme.layout.spacing.xl,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: theme.layout.spacing.lg,
    letterSpacing: 0.5,
  },
});
