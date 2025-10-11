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
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../lib/AuthContext';
import { useTournaments, useAOYStandings } from '../lib/hooks/useQueries';
import { supabase } from '../lib/supabase';
import { showSuccess, showError } from '../utils/toast';
import AnimatedCard from '../components/AnimatedCard';

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
  }, [profile?.member_code]);

  const loadProfileData = async () => {
    if (!profile?.member_code) return;
    
    setLoading(true);
    try {
      // For demo purposes, using mock data that matches your design
      // In production, this would query Supabase with the SQL you provided
      
      const mockProfile: MemberProfile = {
        member_id: profile.member_code,
        name: profile.name || 'Tai Hunt',
        role: 'DBM Secretary',
        member_since: 'Oct 2025',
        hometown: 'Denver, CO',
        home_waters: 'Cherry Creek Reservoir',
        birthdate: 'May 30, 1994',
        hobbies: 'Hunting, offshore fishing, outdoors',
        signature_technique: 'Deep water structure fishing',
        avatar_url: 'https://via.placeholder.com/150'
      };

      const mockCareerStats: CareerStats = {
        years_in_dbm: 1,
        total_tournaments: 12,
        time_in_money: 8,
        first_place_finishes: 2,
        second_place_finishes: 1,
        third_place_finishes: 2,
        top_ten_finishes: 9,
        total_weight: 89.7,
        career_winnings: 1250.00
      };

      const mockSeasonPerformance: SeasonPerformance = {
        aoy_points: 487,
        season_rank: 3,
        win_rate: 0.42,
        avg_tournament_weight: 7.48,
        personal_best: 9.1
      };

      const mockRecentForm: RecentTournament[] = [
        {
          tournament_name: 'Fall Championship',
          lake: 'Cedar Bluff Reservoir',
          placement: 3,
          total_weight: 7.6,
          event_date: '2025-10-05'
        },
        {
          tournament_name: 'Late Summer Classic',
          lake: 'Hartwell Lake',
          placement: 1,
          total_weight: 8.2,
          event_date: '2025-09-21'
        },
        {
          tournament_name: 'Summer Showdown',
          lake: 'Lake Lanier',
          placement: 5,
          total_weight: 6.4,
          event_date: '2025-09-07'
        },
        {
          tournament_name: 'Labor Day Tournament',
          lake: 'Lake Sinclair',
          placement: 2,
          total_weight: 9.1,
          event_date: '2025-09-02'
        },
        {
          tournament_name: 'August Heat',
          lake: 'Wheeler Reservoir',
          placement: 4,
          total_weight: 7.0,
          event_date: '2025-08-17'
        }
      ];

      setMemberProfile(mockProfile);
      setCareerStats(mockCareerStats);
      setSeasonPerformance(mockSeasonPerformance);
      setRecentForm(mockRecentForm);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="person-circle-outline" size={64} color="#4CAF50" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!memberProfile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#E91E63" />
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#4CAF50']}
          tintColor="#4CAF50"
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
            <View key={index} style={styles.tournamentRow}>
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
            </View>
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
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
        </View>
        
        <View style={styles.upcomingEvent}>
          <Text style={styles.eventDetails}>
            Cedar Bluff Reservoir – Oct 20, 2025 • 7:00 AM
          </Text>
          
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Register Now →</Text>
          </TouchableOpacity>
        </View>
      </AnimatedCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#E91E63',
    fontWeight: '600',
  },
  heroCard: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  heroGradient: {
    backgroundColor: '#667eea', // Gradient will be implemented with separate library or native component
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
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
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
    color: '#2c3e50',
    fontWeight: '500',
    minWidth: 60,
  },
  aboutValue: {
    fontSize: 16,
    color: '#34495e',
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  fullWidthStat: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f0f8f0',
    borderRadius: 12,
  },
  winningsValue: {
    fontSize: 24,
    color: '#4CAF50',
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
    backgroundColor: '#fff9e6',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  seasonLabel: {
    fontSize: 12,
    color: '#f39c12',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  seasonValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
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
    color: '#2c3e50',
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
    color: '#34495e',
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  trendLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  trendValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  upcomingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  upcomingEvent: {
    gap: 16,
  },
  eventDetails: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
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