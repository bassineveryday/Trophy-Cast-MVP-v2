import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import officersData from '../assets/imports/dbm-officers.json';
import localOfficers from '../assets/imports/dbm-officers.local';
import TopBar from '../components/TopBar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RulesDisplay from '../components/RulesDisplay';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, fontSize, fontWeight, shadows, opacity } from '../lib/designTokens';

// Prefer local bundled officers (with images) when available; fall back to scraped JSON
const officers = (localOfficers as any[])?.length ? (localOfficers as any[]) : (officersData as any[]) || [];

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: theme.primary,
    alignItems: 'center',
  },
  clubName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#ffffff',
  },
  clubTagline: {
    fontSize: fontSize.md,
    color: '#ffffff',
    opacity: opacity.strong,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.md + 3,
    backgroundColor: theme.primaryDark,
  },
  linkButton: {
    alignItems: 'center',
    padding: spacing.sm + 2,
  },
  linkText: {
    color: '#ffffff',
    marginTop: 5,
  },
  card: {
    backgroundColor: theme.surface,
    padding: spacing.md + 3,
    marginBottom: spacing.md + 3,
    borderRadius: borderRadius.md,
    ...shadows.lg,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm + 2,
    color: theme.primary,
  },
  cardContent: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: theme.text,
    marginBottom: 5,
  },
  officerCard: {
    marginBottom: spacing.sm + 2,
    padding: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officerAvatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.circle,
    marginRight: spacing.md,
    backgroundColor: theme.border,
  },
  officerMeta: {
    flex: 1,
  },
  officerRole: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
  },
  officerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: theme.text,
  },
  officerContact: {
    fontSize: fontSize.xs,
    color: theme.accent,
    marginTop: spacing.xs,
  },
  websiteLink: {
    color: theme.accent,
    marginLeft: spacing.sm + 2,
  },
}));

const ClubScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { theme } = useTheme();
  const themedStyles = styles(theme);
  const [showRules, setShowRules] = React.useState(false);

  if (showRules) {
    return (
      <View style={themedStyles.container}>
        <TopBar showBack title="Tournament Rules" />
        <RulesDisplay />
      </View>
    );
  }

  return (
    <ScrollView style={themedStyles.container}>
      {/* Club Header */}
      <View style={themedStyles.header}>
        <Text style={themedStyles.clubName}>Denver Bassmasters</Text>
        <Text style={themedStyles.clubTagline}>Established 1975</Text>
      </View>

      {/* Quick Links */}
      <View style={themedStyles.quickLinks}>
        <TouchableOpacity 
          style={themedStyles.linkButton}
          onPress={() => setShowRules(true)}
        >
          <Ionicons name="document-text" size={24} color="#fff" />
          <Text style={themedStyles.linkText}>Tournament Rules</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={themedStyles.linkButton}
          onPress={() => navigation.navigate('Tournaments')}
        >
          <Ionicons name="trophy" size={24} color="#fff" />
          <Text style={themedStyles.linkText}>Tournaments</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={themedStyles.linkButton}
          onPress={() => navigation.navigate('AOY')}
        >
          <Ionicons name="stats-chart" size={24} color="#fff" />
          <Text style={themedStyles.linkText}>Standings</Text>
        </TouchableOpacity>
      </View>

      {/* Club Description */}
            <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>About Denver Bassmasters</Text>
        <Text style={themedStyles.cardContent}>
          Founded in 1977, Denver Bassmasters is a premier fishing club in Colorado dedicated to promoting bass fishing, conservation, and sportsmanship.
        </Text>
      </View>

      {/* Officers Section */}
            <View style={themedStyles.card}>
        <Text style={themedStyles.cardTitle}>Club Officers</Text>
        {officers.map((officer, index) => (
          <View key={index} style={themedStyles.officerCard}>
            <View style={themedStyles.officerRow}>
              {officer.image ? (
                // local require() image
                <Image source={officer.image} style={themedStyles.officerAvatar} />
              ) : officer.imageUrl ? (
                <Image source={{ uri: officer.imageUrl }} style={themedStyles.officerAvatar} />
              ) : null}
              <View style={themedStyles.officerMeta}>
                <Text style={themedStyles.officerRole}>{officer.role}</Text>
                <Text style={themedStyles.officerName}>{officer.name || 'TBA'}</Text>
                {officer.phone && <Text style={themedStyles.officerContact}>{officer.phone}</Text>}
                {officer.email && (
                  <TouchableOpacity onPress={() => Linking.openURL(`mailto:${officer.email}`)} accessible accessibilityRole="button" accessibilityLabel={`Email ${officer.name}`}>
                    <Text style={themedStyles.officerContact}>{officer.email}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Contact Section */}
            <View style={themedStyles.card}>
              <Text style={themedStyles.cardTitle}>Contact Us</Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:info@denverbassmasters.com')} accessible accessibilityRole="button" accessibilityLabel="Email the club">
                <Text style={themedStyles.cardContent}>Email: info@denverbassmasters.com</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => Linking.openURL('https://www.denverbassmasters.com')} accessible accessibilityRole="link" accessibilityLabel="Open club website">
                <Text style={[themedStyles.cardContent, themedStyles.websiteLink]}>Website: www.denverbassmasters.com</Text>
              </TouchableOpacity>

              <Text style={themedStyles.cardContent}>Meeting: First Thursday of each month at 7:00 PM</Text>

              <TouchableOpacity onPress={() => {
                const url = Platform.OS === 'ios'
                  ? 'maps:0,0?q=Gander Mountain, 9923 Grant St, Thornton, CO'
                  : 'https://maps.google.com/?q=Gander Mountain, 9923 Grant St, Thornton, CO';
                Linking.openURL(url);
              }} accessible accessibilityRole="button" accessibilityLabel="Open club location in maps">
                <Text style={themedStyles.cardContent}>Location: Gander Mountain, 9923 Grant St, Thornton, CO</Text>
              </TouchableOpacity>
            </View>
    </ScrollView>
  );
};

export default ClubScreen;