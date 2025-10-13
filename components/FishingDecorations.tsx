import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * FishingDecorations - Decorative fishing icons around the UI
 * Adds subtle fishing-themed icons (hooks, lures, anchors) with low opacity
 * pointerEvents='none' to avoid blocking interactions
 */

export const FishingDecorations: React.FC = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Top Left - Hook */}
      <Text style={[styles.icon, styles.topLeft, styles.rotate15]}>🪝</Text>
      
      {/* Top Right - Lure */}
      <Text style={[styles.icon, styles.topRight, styles.rotateNeg20]}>🎣</Text>
      
      {/* Middle Left - Anchor */}
      <Text style={[styles.icon, styles.middleLeft, styles.rotate10]}>⚓</Text>
      
      {/* Middle Right - Fish */}
      <Text style={[styles.icon, styles.middleRight, styles.rotateNeg15]}>🐟</Text>
      
      {/* Bottom Left - Waves */}
      <Text style={[styles.icon, styles.bottomLeft]}>🌊</Text>
      
      {/* Bottom Right - Hook */}
      <Text style={[styles.icon, styles.bottomRight, styles.rotateNeg25]}>🪝</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  icon: {
    position: 'absolute',
    fontSize: 32,
    opacity: 0.08,
  },
  // Positions
  topLeft: {
    top: 120,
    left: 20,
  },
  topRight: {
    top: 140,
    right: 30,
  },
  middleLeft: {
    top: '40%',
    left: 15,
  },
  middleRight: {
    top: '45%',
    right: 25,
  },
  bottomLeft: {
    bottom: 100,
    left: 25,
  },
  bottomRight: {
    bottom: 120,
    right: 20,
  },
  // Rotations for natural look
  rotate10: {
    transform: [{ rotate: '10deg' }],
  },
  rotate15: {
    transform: [{ rotate: '15deg' }],
  },
  rotateNeg15: {
    transform: [{ rotate: '-15deg' }],
  },
  rotateNeg20: {
    transform: [{ rotate: '-20deg' }],
  },
  rotateNeg25: {
    transform: [{ rotate: '-25deg' }],
  },
});
