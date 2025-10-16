/**
 * HeroBanner - Personalized Hero Banner Component
 */
import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/AuthContext';
import { useDashboard, useAOYStandings } from '../lib/hooks/useQueries';
import { useTheme } from '../lib/ThemeContext';
import type { BrandTheme } from '../lib/ThemeContext';

interface CircleBadgeProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  iconColor?: string;
  containerStyle?: any;
  valueStyle?: any;
}

interface HeroBannerProps {
  name?: string;
  subtitle?: string;
  tagline?: string;
}

function CircleBadge({ icon, value, iconColor, containerStyle, valueStyle }: CircleBadgeProps) {
  return (
    <View style={containerStyle}>
      <Ionicons name={icon} size={12} color={iconColor} />
      <Text style={valueStyle}>{value}</Text>
    </View>
  );
}

const daysUntil = (isoDate?: string) => {
  if (!isoDate) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(isoDate);
  d.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  return diffDays < 0 ? undefined : diffDays;
};

function HeroBanner({ name, subtitle, tagline }: HeroBannerProps) {
  const { profile } = useAuth();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= 768;

  const { data: dashboardData } = useDashboard(profile?.member_code);
  const { data: aoyStandings } = useAOYStandings();

  const stats = React.useMemo(() => {
    if (!dashboardData) {
      return { wins: 0, tournaments: 0, bigBass: 0, aoyRank: 0 };
    }
    const { seasonStats, aoyData } = dashboardData;
    return {
      wins: seasonStats?.wins || 0,
      tournaments: seasonStats?.tournaments || 0,
      bigBass: seasonStats?.bigFish || 0,
      aoyRank: aoyData?.aoy_rank || 0,
    };
  }, [dashboardData]);

  const displayName = name || profile?.name || 'Member';
  const displaySubtitle = subtitle || '2025 AOY Champion';
  const displayTagline = tagline || 'Your digital tackle box for tournament success';

  const gradientColors = theme.gradients.hero as [string, string];

  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const nextTournament = (dashboardData as any)?.nextTournament;
  const days = daysUntil(nextTournament?.event_date as string | undefined);

  return (
    <View style={[styles.container, isLargeScreen && styles.containerLarge]}>
      {isWeb ? (
        <View
          style={[
            styles.gradient,
            { background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)` } as any,
          ]}
        />
      ) : (
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.avatar} accessibilityLabel="Profile avatar">
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url as string }} style={styles.avatarImage} accessibilityLabel="Profile avatar image" />
            ) : (
              <Text style={styles.avatarText} accessibilityLabel={`Avatar initials ${initials}`}>
                {initials}
              </Text>
            )}
          </View>

          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back, {displayName}!</Text>
            <Text style={styles.subtitleText}>{displaySubtitle}</Text>
            {!!displayTagline && <Text style={styles.taglineText} testID="hero.tagline">{displayTagline}</Text>}

            {typeof days === 'number' && nextTournament?.event_date && (
              <View
                style={styles.countdownPill}
                accessibilityLabel={`Next tournament ${days > 0 ? `in ${days} day${days === 1 ? '' : 's'}` : 'today'}`}
                accessible
              >
                <Ionicons name="time" size={12} color={theme.onPrimary} />
                <Text style={styles.countdownPillText}>
                  {days > 0 ? `In ${days} day${days === 1 ? '' : 's'}` : 'Today'}
                  {nextTournament?.lake ? ` • ${nextTournament.lake}` : ''}
                </Text>
              </View>
            )}

            <View style={styles.badgesRow}>
              <CircleBadge icon="people" value={stats.wins} iconColor={theme.warning} containerStyle={styles.circleBadge} valueStyle={styles.circleValue} />
              <CircleBadge icon="calendar" value={stats.tournaments} iconColor={theme.accent} containerStyle={styles.circleBadge} valueStyle={styles.circleValue} />
              <CircleBadge icon="trophy" value={stats.bigBass} iconColor={theme.gold} containerStyle={styles.circleBadge} valueStyle={styles.circleValue} />
              <CircleBadge icon="ribbon" value={stats.aoyRank} iconColor={theme.success} containerStyle={styles.circleBadge} valueStyle={styles.circleValue} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: BrandTheme) => StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    marginTop: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: theme.card,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: theme.onPrimary,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.onPrimary,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.onPrimary,
    marginBottom: 2,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.onPrimary,
    opacity: 0.9,
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  circleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 3,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  circleValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text,
  },
  taglineText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.onPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  countdownPill: {
    marginTop: 6,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.overlay,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countdownPillText: {
    color: theme.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default React.memo(HeroBanner);
