/**
 * EnhancedTournamentsScreen - Tournament list with UX polish
 * ✓ Loading → shows skeletons (no layout shift flashes)
 * ✓ Empty → branded EmptyState with optional action
 * ✓ Cards/rows feel tactile on hover/press
 * ✓ No changes to data fetching logic or types
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { TournamentEvent } from '../lib/supabase';
import { useGroupedTournaments, useTournamentParticipants, useParticipantCounts } from '../lib/hooks/useQueries';
import { ListSkeleton, TableRowSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { CardPressable } from '../components/Card';
import ListRow from '../components/ListRow';

interface FilterOptions {
  search: string;
  year: string;
  status: 'all' | 'upcoming' | 'completed';
}

export default function EnhancedTournamentsScreen() {
  const navigation = useNavigation();
  const { data: tournaments = [], isLoading, error, refetch, isRefetching } = useGroupedTournaments();
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    year: new Date().getFullYear().toString(),
    status: 'all'
  });
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  // Fetch participants for the currently selected (expanded) tournament code.
  // The hook is enabled only when a tournament code is selected, so it won't fire for every list item.
  const { data: selectedParticipants = [], isLoading: participantsLoading } = useTournamentParticipants(selectedTournament || undefined);

  // Compute visible tournament codes and fetch participant counts for them
  // (moved below where filteredTournaments is computed to avoid duplicate declarations)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getTournamentStatus = (tournament: TournamentEvent) => {
    if (!tournament.event_date) return { status: 'pending', color: '#ffc107', icon: 'time-outline' };
    
    const eventDate = new Date(tournament.event_date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'completed', color: '#28a745', icon: 'checkmark-circle-outline' };
    } else if (diffDays <= 7) {
      return { status: 'upcoming', color: '#dc3545', icon: 'warning-outline' };
    } else {
      return { status: 'scheduled', color: '#007bff', icon: 'calendar-outline' };
    }
  };

  const getStatusText = (status: string, diffDays?: number) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'upcoming': return diffDays === 0 ? 'Today' : `${Math.abs(diffDays!)} days ago`;
      case 'scheduled': return 'Scheduled';
      default: return 'Pending';
    }
  };

  const filterTournaments = (tournaments: TournamentEvent[]): TournamentEvent[] => {
    return tournaments.filter(tournament => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          tournament.tournament_name?.toLowerCase().includes(searchLower) ||
          tournament.lake?.toLowerCase().includes(searchLower) ||
          tournament.tournament_code?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Year filter
      if (tournament.event_date && filters.year !== 'all') {
        const tournamentYear = new Date(tournament.event_date).getFullYear().toString();
        if (tournamentYear !== filters.year) return false;
      }

      // Status filter
      if (filters.status !== 'all') {
        const { status } = getTournamentStatus(tournament);
        if (filters.status === 'upcoming' && status !== 'upcoming' && status !== 'scheduled') return false;
        if (filters.status === 'completed' && status !== 'completed') return false;
      }

      return true;
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderTournamentCard = ({ item }: { item: TournamentEvent }) => {
    const statusInfo = getTournamentStatus(item);
    const isExpanded = selectedTournament === item.tournament_code;

    return (
      <TouchableOpacity 
        style={[styles.tournamentCard, isExpanded && styles.expandedCard]}
        onPress={() => setSelectedTournament(isExpanded ? null : item.tournament_code || null)}
        activeOpacity={0.7}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.tournamentName} numberOfLines={isExpanded ? undefined : 1}>
              {item.tournament_name || 'Unnamed Tournament'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon as any} size={12} color="white" />
              <Text style={styles.statusText}>
                {getStatusText(statusInfo.status)}
              </Text>
            </View>
          </View>
          
          <View style={styles.participantBadge}>
              <Text style={styles.participantCount}>
                {participantCounts[item.tournament_code || ''] ?? (isExpanded ? (selectedParticipants?.length ?? 0) : (item.participants || 0))}
              </Text>
              <Text style={styles.participantLabel}>anglers</Text>
            </View>
        </View>
        
        {/* Basic Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {formatDate(item.event_date || '')}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText}>
              {item.lake || 'Lake TBD'}
            </Text>
          </View>
          
          {item.tournament_code && (
            <View style={styles.infoRow}>
              <Ionicons name="barcode-outline" size={16} color="#666" />
              <Text style={styles.codeText}>
                {item.tournament_code}
              </Text>
            </View>
          )}
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.separator} />
            
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Tournament Details</Text>
                <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Participants</Text>
                  <Text style={styles.detailValue}>{isExpanded && selectedTournament === item.tournament_code ? (participantsLoading ? 'Loading...' : `${selectedParticipants?.length ?? 0} anglers`) : `${item.participants || 0} anglers`}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <Text style={[styles.detailValue, { color: statusInfo.color }]}>
                    {getStatusText(statusInfo.status)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('TournamentDetail', { 
                tournamentId: item.event_id 
              })}
            >
              <Ionicons name="information-circle-outline" size={18} color="#007bff" />
              <Text style={styles.actionButtonText}>View Full Details</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Expand/Collapse Indicator */}
        <View style={styles.expandIndicator}>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#999" 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tournaments..."
          value={filters.search}
          onChangeText={(text) => setFilters(prev => ({ ...prev, search: text }))}
        />
        {filters.search.length > 0 && (
          <TouchableOpacity 
            onPress={() => setFilters(prev => ({ ...prev, search: '' }))}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
        <TouchableOpacity 
          style={[styles.filterChip, filters.status === 'all' && styles.activeChip]}
          onPress={() => setFilters(prev => ({ ...prev, status: 'all' }))}
        >
          <Text style={[styles.chipText, filters.status === 'all' && styles.activeChipText]}>
            All Tournaments
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filters.status === 'upcoming' && styles.activeChip]}
          onPress={() => setFilters(prev => ({ ...prev, status: 'upcoming' }))}
        >
          <Text style={[styles.chipText, filters.status === 'upcoming' && styles.activeChipText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filters.status === 'completed' && styles.activeChip]}
          onPress={() => setFilters(prev => ({ ...prev, status: 'completed' }))}
        >
          <Text style={[styles.chipText, filters.status === 'completed' && styles.activeChipText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  if (isLoading && !tournaments.length) {
    return (
      <View style={styles.container}>
        {renderFilterBar()}
        <ListSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderFilterBar()}
        <EmptyState
          title="Unable to Load Tournaments"
          message="Please check your connection and try again"
          actionLabel="Retry"
          onAction={handleRefresh}
          testID="empty.tournaments.error"
        />
      </View>
    );
  }

  const filteredTournaments = filterTournaments(tournaments);

  // Fetch participant counts for visible tournaments (support code or event_id)
  const lookups = filteredTournaments.map(t => ({ code: t.tournament_code, eventId: t.event_id }));
  const { data: participantCounts = {}, isLoading: countsLoading } = useParticipantCounts(lookups as any);

  return (
    <View style={styles.container}>
      {renderFilterBar()}
      
      {filteredTournaments.length === 0 ? (
        <EmptyState
          title={filters.search || filters.status !== 'all' ? "No Matching Tournaments" : "No Tournaments Yet"}
          message={filters.search || filters.status !== 'all' 
            ? "Try adjusting your search or filters" 
            : "Tournament data will appear here when available"}
          actionLabel={filters.search || filters.status !== 'all' ? "Clear Filters" : "Refresh"}
          onAction={() => {
            if (filters.search || filters.status !== 'all') {
              setFilters({ search: '', year: new Date().getFullYear().toString(), status: 'all' });
            } else {
              handleRefresh();
            }
          }}
          testID="empty.tournaments"
        />
      ) : (
        <FlatList
          data={filteredTournaments}
          renderItem={renderTournamentCard}
          keyExtractor={(item) => item.event_id || item.tournament_code || `tournament-${Math.random()}`}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  activeChip: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  chipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeChipText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  tournamentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
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
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  participantBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  participantCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  participantLabel: {
    fontSize: 10,
    color: '#1976d2',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  codeText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#e1e5e9',
    marginBottom: 16,
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  expandIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});