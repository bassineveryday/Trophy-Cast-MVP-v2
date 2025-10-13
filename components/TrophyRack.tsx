import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrophyBadge, TrophyType } from './TrophyBadge';
import { fishingTheme } from '../lib/designTokens';

export interface Trophy {
  type: TrophyType;
  label: string;
  earnedDate?: Date;
}

export interface TrophyRackProps {
  trophies: Trophy[];
  maxDisplay?: number;
  testID?: string;
}

export const TrophyRack: React.FC<TrophyRackProps> = ({
  trophies,
  maxDisplay = 6,
  testID,
}) => {
  const displayedTrophies = trophies.slice(0, maxDisplay);

  return (
    <View style={styles.container} testID={testID || 'trophy-rack'}>
      {/* Section Title */}
      <Text style={styles.title}>YOUR TROPHIES</Text>

      {/* Trophy Grid */}
      <View style={styles.grid}>
        {displayedTrophies.length > 0 ? (
          displayedTrophies.map((trophy, index) => (
            <TrophyBadge
              key={`${trophy.type}-${index}`}
              type={trophy.type}
              label={trophy.label}
              testID={`trophy-rack-badge-${index}`}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🏆</Text>
            <Text style={styles.emptyLabel}>No trophies yet</Text>
            <Text style={styles.emptyHint}>Complete challenges to earn badges</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: fishingTheme.colors.trophyNavy,
    borderRadius: 16,
    padding: 18,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: fishingTheme.colors.gold,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginHorizontal: -10, // Offset badge margins
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 8,
    opacity: 0.3,
  },
  emptyLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: fishingTheme.colors.mutedWhite,
    marginBottom: 4,
  },
  emptyHint: {
    fontSize: 12,
    color: fishingTheme.colors.mutedWhite,
    opacity: 0.7,
  },
});
