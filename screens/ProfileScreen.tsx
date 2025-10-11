import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TopBar from '../components/TopBar';
import { useAuth } from '../lib/AuthContext';
import DatabaseStatusScreen from '../components/DatabaseStatusScreen';
import ComprehensiveMemberProfile from './ComprehensiveMemberProfile';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [showDatabaseStatus, setShowDatabaseStatus] = useState(false);

  if (showDatabaseStatus) {
    return (
      <View style={styles.container}>
        <TopBar showBack title="Profile" />
        <DatabaseStatusScreen />
      </View>
    );
  }

  // Use the comprehensive member profile as the main profile experience
  return <ComprehensiveMemberProfile />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007bff',
  },
});