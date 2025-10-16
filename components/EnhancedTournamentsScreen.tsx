/* eslint-disable react-native/no-unused-styles, react-native/no-color-literals, react-native/sort-styles, @typescript-eslint/no-explicit-any */
/**
 * EnhancedTournamentsScreen - Tournament list with UX polish
 * ✓ Loading → shows skeletons (no layout shift flashes)
 * ✓ Empty → branded EmptyState with optional action
 * ✓ Cards/rows feel tactile on hover/press
 * ✓ No changes to data fetching logic or types
 */
import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TournamentStatus, { getTournamentStatusValue, getTournamentStatusText } from './TournamentStatus';
import { useNavigation } from '@react-navigation/native';
import { TournamentEvent } from '../lib/supabase';
import { useGroupedTournaments, useTournamentParticipants, useParticipantCounts } from '../lib/hooks/useQueries';
import { useTheme } from '../lib/ThemeContext';
import { ListSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import TournamentCard from './TournamentCard';
import TournamentSearch from './TournamentSearch';
// Removed unused imports

interface FilterOptions {
  search: string;
  year: string;
  status: 'all' | 'upcoming' | 'completed';
}

export default function EnhancedTournamentsScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
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
  const { data: participantCounts = {} } = useParticipantCounts(lookupsInitial as any);

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

  // Status helpers now provided by TournamentStatus component

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
        const { status } = getTournamentStatusValue(tournament.event_date);
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
    const { status, daysDiff } = getTournamentStatusValue(item.event_date);
    const isExpanded = selectedTournament === item.tournament_code;

    return (
      <View>
        <TouchableOpacity onPress={() => setSelectedTournament(isExpanded ? null : item.tournament_code || null)} activeOpacity={0.8}>
          <TournamentCard
            id={item.event_id}
            title={item.tournament_name || 'Unnamed Tournament'}
            lake={item.lake || undefined}
            date={formatDate(item.event_date || '')}
            attending={participantCounts[item.tournament_code || ''] ?? (isExpanded ? (selectedParticipants?.length ?? 0) : (item.participants || 0))}
            variant="teal"
            onPress={() => (navigation as any).navigate('TournamentDetail', { tournamentId: item.event_id })}
            testID={`tournament.card.${item.event_id || item.tournament_code}`}
          />
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
                  <Text style={styles.detailValue}>
                    {getTournamentStatusText(status, daysDiff)}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => (navigation as any).navigate('TournamentDetail', { tournamentId: item.event_id })}
            >
              <Ionicons name="information-circle-outline" size={18} color={theme.onPrimary} />
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
      <TournamentSearch
        value={filters.search}
        onChange={(text) => setFilters(prev => ({ ...prev, search: text }))}
      />

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

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    flex: 1,
  },
  filterContainer: {
    backgroundColor: theme.surface,
    borderBottomColor: theme.divider,
    borderBottomWidth: 1,
    paddingHorizontal: theme.layout.spacing.lg,
    paddingVertical: theme.layout.spacing.md,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: theme.mode === 'light' ? '#f8f8f8' : theme.surface,
    borderColor: theme.border,
    borderRadius: theme.layout.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
    marginBottom: theme.layout.spacing.md,
    paddingHorizontal: theme.layout.spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
    color: theme.text,
  },
  clearButton: {
    padding: 4,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: theme.components.chipPrimary.outline.backgroundColor,
    borderColor: theme.components.chipPrimary.outline.borderColor,
    borderRadius: theme.components.chipPrimary.outline.borderRadius,
    borderWidth: theme.components.chipPrimary.outline.borderWidth,
    marginRight: theme.layout.spacing.sm,
    paddingHorizontal: theme.components.chipPrimary.outline.paddingHorizontal,
    paddingVertical: theme.layout.spacing.sm,
  },
  activeChip: {
    borderColor: theme.components.chipPrimary.outline.borderColor,
    borderWidth: 2,
    elevation: theme.glow.subtle.elevation,
    // subtle glow when active
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
  },
  chipText: {
    color: theme.components.chipPrimary.outline.textColor,
    fontFamily: theme.typography.family.medium,
    fontSize: theme.typography.sizes.body,
  },
  activeChipText: {
    color: theme.components.chipPrimary.outline.textColor,
    fontFamily: theme.typography.family.bold,
  },
  listContainer: {
    padding: theme.layout.spacing.lg,
  },
  tournamentCard: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: theme.layout.radius.lg,
    borderWidth: 1,
    elevation: theme.glow.subtle.elevation,
    marginBottom: theme.layout.spacing.md,
    padding: theme.layout.spacing.lg,
    // subtle gold glow instead of heavy shadow
    shadowColor: theme.glow.subtle.shadowColor,
    shadowOffset: theme.glow.subtle.shadowOffset,
    shadowOpacity: theme.glow.subtle.shadowOpacity,
    shadowRadius: theme.glow.subtle.shadowRadius,
  },
  expandedCard: {
    borderColor: theme.primary,
    borderWidth: 2,
    elevation: theme.glow.focus.elevation,
    // focused glow on expand
    shadowColor: theme.glow.focus.shadowColor,
    shadowOffset: theme.glow.focus.shadowOffset,
    shadowOpacity: theme.glow.focus.shadowOpacity,
    shadowRadius: theme.glow.focus.shadowRadius,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  tournamentName: {
    color: theme.text,
    fontFamily: theme.typography.family.bold,
    fontSize: theme.typography.sizes.h2,
    marginBottom: theme.layout.spacing.sm,
  },
  statusBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.layout.radius.xl,
    flexDirection: 'row',
    paddingHorizontal: theme.layout.spacing.sm,
    paddingVertical: theme.layout.spacing.xs,
  },
  statusText: {
    color: theme.onPrimary,
    fontFamily: theme.typography.family.bold,
    fontSize: theme.typography.sizes.caption,
    marginLeft: theme.layout.spacing.xs,
  },
  participantBadge: {
    backgroundColor: theme.mode === 'light' ? 'rgba(46,139,87,0.1)' : 'rgba(101,193,140,0.15)',
    borderRadius: theme.layout.radius.md,
    paddingHorizontal: theme.layout.spacing.sm,
    paddingVertical: theme.layout.spacing.xs,
    alignItems: 'center',
    minWidth: 60,
  },
  participantCount: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.accent,
  },
  participantLabel: {
    fontSize: theme.typography.sizes.caption,
    fontFamily: theme.typography.family.bold,
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  infoContainer: {
    gap: theme.layout.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    marginLeft: theme.layout.spacing.sm,
    flex: 1,
  },
  codeText: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    color: theme.accent,
    marginLeft: theme.layout.spacing.sm,
  },
  expandedContent: {
    marginTop: theme.layout.spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: theme.divider,
    marginBottom: theme.layout.spacing.md,
  },
  detailSection: {
    marginBottom: theme.layout.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: theme.layout.spacing.sm,
  },
  sectionContent: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  detailGrid: {
    flexDirection: 'row',
    gap: theme.layout.spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.bold,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.layout.spacing.xs,
  },
  detailValue: {
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
    color: theme.text,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.components.buttonPrimary.outline.backgroundColor,
    paddingVertical: theme.layout.spacing.sm,
    paddingHorizontal: theme.layout.spacing.md,
    borderRadius: theme.layout.radius.md,
    alignSelf: 'flex-start',
    borderWidth: theme.components.buttonPrimary.outline.borderWidth,
    borderColor: theme.components.buttonPrimary.outline.borderColor,
  },
  actionButtonText: {
    color: theme.components.buttonPrimary.outline.textColor,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
    marginLeft: theme.layout.spacing.sm,
  },
  expandIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});