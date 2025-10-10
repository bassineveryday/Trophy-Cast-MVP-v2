import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/AuthContext';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ionicons name="person-circle-outline" size={48} color="#2c3e50" />
        <Text style={styles.title}>Profile</Text>
      </View>
      
      <View style={styles.profileCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color="#2c3e50" />
          <Text style={styles.sectionTitle}>Account Information</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.label}>Member Code</Text>
            <Text style={styles.emailText}>{profile?.member_code}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.emailText}>{profile?.name}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.label}>Hometown</Text>
            <Text style={styles.emailText}>{profile?.hometown}</Text>
          </View>
        </View>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={24} color="#2c3e50" />
          <Text style={styles.sectionTitle}>Statistics</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="fish-outline" size={20} color="#3498db" />
          <Text style={styles.statLabel}>Tournaments Entered:</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="water-outline" size={20} color="#3498db" />
          <Text style={styles.statLabel}>Total Catches:</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
        <View style={styles.statRow}>
          <Ionicons name="trophy-outline" size={20} color="#3498db" />
          <Text style={styles.statLabel}>Best Ranking:</Text>
          <Text style={styles.statValue}>N/A</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Logout"
          onPress={signOut}
          color="#e74c3c"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#2c3e50',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    gap: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    color: '#34495e',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  buttonContainer: {
    marginTop: 30,
  },
});