import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TournamentEvent } from '../lib/supabase';
import { useGroupedTournaments, useTournamentParticipants } from '../lib/hooks/useQueries';
import { ListSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function TournamentsScreen() {
  const { data: tournaments = [], isLoading, error, refetch, isRefetching } = useGroupedTournaments();

  const handleRefresh = () => {
    refetch();
  };

  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  // fetch participants for the selected (expanded) tournament code
  const { data: selectedParticipants = [], isLoading: selectedParticipantsLoading } = useTournamentParticipants(selectedTournament || undefined);

  const renderTournament = ({ item }: { item: TournamentEvent }) => {
    const isExpanded = selectedTournament === item.tournament_code;
    return (
    <TouchableOpacity style={[styles.tournamentCard, isExpanded && styles.expandedCard]} onPress={() => setSelectedTournament(isExpanded ? null : item.tournament_code || null)} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.tournamentName}>
          {item.tournament_name || 'Unnamed Tournament'}
        </Text>
        <View style={styles.participantBadge}>
          <Text style={styles.participantCount}>
            {isExpanded ? (selectedParticipantsLoading ? '...' : (selectedParticipants?.length ?? 0)) : (item.participants || 0)}
          </Text>
          <Text style={styles.participantLabel}>anglers</Text>
        </View>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailIcon}>📅</Text>
        <Text style={styles.detailText}>
          {item.event_date || 'Date TBD'}
        </Text>
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.detailIcon}>🎣</Text>
        <Text style={styles.detailText}>
          {item.lake || 'Lake TBD'}
        </Text>
      </View>
      
      {item.tournament_code && (
        <View style={styles.codeRow}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.codeValue}>{item.tournament_code}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  };

  const renderEmptyState = () => (
    <EmptyState
      icon="trophy-outline"
      title="No Tournaments Available"
      message="Tournament events will appear here once data is available. Pull to refresh to check for new events."
      actionLabel="Refresh"
      onAction={handleRefresh}
    />
  );

  if (isLoading && !tournaments.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Tournaments</Text>
          <Text style={styles.subtitle}>Upcoming & Recent Events</Text>
        </View>
        <ScrollView>
          <ListSkeleton count={5} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Tournaments</Text>
        <Text style={styles.subtitle}>Upcoming & Recent Events</Text>
      </View>

      <FlatList
        data={tournaments}
        renderItem={renderTournament}
        keyExtractor={(item) => item.event_id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tournaments.length === 0 ? styles.emptyList : styles.list}
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
  // Tournament-specific styles
  tournamentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expandedCard: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  participantBadge: {
    backgroundColor: '#27ae60',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 60,
  },
  participantCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  participantLabel: {
    fontSize: 10,
    color: '#fff',
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  codeLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginRight: 8,
  },
  codeValue: {
    fontSize: 12,
    color: '#2c3e50',
    fontWeight: '600',
  },
});