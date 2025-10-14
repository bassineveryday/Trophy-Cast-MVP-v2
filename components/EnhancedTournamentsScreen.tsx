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
import { fishingTheme, spacing, borderRadius, shadows, fontSize, fontWeight } from '../lib/designTokens';
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

  // Participant counts lookup - call hook unconditionally to preserve hooks order
  const lookupsInitial = (tournaments || []).map(t => ({ code: t.tournament_code, eventId: t.event_id }));
  const { data: participantCounts = {}, isLoading: countsLoading } = useParticipantCounts(lookupsInitial as any);

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
    if (!tournament.event_date) return { status: 'pending', color: fishingTheme.colors.goldenOrange, icon: 'time-outline' };
    
    const eventDate = new Date(tournament.event_date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'completed', color: fishingTheme.colors.lightTeal, icon: 'checkmark-circle-outline' };
    } else if (diffDays <= 7) {
      return { status: 'upcoming', color: fishingTheme.colors.progressOrange, icon: 'warning-outline' };
    } else {
      return { status: 'scheduled', color: fishingTheme.colors.deepOcean, icon: 'calendar-outline' };
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
      <View>
        {/* Branded summary card */}
        <TouchableOpacity
          onPress={() => setSelectedTournament(isExpanded ? null : item.tournament_code || null)}
          activeOpacity={0.8}
        >
          {/* Use the themed card styles for a compact summary */}
          <View style={[styles.tournamentCard, isExpanded && styles.expandedCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.tournamentName} numberOfLines={isExpanded ? undefined : 1}>
                  {item.tournament_name || 'Unnamed Tournament'}
                </Text>

                <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                  <Ionicons name={statusInfo.icon as any} size={12} color="white" />
                  <Text style={styles.statusText}>{getStatusText(statusInfo.status)}</Text>
                </View>
              </View>

              <View style={styles.participantBadge}>
                <Text style={styles.participantCount}>{participantCounts[item.tournament_code || ''] ?? (isExpanded ? (selectedParticipants?.length ?? 0) : (item.participants || 0))}</Text>
                <Text style={styles.participantLabel}>anglers</Text>
              </View>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={fishingTheme.colors.mutedWhite} />
                <Text style={styles.infoText}>{formatDate(item.event_date || '')}</Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={fishingTheme.colors.mutedWhite} />
                <Text style={styles.infoText}>{item.lake || 'Lake TBD'}</Text>
              </View>

              {item.tournament_code && (
                <View style={styles.infoRow}>
                  <Ionicons name="barcode-outline" size={16} color={fishingTheme.colors.lightTeal} />
                  <Text style={styles.codeText}>{item.tournament_code}</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded details area (keeps previous layout but visually tied to card) */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.separator} />

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Tournament Details</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Participants</Text>
                  <Text style={styles.detailValue}>{participantsLoading ? 'Loading...' : `${selectedParticipants?.length ?? 0} anglers`}</Text>
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
              onPress={() => (navigation as any).navigate('TournamentDetail', { tournamentId: item.event_id })}
            >
              <Ionicons name="information-circle-outline" size={18} color={fishingTheme.colors.progressOrange} />
              <Text style={styles.actionButtonText}>View Full Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFilterBar = () => (
    <View style={styles.filterContainer}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
  <Ionicons name="search-outline" size={20} color={fishingTheme.colors.mutedWhite} style={styles.searchIcon} />
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
            <Ionicons name="close-circle" size={20} color={fishingTheme.colors.mutedWhite} />
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
  // We already call useParticipantCounts earlier with full list (participantCounts variable)

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
    backgroundColor: fishingTheme.colors.deepOcean,
  },
  filterContainer: {
    backgroundColor: fishingTheme.colors.navyTeal,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 3,
    borderBottomColor: fishingTheme.colors.gold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: fishingTheme.colors.cream,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
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
    backgroundColor: fishingTheme.colors.cream,
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: '#e6e1d6',
  },
  activeChip: {
    backgroundColor: fishingTheme.colors.lightTeal,
    borderColor: fishingTheme.colors.lightTeal,
  },
  chipText: {
    fontSize: fontSize.md,
    color: '#13323b',
    fontWeight: fontWeight.medium as any,
  },
  activeChipText: {
    color: fishingTheme.colors.white,
  },
  listContainer: {
    padding: spacing.lg,
  },
  tournamentCard: {
    backgroundColor: fishingTheme.colors.trophyNavy,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    // subtle shadow for depth
    ...shadows.md,
    borderWidth: 1,
    borderColor: fishingTheme.colors.darkTeal,
  },
  expandedCard: {
    borderColor: fishingTheme.colors.gold,
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
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    color: fishingTheme.colors.cream,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xxl,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: fishingTheme.colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold as any,
    marginLeft: spacing.xs,
  },
  participantBadge: {
    backgroundColor: 'rgba(245,200,66,0.12)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    minWidth: 60,
  },
  participantCount: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold as any,
    color: fishingTheme.colors.gold,
  },
  participantLabel: {
    fontSize: fontSize.xs,
    color: fishingTheme.colors.mutedWhite,
    textTransform: 'uppercase',
    fontWeight: fontWeight.semibold as any,
  },
  infoContainer: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: fontSize.md,
    color: fishingTheme.colors.mutedWhite,
    marginLeft: spacing.sm,
    flex: 1,
  },
  codeText: {
    fontSize: fontSize.md,
    color: fishingTheme.colors.lightTeal,
    fontWeight: fontWeight.semibold as any,
    marginLeft: spacing.sm,
  },
  expandedContent: {
    marginTop: spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: spacing.md,
  },
  detailSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold as any,
    color: fishingTheme.colors.cream,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    fontSize: fontSize.md,
    color: '#666',
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: fishingTheme.colors.mutedWhite,
    textTransform: 'uppercase',
    fontWeight: fontWeight.semibold as any,
    marginBottom: spacing.xs,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: fishingTheme.colors.cream,
    fontWeight: fontWeight.medium as any,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: fishingTheme.colors.progressOrange,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold as any,
    marginLeft: spacing.sm,
  },
  expandIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});