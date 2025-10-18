/**
 * Club Info - Denver Bassmasters Information & Details
 * 
 * Features:
 * - Club overview and mission
 * - Founded year and achievements
 * - Membership benefits
 * - Meeting information
 * - Contact & social links
 * - Premium Navy + Gold branding
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Colors matching Trophy Cast theme
const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  green: '#4CAF50',
  border: 2,
  radius: 16,
};

// Board of Directors Data
const BOARD_MEMBERS = [
  {
    id: 1,
    name: 'Jeremiah Hofstetter',
    role: 'DBM President',
    imageUrl: '',
  },
  {
    id: 2,
    name: 'Bobby Martin',
    role: 'DBM Vice President',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdZ1qaSJrqW7AANY-G2HXt2ZDQgA1Ck3EZwVfEDp0myRAdD-XwWcfkx61mWHb5DmX_dxaci_8p5VBJ-BNbaGmocxXoDiWWTYyWg2kUpI5wfMFVXA3flVoTor5ydBwVq1XUbUq8Ddz7pSR50Lj5Ae2OxLL3XIW1gg5Jf6MXNzOeX3sLAcUSjiVmkdz90Sq9_9vF4BZvgEm3iYVav4pyfCqErUr1Ah2l2DLwq0SD8=w1280',
  },
  {
    id: 3,
    name: 'Tai Hunt',
    role: 'DBM Secretary',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdb-e6GkdcQJ7WIWJxtcb222okTNA4HBIT4s89h2WH7lusl2bCIKRCbZDPOM3AjAEzosEYun219J34S7i_D3kBIcjs4xY0oSXonC-lFJlrSOGy-aZ4CyNwQhfCCKAqq4hn3js-bZ9e97NE-dLZTxsriH3K8P6aH6y248xWbcXTfp45y8qVkALwvBCcuwXm8ANZAuQ5rsI80k9GvQpn-_LOnLi_iisLpOV9yX=w1280',
  },
  {
    id: 4,
    name: 'Gordon Phair',
    role: 'DBM Treasurer',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdawwcMINyb6v9yeNV9aXl_nf892bGGSb_wkggmNnWhSHKr7aMGw6lPvX9Opdhnu-KSnDWiw9yHSF6i8WanOYADavpmNIbf0_9cgJ-dGpeMNTEX9c42-CjQZn_dMIn4csW8iulK-iYtBatFKY1dup8T0YexTgNUgDqPn-79lcG8kTQHYUfwo1aJFmiTaJHR31V_PtU9NTC97A9Brx_umfnbggFLfjkFswKUoye4=w1280',
  },
  {
    id: 5,
    name: 'Howard Binkley',
    role: 'DBM Tournament Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdaYKtPuRS3MM1B8ZQcv6Yn6GBxMRpSdy9L2y90zZCdHu01sW2k5kUidqWR9JTXQ8r93rvBB5gztIKSxIN0dQ6PN28kBgK1H4Gr5B3IbR_SeXk3joFjqFF5BWYUgBS5XaIN78ZNuy5dvd8X6MWJ7IWaJkztdI0rzainVyXOETdO4NbPqbqjhUJIHzjc8YwlDk9JeiwxH-g2UpQv7rjDf6UoqBp3hSCSD-506=w1280',
  },
  {
    id: 6,
    name: 'Justin Apfel',
    role: 'DBM Conservation Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdZytGEAKYAn3LXKrdvxB23KJbwB2KOk2F5qswaDGclVNYTARlhewru4tSixNw095TkD7n4XZ5Rfzwl3zQOVXk2xBoWPvvhKksBPHxb1A8Q82qOTjG9jf-dL9k7zKZ7UdUSWUwtWBZn4FybTtSrU3ts2572UHm_DlXRxjt9ztaIfuTP_69LYeJqs8Acgx3V5RDaLsJSCEL51jZLwSInBe-c2YIC4fAAT3SIN=w1280',
  },
  {
    id: 7,
    name: 'Cliff Purslow',
    role: 'DBM Juniors Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdbBv2BDb9lJBpzizCfTltaYfFNLNk7je5bA2mP39BoAxThkgktOZEn_mXD7k5zIYGZTePaotLauw8C1E1Cggx_qRCjDlGxL_igqLQayR3hp-xMVc5PlCDv5AFLnCIKWDvFGkyG6jK_NNqDpwqzBvz_mT8ga6hnLUvySH99oNWJ-quAMAELA_zCC4Qj2ES-1gqRnfQZihucMtU9HpFB01Cb1s8Q5C8sx2czZIB4=w1280',
  },
  {
    id: 8,
    name: 'Bill Cancellieri',
    role: 'DBM High School Director',
    imageUrl: 'https://lh3.googleusercontent.com/sitesv/AICyYdZVvj3sbMr7JDvcCGM8kJpCJoMweIiP1yBQF5iBJ06srdS58JgHo9t8YC4JBtzlPLU8VZpsEguSIdAb0s5TxupHD_oPd8GsHY23Wogeq-sqJqrQBYy008SEEjDtYX5Uc_-MbOPNUgEo_df4EqVnQF2AtzNbBX9oAXz9UXor_XCKPMZQsWgNoZpM_LaVSPToSKiciVQvhpILIszOxcvsU8oBVqwuU5VzM1wC5I8=w1280',
  },
];

interface ClubInfoProps {
  clubName?: string;
}

export function ClubInfo({ clubName = 'Denver Bassmasters' }: ClubInfoProps) {
  const styles = useMemo(() => createStyles(), []);

  const handlePhonePress = () => {
    // Will be implemented with actual club contact
    console.log('Call club');
  };

  const handleEmailPress = () => {
    // Will be implemented with actual club email
    console.log('Email club');
  };

  const handleFacebookPress = () => {
    Linking.openURL('https://www.facebook.com/Denverbassmasters');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.denverbassmasters.com/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Denver Bassmasters</Text>
        <Text style={styles.headerSubtitle}>🎣 Club Information</Text>
      </View>

      {/* MISSION SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb" size={24} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Our Mission</Text>
        </View>
        <Text style={styles.sectionText}>
          Chartered in the early '70s, Denver Bassmasters aims to foster growth and conservation in the sport of bass fishing. We focus on education and knowledge sharing through club-sponsored tournaments where members can practice and learn new techniques in a friendly competitive environment.
        </Text>
      </View>

      {/* QUICK FACTS */}
      <View style={styles.factsContainer}>
        <View style={styles.factCard}>
          <Text style={styles.factIcon}>📅</Text>
          <Text style={styles.factLabel}>Founded</Text>
          <Text style={styles.factValue}>Early 1970s</Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factIcon}>🏆</Text>
          <Text style={styles.factLabel}>Achievement</Text>
          <Text style={styles.factValue}>CO Bass Club Trophy 2024-2025</Text>
        </View>

        <View style={styles.factCard}>
          <Text style={styles.factIcon}>👥</Text>
          <Text style={styles.factLabel}>Membership</Text>
          <Text style={styles.factValue}>Boaters & Non-Boaters</Text>
        </View>
      </View>

      {/* BENEFITS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={24} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Member Benefits</Text>
        </View>
        
        <View style={styles.benefitList}>
          <BenefitItem text="Exposure to tournament bass fishing" />
          <BenefitItem text="Growing next generation through Junior Youth Program" />
          <BenefitItem text="Habitat conservation opportunities" />
          <BenefitItem text="Education on techniques and fishing conditions" />
          <BenefitItem text="Local and regional club tournaments (boat not required)" />
          <BenefitItem text="Exchange of knowledge through network of members" />
          <BenefitItem text="Community service events and initiatives" />
          <BenefitItem text="Qualify for B.A.S.S Regional, National & Bassmasters Classic" />
        </View>
      </View>

      {/* MEETINGS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar" size={24} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Club Meetings</Text>
        </View>

        <View style={styles.meetingCard}>
          <View style={styles.meetingRow}>
            <Ionicons name="location" size={20} color={COLORS.gold} />
            <Text style={styles.meetingText}>Bass Pro Shops Denver, Frying Pan Lodge</Text>
          </View>
          <View style={styles.meetingRow}>
            <Ionicons name="time" size={20} color={COLORS.gold} />
            <Text style={styles.meetingText}>1st Wednesday of every month, 7:00 PM - 8:30 PM</Text>
          </View>
          <View style={styles.meetingRow}>
            <Ionicons name="information-circle" size={20} color={COLORS.gold} />
            <Text style={styles.meetingText}>Sign up for updates and announcements</Text>
          </View>
        </View>
      </View>

      {/* CONTACT SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="call" size={24} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Connect With Us</Text>
        </View>

        <View style={styles.contactGrid}>
          <Pressable
            style={styles.contactButton}
            onPress={handleWebsitePress}
          >
            <Text style={styles.contactIcon}>🌐</Text>
            <Text style={styles.contactButtonText}>Website</Text>
          </Pressable>

          <Pressable
            style={styles.contactButton}
            onPress={handleFacebookPress}
          >
            <Text style={styles.contactIcon}>👍</Text>
            <Text style={styles.contactButtonText}>Facebook</Text>
          </Pressable>

          <Pressable
            style={styles.contactButton}
            onPress={handleEmailPress}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactButtonText}>Email</Text>
          </Pressable>

          <Pressable
            style={styles.contactButton}
            onPress={handlePhonePress}
          >
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactButtonText}>Call</Text>
          </Pressable>
        </View>
      </View>

      {/* BOARD OF DIRECTORS SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={24} color={COLORS.gold} />
          <Text style={styles.sectionTitle}>Board of Directors</Text>
        </View>

        <View style={styles.boardGrid}>
          {BOARD_MEMBERS.map((member) => (
            <BoardMemberCard key={member.id} member={member} />
          ))}
        </View>
      </View>

      {/* SPACER */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function BenefitItem({ text }: { text: string }) {
  const styles = useMemo(() => createStyles(), []);
  
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitBullet}>•</Text>
      <Text style={styles.benefitText}>{text}</Text>
    </View>
  );
}

function BoardMemberCard({ member }: { member: typeof BOARD_MEMBERS[0] }) {
  const styles = useMemo(() => createStyles(), []);
  
  return (
    <View style={styles.boardMemberCard}>
      {/* Officer Photo */}
      {member.imageUrl ? (
        <Image
          source={{ uri: member.imageUrl }}
          style={styles.boardMemberPhoto}
        />
      ) : (
        <View style={[styles.boardMemberPhoto, styles.boardMemberPhotoPlaceholder]}>
          <Text style={styles.boardMemberInitials}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
      )}

      {/* Member Info */}
      <View style={styles.boardMemberInfo}>
        <Text style={styles.boardMemberName}>{member.name}</Text>
        <Text style={styles.boardMemberRole}>{member.role}</Text>
      </View>
    </View>
  );
}

function createStyles() {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.navy,
    },

    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
    },

    // HEADER
    header: {
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.navyBorder,
    },

    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.textLight,
      marginBottom: 4,
    },

    headerSubtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS.textGray,
    },

    // SECTIONS
    section: {
      marginBottom: 24,
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: COLORS.radius,
      padding: 16,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    sectionText: {
      fontSize: 14,
      lineHeight: 22,
      color: COLORS.textGray,
    },

    // QUICK FACTS
    factsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },

    factCard: {
      flex: 1,
      backgroundColor: COLORS.navyDark,
      borderWidth: COLORS.border,
      borderColor: COLORS.gold,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },

    factIcon: {
      fontSize: 28,
      marginBottom: 6,
    },

    factLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: COLORS.textGray,
      marginBottom: 4,
    },

    factValue: {
      fontSize: 12,
      fontWeight: '700',
      color: COLORS.gold,
      textAlign: 'center',
    },

    // BENEFITS
    benefitList: {
      gap: 10,
    },

    benefitItem: {
      flexDirection: 'row',
      gap: 10,
    },

    benefitBullet: {
      fontSize: 16,
      color: COLORS.gold,
      fontWeight: '700',
      marginTop: 2,
    },

    benefitText: {
      flex: 1,
      fontSize: 13,
      color: COLORS.textGray,
      lineHeight: 20,
    },

    // MEETINGS
    meetingCard: {
      gap: 12,
    },

    meetingRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },

    meetingText: {
      flex: 1,
      fontSize: 13,
      color: COLORS.textGray,
      lineHeight: 20,
    },

    // CONTACT
    contactGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },

    contactButton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: COLORS.navy,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: 'center',
      gap: 8,
    },

    contactIcon: {
      fontSize: 28,
    },

    contactButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: COLORS.gold,
      textAlign: 'center',
    },

    // BOARD MEMBERS
    boardGrid: {
      gap: 12,
    },

    boardMemberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.navy,
      borderWidth: 1,
      borderColor: COLORS.gold,
      borderRadius: 12,
      padding: 12,
      gap: 12,
    },

    boardMemberPhoto: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: COLORS.navyBorder,
      borderWidth: 2,
      borderColor: COLORS.gold,
    },

    boardMemberPhotoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.gold,
    },

    boardMemberInitials: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.navy,
    },

    boardMemberInfo: {
      flex: 1,
      gap: 2,
    },

    boardMemberName: {
      fontSize: 13,
      fontWeight: '700',
      color: COLORS.textLight,
    },

    boardMemberRole: {
      fontSize: 11,
      fontWeight: '600',
      color: COLORS.gold,
    },
  });
}
