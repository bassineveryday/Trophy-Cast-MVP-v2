import { StyleSheet } from 'react-native';
import { ColorScheme } from './ThemeContext';

/**
 * Design Tokens for consistent spacing, sizing, and styling
 */

// Spacing scale (in pixels)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 56,
  massive: 64,
  giant: 72,
} as const;

// Border radius values
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  xxl: 32,
  circle: 9999,
} as const;

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

// Font weights
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  glow: {
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;

// Opacity values
export const opacity = {
  disabled: 0.5,
  subtle: 0.6,
  medium: 0.7,
  strong: 0.8,
  full: 1,
} as const;

/**
 * Helper function to create themed styles with design tokens
 * Usage: const styles = makeStyles((theme) => ({ ... }));
 * Then use inside component: const themedStyles = styles(theme);
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
  styleFactory: (theme: any) => T
): (theme: any) => T {
  return (theme: any): T => {
    return StyleSheet.create(styleFactory(theme));
  };
}

/**
 * Fishing Theme - Premium tournament fishing UI colors and gradients
 * Brand: Bassin' Everyday × Trophy Cast
 */
export const fishingTheme = {
  colors: {
    // Base backgrounds
    deepOcean: '#1A3D4D',
    navyTeal: '#2A5A6B',
    darkTeal: '#1E4A56',
    
    // Brand
    gold: '#F5C842',
    goldenOrange: '#E8A735',
    
    // Widget backgrounds
    challengeTeal: '#3A7A7E',
    trophyNavy: '#2A5060',
    
    // Accents
    mutedGold: '#D4AF7A',
    lightTeal: '#5BC4C0',
    
    // Text
    white: '#FFFFFF',
    cream: '#F5EFE6',
    mutedWhite: 'rgba(255,255,255,0.7)',
    
    // Progress
    progressOrange: '#F5A142',
    progressDark: '#2A4A5A',
  },
  
  gradients: {
    goldCard: 'linear-gradient(135deg, #F5C842 0%, #E8A735 100%)',
    greenCard: 'linear-gradient(135deg, #7CAA5C 0%, #5A8A4A 100%)',
    tealCard: 'linear-gradient(135deg, #3EAAA8 0%, #2A8B89 100%)',
    blueCard: 'linear-gradient(135deg, #4A7FAF 0%, #35678F 100%)',
    oceanBg: 'linear-gradient(180deg, #1A3D4D 0%, #0D2A36 100%)',
  },
} as const;
