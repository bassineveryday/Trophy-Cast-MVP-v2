import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

interface ProfileScreenProps {
  userEmail: string | null;
  onLogout: () => void;
}

export default function ProfileScreen({ userEmail, onLogout }: ProfileScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>👤 Profile</Text>
      
      <View style={styles.profileCard}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.emailText}>{userEmail}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Tournaments Entered:</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Catches:</Text>
          <Text style={styles.statValue}>0</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Best Ranking:</Text>
          <Text style={styles.statValue}>N/A</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Logout"
          onPress={onLogout}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#2c3e50',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  statLabel: {
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