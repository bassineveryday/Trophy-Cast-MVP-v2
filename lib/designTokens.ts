import { StyleSheet } from 'react-native';
import { ColorScheme } from './ThemeContext';

/**
 * Design Tokens for consistent spacing, sizing, and styling
 */

// Spacing scale (in pixels)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  giant: 60,
} as const;

// Border radius values
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
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
  styleFactory: (theme: ColorScheme) => T
): (theme: ColorScheme) => T {
  return (theme: ColorScheme): T => {
    return StyleSheet.create(styleFactory(theme));
  };
}
