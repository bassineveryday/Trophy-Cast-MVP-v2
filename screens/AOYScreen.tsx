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
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import ListRow from '../components/ListRow';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/designTokens';

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  list: {
    padding: spacing.lg,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    color: theme.textMuted,
  },
}));

export default function AOYScreen() {
  const { theme } = useTheme();
  const themedStyles = styles(theme);
  const { data: standings = [], isLoading, error, refetch, isRefetching } = useAOYStandings();

  const handleRefresh = () => {
    refetch();
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRankBadge = (rank: number | null): string | undefined => {
    if (!rank) return undefined;
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return undefined;
  };

  const getRankBadgeColor = (rank: number | null): string | undefined => {
    if (!rank) return undefined;
    if (rank === 1) return theme.gold;
    if (rank === 2) return theme.silver;
    if (rank === 3) return theme.bronze;
    return undefined;
  };

  const renderStandingItem = ({ item }: { item: AOYStandingsRow }) => {
    const initials = getInitials(item.member_name);
    const rankBadge = getRankBadge(item.aoy_rank);
    const points = item.total_aoy_points !== null ? item.total_aoy_points : 0;
    const rankText = item.aoy_rank ? `#${item.aoy_rank}` : 'N/A';
    
    return (
      <View style={themedStyles.cardContainer}>
        <Card padding="xs" elevation="md">
          <ListRow
            avatarText={initials}
            title={item.member_name || 'Unknown Member'}
            subtitle={`Member ID: ${item.member_id}`}
            metadata={item.boater_status ? `Status: ${item.boater_status}` : undefined}
            badge={rankBadge}
            badgeColor={getRankBadgeColor(item.aoy_rank)}
            rightValue={`${points}`}
            rightLabel="points"
            rightColor={theme.success}
            accessibilityLabel={`${rankText}, ${item.member_name || 'Unknown Member'}, ${points} points`}
            accessibilityHint={`AOY standing for ${item.season_year || 'current season'}`}
          />
        </Card>
      </View>
    );
  };

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
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={themedStyles.loadingText}>Loading AOY Standings...</Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <TopBar title="Angler of the Year" subtitle="Current Season Standings" />

      <FlatList
        data={standings}
        renderItem={renderStandingItem}
        keyExtractor={(item) => item.member_id}
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
        contentContainerStyle={standings.length === 0 ? themedStyles.emptyList : themedStyles.list}
      />
    </View>
  );
}