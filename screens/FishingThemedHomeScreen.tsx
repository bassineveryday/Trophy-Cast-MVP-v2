/**
 * FishingThemedHomeScreen - Trophy Cast Dashboard with Fishing Theme
 * Features:
 * - Two-column responsive layout (leaderboard + widgets)
 * - Gradient leaderboard cards for top 4 anglers
 * - Daily challenge widget with progress
 * - Trophy rack for achievements
 * - Deep ocean themed background
 */
import React from 'react';
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
import HeroBanner from '../components/HeroBanner';
import { GradientCard, GradientVariant } from '../components/GradientCard';
import { TrophyRack, Trophy } from '../components/TrophyRack';
import { DailyChallenge } from '../components/DailyChallenge';
import { FishingDecorations } from '../components/FishingDecorations';
import Skeleton from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import ThemeToggle from '../components/ThemeToggle';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { fishingTheme, spacing, fontSize, fontWeight } from '../lib/designTokens';

// Gradient variants for ranks 1-4
const RANK_VARIANTS: GradientVariant[] = ['gold', 'green', 'teal', 'blue'];

// Mock trophy data (will be replaced with real data later)
const MOCK_TROPHIES: Trophy[] = [
  { type: 'gold', label: 'Champion' },
  { type: 'conservation', label: 'Conservationist' },
  { type: 'bigfish', label: 'Big Fish' },
];

export default function FishingThemedHomeScreen() {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const prefersReducedMotion = useReducedMotion();
  
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

  // Get top 4 anglers from AOY standings
  const topAnglers = React.useMemo(() => {
    if (!aoyQuery.data) return [];
    return aoyQuery.data
      .filter((angler) => angler.aoy_rank && angler.aoy_rank <= 4)
      .sort((a, b) => (a.aoy_rank || 0) - (b.aoy_rank || 0))
      .slice(0, 4);
  }, [aoyQuery.data]);

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
          <Text style={styles.tagline}>Bassin' Everyday Tournament Series</Text>
        </View>
        <ThemeToggle />
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Banner */}
        <HeroBanner subtitle="Denver Bassmasters Secretary" />

        <Animated.View
          style={[
            isMobile ? styles.singleColumn : styles.twoColumn,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Left Column - Leaderboard */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>TOP ANGLERS</Text>
            
            {topAnglers.length > 0 ? (
              topAnglers.map((angler, index) => (
                <GradientCard
                  key={angler.member_id}
                  variant={RANK_VARIANTS[index]}
                  rank={angler.aoy_rank || index + 1}
                  name={angler.member_name || 'Unknown Angler'}
                  points={angler.total_aoy_points || 0}
                  fishCount={Math.floor(Math.random() * 20) + 5} // TODO: Connect to real data
                  testID={`home.leaderboard.${index}`}
                />
              ))
            ) : (
              <EmptyState
                icon="trophy-outline"
                title="No Rankings Yet"
                message="Season standings will appear here once tournaments begin."
              />
            )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fishingTheme.colors.deepOcean,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.giant + 8,
    paddingBottom: spacing.xl + 4,
    backgroundColor: fishingTheme.colors.navyTeal,
    borderBottomWidth: 3,
    borderBottomColor: fishingTheme.colors.gold,
    shadowColor: fishingTheme.colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flex: 1,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '700',
    color: fishingTheme.colors.gold,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: fishingTheme.colors.cream,
    marginTop: 6,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  singleColumn: {
    flexDirection: 'column',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: fishingTheme.colors.cream,
    marginBottom: spacing.lg,
    letterSpacing: 0.5,
  },
});
