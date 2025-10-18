/**
 * EnhancedDashboard - Trophy Cast Premium Dashboard
 * 
 * Features:
 * - Gold-bordered hero section with last catch highlight
 * - 2×2 stat grid (Total Catches, Personal Best, Next Trip, Recent Avg)
 * - Active Quest card with progress
 * - Recent Activity feed
 * - Premium brand styling with Navy + Gold
 * 
 * Ready to wire to real Supabase queries later
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock data - replace with real hooks later
const MOCK_LAST_CATCH = {
  species: 'Largemouth Bass',
  weight: 4.1,
  location: 'Lake Monroe',
  date: 'Oct 14',
};

const MOCK_STATS = {
  totalCatches: 12,
  personalBest: 5.2,
  nextTrip: 'Oct 22 @ Lake Monroe',
  recentAvg: 3.4,
};

const MOCK_QUEST = {
  name: 'Land a Marlin',
  stepsComplete: 3,
  stepsTotal: 5,
};

const MOCK_ACTIVITY = [
  { type: 'catch', text: 'Oct 14: 4.1 lb Largemouth 🎉', icon: 'fish' },
  { type: 'achievement', text: 'Oct 12: Personal Best Updated 📈', icon: 'trophy' },
  { type: 'quest', text: 'Oct 10: Completed 50+ Catch Streak', icon: 'flame' },
];

// Colors
const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  border: 2,
  radius: 16,
};

interface EnhancedDashboardProps {
  loading?: boolean;
  userName?: string;
  title?: string;
  subtitle?: string;
  clubRole?: string;
}

export function EnhancedDashboard({ 
  loading = false, 
  userName = 'Alex',
  title = 'Trophy Cast',
  subtitle = 'Where Every Cast Counts',
  clubRole = 'Member',
}: EnhancedDashboardProps) {
  const styles = useMemo(() => createStyles(), []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HERO CARD - Welcome Section with Icon Badges */}
      <View style={styles.heroCard}>
        {/* Header Row: Avatar + Name/Role + Settings */}
        <View style={styles.heroHeaderRow}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {userName
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.heroInfo}>
            <Text style={styles.heroGreeting}>Welcome back, {userName}!</Text>
            <Text style={styles.heroRole}>{clubRole}</Text>
          </View>

          <Pressable style={styles.heroSettings} onPress={() => console.log('Open settings')}>
            <Ionicons name="settings" size={24} color={COLORS.gold} />
          </Pressable>
        </View>

        {/* Subtitle */}
        <Text style={styles.heroSubtitle}>{subtitle}</Text>

        {/* Icon Badges Row */}
        <View style={styles.iconBadgesRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="trophy" size={20} color={COLORS.gold} />
            <Text style={styles.badgeText}>0</Text>
          </View>

          <View style={styles.iconBadge}>
            <Ionicons name="fish" size={20} color={COLORS.gold} />
            <Text style={styles.badgeText}>5</Text>
          </View>

          <View style={styles.iconBadge}>
            <Ionicons name="medal" size={20} color={COLORS.gold} />
            <Text style={styles.badgeText}>0</Text>
          </View>

          <View style={styles.iconBadge}>
            <Ionicons name="flame" size={20} color={COLORS.gold} />
            <Text style={styles.badgeText}>2</Text>
          </View>
        </View>
      </View>

      {/* LAST CATCH HERO SECTION - Gold Border */}
      <Pressable style={styles.heroCatch} onPress={() => console.log('View last catch details')}>
        <View style={styles.heroCatchHeader}>
          <Text style={styles.heroTitle}>🎣 Last Catch</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.gold} />
        </View>

        <View style={styles.heroContent}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroSpecies}>{MOCK_LAST_CATCH.species}</Text>
            <Text style={styles.heroWeight}>{MOCK_LAST_CATCH.weight} lbs</Text>
            <Text style={styles.heroMeta}>
              {MOCK_LAST_CATCH.date} • {MOCK_LAST_CATCH.location}
            </Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="fish" size={48} color={COLORS.gold} />
          </View>
        </View>
      </Pressable>

      {/* STATS GRID - 2×2 */}
      <View style={styles.statsGrid}>
        {/* Row 1 */}
        <View style={styles.statsRow}>
          {/* Total Catches */}
          <Pressable
            style={styles.statCard}
            onPress={() => console.log('View all catches')}
          >
            <Ionicons name="fish" size={20} color={COLORS.gold} />
            <Text style={styles.statLabel}>Total Catches</Text>
            <Text style={styles.statValue}>{MOCK_STATS.totalCatches}</Text>
            <Text style={styles.statSub}>this season</Text>
          </Pressable>

          {/* Personal Best */}
          <Pressable
            style={styles.statCard}
            onPress={() => console.log('View personal best')}
          >
            <Ionicons name="medal" size={20} color={COLORS.gold} />
            <Text style={styles.statLabel}>Personal Best</Text>
            <Text style={styles.statValue}>{MOCK_STATS.personalBest} lbs</Text>
            <Text style={styles.statSub}>all time</Text>
          </Pressable>
        </View>

        {/* Row 2 */}
        <View style={styles.statsRow}>
          {/* Next Trip */}
          <Pressable
            style={styles.statCard}
            onPress={() => console.log('View trips')}
          >
            <Ionicons name="calendar" size={20} color={COLORS.gold} />
            <Text style={styles.statLabel}>Next Trip</Text>
            <Text style={styles.statValue}>{MOCK_STATS.nextTrip.split('@')[0].trim()}</Text>
            <Text style={styles.statSub}>{MOCK_STATS.nextTrip.split('@')[1].trim()}</Text>
          </Pressable>

          {/* Recent Avg */}
          <Pressable
            style={styles.statCard}
            onPress={() => console.log('View stats')}
          >
            <Ionicons name="trending-up" size={20} color={COLORS.gold} />
            <Text style={styles.statLabel}>Recent Avg</Text>
            <Text style={styles.statValue}>{MOCK_STATS.recentAvg} lbs</Text>
            <Text style={styles.statSub}>last 5 catches</Text>
          </Pressable>
        </View>
      </View>

      {/* ACTIVE QUEST - Gold Border */}
      <Pressable style={styles.questCard} onPress={() => console.log('Open quest')}>
        <View style={styles.questHeader}>
          <View style={styles.questTitle}>
            <Ionicons name="flame" size={20} color={COLORS.gold} />
            <Text style={styles.questName}>{MOCK_QUEST.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.gold} />
        </View>

        <View style={styles.questProgress}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(MOCK_QUEST.stepsComplete / MOCK_QUEST.stepsTotal) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {MOCK_QUEST.stepsComplete}/{MOCK_QUEST.stepsTotal} Steps Complete
          </Text>
        </View>

        <Pressable style={styles.completeButton}>
          <Text style={styles.completeButtonText}>Next Step</Text>
        </Pressable>
      </Pressable>

      {/* RECENT ACTIVITY */}
      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>

        {MOCK_ACTIVITY.map((item, idx) => (
          <Pressable key={idx} style={styles.activityItem}>
            <Ionicons
              name={item.icon as any}
              size={18}
              color={COLORS.gold}
              style={styles.activityIcon}
            />
            <Text style={styles.activityText}>{item.text}</Text>
          </Pressable>
        ))}

        <Pressable style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>See all activity →</Text>
        </Pressable>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActions}>
        <Pressable style={styles.actionButton} onPress={() => console.log('Log catch')}>
          <Ionicons name="camera" size={24} color={COLORS.navy} />
          <Text style={styles.actionText}>Log</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => console.log('Plan trip')}>
          <Ionicons name="calendar" size={24} color={COLORS.navy} />
          <Text style={styles.actionText}>Plan</Text>
        </Pressable>

        <Pressable style={styles.actionButton} onPress={() => console.log('Ask coach')}>
          <Ionicons name="chatbubble" size={24} color={COLORS.navy} />
          <Text style={styles.actionText}>Coach</Text>
        </Pressable>
      </View>

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.navy,
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },

    // HERO CARD - Welcome Section
    heroCard: {
      backgroundColor: COLORS.navyDark,
      borderRadius: COLORS.radius,
      padding: 16,
      marginBottom: 24,
      gap: 12,
    },

    heroHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: COLORS.gold,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: COLORS.textLight,
    },

    avatarText: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.navy,
    },

    heroInfo: {
      flex: 1,
      gap: 2,
    },

    heroGreeting: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    heroRole: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.textGray,
    },

    heroSettings: {
      padding: 8,
    },

    heroSubtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.textGray,
      marginVertical: 4,
    },

    // ICON BADGES ROW
    iconBadgesRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 8,
    },

    iconBadge: {
      backgroundColor: COLORS.navy,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderColor: COLORS.navyBorder,
    },

    badgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    // OLD STYLES (KEEPING FOR REFERENCE)
    // HERO HEADER - Title + Subtitle + Settings
    heroHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
    },

    heroTitleSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },

    titleContent: {
      flex: 1,
    },

    mainTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.gold,
      marginBottom: 2,
    },

    subtitle: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.textGray,
    },

    settingsIcon: {
      padding: 8,
    },

    // USER INFO BAR
    userInfoBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: COLORS.navyDark,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.gold,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginBottom: 20,
    },

    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },

    userDetails: {
      flex: 1,
    },

    userName: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    userRole: {
      fontSize: 12,
      fontWeight: '500',
      color: COLORS.gold,
    },

    // GREETING (old - kept for reference)
    greeting: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },

    greetingText: {
      fontSize: 24,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    // HERO CATCH (renamed from heroHeader in JSX)
    heroCatch: {
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: COLORS.radius,
      padding: 16,
      marginBottom: 24,
      overflow: 'hidden',
    },

    heroCatchHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    heroTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.textGray,
    },

    heroContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    heroLeft: {
      flex: 1,
    },

    heroSpecies: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 4,
    },

    heroWeight: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.gold,
      marginBottom: 8,
    },

    heroMeta: {
      fontSize: 12,
      color: COLORS.textGray,
    },

    heroIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
      height: 80,
    },

    // STATS GRID
    statsGrid: {
      marginBottom: 24,
      gap: 12,
    },

    statsRow: {
      flexDirection: 'row',
      gap: 12,
    },

    statCard: {
      flex: 1,
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: COLORS.radius,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },

    statLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: COLORS.textGray,
      textAlign: 'center',
    },

    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.textLight,
      textAlign: 'center',
    },

    statSub: {
      fontSize: 10,
      color: COLORS.textGray,
      textAlign: 'center',
    },

    // QUEST CARD
    questCard: {
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: COLORS.radius,
      padding: 16,
      marginBottom: 24,
    },

    questHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    questTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    questName: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    questProgress: {
      gap: 8,
      marginBottom: 12,
    },

    progressBar: {
      height: 8,
      backgroundColor: COLORS.navyBorder,
      borderRadius: 4,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      backgroundColor: COLORS.gold,
      borderRadius: 4,
    },

    progressText: {
      fontSize: 12,
      color: COLORS.textGray,
    },

    completeButton: {
      backgroundColor: COLORS.gold,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },

    completeButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.navy,
    },

    // ACTIVITY SECTION
    activitySection: {
      marginBottom: 24,
    },

    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 12,
    },

    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: COLORS.navyDark,
      borderLeftWidth: 3,
      borderLeftColor: COLORS.gold,
      borderRadius: 4,
      marginBottom: 8,
      gap: 10,
    },

    activityIcon: {
      width: 24,
    },

    activityText: {
      fontSize: 13,
      color: COLORS.textLight,
      flex: 1,
    },

    viewAllButton: {
      paddingVertical: 12,
      alignItems: 'center',
    },

    viewAllText: {
      fontSize: 13,
      fontWeight: '600',
      color: COLORS.gold,
    },

    // QUICK ACTIONS
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 20,
      gap: 16,
    },

    actionButton: {
      flex: 1,
      backgroundColor: COLORS.gold,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      gap: 6,
    },

    actionText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.navy,
    },
  });
}
