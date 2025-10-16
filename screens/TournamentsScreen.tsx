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
import TopBar from '../components/TopBar';
import { useTheme } from '../lib/ThemeContext';
import type { BrandTheme } from '../lib/ThemeContext';

// Helper to apply alpha to a token color
function withAlpha(hexOrRgb: string, alpha: number) {
  if (hexOrRgb.startsWith('#')) {
    const hex = hexOrRgb.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrRgb;
}

export default function TournamentsScreen() {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
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
        <TopBar title="Tournaments" subtitle="Upcoming & Recent Events" />
        <ScrollView>
          <ListSkeleton count={5} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Tournaments" subtitle="Upcoming & Recent Events" />

      <FlatList
        data={tournaments}
        renderItem={renderTournament}
        keyExtractor={(item) => item.event_id}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tournaments.length === 0 ? styles.emptyList : styles.list}
      />
    </View>
  );
}

function createStyles(theme: BrandTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    list: {
      padding: 16,
    },
    emptyList: {
      flex: 1,
      justifyContent: 'center',
    },
    // Tournament-specific styles
    tournamentCard: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    expandedCard: {
      borderColor: theme.gold,
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
      color: theme.text,
      flex: 1,
      marginRight: 12,
    },
    participantBadge: {
      backgroundColor: withAlpha(theme.gold, 0.12),
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 4,
      alignItems: 'center',
      minWidth: 60,
      borderWidth: 1,
      borderColor: theme.gold,
    },
    participantCount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.gold,
    },
    participantLabel: {
      fontSize: 10,
      color: theme.gold,
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
      color: theme.textSecondary,
      flex: 1,
    },
    codeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    codeLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginRight: 8,
    },
    codeValue: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '600',
    },
  });
}