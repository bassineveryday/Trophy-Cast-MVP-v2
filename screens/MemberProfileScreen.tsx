/**
 * MemberProfileScreen.tsx - Individual Member Profile
 * 
 * Displays:
 * - Member info (name, photo, board role, AOY rank)
 * - Season stats (catches, weight, earnings)
 * - AOY standings info
 * - Tournament history (scrollable list)
 * 
 * Features:
 * - Edit profile button (only for own profile)
 * - Photo support (board photos or initials)
 * - Tap tournament to expand details
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Colors matching Trophy Cast theme
const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  green: '#4CAF50',
  error: '#E74C3C',
  border: 2,
  radius: 16,
};

// Board member photos mapping - only includes JPG files that exist
const BOARD_MEMBER_PHOTOS: Record<string, any> = {
  'DBM020': require('../assets/images/jeremiah_hofstetter.jpg'),
  'DBM021': require('../assets/images/bobby_martin.jpg'),
  'DBM019': require('../assets/images/tai_hunt.jpg'),
  'DBM063': require('../assets/images/gordon_phair.jpg'),
  'DBM004': require('../assets/images/howard_binkley.jpg'),
  'DBM045': require('../assets/images/justin_apfel.jpg'),
  'DBM002': require('../assets/images/cliff_purslow.jpg'),
  // DBM014 (Bill) - no image available, will show initials
};

// Board roles mapping
const BOARD_ROLES = {
  'DBM020': 'DBM President',
  'DBM021': 'DBM Vice President',
  'DBM019': 'DBM Secretary',
  'DBM063': 'DBM Treasurer',
  'DBM004': 'DBM Tournament Director',
  'DBM045': 'DBM Conservation Director',
  'DBM002': 'DBM Juniors Director',
  'DBM014': 'DBM High School Director',
};

interface MemberProfileScreenProps {
  route?: {
    params?: {
      member_id: string;
      member_name?: string;
    };
  };
}

// Fetch member profile data
async function fetchMemberProfileData(memberId: string) {
  // Get AOY standing
  const { data: aoyData, error: aoyError } = await supabase
    .from('aoy_standings')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle();

  if (aoyError) throw aoyError;

  // Get tournament results
  const { data: tournamentData, error: tourError } = await supabase
    .from('tournament_results')
    .select('*')
    .eq('member_id', memberId)
    .order('event_date', { ascending: false });

  if (tourError) throw tourError;

  return {
    aoy: aoyData,
    tournaments: tournamentData || [],
  };
}

export function MemberProfileScreen({ route }: MemberProfileScreenProps) {
  const navigation = useNavigation();
  const memberId = route?.params?.member_id || '';
  const boardRole = BOARD_ROLES[memberId as keyof typeof BOARD_ROLES];
  const boardPhoto = BOARD_MEMBER_PHOTOS[memberId as keyof typeof BOARD_MEMBER_PHOTOS];

  // Fetch profile data
  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['member-profile', memberId],
    queryFn: () => fetchMemberProfileData(memberId),
    enabled: !!memberId,
  });

  const styles = useMemo(() => createStyles(), []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (error || !profileData || !profileData.aoy) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Failed to load profile</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const { aoy, tournaments } = profileData;
  const memberName = aoy.member_name || 'Unknown Member';
  const initials = memberName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase();

  // Calculate stats from tournaments - handle both number and string types
  const totalCatches = tournaments.length;
  const totalWeight = tournaments.reduce((sum: number, t: any) => {
    const weight = typeof t.weight_lbs === 'number' ? t.weight_lbs : parseFloat(t.weight_lbs) || 0;
    return sum + weight;
  }, 0);
  const bestWeight = tournaments.length > 0 
    ? Math.max(...tournaments.map((t: any) => {
        const weight = typeof t.weight_lbs === 'number' ? t.weight_lbs : parseFloat(t.weight_lbs) || 0;
        return weight;
      }))
    : 0;
  const totalEarnings = tournaments.reduce((sum: number, t: any) => {
    const payout = typeof t.cash_payout === 'number' ? t.cash_payout : parseFloat(t.cash_payout) || 0;
    return sum + payout;
  }, 0);
  const bestPlace = tournaments.length > 0 ? Math.min(...tournaments.map((t: any) => t.place || 999)) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HERO CARD SECTION */}
      <View style={styles.heroCard}>
        {/* Initials Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Member Info */}
        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{memberName}</Text>
          {boardRole && (
            <Text style={styles.heroRole}>{boardRole}</Text>
          )}
        </View>

        {/* Quick Stats Row with Icons */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>🎣</Text>
            <Text style={styles.quickStatValue}>{totalCatches}</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>🏅</Text>
            <Text style={styles.quickStatValue}>{totalCatches > 0 ? tournaments.length : 0}</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>🥇</Text>
            <Text style={styles.quickStatValue}>{bestPlace || 0}</Text>
          </View>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatIcon}>💰</Text>
            <Text style={styles.quickStatValue}>${totalEarnings.toFixed(0)}</Text>
          </View>
        </View>
      </View>

      {/* QUICK STATS GRID - 4 CARDS */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="🎣"
          label="Total Catches"
          value={totalCatches.toString()}
        />
        <StatCard
          icon="📊"
          label="Total Weight"
          value={`${totalWeight.toFixed(1)} lbs`}
        />
        <StatCard
          icon="🏅"
          label="Best Weight"
          value={`${bestWeight.toFixed(1)} lbs`}
        />
        <StatCard
          icon="💰"
          label="Total Earnings"
          value={`$${totalEarnings.toFixed(2)}`}
        />
      </View>

      {/* SEASON OVERVIEW */}
      <View style={styles.seasonOverview}>
        <Text style={styles.sectionTitle}>Season Overview</Text>

        <View style={styles.overviewGrid}>
          <OverviewCard
            label="AOY Rank"
            value={aoy.aoy_rank ? `#${aoy.aoy_rank}` : 'N/A'}
            icon="trophy"
          />
          <OverviewCard
            label="Tournaments"
            value={tournaments.length.toString()}
            icon="calendar"
          />
          <OverviewCard
            label="Best Place"
            value={bestPlace ? `#${bestPlace}` : 'N/A'}
            icon="medal"
          />
          <OverviewCard
            label="Season Points"
            value={aoy.total_aoy_points?.toString() || '0'}
            icon="flame"
          />
        </View>
      </View>

      {/* TOURNAMENT HISTORY */}
      <View style={styles.tournamentSection}>
        <Text style={styles.sectionTitle}>Tournament History</Text>

        {tournaments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="fish-outline" size={48} color={COLORS.textGray} />
            <Text style={styles.emptyStateText}>No tournaments yet</Text>
          </View>
        ) : (
          tournaments.map((tournament: any, idx: number) => (
            <TournamentCard key={idx} tournament={tournament} />
          ))
        )}
      </View>

      {/* Spacer */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/**
 * StatCard Component
 */
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  const styles = useMemo(() => createStyles(), []);
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/**
 * OverviewCard Component
 */
function OverviewCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const styles = useMemo(() => createStyles(), []);
  return (
    <View style={styles.overviewCard}>
      <Ionicons name={icon} size={20} color={COLORS.gold} />
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={styles.overviewValue}>{value}</Text>
    </View>
  );
}

/**
 * TournamentCard Component
 */
function TournamentCard({ tournament }: { tournament: any }) {
  const [expanded, setExpanded] = React.useState(false);
  const styles = useMemo(() => createStyles(), []);

  const placeOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <TouchableOpacity
      style={styles.tournamentCard}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.7}
    >
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentTitleSection}>
          <Text style={styles.tournamentName}>{tournament.tournament_name}</Text>
          <Text style={styles.tournamentMeta}>
            {new Date(tournament.event_date).toLocaleDateString()} • {tournament.lake}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={COLORS.gold}
        />
      </View>

      <View style={styles.tournamentStats}>
        <View style={styles.tournamentStat}>
          <Text style={styles.statLabel}>Place</Text>
          <Text style={styles.statValue}>{placeOrdinal(tournament.place)}</Text>
        </View>
        <View style={styles.tournamentStat}>
          <Text style={styles.statLabel}>Weight</Text>
          <Text style={styles.statValue}>{typeof tournament.weight_lbs === 'number' ? tournament.weight_lbs.toFixed(1) : (parseFloat(tournament.weight_lbs as string) || 0).toFixed(1)} lbs</Text>
        </View>
        <View style={styles.tournamentStat}>
          <Text style={styles.statLabel}>Points</Text>
          <Text style={styles.statValue}>{tournament.aoy_points}</Text>
        </View>
        <View style={styles.tournamentStat}>
          <Text style={styles.statLabel}>Earnings</Text>
          <Text style={styles.statValue}>${typeof tournament.cash_payout === 'number' ? tournament.cash_payout.toFixed(2) : (parseFloat(tournament.cash_payout as string) || 0).toFixed(2)}</Text>
        </View>
      </View>

      {expanded && (
        <View style={styles.tournamentDetails}>
          <Text style={styles.detailsText}>
            Tournament: {tournament.tournament_name}
          </Text>
          <Text style={styles.detailsText}>
            Lake: {tournament.lake}
          </Text>
          <Text style={styles.detailsText}>
            Date: {new Date(tournament.event_date).toLocaleDateString()}
          </Text>
          {/* More details can be added here in future */}
        </View>
      )}
    </TouchableOpacity>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: COLORS.textGray,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    errorText: {
      marginTop: 12,
      fontSize: 16,
      color: COLORS.error,
      textAlign: 'center',
    },
    retryButton: {
      marginTop: 20,
      paddingHorizontal: 24,
      paddingVertical: 12,
      backgroundColor: COLORS.gold,
      borderRadius: 8,
    },
    retryButtonText: {
      color: COLORS.navy,
      fontWeight: '600',
      fontSize: 16,
    },

    // HERO CARD SECTION
    heroCard: {
      backgroundColor: COLORS.navyDark,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.gold,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 40,
      fontWeight: '700',
      color: COLORS.navy,
    },
    heroInfo: {
      alignItems: 'center',
      marginBottom: 16,
    },
    heroName: {
      fontSize: 24,
      fontWeight: '700',
      color: COLORS.gold,
      marginBottom: 4,
    },
    heroRole: {
      fontSize: 14,
      color: COLORS.textGray,
      marginBottom: 8,
    },
    quickStatsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      gap: 12,
    },
    quickStat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
    },
    quickStatIcon: {
      fontSize: 24,
      marginBottom: 4,
    },
    quickStatValue: {
      fontSize: 14,
      fontWeight: '700',
      color: COLORS.gold,
    },

    // OLD HERO SECTION (kept for backwards compatibility if needed)
    heroSection: {
      marginBottom: 24,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
      paddingBottom: 20,
    },
    memberPhoto: {
      width: '100%',
      height: 280,
      borderRadius: COLORS.radius,
      marginBottom: 16,
      backgroundColor: COLORS.navyDark,
    },
    initialsAvatar: {
      width: '100%',
      height: 280,
      borderRadius: COLORS.radius,
      backgroundColor: COLORS.gold,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    initialsText: {
      fontSize: 72,
      fontWeight: '700',
      color: COLORS.navy,
    },
    memberInfo: {
      marginBottom: 12,
    },
    memberName: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 6,
    },
    boardRole: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.gold,
      marginBottom: 10,
    },
    aoyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.navyDark,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
      alignSelf: 'flex-start',
    },
    aoyText: {
      color: COLORS.gold,
      fontWeight: '600',
      fontSize: 14,
    },
    editButton: {
      position: 'absolute',
      top: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: COLORS.navyDark,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    editButtonText: {
      color: COLORS.gold,
      fontWeight: '600',
      fontSize: 14,
    },

    // STATS GRID
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 24,
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 12,
      color: COLORS.textGray,
      marginBottom: 6,
      textAlign: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.gold,
      textAlign: 'center',
    },

    // SEASON OVERVIEW
    seasonOverview: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 12,
    },
    overviewGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    overviewCard: {
      flex: 1,
      minWidth: '48%',
      backgroundColor: COLORS.navyDark,
      borderWidth: 1,
      borderColor: COLORS.navyBorder,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
    },
    overviewLabel: {
      fontSize: 11,
      color: COLORS.textGray,
      marginTop: 6,
      marginBottom: 4,
    },
    overviewValue: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.gold,
    },

    // TOURNAMENT HISTORY
    tournamentSection: {
      marginBottom: 16,
    },
    tournamentCard: {
      backgroundColor: COLORS.navyDark,
      borderWidth: 1,
      borderColor: COLORS.navyBorder,
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    tournamentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
    },
    tournamentTitleSection: {
      flex: 1,
    },
    tournamentName: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.textLight,
      marginBottom: 4,
    },
    tournamentMeta: {
      fontSize: 12,
      color: COLORS.textGray,
    },
    tournamentStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 12,
      paddingBottom: 16,
    },
    tournamentStat: {
      alignItems: 'center',
    },
    tournamentDetails: {
      borderTopWidth: 1,
      borderTopColor: COLORS.navyBorder,
      padding: 12,
      backgroundColor: COLORS.navy,
    },
    detailsText: {
      fontSize: 12,
      color: COLORS.textGray,
      marginBottom: 6,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyStateText: {
      marginTop: 12,
      fontSize: 16,
      color: COLORS.textGray,
    },
  });
}
