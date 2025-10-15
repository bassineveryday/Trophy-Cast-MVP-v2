import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import ListRow from '../components/ListRow';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles } from '../lib/designTokens';

interface Tournament {
  tournament_id: string;
  name: string;
  lake: string;
  event_date: string;
  entry_fee: number;
  club_id: string;
}

type FilterType = 'upcoming' | 'past';

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  stickyHeader: {
    backgroundColor: theme.background,
    paddingHorizontal: theme.layout.spacing.lg,
    paddingVertical: theme.layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: theme.layout.spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.layout.spacing.md,
    paddingHorizontal: theme.layout.spacing.lg,
    borderRadius: theme.layout.radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: theme.border,
  },
  filterButtonTextActive: {
    color: '#ffffff',
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.bold,
  },
  filterButtonTextInactive: {
    color: theme.textSecondary,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.medium,
  },
  listContent: {
    padding: theme.layout.spacing.lg,
  },
  cardContainer: {
    marginBottom: theme.layout.spacing.md,
  },
  cardWrapper: {
    borderRadius: theme.layout.radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  empty: {
    textAlign: 'center',
    color: theme.textSecondary,
    marginTop: theme.layout.spacing.xxl,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
  },
}));

export default function TournamentsListScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const themedStyles = styles(theme);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('upcoming');

  useEffect(() => {
    fetchTournaments();
  }, [filter]);

  const fetchTournaments = async () => {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    let query = supabase
      .from('tournaments')
      .select('*')
      .order('event_date', { ascending: filter === 'upcoming' });
    if (filter === 'upcoming') {
      query = query.gte('event_date', today);
    } else {
      query = query.lt('event_date', today);
    }
    const { data, error } = await query;
    if (!error) setTournaments(data || []);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
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

  const isUpcoming = (dateString: string) => {
    const tournamentDate = new Date(dateString);
    const today = new Date();
    return tournamentDate >= today;
  };

  const renderTournament = ({ item }: { item: Tournament }) => {
    const upcoming = isUpcoming(item.event_date);
    const formattedDate = formatDate(item.event_date);
    
    return (
      <View style={themedStyles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => (navigation as any).navigate('TournamentDetail', { tournamentId: item.tournament_id })}
          style={themedStyles.cardWrapper}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} at ${item.lake}, ${formattedDate}, entry fee $${item.entry_fee}`}
          accessibilityHint="Tap to view tournament details"
        >
          <Card padding="xs" elevation="sm">
            <ListRow
              icon="trophy"
              iconColor={upcoming ? theme.warning : theme.textMuted}
              title={item.name}
              subtitle={`📍 ${item.lake}`}
              metadata={`📅 ${formattedDate}`}
              rightValue={`$${item.entry_fee}`}
              rightLabel="entry fee"
              rightColor={theme.accent}
              showChevron
            />
          </Card>
        </TouchableOpacity>
      </View>
    );
  };

  const renderStickyHeader = () => (
    <View style={themedStyles.stickyHeader}>
      <View style={themedStyles.filterRow}>
        <TouchableOpacity
          style={[
            themedStyles.filterButton,
            filter === 'upcoming' ? themedStyles.filterButtonActive : themedStyles.filterButtonInactive
          ]}
          onPress={() => setFilter('upcoming')}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Show upcoming tournaments"
          accessibilityState={{ selected: filter === 'upcoming' }}
        >
          <Text style={filter === 'upcoming' ? themedStyles.filterButtonTextActive : themedStyles.filterButtonTextInactive}>
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            themedStyles.filterButton,
            filter === 'past' ? themedStyles.filterButtonActive : themedStyles.filterButtonInactive
          ]}
          onPress={() => setFilter('past')}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Show past tournaments"
          accessibilityState={{ selected: filter === 'past' }}
        >
          <Text style={filter === 'past' ? themedStyles.filterButtonTextActive : themedStyles.filterButtonTextInactive}>
            Past
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={themedStyles.container}>
      <TopBar title="Tournaments" subtitle="Browse and register" />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={item => item.tournament_id}
          renderItem={renderTournament}
          ListHeaderComponent={renderStickyHeader}
          stickyHeaderIndices={[0]}
          contentContainerStyle={themedStyles.listContent}
          ListEmptyComponent={<Text style={themedStyles.empty}>No tournaments found.</Text>}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}