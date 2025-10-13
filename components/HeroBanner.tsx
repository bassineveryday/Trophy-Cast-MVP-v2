/**
 * HeroBanner - Personalized Hero Banner Component
 * 
 * Features:
 * - Welcome message with user's name
 * - Achievement subtitle (role/title)
 * - Row of 4 stat badges with real data
 * - Trophy Cast teal gradient background
 * - Responsive design for web and mobile
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/AuthContext';
import { useDashboard, useAOYStandings } from '../lib/hooks/useQueries';

interface StatBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
}

interface HeroBannerProps {
  /**
   * Override for welcome name (defaults to profile name)
   */
  name?: string;
  /**
   * Achievement subtitle (defaults to "Denver Bassmasters Member")
   */
  subtitle?: string;
}

/**
 * Individual stat badge component
 */
function StatBadge({ icon, value, label }: StatBadgeProps) {
  return (
    <View style={styles.statBadge}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={20} color="#0891b2" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/**
 * Hero Banner Component
 */
export default function HeroBanner({ name, subtitle }: HeroBannerProps) {
  const { profile } = useAuth();
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;

  // Fetch real tournament data
  const { data: dashboardData } = useDashboard(profile?.member_code);
  const { data: aoyStandings } = useAOYStandings();

  // Calculate stats from real data
  const stats = React.useMemo(() => {
    if (!dashboardData) {
      return {
        wins: 0,
        tournaments: 0,
        bigBass: '0.00',
        aoyRank: 'N/A',
      };
    }

    const { seasonStats, aoyData } = dashboardData;

    return {
      wins: seasonStats?.wins || 0,
      tournaments: seasonStats?.tournaments || 0,
      bigBass: seasonStats?.bigFish ? `${seasonStats.bigFish.toFixed(2)}` : '0.00',
      aoyRank: aoyData?.aoy_rank ? `#${aoyData.aoy_rank}` : 'N/A',
    };
  }, [dashboardData]);

  // Display name and subtitle
  const displayName = name || profile?.name || 'Member';
  const displaySubtitle = subtitle || 'Denver Bassmasters Member';

  // Gradient colors (Trophy Cast teal)
  const gradientColors = ['#0891b2', '#06b6d4', '#22d3ee'] as const;

  return (
    <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
      {isWeb ? (
        // Web gradient (CSS)
        <View style={[styles.gradient, styles.gradientWeb]} />
      ) : (
        // Native gradient (expo-linear-gradient)
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {displayName}!</Text>
          <Text style={styles.subtitleText}>{displaySubtitle}</Text>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, isLargeScreen && styles.statsRowLarge]}>
          <StatBadge
            icon="trophy"
            value={stats.wins}
            label="Wins"
          />
          <StatBadge
            icon="fish"
            value={stats.tournaments}
            label="Tournaments"
          />
          <StatBadge
            icon="analytics"
            value={`${stats.bigBass} lbs`}
            label="Big Bass"
          />
          <StatBadge
            icon="podium"
            value={stats.aoyRank}
            label="AOY Rank"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  containerLarge: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientWeb: {
    // CSS gradient for web
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
      } as any,
    }),
  },
  content: {
    padding: 24,
    paddingVertical: 28,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statsRowLarge: {
    gap: 20,
  },
  statBadge: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    minWidth: 70,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
