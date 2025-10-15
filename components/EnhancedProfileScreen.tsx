import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from '../lib/ThemeContext';
import { useAOYStandings, useTournaments } from '../lib/hooks/useQueries';
import { TournamentEvent, AOYStandingsRow } from '../lib/supabase';
import DatabaseStatusScreen from '../components/DatabaseStatusScreen';
import { ListSkeleton } from '../components/Skeleton';
import TopBar from '../components/TopBar';
import ThemeToggle from '../components/ThemeToggle';
import { Chip } from '../components/BrandPrimitives';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
}

interface PersonalStats {
  totalTournaments: number;
  currentRank: number | null;
  totalPoints: number;
  bestFinish: number | null;
  averageFinish: number | null;
  tournamentsThisYear: number;
}

const { width: screenWidth } = Dimensions.get('window');

export default function EnhancedProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: aoyStandings = [], isLoading: aoyLoading, refetch: refetchAOY } = useAOYStandings();
  const { data: tournaments = [], isLoading: tournamentsLoading, refetch: refetchTournaments } = useTournaments();
  
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'achievements' | 'settings'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Calculate personal statistics
  const personalStats: PersonalStats = useMemo(() => {
    if (!profile?.member_code) {
      return {
        totalTournaments: 0,
        currentRank: null,
        totalPoints: 0,
        bestFinish: null,
        averageFinish: null,
        tournamentsThisYear: 0,
      };
    }

    // Find member in AOY standings
    const memberStanding = aoyStandings.find(
      standing => standing.member_id === profile.member_code
    );

    // Calculate tournament participation (mock data for demo)
    const currentYear = new Date().getFullYear();
    const thisYearTournaments = tournaments.filter(t => {
      if (!t.event_date) return false;
      return new Date(t.event_date).getFullYear() === currentYear;
    }).length;

    return {
      totalTournaments: 15, // Mock: Total career tournaments
      currentRank: memberStanding?.aoy_rank || null,
      totalPoints: memberStanding?.total_aoy_points || 0,
      bestFinish: 3, // Mock: Best tournament finish
      averageFinish: 8.5, // Mock: Average finish position
      tournamentsThisYear: thisYearTournaments,
    };
  }, [profile, aoyStandings, tournaments]);

  // Define achievement system
  const achievements: Achievement[] = useMemo(() => [
    {
      id: 'first_tournament',
      title: 'First Cast',
      description: 'Participated in your first tournament',
      icon: 'fish-outline',
      color: '#28a745',
      earned: personalStats.totalTournaments > 0,
      earnedDate: '2024-03-15',
    },
    {
      id: 'top_ten',
      title: 'Top Angler',
      description: 'Finished in the top 10',
      icon: 'medal-outline',
      color: '#ffc107',
      earned: personalStats.bestFinish !== null && personalStats.bestFinish <= 10,
      earnedDate: '2024-05-20',
    },
    {
      id: 'podium_finish',
      title: 'Podium Master',
      description: 'Achieved a top 3 finish',
      icon: 'trophy-outline',
      color: '#fd7e14',
      earned: personalStats.bestFinish !== null && personalStats.bestFinish <= 3,
      earnedDate: '2024-07-08',
    },
    {
      id: 'season_veteran',
      title: 'Season Veteran',
      description: 'Participated in 5+ tournaments this year',
      icon: 'calendar-outline',
      color: '#6f42c1',
      earned: personalStats.tournamentsThisYear >= 5,
    },
    {
      id: 'points_milestone',
      title: 'Point Collector',
      description: 'Earned 100+ AOY points',
      icon: 'star-outline',
      color: '#dc3545',
      earned: personalStats.totalPoints >= 100,
      earnedDate: '2024-06-12',
    },
    {
      id: 'consistent_angler',
      title: 'Consistency Award',
      description: 'Maintained top 20 ranking',
      icon: 'trending-up-outline',
      color: '#20c997',
      earned: personalStats.currentRank !== null && personalStats.currentRank <= 20,
    },
  ], [personalStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchAOY(), refetchTournaments()]);
    } finally {
      setRefreshing(false);
    }
  };

  // Role label from AOY boater status and membership since (derived from created_at)
  const classifyBoaterStatus = (raw?: string | null): 'boater' | 'co-angler' | 'unknown' => {
    if (!raw) return 'unknown';
    const s = String(raw).trim().toLowerCase();
    if (s === 'b' || s.includes('boater')) return 'boater';
    if (s === 'c' || s.includes('co') || s.includes('co-angler') || s.includes('co angler')) return 'co-angler';
    return 'unknown';
  };

  const roleLabel = useMemo(() => {
    if (!profile?.member_code) return 'Member';
    const entry = (aoyStandings as any[]).find(s => String(s.member_id) === String(profile.member_code));
    const role = classifyBoaterStatus((entry as any)?.boater_status);
    return role === 'boater' ? 'Boater' : role === 'co-angler' ? 'Co-Angler' : 'Member';
  }, [aoyStandings, profile?.member_code]);

  const memberSinceYear = useMemo(() => {
    try {
      return profile?.created_at ? new Date(profile.created_at).getFullYear() : null;
    } catch {
      return null;
    }
  }, [profile?.created_at]);

  if (showDatabaseStatus) {
    return (
      <View style={styles.container}>
           <TopBar showBack title="Profile" />
        <DatabaseStatusScreen />
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Branded Profile Hero */}
      <View style={styles.heroCard}>
        <LinearGradient
          colors={theme.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#007bff" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.heroName}>{profile?.name || 'Member Name'}</Text>
              {personalStats.currentRank ? (
                <View style={styles.aoyRow}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.aoyRankText}>AOY #{personalStats.currentRank}</Text>
                  {personalStats.totalPoints ? (
                    <Text style={styles.aoyPointsText}>{personalStats.totalPoints} pts</Text>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.chipsRow}>
                <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' }]}>
                  <Ionicons name="card" size={14} color="#fff" />
                  <Text style={styles.chipText}>{profile?.member_code || 'Not Linked'}</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' }]}>
                  <Ionicons name="person" size={14} color="#fff" />
                  <Text style={styles.chipText}>{roleLabel}</Text>
                </View>
                {memberSinceYear && (
                  <View style={[styles.chip, { backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.4)' }]}>
                    <Ionicons name="calendar" size={14} color="#fff" />
                    <Text style={styles.chipText}>Since {memberSinceYear}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.heroLocation}>📍 {profile?.hometown || 'Location not set'}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStatsContainer}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#ffc107" />
            <Text style={styles.statValue}>{personalStats.totalPoints}</Text>
            <Text style={styles.statLabel}>AOY Points</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#28a745" />
            <Text style={styles.statValue}>{personalStats.totalTournaments}</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="medal" size={24} color="#fd7e14" />
            <Text style={styles.statValue}>
              {personalStats.bestFinish ? `#${personalStats.bestFinish}` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Best Finish</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#6f42c1" />
            <Text style={styles.statValue}>
              {personalStats.averageFinish ? personalStats.averageFinish.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Avg Finish</Text>
          </View>
        </View>
      </View>

      {/* Recent Achievements */}
      <View style={styles.achievementsPreview}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.filter(a => a.earned).slice(-3).map(achievement => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: achievement.color }]}>
                <Ionicons name={achievement.icon as any} size={24} color="#fff" />
              </View>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDate}>
                {achievement.earnedDate || 'Recently'}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Tournament History Preview */}
      <View style={styles.historyPreview}>
        <Text style={styles.sectionTitle}>Recent Tournaments</Text>
        {tournaments.slice(0, 3).map((tournament, index) => (
          <View key={tournament.event_id} style={styles.tournamentHistoryItem}>
            <View style={styles.tournamentInfo}>
              <Text style={styles.tournamentName}>
                {tournament.tournament_name || 'Tournament'}
              </Text>
              <Text style={styles.tournamentDate}>
                {tournament.event_date ? new Date(tournament.event_date).toLocaleDateString() : 'Date TBD'}
              </Text>
            </View>
            <View style={styles.tournamentResult}>
              <Text style={styles.resultPosition}>#{index + 5}</Text>
              <Text style={styles.resultPoints}>{25 - (index * 3)} pts</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Performance Analytics</Text>
        
        {/* Season Overview */}
        <View style={styles.seasonOverview}>
          <Text style={styles.subsectionTitle}>2024 Season</Text>
          <View style={styles.seasonStats}>
            <View style={styles.seasonStat}>
              <Text style={styles.seasonStatValue}>{personalStats.tournamentsThisYear}</Text>
              <Text style={styles.seasonStatLabel}>Tournaments</Text>
            </View>
            <View style={styles.seasonStat}>
              <Text style={styles.seasonStatValue}>{personalStats.totalPoints}</Text>
              <Text style={styles.seasonStatLabel}>Total Points</Text>
            </View>
            <View style={styles.seasonStat}>
              <Text style={styles.seasonStatValue}>
                {personalStats.currentRank ? `#${personalStats.currentRank}` : 'NR'}
              </Text>
              <Text style={styles.seasonStatLabel}>Current Rank</Text>
            </View>
          </View>
        </View>

        {/* Performance Breakdown */}
        <View style={styles.performanceBreakdown}>
          <Text style={styles.subsectionTitle}>Tournament Performance</Text>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Best Finish</Text>
            <Text style={styles.performanceValue}>
              {personalStats.bestFinish ? `#${personalStats.bestFinish}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Average Finish</Text>
            <Text style={styles.performanceValue}>
              {personalStats.averageFinish ? `#${personalStats.averageFinish.toFixed(1)}` : 'N/A'}
            </Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Top 10 Finishes</Text>
            <Text style={styles.performanceValue}>4</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceLabel}>Points Per Tournament</Text>
            <Text style={styles.performanceValue}>
              {personalStats.totalTournaments > 0 
                ? Math.round(personalStats.totalPoints / personalStats.totalTournaments)
                : 0}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderAchievementsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.achievementsSummary}>
          {achievements.filter(a => a.earned).length} of {achievements.length} earned
        </Text>
        
        {achievements.map(achievement => (
          <View key={achievement.id} style={[
            styles.achievementItem,
            !achievement.earned && styles.achievementItemLocked
          ]}>
            <View style={[
              styles.achievementItemIcon,
              { backgroundColor: achievement.earned ? achievement.color : '#e9ecef' }
            ]}>
              <Ionicons 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.earned ? '#fff' : '#6c757d'} 
              />
            </View>
            
            <View style={styles.achievementItemContent}>
              <Text style={[
                styles.achievementItemTitle,
                !achievement.earned && styles.achievementItemTitleLocked
              ]}>
                {achievement.title}
              </Text>
              <Text style={[
                styles.achievementItemDescription,
                !achievement.earned && styles.achievementItemDescriptionLocked
              ]}>
                {achievement.description}
              </Text>
              {achievement.earned && achievement.earnedDate && (
                <Text style={styles.achievementItemDate}>
                  Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
                </Text>
              )}
            </View>
            
            {achievement.earned && (
              <Ionicons name="checkmark-circle" size={24} color="#28a745" />
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings & Tools</Text>
        
        {/* Account Information */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Account Information</Text>
          
          <View style={styles.settingsItem}>
            <Ionicons name="mail-outline" size={20} color="#7f8c8d" />
            <View style={styles.settingsItemContent}>
              <Text style={styles.settingsItemLabel}>Email</Text>
              <Text style={styles.settingsItemValue}>{user?.email}</Text>
            </View>
          </View>
          
          <View style={styles.settingsItem}>
            <Ionicons name="card-outline" size={20} color="#7f8c8d" />
            <View style={styles.settingsItemContent}>
              <Text style={styles.settingsItemLabel}>Member Code</Text>
              <Text style={styles.settingsItemValue}>
                {profile?.member_code || 'Not linked'}
              </Text>
            </View>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Appearance</Text>
          
          <View style={styles.settingsItem}>
            <Ionicons name="color-palette-outline" size={20} color="#7f8c8d" />
            <View style={styles.settingsItemContent}>
              <Text style={styles.settingsItemLabel}>Theme</Text>
            </View>
            <ThemeToggle />
          </View>
        </View>

        {/* Developer Tools */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Developer Tools</Text>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => setShowDatabaseStatus(true)}
          >
            <Ionicons name="server-outline" size={20} color="#007bff" />
            <Text style={styles.settingsButtonText}>Database Status</Text>
            <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        </View>

        {/* App Actions */}
        <View style={styles.settingsGroup}>
          <Text style={styles.settingsGroupTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color="#dc3545" />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverviewTab();
      case 'stats': return renderStatsTab();
      case 'achievements': return renderAchievementsTab();
      case 'settings': return renderSettingsTab();
      default: return renderOverviewTab();
    }
  };

  if (aoyLoading && tournamentsLoading) {
    return (
      <View style={styles.container}>
        <ListSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={activeTab === 'overview' ? '#007bff' : '#7f8c8d'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'overview' && styles.activeTabLabel]}>
            Overview
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Ionicons 
            name="stats-chart-outline" 
            size={20} 
            color={activeTab === 'stats' ? '#007bff' : '#7f8c8d'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'stats' && styles.activeTabLabel]}>
            Stats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Ionicons 
            name="trophy-outline" 
            size={20} 
            color={activeTab === 'achievements' ? '#007bff' : '#7f8c8d'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'achievements' && styles.activeTabLabel]}>
            Achievements
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings-outline" 
            size={20} 
            color={activeTab === 'settings' ? '#007bff' : '#7f8c8d'} 
          />
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.surface,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
    color: theme.accent,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
  },
  tabLabel: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.medium,
    color: theme.textSecondary,
    marginTop: 4,
  },
  activeTabLabel: {
    color: theme.primary,
    fontFamily: theme.typography.family.bold,
  },
  tabContent: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: theme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: theme.surface,
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.border,
  },
  profileInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: theme.typography.sizes.h2,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 4,
  },
  memberCode: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.medium,
    color: theme.primary,
    marginBottom: 2,
  },
  memberLocation: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
  },
  // New branded hero styles
  heroCard: {
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: theme.layout.radius.lg,
    overflow: 'hidden',
    elevation: theme.layout.elevation.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  heroGradient: {
    padding: theme.layout.spacing.lg,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroName: {
    fontSize: theme.typography.sizes.h1,
    fontFamily: theme.typography.family.bold,
    color: '#fff',
    marginBottom: 6,
  },
  aoyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aoyRankText: {
    marginLeft: 6,
    color: '#fff',
    fontWeight: '700',
  },
  aoyPointsText: {
    marginLeft: 8,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  heroLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  quickStatsContainer: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (screenWidth - 64) / 2,
    backgroundColor: theme.mode === 'light' ? '#f8f9fa' : theme.background,
    borderRadius: theme.layout.radius.md,
    padding: theme.layout.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  statValue: {
    fontSize: theme.typography.sizes.h1,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
    color: theme.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  achievementsPreview: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    marginBottom: 12,
  },
  achievementCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 10,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  historyPreview: {
    backgroundColor: theme.surface,
    padding: theme.layout.spacing.lg,
    marginBottom: 12,
  },
  tournamentHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentName: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 2,
  },
  tournamentDate: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
  },
  tournamentResult: {
    alignItems: 'flex-end',
  },
  resultPosition: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.primary,
  },
  resultPoints: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.medium,
    color: theme.accent,
  },
  statsSection: {
    padding: theme.layout.spacing.lg,
  },
  seasonOverview: {
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.lg,
    padding: theme.layout.spacing.lg,
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 16,
  },
  seasonStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seasonStat: {
    alignItems: 'center',
  },
  seasonStatValue: {
    fontSize: theme.typography.sizes.h1,
    fontFamily: theme.typography.family.bold,
    color: theme.primary,
    marginBottom: 4,
  },
  seasonStatLabel: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  performanceBreakdown: {
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.lg,
    padding: theme.layout.spacing.lg,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  performanceLabel: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.regular,
    color: theme.text,
  },
  performanceValue: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.bold,
    color: theme.primary,
  },
  achievementsSection: {
    padding: theme.layout.spacing.lg,
  },
  achievementsSummary: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  achievementItem: {
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.lg,
    padding: theme.layout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementItemLocked: {
    opacity: 0.6,
  },
  achievementItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  achievementItemContent: {
    flex: 1,
  },
  achievementItemTitle: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 4,
  },
  achievementItemTitleLocked: {
    color: theme.textSecondary,
  },
  achievementItemDescription: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    marginBottom: 4,
  },
  achievementItemDescriptionLocked: {
    color: theme.textSecondary,
    opacity: 0.6,
  },
  achievementItemDate: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.medium,
    color: theme.accent,
  },
  settingsSection: {
    padding: theme.layout.spacing.lg,
  },
  settingsGroup: {
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.lg,
    padding: theme.layout.spacing.lg,
    marginBottom: 20,
  },
  settingsGroupTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  settingsItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingsItemLabel: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.medium,
    color: theme.text,
    marginBottom: 2,
  },
  settingsItemValue: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
    color: theme.primary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.mode === 'light' ? '#f8d7da' : 'rgba(220,53,69,0.2)',
    borderRadius: theme.layout.radius.md,
    padding: theme.layout.spacing.lg,
  },
  signOutButtonText: {
    marginLeft: 12,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: '#dc3545',
  },
});