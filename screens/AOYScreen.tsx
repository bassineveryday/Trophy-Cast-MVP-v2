import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { AOYStandingsRow } from '../lib/supabase';
import { useAOYStandings } from '../lib/hooks/useQueries';
import EmptyState from '../components/EmptyState';

export default function AOYScreen() {
  const { data: standings = [], isLoading, error, refetch, isRefetching } = useAOYStandings();

  const handleRefresh = () => {
    refetch();
  };

  const renderStandingItem = ({ item }: { item: AOYStandingsRow }) => (
    <View style={styles.standingItem}>
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>
          {item.aoy_rank ? `#${item.aoy_rank}` : 'N/A'}
        </Text>
      </View>
      
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {item.member_name || 'Unknown Member'}
        </Text>
        <Text style={styles.memberId}>ID: {item.member_id}</Text>
        {item.boater_status && (
          <Text style={styles.boaterStatus}>
            Status: {item.boater_status}
          </Text>
        )}
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>
          {item.total_aoy_points !== null ? `${item.total_aoy_points} pts` : '0 pts'}
        </Text>
        {item.season_year && (
          <Text style={styles.seasonText}>{item.season_year}</Text>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <EmptyState
      icon="trophy-outline"
      title="No AOY Standings Available"
      message="Angler of the Year standings will appear here once data is available. Pull to refresh to check for updates."
      actionLabel="Refresh"
      onAction={handleRefresh}
    />
  );

  if (isLoading && !standings.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading AOY Standings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Angler of the Year</Text>
        <Text style={styles.subtitle}>Current Season Standings</Text>
      </View>

      <FlatList
        data={standings}
        renderItem={renderStandingItem}
        keyExtractor={(item) => item.member_id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={standings.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2c3e50',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  standingItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 60,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memberId: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  boaterStatus: {
    fontSize: 12,
    color: '#34495e',
    fontStyle: 'italic',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  seasonText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
  },
});