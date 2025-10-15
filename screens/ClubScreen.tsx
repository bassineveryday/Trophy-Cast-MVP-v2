import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import officersData from '../assets/imports/dbm-officers.json';
import localOfficers from '../assets/imports/dbm-officers.local';
// Local images (prefer these when available)
import jeremiahImg from '../assets/images/jeremiah_hofstetter.jpg';
import bobbyImg from '../assets/images/bobby_martin.jpg';
import taiImg from '../assets/images/tai_hunt.jpg';
import gordonImg from '../assets/images/gordon_phair.jpg';
import howardImg from '../assets/images/howard_binkley.jpg';
import justinImg from '../assets/images/justin_apfel.jpg';
import cliffImg from '../assets/images/cliff_purslow.jpg';
import TopBar from '../components/TopBar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import RulesDisplay from '../components/RulesDisplay';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, fontSize, fontWeight, shadows, opacity } from '../lib/designTokens';

// Prefer local bundled officers (with images) when available; fall back to scraped JSON
const officers = (localOfficers as any[])?.length ? (localOfficers as any[]) : (officersData as any[]) || [];

// Map of canonicalized name -> local image asset
// Intentionally shift images down one person per request. Jeremiah will use the placeholder.
const localImageMap: Record<string, any> = {
  'jeremiah hofstetter': null,
  'bobby martin': jeremiahImg,
  'tai hunt': bobbyImg,
  'gordon phair': taiImg,
  'howard binkley': gordonImg,
  'justin apfel': howardImg,
  'cliff purslow': justinImg,
  'bill cancellieri': cliffImg,
};

const canonicalize = (name?: string) => (name || '').trim().toLowerCase();

const getImageForOfficer = (officer: any) => {
  if (!officer) return null;
  const key = canonicalize(officer.name);
  // Jeremiah should always show the placeholder (no image)
  if (key === 'jeremiah hofstetter') return null;

  // Prefer local mapped images (shifted)
  if (Object.prototype.hasOwnProperty.call(localImageMap, key) && localImageMap[key]) return localImageMap[key];

  // Fallback to officer-provided image fields
  if (officer.image) return officer.image;
  if (officer.imageUrl) return { uri: officer.imageUrl };
  return null;
};

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  heroHeader: {
    backgroundColor: theme.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  clubName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: theme.text,
    marginRight: spacing.md,
  },
  statusBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: borderRadius.md,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  clubTagline: {
    fontSize: fontSize.md,
    color: theme.textSecondary,
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
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  officerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  officerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    marginBottom: 4,
    backgroundColor: theme.border,
  },
  officerMeta: {
    flex: 1,
  },
  officerRole: {
    fontSize: fontSize.xs,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  officerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: theme.text,
  },
  actionChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: theme.border,
  },
  actionChipIcon: {
    marginRight: spacing.xs,
  },
  actionChipText: {
    fontSize: fontSize.xs,
    color: theme.accent,
    fontWeight: fontWeight.medium,
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
      {/* Club Hero Header */}
      <View style={themedStyles.heroHeader}>
        <View style={themedStyles.headerTitleRow}>
          <Text style={themedStyles.clubName}>Denver Bassmasters</Text>
          <View style={themedStyles.statusBadge}>
            <Text style={themedStyles.statusBadgeText}>ACTIVE</Text>
          </View>
        </View>
        <Text style={themedStyles.clubTagline}>Established 1975 • Colorado's Premier Bass Fishing Club</Text>
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
              {(() => {
                const img = getImageForOfficer(officer);
                if (img) return <Image source={img} style={themedStyles.officerAvatar} />;
                // Render a simple initials placeholder when no image is available
                return (
                  <View style={[themedStyles.officerAvatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryLight }] as any}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{(officer.name || 'TBA').split(' ').map((p: string) => p[0]).slice(0,2).join('')}</Text>
                  </View>
                );
              })()}
              <View style={themedStyles.officerMeta}>
                <Text style={themedStyles.officerRole}>{officer.role}</Text>
                <Text style={themedStyles.officerName}>{officer.name || 'TBA'}</Text>
              </View>
            </View>
            
            {/* Action Chips for Contact */}
            {(officer.email || officer.phone) && (
              <View style={themedStyles.actionChipsContainer}>
                {officer.email && (
                  <TouchableOpacity
                    style={themedStyles.actionChip}
                    onPress={() => Linking.openURL(`mailto:${officer.email}`)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Email ${officer.name}`}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="mail" size={14} color={theme.accent} style={themedStyles.actionChipIcon} />
                    <Text style={themedStyles.actionChipText}>{officer.email}</Text>
                  </TouchableOpacity>
                )}
                {officer.phone && (
                  <TouchableOpacity
                    style={themedStyles.actionChip}
                    onPress={() => Linking.openURL(`tel:${officer.phone}`)}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`Call ${officer.name}`}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={14} color={theme.accent} style={themedStyles.actionChipIcon} />
                    <Text style={themedStyles.actionChipText}>{officer.phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
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