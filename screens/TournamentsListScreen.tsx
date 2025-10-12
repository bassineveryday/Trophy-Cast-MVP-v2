import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import Card from '../components/Card';
import ListRow from '../components/ListRow';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, fontSize, fontWeight, shadows } from '../lib/designTokens';

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
    padding: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  empty: {
    textAlign: 'center',
    color: theme.textMuted,
    marginTop: spacing.huge,
    fontSize: fontSize.md,
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
        <Card padding="xs" elevation="md">
          <ListRow
            icon="trophy"
            iconColor={upcoming ? theme.warning : theme.textMuted}
            title={item.name}
            subtitle={`📍 ${item.lake}`}
            metadata={`📅 ${formattedDate}`}
            rightValue={`$${item.entry_fee}`}
            rightLabel="entry fee"
            rightColor={theme.accent}
            onPress={() => (navigation as any).navigate('TournamentDetail', { tournamentId: item.tournament_id })}
            showChevron
            accessibilityLabel={`${item.name} at ${item.lake}, ${formattedDate}, entry fee $${item.entry_fee}`}
            accessibilityHint="Tap to view tournament details"
          />
        </Card>
      </View>
    );
  };

  return (
    <View style={themedStyles.container}>
      <TopBar title="Tournaments" subtitle="Browse and register" />
      <View style={themedStyles.filterRow}>
        <Button
          title="Upcoming"
          onPress={() => setFilter('upcoming')}
          color={filter === 'upcoming' ? theme.accent : theme.textMuted}
        />
        <Button
          title="Past"
          onPress={() => setFilter('past')}
          color={filter === 'past' ? theme.accent : theme.textMuted}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: spacing.huge }} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={item => item.tournament_id}
          renderItem={renderTournament}
          ListEmptyComponent={<Text style={themedStyles.empty}>No tournaments found.</Text>}
        />
      )}
    </View>
  );
}