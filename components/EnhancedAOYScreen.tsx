import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AOYStandingsRow } from '../lib/supabase';
import { useAOYStandings } from '../lib/hooks/useQueries';
import { useTheme } from '../lib/ThemeContext';
import { ListSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { Chip } from '../components/BrandPrimitives';

interface FilterOptions {
  search: string;
  year: string;
  boaterStatus: 'all' | 'boater' | 'co-angler';
}

interface StandingWithTrend extends AOYStandingsRow {
  trend?: 'up' | 'down' | 'same' | null;
  percentileRank?: number;
}

export default function EnhancedAOYScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { data: standings = [], isLoading, error, refetch, isRefetching } = useAOYStandings();
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    year: new Date().getFullYear().toString(),
    boaterStatus: 'all'
  });
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Enhanced standings with calculated data
  const enhancedStandings = useMemo((): StandingWithTrend[] => {
    if (!standings.length) return [];

    // Sort by rank for proper display
    const sorted = [...standings].sort((a, b) => {
      const rankA = a.aoy_rank || 999;
      const rankB = b.aoy_rank || 999;
      return rankA - rankB;
    });

    // Calculate percentile ranks and add trends
    const totalMembers = sorted.length;
    return sorted.map((member, index) => {
      const percentileRank = Math.round(((totalMembers - index) / totalMembers) * 100);
      
      // Mock trend calculation (in real app, compare with previous period)
      let trend: 'up' | 'down' | 'same' | null = null;
      if (member.aoy_rank) {
        const mockPrevRank = member.aoy_rank + Math.floor(Math.random() * 6 - 3); // Simulate trend
        if (member.aoy_rank < mockPrevRank) trend = 'up';
        else if (member.aoy_rank > mockPrevRank) trend = 'down';
        else trend = 'same';
      }

      return {
        ...member,
        percentileRank,
        trend,
      };
    });
  }, [standings]);

  const getRankBadgeStyle = (rank: number | null) => {
    if (!rank) return { backgroundColor: '#6c757d' };
    if (rank === 1) return { backgroundColor: '#ffd700' }; // Gold
    if (rank === 2) return { backgroundColor: '#c0c0c0' }; // Silver
    if (rank === 3) return { backgroundColor: '#cd7f32' }; // Bronze
    if (rank <= 10) return { backgroundColor: '#28a745' }; // Top 10
    if (rank <= 25) return { backgroundColor: '#007bff' }; // Top 25
    return { backgroundColor: '#6c757d' }; // Others
  };

  const getRankIcon = (rank: number | null) => {
    if (!rank) return 'help-outline';
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal-outline';
    if (rank <= 10) return 'ribbon';
    return 'person';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'same' | null | undefined) => {
    switch (trend) {
      case 'up': return { name: 'trending-up', color: '#28a745' };
      case 'down': return { name: 'trending-down', color: '#dc3545' };
      case 'same': return { name: 'remove', color: '#6c757d' };
      default: return { name: 'remove', color: '#6c757d' };
    }
  };

  // Classify boater status with robust heuristics
  const classifyBoaterStatus = (raw?: string | null): 'boater' | 'co-angler' | 'unknown' => {
    if (!raw) return 'unknown';
    const s = String(raw).trim().toLowerCase();
    if (s === 'b' || s.includes('boater')) return 'boater';
    if (s === 'c' || s.includes('co') || s.includes('co-angler') || s.includes('co angler')) return 'co-angler';
    return 'unknown';
  };

  const filterStandings = (standings: StandingWithTrend[]): StandingWithTrend[] => {
    return standings.filter(member => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          member.member_name?.toLowerCase().includes(searchLower) ||
          member.member_id?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Year filter (if season_year data exists)
      if (member.season_year && filters.year !== 'all') {
        if (member.season_year.toString() !== filters.year) return false;
      }

      // Boater/Co-Angler filter
      if (filters.boaterStatus !== 'all') {
        const role = classifyBoaterStatus(member.boater_status);
        if (filters.boaterStatus === 'boater' && role !== 'boater') return false;
        if (filters.boaterStatus === 'co-angler' && role !== 'co-angler') return false;
      }

      return true;
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderMemberCard = ({ item, index }: { item: StandingWithTrend; index: number }) => {
    const rankBadgeStyle = getRankBadgeStyle(item.aoy_rank);
    const rankIcon = getRankIcon(item.aoy_rank);
    const trendInfo = getTrendIcon(item.trend);
    const isExpanded = selectedMember === item.member_id;

    return (
      <TouchableOpacity 
        style={[styles.memberCard, isExpanded && styles.expandedCard]}
        onPress={() => setSelectedMember(isExpanded ? null : item.member_id)}
        activeOpacity={0.7}
      >
        {/* Main Member Info */}
        <View style={styles.cardHeader}>
          {/* Rank Badge */}
          <View style={[styles.rankBadge, rankBadgeStyle]}>
            <Ionicons name={rankIcon as any} size={20} color="white" />
            <Text style={styles.rankNumber}>
              {item.aoy_rank || 'NR'}
            </Text>
          </View>

          {/* Member Details */}
          <View style={styles.memberDetails}>
            <Text style={styles.memberName} numberOfLines={isExpanded ? undefined : 1}>
              {item.member_name || 'Unknown Member'}
            </Text>
            <View style={styles.memberMeta}>
              <Text style={styles.memberId}>ID: {item.member_id}</Text>
              {item.boater_status && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {(() => {
                      const role = classifyBoaterStatus(item.boater_status);
                      return role === 'boater' ? 'Boater' : role === 'co-angler' ? 'Co-Angler' : (item.boater_status || '');
                    })()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Points and Trend */}
          <View style={styles.pointsSection}>
            <Text style={styles.pointsValue}>
              {item.total_aoy_points?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.pointsLabel}>points</Text>
            
            {item.trend && (
              <View style={styles.trendContainer}>
                <Ionicons 
                  name={trendInfo.name as any} 
                  size={16} 
                  color={trendInfo.color} 
                />
              </View>
            )}
          </View>
        </View>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.separator} />
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Ranking</Text>
                <Text style={styles.statValue}>
                  #{item.aoy_rank || 'Unranked'}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Percentile</Text>
                <Text style={styles.statValue}>
                  {item.percentileRank ? `${item.percentileRank}%` : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Season</Text>
                <Text style={styles.statValue}>
                  {item.season_year || 'Current'}
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>
                  {item.boater_status || 'N/A'}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={() => (navigation as any).navigate('MemberProfile', { memberId: item.member_id })}>
              <Ionicons name="person-outline" size={18} color="#007bff" />
              <Text style={styles.actionButtonText}>View Member Profile</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Expand Indicator */}
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
        <Ionicons name="search-outline" size={20} color="#F5C842" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor="rgba(245, 239, 230, 0.6)"
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
          style={[styles.filterChip, filters.boaterStatus === 'all' && styles.activeChip]}
          onPress={() => setFilters(prev => ({ ...prev, boaterStatus: 'all' }))}
        >
          <Text style={[styles.chipText, filters.boaterStatus === 'all' && styles.activeChipText]}>
            All Members
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filters.boaterStatus === 'boater' && styles.activeChip]}
          onPress={() => setFilters(prev => ({ ...prev, boaterStatus: 'boater' }))}
        >
          <Text style={[styles.chipText, filters.boaterStatus === 'boater' && styles.activeChipText]}>
            Boaters
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterChip, filters.boaterStatus === 'co-angler' && styles.activeChip]}
          onPress={() => setFilters(prev => ({ ...prev, boaterStatus: 'co-angler' }))}
        >
          <Text style={[styles.chipText, filters.boaterStatus === 'co-angler' && styles.activeChipText]}>
            Co-Anglers
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderHeader = () => {
    const filteredStandings = filterStandings(enhancedStandings);
    const totalPoints = filteredStandings.reduce((sum, member) => sum + (member.total_aoy_points || 0), 0);
    const averagePoints = filteredStandings.length > 0 ? Math.round(totalPoints / filteredStandings.length) : 0;

    return (
      <View style={styles.headerStats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredStandings.length}</Text>
          <Text style={styles.statTitle}>Total Members</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{averagePoints.toLocaleString()}</Text>
          <Text style={styles.statTitle}>Avg Points</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {filteredStandings.length > 0 ? filteredStandings[0].season_year || new Date().getFullYear() : new Date().getFullYear()}
          </Text>
          <Text style={styles.statTitle}>Season</Text>
        </View>
      </View>
    );
  };

  if (isLoading && !standings.length) {
    return (
      <View style={styles.container}>
        {renderFilterBar()}
        {renderHeader()}
        <ListSkeleton />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {renderFilterBar()}
        <EmptyState
          title="Unable to Load AOY Standings"
          message="Please check your connection and try again"
          actionLabel="Retry"
          onAction={handleRefresh}
        />
      </View>
    );
  }

  const filteredStandings = filterStandings(enhancedStandings);

  return (
    <View style={styles.container}>
      {renderFilterBar()}
      
      {filteredStandings.length === 0 ? (
        <EmptyState
          title={filters.search || filters.boaterStatus !== 'all' ? "No Matching Members" : "No AOY Data Yet"}
          message={filters.search || filters.boaterStatus !== 'all' 
            ? "Try adjusting your search or filters" 
            : "AOY standings will appear here when available"}
          actionLabel={filters.search || filters.boaterStatus !== 'all' ? "Clear Filters" : "Refresh"}
          onAction={() => {
            if (filters.search || filters.boaterStatus !== 'all') {
              setFilters({ search: '', year: new Date().getFullYear().toString(), boaterStatus: 'all' });
            } else {
              handleRefresh();
            }
          }}
        />
      ) : (
        <FlatList
          data={filteredStandings}
          renderItem={renderMemberCard}
          keyExtractor={(item) => item.member_id}
          ListHeaderComponent={renderHeader}
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
    flex: 1,
    backgroundColor: theme.background,
  },
  filterContainer: {
    backgroundColor: theme.surface,
    paddingHorizontal: theme.layout.spacing.md,
    paddingVertical: theme.layout.spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: theme.primary,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.layout.radius.md,
    paddingHorizontal: theme.layout.spacing.sm,
    marginBottom: theme.layout.spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    marginRight: theme.layout.spacing.xs,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 200, 66, 0.3)',
  },
  activeChip: {
    backgroundColor: '#F5C842', // fishingTheme.colors.gold
    borderColor: '#E8A735', // fishingTheme.colors.goldenOrange
  },
  chipText: {
    fontSize: 14,
    color: '#F5EFE6', // fishingTheme.colors.cream
    fontWeight: '500',
  },
  activeChipText: {
    color: '#0B1020', // Dark text on gold background
    fontWeight: '700',
  },
  headerStats: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.md,
    padding: theme.layout.spacing.md,
    alignItems: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: theme.layout.elevation.sm,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statNumber: {
    fontSize: theme.typography.sizes.h2,
    fontFamily: theme.typography.family.bold,
    color: theme.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: theme.typography.sizes.label,
    fontFamily: theme.typography.family.medium,
    color: theme.textSecondary,
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  memberCard: {
    backgroundColor: theme.surface,
    borderRadius: theme.layout.radius.lg,
    padding: theme.layout.spacing.md,
    marginBottom: theme.layout.spacing.sm,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: theme.layout.elevation.md,
    borderWidth: 1,
    borderColor: theme.border,
  },
  expandedCard: {
    borderColor: theme.primary,
    borderWidth: 2,
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  memberDetails: {
    flex: 1,
    marginRight: 12,
  },
  memberName: {
    fontSize: theme.typography.sizes.h3,
    fontFamily: theme.typography.family.bold,
    color: theme.text,
    marginBottom: 4,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberId: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)', // fishingTheme.colors.mutedWhite
    fontFamily: 'monospace',
  },
  statusBadge: {
    backgroundColor: 'rgba(245, 200, 66, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#F5C842', // fishingTheme.colors.gold
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pointsSection: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5C842', // fishingTheme.colors.gold
  },
  pointsLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)', // fishingTheme.colors.mutedWhite
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  trendContainer: {
    marginTop: 4,
  },
  expandedContent: {
    marginTop: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(245, 200, 66, 0.2)',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '40%',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)', // fishingTheme.colors.mutedWhite
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: '#F5EFE6', // fishingTheme.colors.cream
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 200, 66, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F5C842',
  },
  actionButtonText: {
    color: '#F5C842', // fishingTheme.colors.gold
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
