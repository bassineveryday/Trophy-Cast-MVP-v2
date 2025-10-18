/**
 * TrophyCastLogo - Trophy Cast Fish Badge
 * Custom logo for Trophy Cast branding
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TrophyCastLogoProps {
  size?: number;
  color?: string;
}

export function TrophyCastLogo({ size = 24, color = '#C9A646' }: TrophyCastLogoProps) {
  // Use a jumping fish emoji as the Trophy Cast logo
  return (
    <View style={styles.container}>
      <Text style={[styles.fish, { fontSize: size }]}>🏆</Text>
    </View>
  );
}

// Alternative: Use multiple icons to create trophy pose
export function TrophyCastBadge({ size = 20, color = '#C9A646' }: TrophyCastLogoProps) {
  return (
    <View style={styles.badgeContainer}>
      <Ionicons name="fish" size={size} color={color} />
      <Text style={[styles.badgeText, { color, fontSize: size * 0.6 }]}>⭐</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  fish: {
    fontWeight: '700',
  },

  badgeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  badgeText: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});
