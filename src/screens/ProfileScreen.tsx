import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../services/auth';
import { AnglerStats } from '../types';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState<AnglerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      // Fetch angler profile
      const { data: anglerData, error: anglerError } = await supabase
        .from('anglers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (anglerError) throw anglerError;

      // Fetch tournament results for this angler
      const { data: resultsData, error: resultsError } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('angler_id', anglerData.id);

      if (resultsError) throw resultsError;

      // Calculate stats
      const totalTournaments = resultsData?.length || 0;
      const totalPoints = resultsData?.reduce((sum, r) => sum + (r.points || 0), 0) || 0;
      const totalWeight = resultsData?.reduce((sum, r) => sum + (r.total_weight || 0), 0) || 0;
      const averageWeight = totalTournaments > 0 ? totalWeight / totalTournaments : 0;
      const bestFinish = resultsData?.reduce((best, r) => 
        Math.min(best, r.placement || 999), 999) || 0;
      const top5Finishes = resultsData?.filter(r => r.placement <= 5).length || 0;
      const bigFish = resultsData?.reduce((max, r) => 
        Math.max(max, r.big_fish_weight || 0), 0) || 0;

      setStats({
        angler: anglerData,
        total_tournaments: totalTournaments,
        total_points: totalPoints,
        total_weight: totalWeight,
        average_weight: averageWeight,
        best_finish: bestFinish,
        top_5_finishes: top5Finishes,
        big_fish_weight: bigFish > 0 ? bigFish : undefined,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Profile not found</Text>
          <Text style={styles.emptySubtext}>Please contact your club administrator</Text>
          <Button title="Sign Out" onPress={handleSignOut} style={styles.signOutButton} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.headerCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {stats.angler.first_name[0]}{stats.angler.last_name[0]}
            </Text>
          </View>
          <Text style={styles.name}>
            {stats.angler.first_name} {stats.angler.last_name}
          </Text>
          {stats.angler.club_member_id && (
            <Text style={styles.memberIdText}>
              Member ID: {stats.angler.club_member_id}
            </Text>
          )}
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Season Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_tournaments}</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_points}</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_weight.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Weight (lbs)</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.average_weight.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg Weight</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementRow}>
          <Text style={styles.achievementLabel}>Best Finish:</Text>
          <Text style={styles.achievementValue}>
            {stats.best_finish < 999 ? `#${stats.best_finish}` : 'N/A'}
          </Text>
        </View>
        <View style={styles.achievementRow}>
          <Text style={styles.achievementLabel}>Top 5 Finishes:</Text>
          <Text style={styles.achievementValue}>{stats.top_5_finishes}</Text>
        </View>
        {stats.big_fish_weight && (
          <View style={styles.achievementRow}>
            <Text style={styles.achievementLabel}>Biggest Fish:</Text>
            <Text style={styles.achievementValue}>{stats.big_fish_weight.toFixed(2)} lbs</Text>
          </View>
        )}
      </Card>

      <Button title="Sign Out" onPress={handleSignOut} variant="secondary" style={styles.signOutButton} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    paddingVertical: 8,
  },
  headerCard: {
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0066CC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  memberIdText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  achievementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  achievementLabel: {
    fontSize: 14,
    color: '#666',
  },
  achievementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  signOutButton: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
