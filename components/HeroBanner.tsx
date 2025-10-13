/**
 * HeroBanner - Personalized Hero Banner Component
 * 
 * Features:
 * - Avatar circle on the left
 * - Welcome message with user's name
 * - Achievement subtitle (role/title)
 * - Row of circular icon badges with counts
 * - Trophy Cast teal gradient background
 * - Tagline below welcome
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

interface CircleBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  iconColor?: string;
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
  /**
   * Tagline below welcome message
   */
  tagline?: string;
}

/**
 * Small circular badge with icon and number
 */
function CircleBadge({ icon, value, iconColor = '#FFA500' }: CircleBadgeProps) {
  return (
    <View style={styles.circleBadge}>
      <Ionicons name={icon} size={12} color={iconColor} />
      <Text style={styles.circleValue}>{value}</Text>
    </View>
  );
}

/**
 * Hero Banner Component
 */
export default function HeroBanner({ name, subtitle, tagline }: HeroBannerProps) {
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
        bigBass: 0,
        aoyRank: 0,
      };
    }

    const { seasonStats, aoyData } = dashboardData;

    return {
      wins: seasonStats?.wins || 0,
      tournaments: seasonStats?.tournaments || 0,
      bigBass: seasonStats?.bigFish || 0,
      aoyRank: aoyData?.aoy_rank || 0,
    };
  }, [dashboardData]);

  // Display name, subtitle, and tagline
  const displayName = name || profile?.name || 'Member';
  const displaySubtitle = subtitle || '2025 AOY Champion';
  const displayTagline = tagline || 'Your digital tackle box for tournament success';

  // Gradient colors (Trophy Cast teal)
  const gradientColors = ['#0891b2', '#06b6d4', '#22d3ee'] as const;

  // Get user initials for avatar
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

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
        {/* Top Row: Avatar + Welcome Text + Badges */}
        <View style={styles.topRow}>
          {/* DBM Logo Placeholder */}
          <View style={styles.avatar}>
            <Text style={styles.logoPlaceholder}>DBM</Text>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, {displayName}!</Text>
            <Text style={styles.subtitleText}>{displaySubtitle}</Text>
            
            {/* Icon Badges Row */}
            <View style={styles.badgesRow}>
              <CircleBadge icon="people" value={stats.wins} iconColor="#FF6B6B" />
              <CircleBadge icon="calendar" value={stats.tournaments} iconColor="#FFA500" />
              <CircleBadge icon="trophy" value={stats.bigBass} iconColor="#FFD700" />
              <CircleBadge icon="ribbon" value={stats.aoyRank} iconColor="#4ECDC4" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginTop: 8,
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
    padding: 16,
    paddingVertical: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  logoPlaceholder: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  circleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
