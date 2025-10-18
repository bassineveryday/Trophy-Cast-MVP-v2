/**
 * FishingThemedHomeScreen - Trophy Cast Dashboard
 * Now using EnhancedDashboard with premium gold-bordered layout
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { EnhancedDashboard } from '../features/home/EnhancedDashboard';

export default function FishingThemedHomeScreen({ navigation }: any) {
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <EnhancedDashboard 
        userName={profile?.name || 'Angler'} 
        title="Trophy Cast"
        subtitle="Where Every Cast Counts"
        clubRole="Denver Bassmaster Secretary"
        loading={false}
        navigation={navigation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2F',
  },
});
