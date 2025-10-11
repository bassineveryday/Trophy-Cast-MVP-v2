import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RulesDisplay from '../components/RulesDisplay';

// Use a simple array of officers instead of fetching from database initially
const officers = [
  {
    name: 'Tai Hunt',
    position: 'Secretary',
    email: 'secretary@denverbassmasters.com',
  },
  {
    name: 'John Smith',
    position: 'President',
    email: 'president@denverbassmasters.com',
  },
  {
    name: 'Jane Doe',
    position: 'Vice President',
    email: 'vp@denverbassmasters.com',
  },
  {
    name: 'Bob Johnson',
    position: 'Treasurer',
    email: 'treasurer@denverbassmasters.com',
  }
];

const ClubScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [showRules, setShowRules] = React.useState(false);

  if (showRules) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setShowRules(false)}
        >
          <Ionicons name="arrow-back" size={24} color="#003366" />
          <Text style={styles.backButtonText}>Back to Club</Text>
        </TouchableOpacity>
        <RulesDisplay />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Club Header */}
      <View style={styles.header}>
        <Text style={styles.clubName}>Denver Bassmasters</Text>
        <Text style={styles.clubTagline}>Established 1975</Text>
      </View>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => setShowRules(true)}
        >
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={styles.linkText}>Tournament Rules</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('Tournaments')}
        >
          <Ionicons name="trophy" size={24} color="#fff" />
          <Text style={styles.linkText}>Tournaments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.navigate('AOY')}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
          <Text style={styles.linkText}>Standings</Text>
        </TouchableOpacity>
      </View>

      {/* Club Description */}
            <View style={styles.card}>
        <Text style={styles.cardTitle}>About Denver Bassmasters</Text>
        <Text style={styles.cardContent}>
          Founded in 1977, Denver Bassmasters is a premier fishing club in Colorado dedicated to promoting bass fishing, conservation, and sportsmanship.
        </Text>
      </View>

      {/* Officers Section */}
            <View style={styles.card}>
        <Text style={styles.cardTitle}>Club Officers</Text>
        {officers.map((officer, index) => (
          <View key={index} style={styles.officerCard}>
            <Text style={styles.officerRole}>{officer.position}</Text>
            <Text style={styles.officerName}>{officer.name || 'TBA'}</Text>
            {officer.email && (
              <Text style={styles.officerContact}>{officer.email}</Text>
            )}
          </View>
        ))}
      </View>

      {/* Contact Section */}
            <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Us</Text>
        <Text style={styles.cardContent}>Email: info@denverbassmasters.com</Text>
        <Text style={styles.cardContent}>Website: www.denverbassmasters.com</Text>
        <Text style={styles.cardContent}>Meeting: First Thursday of each month at 7:00 PM</Text>
        <Text style={styles.cardContent}>Location: Gander Mountain, 9923 Grant St, Thornton, CO</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#003366',
    alignItems: 'center',
  },
  clubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  clubTagline: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#004080',
  },
  linkButton: {
    alignItems: 'center',
    padding: 10,
  },
  linkText: {
    color: '#ffffff',
    marginTop: 5,
  },
  aboutText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  contactLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  websiteLink: {
    color: '#0066cc',
    marginLeft: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#003366',
  },
  officerCard: {
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  officerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  officerRole: {
    fontSize: 14,
    color: '#666',
  },
  officerEmail: {
    fontSize: 12,
    color: '#0066cc',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#003366',
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 5,
  },
  officerContact: {
    fontSize: 12,
    color: '#0066cc',
    marginTop: 4,
  },
});

export default ClubScreen;