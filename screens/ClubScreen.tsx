import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { Card } from 'react-native-elements';
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
      <Card>
        <Card.Title>About Denver Bassmasters</Card.Title>
        <Text style={styles.aboutText}>
          Denver Bassmasters is one of Colorado's premier bass fishing clubs, established in 1975. 
          We promote the sport of bass fishing through education, conservation, and friendly competition. 
          Our club hosts regular tournaments and social events throughout the year.
        </Text>
      </Card>

      {/* Officers Section */}
      <Card>
        <Card.Title>Club Officers</Card.Title>
        {officers.map((officer, index) => (
          <View key={index} style={styles.officerCard}>
            <View style={styles.officerInfo}>
              <View>
                <Text style={styles.officerName}>{officer.name}</Text>
                <Text style={styles.officerRole}>{officer.position}</Text>
                {officer.email && <Text style={styles.officerEmail}>{officer.email}</Text>}
              </View>
            </View>
          </View>
        ))}
      </Card>

      {/* Contact Section */}
      <Card>
        <Card.Title>Contact Us</Card.Title>
        <TouchableOpacity 
          onPress={() => Linking.openURL('https://www.denverbassmasters.com')}
          style={styles.contactLink}
        >
          <Ionicons name="globe" size={20} color="#0066cc" />
          <Text style={[styles.linkText, styles.websiteLink]}>www.denverbassmasters.com</Text>
        </TouchableOpacity>
      </Card>
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
});

export default ClubScreen;