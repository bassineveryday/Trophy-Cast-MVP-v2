import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import officersData from '../assets/imports/dbm-officers.json';
import localOfficers from '../assets/imports/dbm-officers.local';
import TopBar from '../components/TopBar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RulesDisplay from '../components/RulesDisplay';

// Prefer local bundled officers (with images) when available; fall back to scraped JSON
const officers = (localOfficers as any[])?.length ? (localOfficers as any[]) : (officersData as any[]) || [];

const ClubScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [showRules, setShowRules] = React.useState(false);

  if (showRules) {
    return (
      <View style={styles.container}>
        <TopBar showBack title="Tournament Rules" />
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
            <View style={styles.officerRow}>
              {officer.image ? (
                // local require() image
                <Image source={officer.image} style={styles.officerAvatar} />
              ) : officer.imageUrl ? (
                <Image source={{ uri: officer.imageUrl }} style={styles.officerAvatar} />
              ) : null}
              <View style={styles.officerMeta}>
                <Text style={styles.officerRole}>{officer.role}</Text>
                <Text style={styles.officerName}>{officer.name || 'TBA'}</Text>
                {officer.phone && <Text style={styles.officerContact}>{officer.phone}</Text>}
                {officer.email && (
                  <TouchableOpacity onPress={() => Linking.openURL(`mailto:${officer.email}`)} accessible accessibilityRole="button" accessibilityLabel={`Email ${officer.name}`}>
                    <Text style={styles.officerContact}>{officer.email}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Contact Section */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Contact Us</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:info@denverbassmasters.com')} accessible accessibilityRole="button" accessibilityLabel="Email the club">
                <Text style={styles.cardContent}>Email: info@denverbassmasters.com</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Linking.openURL('https://www.denverbassmasters.com')} accessible accessibilityRole="link" accessibilityLabel="Open club website">
                <Text style={[styles.cardContent, styles.websiteLink]}>Website: www.denverbassmasters.com</Text>
              </TouchableOpacity>

              <Text style={styles.cardContent}>Meeting: First Thursday of each month at 7:00 PM</Text>

              <TouchableOpacity onPress={() => {
                const url = Platform.OS === 'ios'
                  ? 'maps:0,0?q=Gander Mountain, 9923 Grant St, Thornton, CO'
                  : 'https://maps.google.com/?q=Gander Mountain, 9923 Grant St, Thornton, CO';
                Linking.openURL(url);
              }} accessible accessibilityRole="button" accessibilityLabel="Open club location in maps">
                <Text style={styles.cardContent}>Location: Gander Mountain, 9923 Grant St, Thornton, CO</Text>
              </TouchableOpacity>
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
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  officerMeta: {
    flex: 1,
  },
});

export default ClubScreen;