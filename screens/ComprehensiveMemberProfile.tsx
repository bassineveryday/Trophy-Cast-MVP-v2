import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';
import { useTheme, createThemedStyles } from '../lib/ThemeContext';
import { useTournaments, useAOYStandings } from '../lib/hooks/useQueries';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../utils/toast';
import AnimatedCard from '../components/AnimatedCard';
import ThemeToggle from '../components/ThemeToggle';

const { width } = Dimensions.get('window');

interface MemberProfile {
  member_id: string;
  name: string;
  role: string;
  member_since: string;
  hometown: string;
  home_waters: string;
  birthdate?: string;
  hobbies?: string;
  signature_technique?: string;
  avatar_url?: string;
}

interface CareerStats {
  years_in_dbm: number;
  total_tournaments: number;
  time_in_money: number;
  first_place_finishes: number;
  second_place_finishes: number;
  third_place_finishes: number;
  top_ten_finishes: number;
  total_weight: number;
  career_winnings: number;
}

interface SeasonPerformance {
  aoy_points: number;
  season_rank: number;
  win_rate: number;
  avg_tournament_weight: number;
  personal_best: number;
}

interface RecentTournament {
  tournament_name: string;
  lake: string;
  placement: number;
  total_weight: number;
  event_date: string;
}

const ComprehensiveMemberProfile: React.FC = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const route = useRoute();
  const routeMemberId = (route.params as any)?.memberId as string | undefined;
  const { theme, isDark } = useTheme();
  const { data: tournaments } = useTournaments();
  const { data: standings } = useAOYStandings();
  
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [careerStats, setCareerStats] = useState<CareerStats | null>(null);
  const [seasonPerformance, setSeasonPerformance] = useState<SeasonPerformance | null>(null);
  const [recentForm, setRecentForm] = useState<RecentTournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [profile?.member_code, routeMemberId]);

  const loadProfileData = async () => {
  // If a route param memberId is provided, prefer that (viewing another member)
  const memberCodeToUse = routeMemberId || profile?.member_code;
  if (!memberCodeToUse) return;
    
    setLoading(true);
    try {
      // Try to fetch a real profile from Supabase by dbm_number, member_code, or id
      const { data: found, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .or(`dbm_number.eq.${memberCodeToUse},member_code.eq.${memberCodeToUse},id.eq.${memberCodeToUse}`)
        .limit(1)
        .maybeSingle();

      if (findError) {
        console.error('Error querying profile by memberId:', findError);
      }

      if (found && Object.keys(found).length > 0) {
        // Map found record to MemberProfile shape
        const fetched: MemberProfile = {
          member_id: (found.id || found.member_code || memberCodeToUse) as string,
          name: (found.name || found.full_name || 'Unknown') as string,
          role: (found.role || 'Member') as string,
          member_since: (found.member_since || 'Unknown') as string,
          hometown: (found.hometown || 'Unknown') as string,
          home_waters: (found.home_waters || '') as string,
          birthdate: found.birthdate || undefined,
          hobbies: found.hobbies || undefined,
          signature_technique: found.signature_technique || undefined,
          avatar_url: found.avatar_url || undefined,
        };

        setMemberProfile(fetched);

        // Optionally, fetch career/season stats from tournament_results for this member
        const memberKey = found.member_code || found.dbm_number || found.id;
        const { data: statsRows } = await supabase
          .from('tournament_results')
          .select('place, weight_lbs, event_date, payout, big_fish')
          .eq('member_id', memberKey)
          .order('event_date', { ascending: false });

        // derive simple career stats and recent form
        const career: CareerStats = {
          years_in_dbm: 1,
          total_tournaments: statsRows?.length || 0,
          time_in_money: (statsRows || []).filter((r: any) => r.payout && r.payout > 0).length,
          first_place_finishes: (statsRows || []).filter((r: any) => r.place === 1).length,
          second_place_finishes: (statsRows || []).filter((r: any) => r.place === 2).length,
          third_place_finishes: (statsRows || []).filter((r: any) => r.place === 3).length,
          top_ten_finishes: (statsRows || []).filter((r: any) => r.place && r.place <= 10).length,
          total_weight: (statsRows || []).reduce((s: number, r: any) => s + (Number(r.weight_lbs) || 0), 0),
          career_winnings: (statsRows || []).reduce((s: number, r: any) => s + (Number(r.payout) || 0), 0),
        };

        setCareerStats(career);

        const recent: RecentTournament[] = (statsRows || []).slice(0, 5).map((r: any) => ({
          tournament_name: r.tournament_name || 'Tournament',
          lake: r.lake || '',
          placement: r.place || 0,
          total_weight: r.weight_lbs || 0,
          event_date: r.event_date || '',
        }));

        setRecentForm(recent);

        // derive simple season performance
        setSeasonPerformance({
          aoy_points: 0,
          season_rank: 0,
          win_rate: career.total_tournaments ? career.first_place_finishes / career.total_tournaments : 0,
          avg_tournament_weight: career.total_tournaments ? career.total_weight / career.total_tournaments : 0,
          personal_best: recent.length ? Math.max(...recent.map(r => r.total_weight)) : 0,
        });
      } else {
        // keep fallback mock data if no record found
        const mockProfile: MemberProfile = {
          member_id: memberCodeToUse,
          name: profile?.name || 'Tai Hunt',
          role: 'DBM Member',
          member_since: 'Oct 2025',
          hometown: 'Denver, CO',
          home_waters: 'Cherry Creek Reservoir',
          birthdate: undefined,
          hobbies: undefined,
          signature_technique: undefined,
          avatar_url: 'https://via.placeholder.com/150'
        };

        setMemberProfile(mockProfile);
        setCareerStats(null);
        setSeasonPerformance(null);
        setRecentForm([]);
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
      showError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const getPlacementColor = (placement: number) => {
    if (placement === 1) return '#FFD700';
    if (placement === 2) return '#C0C0C0';
    if (placement === 3) return '#CD7F32';
    if (placement <= 5) return '#4CAF50';
    if (placement <= 10) return '#2196F3';
    return '#757575';
  };

  const getPlacementSuffix = (place: number) => {
    if (place % 10 === 1 && place % 100 !== 11) return 'st';
    if (place % 10 === 2 && place % 100 !== 12) return 'nd';
    if (place % 10 === 3 && place % 100 !== 13) return 'rd';
    return 'th';
  };

  const getTrendIndicator = () => {
    if (recentForm.length < 2) return '➡️ Stable';
    
    const recent = recentForm.slice(0, 3);
    const avgRecent = recent.reduce((sum, t) => sum + t.placement, 0) / recent.length;
    const older = recentForm.slice(3, 5);
    const avgOlder = older.reduce((sum, t) => sum + t.placement, 0) / older.length;
    
    if (avgRecent < avgOlder - 0.5) return '⬆️ Improving';
    if (avgRecent > avgOlder + 0.5) return '⬇️ Declining';
    return '➡️ Consistent';
  };

  const styles = createStyles(theme);

  const findEventId = (t: { tournament_name?: string; event_date?: string; lake?: string } | null) => {
    if (!t || !tournaments || tournaments.length === 0) return null;
    return (
      tournaments.find((ev: any) => {
        if (!ev) return false;
        const sameName = ev.tournament_name && t.tournament_name && ev.tournament_name.trim().toLowerCase() === t.tournament_name.trim().toLowerCase();
        const sameDate = ev.event_date && t.event_date && new Date(ev.event_date).toISOString().slice(0,10) === new Date(t.event_date || '').toISOString().slice(0,10);
        const sameLake = ev.lake && t.lake && ev.lake.trim().toLowerCase() === t.lake.trim().toLowerCase();
        return (sameName && (sameDate || sameLake)) || sameName;
      }) || null
    )?.event_id || null;
  };

  const handleRecentPress = (t: RecentTournament) => {
    const id = findEventId(t as any);
    if (id) (navigation as any).navigate('TournamentDetail', { tournamentId: id });
    else (navigation as any).navigate('Tournaments');
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="person-circle-outline" size={64} color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textMuted }]}>Loading profile...</Text>
      </View>
    );
  }

  if (!memberProfile) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.primary]}
          tintColor={theme.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* 🎣 Hero Card (Gradient) */}
      <View style={styles.heroCard}>
        <View style={styles.heroGradient}>
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: memberProfile.avatar_url || 'https://via.placeholder.com/100' }}
                style={styles.avatar}
              />
              <View style={styles.heroIcon}>
                <Ionicons name="fish" size={20} color="#fff" />
              </View>
            </View>
            
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{memberProfile.name}</Text>
              <Text style={styles.heroRole}>
                {memberProfile.role} • Member Since: {memberProfile.member_since}
              </Text>
              <Text style={styles.heroLocation}>
                📍 My Hometown: {memberProfile.hometown}
              </Text>
              <Text style={styles.heroWaters}>
                🌊 Home Waters: {memberProfile.home_waters}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 📋 About Me */}
      <AnimatedCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="clipboard" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>About Me</Text>
        </View>
        
        <View style={styles.aboutContent}>
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>• Birthdate:</Text>
            <Text style={styles.aboutValue}>{memberProfile.birthdate || 'Not specified'}</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>• Hobbies:</Text>
            <Text style={styles.aboutValue}>{memberProfile.hobbies || 'Fishing and outdoors'}</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>• Signature Technique/Strength:</Text>
            <Text style={styles.aboutValue}>{memberProfile.signature_technique || '*(to define)*'}</Text>
          </View>
          
          <View style={styles.aboutItem}>
            <Text style={styles.aboutLabel}>• Career Highlights:</Text>
            <Text style={styles.aboutValue}>
              {careerStats?.first_place_finishes ? `${careerStats.first_place_finishes} tournament victories` : '*(to generate later)*'}
            </Text>
          </View>
        </View>
      </AnimatedCard>

      {/* 📊 Career Statistics */}
      <AnimatedCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bar-chart" size={20} color="#2196F3" />
          <Text style={styles.sectionTitle}>Career Statistics</Text>
        </View>
        
        {careerStats && (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Years in DBM</Text>
                <Text style={styles.statValue}>{careerStats.years_in_dbm}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Tournaments</Text>
                <Text style={styles.statValue}>{careerStats.total_tournaments}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Time in Money</Text>
                <Text style={styles.statValue}>{careerStats.time_in_money}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>1st Place Finishes</Text>
                <Text style={[styles.statValue, { color: '#FFD700' }]}>{careerStats.first_place_finishes}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>2nd Place Finishes</Text>
                <Text style={[styles.statValue, { color: '#C0C0C0' }]}>{careerStats.second_place_finishes}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>3rd Place Finishes</Text>
                <Text style={[styles.statValue, { color: '#CD7F32' }]}>{careerStats.third_place_finishes}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Top 10 Finishes</Text>
                <Text style={styles.statValue}>{careerStats.top_ten_finishes}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Total Weight</Text>
                <Text style={styles.statValue}>{careerStats.total_weight.toFixed(1)} lbs</Text>
              </View>
            </View>
            
            <View style={styles.fullWidthStat}>
              <Text style={styles.statLabel}>Career Winnings</Text>
              <Text style={[styles.statValue, styles.winningsValue]}>${careerStats.career_winnings.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </AnimatedCard>

      {/* 🏆 Season Performance (2025) */}
      <AnimatedCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.sectionTitle}>Season Performance (2025)</Text>
        </View>
        
        {seasonPerformance && (
          <View style={styles.seasonStats}>
            <View style={styles.seasonRow}>
              <View style={styles.seasonItem}>
                <Text style={styles.seasonLabel}>AOY Points</Text>
                <Text style={styles.seasonValue}>{seasonPerformance.aoy_points}</Text>
              </View>
              <View style={styles.seasonItem}>
                <Text style={styles.seasonLabel}>Season Rank</Text>
                <Text style={[styles.seasonValue, { color: '#FFD700' }]}>#{seasonPerformance.season_rank}</Text>
              </View>
            </View>
            
            <View style={styles.seasonRow}>
              <View style={styles.seasonItem}>
                <Text style={styles.seasonLabel}>Win Rate</Text>
                <Text style={styles.seasonValue}>{(seasonPerformance.win_rate * 100).toFixed(0)}%</Text>
              </View>
              <View style={styles.seasonItem}>
                <Text style={styles.seasonLabel}>Avg Tournament Weight</Text>
                <Text style={styles.seasonValue}>{seasonPerformance.avg_tournament_weight.toFixed(1)} lbs</Text>
              </View>
            </View>
            
            <View style={styles.fullWidthStat}>
              <Text style={styles.seasonLabel}>Personal Best</Text>
              <Text style={[styles.seasonValue, { color: '#4CAF50', fontSize: 24 }]}>
                {seasonPerformance.personal_best.toFixed(1)} lbs
              </Text>
            </View>
          </View>
        )}
      </AnimatedCard>

      {/* 🐟 Recent Form (Last 5 of 2025) */}
      <AnimatedCard style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="fish" size={20} color="#FF9800" />
          <Text style={styles.sectionTitle}>Recent Form (Last 5 of 2025)</Text>
        </View>
        
        <View style={styles.recentForm}>
          {recentForm.map((tournament, index) => (
            <TouchableOpacity key={index} style={styles.tournamentRow} onPress={() => handleRecentPress(tournament)} activeOpacity={0.8} accessible accessibilityRole="button" accessibilityLabel={`Open details for ${tournament.tournament_name}`}>
              <View style={styles.tournamentInfo}>
                <Text style={styles.tournamentLake}>• {tournament.lake}:</Text>
                <View style={styles.tournamentDetails}>
                  <View style={[styles.placementBadge, { backgroundColor: getPlacementColor(tournament.placement) }]}>
                    <Text style={styles.placementText}>
                      {tournament.placement}{getPlacementSuffix(tournament.placement)} place
                    </Text>
                  </View>
                  <Text style={styles.tournamentWeight}>• {tournament.total_weight.toFixed(1)} lbs</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          
          <View style={styles.trendContainer}>
            <Text style={styles.trendLabel}>Trend: </Text>
            <Text style={styles.trendValue}>{getTrendIndicator()}</Text>
          </View>
        </View>
      </AnimatedCard>

      {/* 📅 Upcoming Events */}
      <AnimatedCard style={StyleSheet.flatten([styles.sectionCard, styles.upcomingCard])}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={20} color="#9C27B0" />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Events</Text>
        </View>
        
        <View style={styles.upcomingEvent}>
          <Text style={[styles.eventDetails, { color: theme.text }]}>
            Cedar Bluff Reservoir – Oct 20, 2025 • 7:00 AM
          </Text>
          
          <TouchableOpacity style={[styles.registerButton, { backgroundColor: theme.primary }]} onPress={() => (navigation as any).navigate('Tournaments')} accessible accessibilityRole="button" accessibilityLabel="Open tournaments to register"> 
            <Text style={styles.registerButtonText}>Register Now →</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>

      {/* Theme Settings */}
      <ThemeToggle />
    </ScrollView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textMuted,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: theme.error,
    fontWeight: '600',
  },
  heroCard: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroGradient: {
    backgroundColor: theme.primary,
    padding: 25,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  heroIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  heroRole: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
  },
  heroLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroWaters: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginLeft: 8,
  },
  aboutContent: {
    gap: 12,
  },
  aboutItem: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  aboutLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
    minWidth: 60,
  },
  aboutValue: {
    fontSize: 16,
    color: theme.textSecondary,
    flex: 1,
    marginLeft: 8,
  },
  statsGrid: {
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  fullWidthStat: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
  },
  winningsValue: {
    fontSize: 24,
    color: theme.success,
  },
  seasonStats: {
    gap: 16,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seasonItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  seasonLabel: {
    fontSize: 12,
    color: theme.warning,
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  seasonValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  recentForm: {
    gap: 12,
  },
  tournamentRow: {
    paddingVertical: 8,
  },
  tournamentInfo: {
    gap: 6,
  },
  tournamentLake: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  tournamentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 16,
  },
  placementBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  placementText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentWeight: {
    fontSize: 14,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  trendLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 16,
    color: theme.success,
    fontWeight: 'bold',
  },
  upcomingCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.accent,
  },
  upcomingEvent: {
    gap: 16,
  },
  eventDetails: {
    fontSize: 16,
    color: theme.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: theme.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ComprehensiveMemberProfile;