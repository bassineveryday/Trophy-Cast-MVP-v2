import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { fishingTheme } from '../lib/designTokens';

export interface DailyChallengeProps {
  progress: number; // 0-100
  fishTypes?: string[]; // Array of fish emoji
  testID?: string;
}

const DEFAULT_FISH_TYPES = ['🐟', '🐠', '🐡'];

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  progress,
  fishTypes = DEFAULT_FISH_TYPES,
  testID,
}) => {
  // Clamp progress between 0-100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  // Animated value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clampedProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container} testID={testID || 'daily-challenge'}>
      {/* Title with decorative hook */}
      <View style={styles.titleRow}>
        <Text style={styles.hookEmoji}>🎣</Text>
        <Text style={styles.title}>DAILY CHALLENGE</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[
            styles.progressBarFill,
            { width: progressWidth },
          ]}
        />
      </View>

      {/* Progress Text */}
      <Text style={styles.progressText}>
        {Math.round(clampedProgress)}% Complete
      </Text>

      {/* Fish Type Badges */}
      <View style={styles.fishRow}>
        {fishTypes.slice(0, 3).map((fish, index) => (
          <View key={index} style={styles.fishBadge}>
            <Text style={styles.fishEmoji}>{fish}</Text>
          </View>
        ))}
      </View>

      {/* Challenge Description */}
      <Text style={styles.description}>
        Catch 3 different species today
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: fishingTheme.colors.challengeTeal,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hookEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: fishingTheme.colors.white,
    letterSpacing: 0.5,
  },
  progressBarContainer: {
    height: 14,
    backgroundColor: fishingTheme.colors.progressDark,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: fishingTheme.colors.progressOrange,
    borderRadius: 7,
  },
  progressText: {
    fontSize: 13,
    color: fishingTheme.colors.white,
    marginBottom: 20,
    fontWeight: '600',
  },
  fishRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  fishBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishEmoji: {
    fontSize: 24,
  },
  description: {
    fontSize: 12,
    color: fishingTheme.colors.mutedWhite,
    textAlign: 'center',
    fontWeight: '500',
  },
});
