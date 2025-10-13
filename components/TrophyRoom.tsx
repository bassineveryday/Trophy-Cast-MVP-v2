/**
 * TrophyRoom - Personal Trophy & Catch Display
 * 
 * Features:
 * - Display user's big catches with placeholder images
 * - Show trophies and accolades
 * - Personal achievement showcase
 */
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { fishingTheme, spacing } from '../lib/designTokens';

interface CatchPhoto {
  id: string;
  title: string;
  weight?: number;
  date?: string;
  imageUrl?: string;
}

interface TrophyRoomProps {
  catches?: CatchPhoto[];
  onAddCatch?: () => void;
  onViewCatch?: (catchId: string) => void;
}

/**
 * Individual Catch Card with Photo Placeholder
 */
function CatchCard({ 
  title, 
  weight, 
  date, 
  imageUrl,
  onPress 
}: CatchPhoto & { onPress?: () => void }) {
  return (
    <TouchableOpacity 
      style={styles.catchCard} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Photo Placeholder */}
      <View style={styles.photoPlaceholder}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderContent}>
            <Ionicons name="fish" size={40} color={fishingTheme.colors.gold} />
            <Text style={styles.placeholderText}>Photo</Text>
          </View>
        )}
        
        {/* Weight Badge */}
        {weight && (
          <View style={styles.weightBadge}>
            <Text style={styles.weightText}>{weight} lbs</Text>
          </View>
        )}
      </View>

      {/* Catch Info */}
      <View style={styles.catchInfo}>
        <Text style={styles.catchTitle} numberOfLines={1}>{title}</Text>
        {date && <Text style={styles.catchDate}>{date}</Text>}
      </View>
    </TouchableOpacity>
  );
}

/**
 * Trophy Room Component
 */
export default function TrophyRoom({ 
  catches = [], 
  onAddCatch,
  onViewCatch 
}: TrophyRoomProps) {
  // Mock catches for display (will be replaced with real data)
  const mockCatches: CatchPhoto[] = catches.length > 0 ? catches : [
    { id: '1', title: 'Tournament Winner', weight: 8.5, date: 'Sept 15, 2024' },
    { id: '2', title: 'Big Bass', weight: 6.2, date: 'Aug 22, 2024' },
    { id: '3', title: 'Personal Best', weight: 9.1, date: 'July 8, 2024' },
    { id: '4', title: 'Lake Guntersville', weight: 7.3, date: 'June 12, 2024' },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Title */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="trophy" size={24} color={fishingTheme.colors.gold} />
          <Text style={styles.title}>MY TROPHY ROOM</Text>
        </View>
        <Text style={styles.subtitle}>Your biggest catches & achievements</Text>
      </View>

      {/* Grid of Catches */}
      <View style={styles.grid}>
        {mockCatches.map((catch_item) => (
          <CatchCard
            key={catch_item.id}
            {...catch_item}
            onPress={() => onViewCatch?.(catch_item.id)}
          />
        ))}
        
        {/* Add New Catch Card */}
        <TouchableOpacity 
          style={[styles.catchCard, styles.addCard]} 
          onPress={onAddCatch}
          activeOpacity={0.7}
        >
          <View style={styles.addCardContent}>
            <Ionicons name="add-circle" size={48} color={fishingTheme.colors.gold} />
            <Text style={styles.addCardText}>Add Catch</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Accolades Section */}
      <View style={styles.accoladesSection}>
        <Text style={styles.accoladesTitle}>Recent Accolades</Text>
        <View style={styles.accoladesList}>
          <View style={styles.accoladeBadge}>
            <Ionicons name="ribbon" size={20} color={fishingTheme.colors.gold} />
            <Text style={styles.accoladeText}>1st Place - Fall Classic</Text>
          </View>
          <View style={styles.accoladeBadge}>
            <Ionicons name="star" size={20} color={fishingTheme.colors.lightTeal} />
            <Text style={styles.accoladeText}>Big Bass Award</Text>
          </View>
          <View style={styles.accoladeBadge}>
            <Ionicons name="trophy" size={20} color={fishingTheme.colors.goldenOrange} />
            <Text style={styles.accoladeText}>AOY Contender</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: fishingTheme.colors.gold,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: fishingTheme.colors.mutedWhite,
    fontStyle: 'italic',
    marginLeft: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  catchCard: {
    width: '48%',
    minWidth: 140,
    backgroundColor: fishingTheme.colors.trophyNavy,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: fishingTheme.colors.darkTeal,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: fishingTheme.colors.darkTeal,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: fishingTheme.colors.navyTeal,
  },
  placeholderText: {
    fontSize: 12,
    color: fishingTheme.colors.mutedGold,
    marginTop: 4,
    fontWeight: '500',
  },
  weightBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: fishingTheme.colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weightText: {
    fontSize: 11,
    fontWeight: '700',
    color: fishingTheme.colors.deepOcean,
  },
  catchInfo: {
    padding: spacing.sm,
  },
  catchTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: fishingTheme.colors.cream,
    marginBottom: 2,
  },
  catchDate: {
    fontSize: 11,
    color: fishingTheme.colors.mutedWhite,
  },
  addCard: {
    backgroundColor: 'rgba(245, 200, 66, 0.1)',
    borderColor: fishingTheme.colors.gold,
    borderStyle: 'dashed',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  addCardText: {
    fontSize: 14,
    fontWeight: '600',
    color: fishingTheme.colors.gold,
    marginTop: spacing.sm,
  },
  accoladesSection: {
    marginTop: spacing.lg,
  },
  accoladesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: fishingTheme.colors.cream,
    marginBottom: spacing.md,
  },
  accoladesList: {
    gap: spacing.sm,
  },
  accoladeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: fishingTheme.colors.trophyNavy,
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: fishingTheme.colors.gold,
    gap: spacing.md,
  },
  accoladeText: {
    fontSize: 14,
    fontWeight: '600',
    color: fishingTheme.colors.cream,
  },
});
