/**
 * BoardBackOfficeScreen.tsx
 * 
 * DBM Board Back Office Dashboard
 * 
 * Entry point for board-only administrative features:
 * - Board Notes & Minutes
 * - Member Management
 * - Tournament Admin
 * - Finance & Reports
 * - Conservation Projects
 * - Juniors Program
 * - High School Program
 * - Settings
 * 
 * Buttons are non-functional (placeholders) pending implementation
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BoardGuard } from '../components/BoardGuard';

const COLORS = {
  navy: '#0B1A2F',
  navyDark: '#0F2238',
  navyBorder: '#1A2A3F',
  gold: '#C9A646',
  textLight: '#E7ECF2',
  textGray: '#9AA4B2',
  error: '#FF6B6B',
  success: '#4CAF50',
};

interface BoardMenuCard {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
}

const BOARD_MENU_ITEMS: BoardMenuCard[] = [
  {
    id: 'board-notes',
    icon: 'document-text',
    title: 'Board Notes',
    subtitle: 'Agendas, minutes, tasks',
    color: '#E8944A',
  },
  {
    id: 'member-management',
    icon: 'people',
    title: 'Member Mgmt',
    subtitle: 'Manage roster & roles',
    color: '#4CAF50',
  },
  {
    id: 'tournament-admin',
    icon: 'trophy',
    title: 'Tournaments',
    subtitle: 'Schedule & manage events',
    color: '#FF9100',
  },
  {
    id: 'finance',
    icon: 'cash',
    title: 'Finance',
    subtitle: 'Budget & reports',
    color: '#2196F3',
  },
  {
    id: 'conservation',
    icon: 'leaf',
    title: 'Conservation',
    subtitle: 'Projects & initiatives',
    color: '#66BB6A',
  },
  {
    id: 'juniors',
    icon: 'school',
    title: 'Juniors Program',
    subtitle: 'Youth outreach',
    color: '#AB47BC',
  },
  {
    id: 'highschool',
    icon: 'school',
    title: 'High School',
    subtitle: 'HS program management',
    color: '#7E57C2',
  },
  {
    id: 'settings',
    icon: 'settings',
    title: 'Settings',
    subtitle: 'Board preferences',
    color: '#78909C',
  },
];

export function BoardBackOfficeScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = width > 600 ? (width - 48) / 2 - 6 : (width - 48) / 2;

  const handleCardPress = (id: string) => {
    // Placeholder: buttons don't navigate yet
    console.log(`Pressed: ${id}`);
  };

  return (
    <BoardGuard>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>DBM Board</Text>
            <Text style={styles.headerSubtitle}>Back Office</Text>
          </View>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: COLORS.gold,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name="shield-checkmark"
              size={28}
              color={COLORS.navy}
            />
          </View>
        </View>

        {/* Menu Grid */}
        <View style={styles.gridContainer}>
          {BOARD_MENU_ITEMS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleCardPress(item.id)}
              style={({ pressed }) => [
                styles.menuCard,
                {
                  width: cardWidth,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {/* Card Background Accent */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  backgroundColor: item.color,
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              />

              {/* Icon */}
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  backgroundColor: `${item.color}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>

              {/* Title */}
              <Text style={styles.cardTitle}>{item.title}</Text>

              {/* Subtitle */}
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

              {/* Arrow */}
              <View style={styles.cardArrow}>
                <Ionicons name="chevron-forward" size={18} color={COLORS.gold} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔐 Board-Only Area • All actions are logged
          </Text>
        </View>
      </ScrollView>
    </BoardGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navy,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  menuCard: {
    backgroundColor: COLORS.navyDark,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    padding: 16,
    paddingTop: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '400',
    lineHeight: 16,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  footer: {
    backgroundColor: `${COLORS.gold}10`,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
    textAlign: 'center',
  },
});
