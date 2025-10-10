import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { supabase } from '../lib/supabase';

interface Tournament {
  tournament_id: string;
  name: string;
  lake: string;
  event_date: string;
  entry_fee: number;
  club_id: string;
}

type FilterType = 'upcoming' | 'past';

export default function TournamentsListScreen() {
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

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.lake}>Lake: {item.lake}</Text>
      <Text style={styles.date}>Date: {item.event_date}</Text>
      <Text style={styles.fee}>Entry Fee: ${item.entry_fee}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <Button
          title="Upcoming"
          onPress={() => setFilter('upcoming')}
          color={filter === 'upcoming' ? '#0066CC' : '#bbb'}
        />
        <Button
          title="Past"
          onPress={() => setFilter('past')}
          color={filter === 'past' ? '#0066CC' : '#bbb'}
        />
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={item => item.tournament_id}
          renderItem={renderTournament}
          ListEmptyComponent={<Text style={styles.empty}>No tournaments found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  lake: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 2,
  },
  date: {
    fontSize: 15,
    color: '#34495e',
    marginBottom: 2,
  },
  fee: {
    fontSize: 15,
    color: '#0066CC',
    marginBottom: 2,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
});
