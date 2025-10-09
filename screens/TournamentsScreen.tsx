import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList,
  RefreshControl, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { testConnection } from '../lib/testConnection';

interface AOYStanding {
  season_year: number;      // bigint in DB
  aoy_rank: number;         // bigint in DB
  total_aoy_points: number; // bigint in DB
  member_id: string;        // text in DB
  member_name: string;      // text in DB
  boater_status: 'B' | 'C'; // text in DB, constrained to B/C
}

export default function TournamentsScreen() {
  const [standings, setStandings] = useState<AOYStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = async () => {
    try {
      setError(null);
      console.log('🔵 [START] Fetching AOY standings...');
      console.log('🔵 [INIT] Supabase client:', supabase);
      console.log('🔵 [INIT] Client ready:', !!supabase);
      
      const startTime = Date.now();
      
      const { data, error, status, statusText } = await supabase
        .from('aoy_standings_rows')
        .select('*')
        .order('aoy_rank', { ascending: true });

      const duration = Date.now() - startTime;
      
      console.log(`� [DONE] Request completed in ${duration}ms`);
      console.log('📊 [STATUS]', status, statusText);
      console.log('📊 [DATA] Rows returned:', data?.length ?? 0);
      console.log('📊 [ERROR]', error ? JSON.stringify(error) : 'None');
      
      if (error) {
        console.error('❌ [ERROR DETAIL]', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ [SUCCESS] First 3 rows:', data.slice(0, 3));
        setStandings(data);
      } else {
        console.warn('⚠️ [EMPTY] No data returned');
      }

      console.log('✅ Setting standings:', data?.length);
      setStandings(data || []);
    } catch (err: any) {
      console.error('❌ Catch block error:', err);
      setError(err.message || 'Failed to load standings');
      Alert.alert('Error', 'Failed to load AOY standings');
    } finally {
      console.log('🏁 Finally block - setting loading to false');
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    async function init() {
      const isConnected = await testConnection();
      console.log('🔌 Supabase connection test:', isConnected ? '✅ Ready' : '❌ Failed');
      if (isConnected) {
        fetchStandings();
      }
    }
    init();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStandings();
  };

  const renderStandingItem = ({ item, index }: { item: AOYStanding; index: number }) => (
    <View style={[styles.standingRow, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
      <Text style={styles.rankText}>#{item.aoy_rank}</Text>
      <Text style={styles.nameText} numberOfLines={1}>{item.member_name}</Text>
      <View style={[styles.boaterBadge, item.boater_status === 'B' ? styles.boaterBadgeB : styles.boaterBadgeC]}>
        <Text style={styles.boaterText}>{item.boater_status}</Text>
      </View>
      <Text style={styles.pointsText}>{item.total_aoy_points}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading AOY Standings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🏆 2025 Angler of the Year</Text>
      
      <Text style={{ fontSize: 18, color: 'red', textAlign: 'center', marginBottom: 20 }}>
        DEBUG: Found {standings.length} standings
      </Text>

      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error loading standings</Text>
          <Text style={styles.errorSubText}>{error}</Text>
        </View>
      ) : standings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No standings available</Text>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <Text style={styles.headerCell}>Rank</Text>
            <Text style={styles.headerCellName}>Name</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Points</Text>
          </View>

          <FlatList
            data={standings}
            keyExtractor={(item) => item.member_id}
            renderItem={renderStandingItem}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 16 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50', paddingVertical: 10 },
  loadingText: { marginTop: 10, fontSize: 16, color: '#7f8c8d' },
  errorText: { fontSize: 18, color: '#e74c3c', fontWeight: '600', marginBottom: 5 },
  errorSubText: { fontSize: 14, color: '#7f8c8d', textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#7f8c8d', textAlign: 'center' },
  headerRow: { flexDirection: 'row', backgroundColor: '#2c3e50', paddingVertical: 12, paddingHorizontal: 8, marginBottom: 2, borderRadius: 8 },
  headerCell: { flex: 1, color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  headerCellName: { flex: 2, color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'left', paddingLeft: 8 },
  listContainer: { flex: 1 },
  standingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, marginBottom: 1 },
  evenRow: { backgroundColor: '#ffffff' },
  oddRow: { backgroundColor: '#f1f3f4' },
  rankText: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  nameText: { flex: 2, fontSize: 16, color: '#2c3e50', paddingLeft: 8, fontWeight: '500' },
  boaterBadge: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, marginHorizontal: 4 },
  boaterBadgeB: { backgroundColor: '#3498db' },
  boaterBadgeC: { backgroundColor: '#e67e22' },
  boaterText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  pointsText: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#27ae60', textAlign: 'center' },
});
