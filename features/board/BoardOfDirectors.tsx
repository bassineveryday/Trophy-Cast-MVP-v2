/**
 * Board of Directors - Denver Bassmaster Leadership & Standings
 * 
 * Features:
 * - Real club officers with photos from denverbassmasters.com
 * - Role-based rank badges (President, Vice President, Secretary, etc.)
 * - Tournament stats per member (catches, PB, avg weight)
 * - Color-coded medals: Gold, Silver, Bronze
 * - Sortable by catches, PB, or avg weight
 * - Premium brand styling with Navy + Gold
 * 
 * Ready to wire to real Supabase queries
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Real Denver Bassmaster Club Officers - 2025
const REAL_BOARD_MEMBERS = [
  {
    id: 1,
    name: 'Jeremiah Hofstetter',
    role: 'President',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdZ1qaSJrqW7AANY-G2HXt2ZDQgA1Ck3EZwVfEDp0myRAdD-XwWcfkx61mWHb5DmX_dxaci_8p5VBJ-BNbaGmocxXoDiWWTYyWg2kUpI5wfMFVXA3flVoTor5ydBwVq1XUbUq8Ddz7pSR50Lj5Ae2OxLL3XIW1gg5Jf6MXNzOeX3sLAcUSjiVmkdz90Sq9_9vF4BZvgEm3iYVav4pyfCqErUr1Ah2l2DLwq0SD8=w1280',
    catches: 18,
    personalBest: 6.1,
    avgWeight: 3.8,
    trend: 'up',
    trendPercent: 12,
    avatar: 'JH',
    medal: 'gold',
    rank: 1,
  },
  {
    id: 2,
    name: 'Bobby Martin',
    role: 'Vice President',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdb-e6GkdcQJ7WIWJxtcb222okTNA4HBIT4s89h2WH7lusl2bCIKRCbZDPOM3AjAEzosEYun219J34S7i_D3kBIcjs4xY0oSXonC-lFJlrSOGy-aZ4CyNwQhfCCKAqq4hn3js-bZ9e97NE-dLZTxsriH3K8P6aH6y248xWbcXTfp45y8qVkALwvBCcuwXm8ANZAuQ5rsI80k9GvQpn-_LOnLi_iisLpOV9yX=w1280',
    catches: 15,
    personalBest: 5.8,
    avgWeight: 3.6,
    trend: 'up',
    trendPercent: 8,
    avatar: 'BM',
    medal: 'silver',
    rank: 2,
  },
  {
    id: 3,
    name: 'Tai Hunt',
    role: 'Secretary',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdawwcMINyb6v9yeNV9aXl_nf892bGGSb_wkggmNnWhSHKr7aMGw6lPvX9Opdhnu-KSnDWiw9yHSF6i8WanOYADavpmNIbf0_9cgJ-dGpeMNTEX9c42-CjQZn_dMIn4csW8iulK-iYtBatFKY1dup8T0YexTgNUgDqPn-79lcG8kTQHYUfwo1aJFmiTaJHR31V_PtU9NTC97A9Brx_umfnbggFLfjkFswKUoye4=w1280',
    catches: 12,
    personalBest: 5.2,
    avgWeight: 3.4,
    trend: 'stable',
    trendPercent: 0,
    avatar: 'TH',
    medal: 'bronze',
    rank: 3,
  },
  {
    id: 4,
    name: 'Gordon Phair',
    role: 'Treasurer',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdaYKtPuRS3MM1B8ZQcv6Yn6GBxMRpSdy9L2y90zZCdHu01sW2k5kUidqWR9JTXQ8r93rvBB5gztIKSxIN0dQ6PN28kBgK1H4Gr5B3IbR_SeXk3joFjqFF5BWYUgBS5XaIN78ZNuy5dvd8X6MWJ7IWaJkztdI0rzainVyXOETdO4NbPqbqjhUJIHzjc8YwlDk9JeiwxH-g2UpQv7rjDf6UoqBp3hSCSD-506=w1280',
    catches: 14,
    personalBest: 5.5,
    avgWeight: 3.5,
    trend: 'down',
    trendPercent: -5,
    avatar: 'GP',
    medal: 'none',
    rank: 4,
  },
  {
    id: 5,
    name: 'Howard Binkley',
    role: 'Tournament Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdZytGEAKYAn3LXKrdvxB23KJbwB2KOk2F5qswaDGclVNYTARlhewru4tSixNw095TkD7n4XZ5Rfzwl3zQOVXk2xBoWPvvhKksBPHxb1A8Q82qOTjG9jf-dL9k7zKZ7UdUSWUwtWBZn4FybTtSrU3ts2572UHm_DlXRxjt9ztaIfuTP_69LYeJqs8Acgx3V5RDaLsJSCEL51jZLwSInBe-c2YIC4fAAT3SIN=w1280',
    catches: 9,
    personalBest: 4.9,
    avgWeight: 3.1,
    trend: 'up',
    trendPercent: 15,
    avatar: 'HB',
    medal: 'none',
    rank: 5,
  },
  {
    id: 6,
    name: 'Justin Apfel',
    role: 'Conservation Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdbBv2BDb9lJBpzizCfTltaYfFNLNk7je5bA2mP39BoAxThkgktOZEn_mXD7k5zIYGZTePaotLauw8C1E1Cggx_qRCjDlGxL_igqLQayR3hp-xMVc5PlCDv5AFLnCIKWDvFGkyG6jK_NNqDpwqzBvz_mT8ga6hnLUvySH99oNWJ-quAMAELA_zCC4Qj2ES-1gqRnfQZihucMtU9HpFB01Cb1s8Q5C8sx2czZIB4=w1280',
    catches: 8,
    personalBest: 4.7,
    avgWeight: 3.0,
    trend: 'stable',
    trendPercent: 0,
    avatar: 'JA',
    medal: 'none',
    rank: 6,
  },
  {
    id: 7,
    name: 'Cliff Purslow',
    role: 'Juniors Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdZVvj3sbMr7JDvcCGM8kJpCJoMweIiP1yBQF5iBJ06srdS58JgHo9t8YC4JBtzlPLU8VZpsEguSIdAb0s5TxupHD_oPd8GsHY23Wogeq-sqJqrQBYy008SEEjDtYX5Uc_-MbOPNUgEo_df4EqVnQF2AtzNbBX9oAXz9UXor_XCKPMZQsWgNoZpM_LaVSPToSKiciVQvhpILIszOxcvsU8oBVqwuU5VzM1wC5I8=w1280',
    catches: 7,
    personalBest: 4.3,
    avgWeight: 2.8,
    trend: 'down',
    trendPercent: -3,
    avatar: 'CP',
    medal: 'none',
    rank: 7,
  },
];

// Colors
const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  green: '#4CAF50',
  red: '#FF6B6B',
  goldMedal: '#FFD700',
  silverMedal: '#C0C0C0',
  bronzeMedal: '#CD7F32',
  border: 2,
  radius: 16,
};

interface BoardOfDirectorsProps {
  loading?: boolean;
  clubName?: string;
}

export function BoardOfDirectors({
  loading = false,
  clubName = 'Denver Bassmaster',
}: BoardOfDirectorsProps) {
  const [sortBy, setSortBy] = useState<'catches' | 'pb' | 'avg'>('catches');
  const styles = useMemo(() => createStyles(), []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.gold} />
      </View>
    );
  }

  // Sort members based on selected metric
  const sortedMembers = [...REAL_BOARD_MEMBERS].sort((a, b) => {
    switch (sortBy) {
      case 'pb':
        return b.personalBest - a.personalBest;
      case 'avg':
        return b.avgWeight - a.avgWeight;
      case 'catches':
      default:
        return b.catches - a.catches;
    }
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🏆 Board of Directors</Text>
          <Text style={styles.headerSubtitle}>{clubName} 2025</Text>
        </View>
        <Pressable style={styles.headerIcon} onPress={() => console.log('Filter')}>
          <Ionicons name="funnel" size={24} color={COLORS.gold} />
        </Pressable>
      </View>

      {/* CLUB STATS OVERVIEW */}
      <View style={styles.clubStatsContainer}>
        <View style={styles.clubStatCard}>
          <Ionicons name="people" size={24} color={COLORS.gold} />
          <Text style={styles.clubStatLabel}>Board Members</Text>
          <Text style={styles.clubStatValue}>{REAL_BOARD_MEMBERS.length}</Text>
        </View>

        <View style={styles.clubStatCard}>
          <Ionicons name="fish" size={24} color={COLORS.gold} />
          <Text style={styles.clubStatLabel}>Total Catches</Text>
          <Text style={styles.clubStatValue}>
            {REAL_BOARD_MEMBERS.reduce((sum, m) => sum + m.catches, 0)}
          </Text>
        </View>

        <View style={styles.clubStatCard}>
          <Ionicons name="medal" size={24} color={COLORS.gold} />
          <Text style={styles.clubStatLabel}>Top PB</Text>
          <Text style={styles.clubStatValue}>
            {Math.max(...REAL_BOARD_MEMBERS.map(m => m.personalBest)).toFixed(1)} lbs
          </Text>
        </View>
      </View>

      {/* SORT TABS */}
      <View style={styles.sortTabs}>
        <Pressable
          style={[styles.sortTab, sortBy === 'catches' && styles.sortTabActive]}
          onPress={() => setSortBy('catches')}
        >
          <Text
            style={[
              styles.sortTabText,
              sortBy === 'catches' && styles.sortTabTextActive,
            ]}
          >
            🎣 Catches
          </Text>
        </Pressable>

        <Pressable
          style={[styles.sortTab, sortBy === 'pb' && styles.sortTabActive]}
          onPress={() => setSortBy('pb')}
        >
          <Text
            style={[styles.sortTabText, sortBy === 'pb' && styles.sortTabTextActive]}
          >
            🏅 Personal Best
          </Text>
        </Pressable>

        <Pressable
          style={[styles.sortTab, sortBy === 'avg' && styles.sortTabActive]}
          onPress={() => setSortBy('avg')}
        >
          <Text
            style={[styles.sortTabText, sortBy === 'avg' && styles.sortTabTextActive]}
          >
            📈 Avg Weight
          </Text>
        </Pressable>
      </View>

      {/* BOARD MEMBERS LIST */}
      <View style={styles.membersList}>
        {sortedMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            sortBy={sortBy}
            onPress={() => console.log(`View ${member.name} profile`)}
          />
        ))}
      </View>

      {/* SPACER */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// MEMBER CARD COMPONENT
interface MemberCardProps {
  member: (typeof REAL_BOARD_MEMBERS)[0];
  sortBy: 'catches' | 'pb' | 'avg';
  onPress: () => void;
}

function MemberCard({ member, sortBy, onPress }: MemberCardProps) {
  const styles = useMemo(() => createStyles(), []);
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'President':
        return COLORS.goldMedal;
      case 'Vice President':
        return COLORS.silverMedal;
      case 'Secretary':
        return COLORS.bronzeMedal;
      case 'Treasurer':
        return COLORS.gold;
      default:
        return COLORS.textGray;
    }
  };

  const getMainValue = () => {
    switch (sortBy) {
      case 'pb':
        return `${member.personalBest} lbs`;
      case 'avg':
        return `${member.avgWeight} lbs`;
      case 'catches':
      default:
        return `${member.catches}`;
    }
  };

  const getTrendIcon = () => {
    switch (member.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getMedalIcon = () => {
    switch (member.medal) {
      case 'gold':
        return '🥇';
      case 'silver':
        return '🥈';
      case 'bronze':
        return '🥉';
      default:
        return '';
    }
  };

  return (
    <Pressable style={styles.memberCard} onPress={onPress}>
      {/* Rank Badge with Medal */}
      <View style={styles.rankBadge}>
        <Text style={styles.medalIcon}>{getMedalIcon()}</Text>
        <Text style={styles.rankText}>#{member.rank}</Text>
      </View>

      {/* Image + Info */}
      <View style={styles.memberInfo}>
        {/* Officer Photo */}
        <Image
          source={{ uri: member.imageUrl }}
          style={styles.officerPhoto}
        />

        <View style={styles.memberDetails}>
          <View style={styles.memberHeader}>
            <Text style={styles.memberName}>{member.name}</Text>
            <View
              style={[
                styles.roleBadge,
                { borderColor: getRoleColor(member.role) },
              ]}
            >
              <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                {member.role}
              </Text>
            </View>
          </View>

          <View style={styles.memberStats}>
            <Text style={styles.memberStatText}>🎣 {member.catches}</Text>
            <Text style={styles.memberStatText}>🏅 {member.personalBest}</Text>
            <Text style={styles.memberStatText}>📊 {member.avgWeight}</Text>
          </View>
        </View>
      </View>

      {/* Main Value + Trend */}
      <View style={styles.memberValue}>
        <Text style={styles.mainValue}>{getMainValue()}</Text>
        <View style={styles.trendBadge}>
          <Text style={styles.trendIcon}>{getTrendIcon()}</Text>
          <Text
            style={[
              styles.trendText,
              member.trend === 'up' && styles.trendUp,
              member.trend === 'down' && styles.trendDown,
            ]}
          >
            {member.trendPercent > 0 && '+'}
            {member.trendPercent}%
          </Text>
        </View>
      </View>

      {/* Arrow */}
      <Ionicons name="chevron-forward" size={18} color={COLORS.gold} />
    </Pressable>
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

    // HEADER
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 4,
    },

    headerSubtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: COLORS.textGray,
    },

    headerIcon: {
      padding: 8,
    },

    // CLUB STATS OVERVIEW
    clubStatsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 20,
    },

    clubStatCard: {
      flex: 1,
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 6,
    },

    clubStatLabel: {
      fontSize: 10,
      fontWeight: '500',
      color: COLORS.textGray,
      textAlign: 'center',
    },

    clubStatValue: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.gold,
    },

    // SORT TABS
    sortTabs: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
    },

    sortTab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: COLORS.navyBorder,
      alignItems: 'center',
    },

    sortTabActive: {
      backgroundColor: COLORS.gold,
      borderColor: COLORS.gold,
    },

    sortTabText: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.textGray,
    },

    sortTabTextActive: {
      color: COLORS.navy,
    },

    // MEMBERS LIST
    membersList: {
      gap: 12,
    },

    // MEMBER CARD
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: COLORS.radius,
      padding: 12,
      gap: 12,
    },

    rankBadge: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: COLORS.gold,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },

    medalIcon: {
      fontSize: 18,
    },

    rankText: {
      fontSize: 10,
      fontWeight: '700',
      color: COLORS.navy,
    },

    // MEMBER INFO
    memberInfo: {
      flex: 1,
      flexDirection: 'row',
      gap: 10,
    },

    officerPhoto: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: COLORS.navyBorder,
      borderWidth: 2,
      borderColor: COLORS.gold,
    },

    memberDetails: {
      flex: 1,
      gap: 4,
    },

    memberHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'space-between',
    },

    memberName: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.textLight,
      flex: 1,
    },

    roleBadge: {
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },

    roleText: {
      fontSize: 8,
      fontWeight: '600',
    },

    memberStats: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
    },

    memberStatText: {
      fontSize: 9,
      color: COLORS.textGray,
    },

    // MEMBER VALUE
    memberValue: {
      alignItems: 'flex-end',
      gap: 4,
    },

    mainValue: {
      fontSize: 15,
      fontWeight: '700',
      color: COLORS.gold,
    },

    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },

    trendIcon: {
      fontSize: 12,
    },

    trendText: {
      fontSize: 9,
      fontWeight: '600',
      color: COLORS.textGray,
    },

    trendUp: {
      color: COLORS.green,
    },

    trendDown: {
      color: COLORS.red,
    },
  });
}
