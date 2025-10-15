import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme as NavDark, DefaultTheme as NavLight, Theme as NavigationTheme } from '@react-navigation/native';
import { BRAND_CONFIG } from './brandConfig';

export type ThemeMode = 'light' | 'dark' | 'system';

// Typography tokens
export interface Typography {
  family: {
    regular: string;
    medium: string;
    bold: string;
  };
  sizes: {
    h1: number;
    h2: number;
    h3: number;
    title: number;
    body: number;
    label: number;
    caption: number;
  };
  weights: {
    regular: '400';
    medium: '600';
    bold: '700';
  };
}

// Layout tokens
export interface LayoutTokens {
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  elevation: {
    sm: number;
    md: number;
    lg: number;
  };
}

export interface ColorScheme {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;
  
  // Accent colors
  accent: string;
  success: string;
  warning: string;
  error: string;
  
  // UI elements
  border: string;
  shadow: string;
  overlay: string;
  
  // Tournament specific colors
  gold: string;
  silver: string;
  bronze: string;
  
  // Status colors
  active: string;
  inactive: string;
  
  // Gradients
  gradients: {
    hero: [string, string];
    card: [string, string];
    accent: [string, string];
  };
}

// Full brand theme combining colors, typography, and layout
export interface BrandTheme extends ColorScheme {
  mode: 'light' | 'dark';
  typography: Typography;
  layout: LayoutTokens;
}

// Shared typography tokens (same for light and dark)
// Now imported from brandConfig.ts for easy updates!
const typography: Typography = {
  family: {
    regular: BRAND_CONFIG.fonts.regular,
    medium: BRAND_CONFIG.fonts.medium,
    bold: BRAND_CONFIG.fonts.bold,
  },
  sizes: {
    h1: BRAND_CONFIG.fontSizes.h1,
    h2: BRAND_CONFIG.fontSizes.h2,
    h3: BRAND_CONFIG.fontSizes.h3,
    title: BRAND_CONFIG.fontSizes.body,
    body: BRAND_CONFIG.fontSizes.body,
    label: BRAND_CONFIG.fontSizes.label,
    caption: BRAND_CONFIG.fontSizes.caption,
  },
  weights: {
    regular: '400',
    medium: '600',
    bold: '700',
  },
};

// Shared layout tokens (same for light and dark)
// Now imported from brandConfig.ts for easy updates!
const layout: LayoutTokens = {
  radius: {
    sm: BRAND_CONFIG.borderRadius.sm,
    md: BRAND_CONFIG.borderRadius.md,
    lg: BRAND_CONFIG.borderRadius.lg,
    xl: BRAND_CONFIG.borderRadius.xl,
  },
  spacing: {
    xs: BRAND_CONFIG.spacing.xs,
    sm: BRAND_CONFIG.spacing.sm,
    md: BRAND_CONFIG.spacing.md,
    lg: BRAND_CONFIG.spacing.lg,
    xl: BRAND_CONFIG.spacing.xl,
    xxl: BRAND_CONFIG.spacing.xxl,
  },
  elevation: {
    sm: BRAND_CONFIG.elevation.sm,
    md: BRAND_CONFIG.elevation.md,
    lg: BRAND_CONFIG.elevation.lg,
  },
};

// Light theme now uses brandConfig.ts values - update colors there to change the entire app!
export const lightTheme: BrandTheme = {
  mode: 'light',
  
  // Background colors - from BRAND_CONFIG
  background: BRAND_CONFIG.lightTheme.background,
  surface: BRAND_CONFIG.lightTheme.surface,
  card: BRAND_CONFIG.lightTheme.surface,
  
  // Text colors - from BRAND_CONFIG
  text: BRAND_CONFIG.lightTheme.text,
  textSecondary: BRAND_CONFIG.lightTheme.textSecondary,
  textMuted: BRAND_CONFIG.lightTheme.textSecondary,
  
  // Primary colors - from BRAND_CONFIG
  primary: BRAND_CONFIG.colors.primary,
  primaryLight: BRAND_CONFIG.colors.accent,
  // Darker variant of primary for emphasis states with gold theme
  primaryDark: '#B8911F',
  onPrimary: BRAND_CONFIG.colors.onPrimary,
  
  // Accent colors - from BRAND_CONFIG
  accent: BRAND_CONFIG.colors.accent,
  success: BRAND_CONFIG.colors.success,
  warning: BRAND_CONFIG.colors.warning,
  error: BRAND_CONFIG.colors.error,
  
  // UI elements - from BRAND_CONFIG
  border: BRAND_CONFIG.lightTheme.border,
  shadow: BRAND_CONFIG.lightTheme.shadow,
  overlay: 'rgba(0,0,0,0.5)',
  
  // Tournament specific colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Status colors - from BRAND_CONFIG
  active: BRAND_CONFIG.colors.success,
  inactive: '#9E9E9E',
  
  // Gradients - from BRAND_CONFIG
  gradients: {
    hero: BRAND_CONFIG.gradients.hero as [string, string],
    card: [BRAND_CONFIG.lightTheme.surface, BRAND_CONFIG.lightTheme.background] as [string, string],
    accent: BRAND_CONFIG.gradients.accent as [string, string],
  },
  
  // Typography and layout
  typography,
  layout,
};

// Dark theme now uses brandConfig.ts values - update colors there to change the entire app!
export const darkTheme: BrandTheme = {
  mode: 'dark',
  
  // Background colors - from BRAND_CONFIG
  background: BRAND_CONFIG.darkTheme.background,
  surface: BRAND_CONFIG.darkTheme.surface,
  card: BRAND_CONFIG.darkTheme.surfaceVariant,
  
  // Text colors - from BRAND_CONFIG
  text: BRAND_CONFIG.darkTheme.text,
  textSecondary: BRAND_CONFIG.darkTheme.textSecondary,
  textMuted: BRAND_CONFIG.darkTheme.textSecondary,
  
  // Primary colors - from BRAND_CONFIG
  primary: BRAND_CONFIG.colors.primary,
  primaryLight: BRAND_CONFIG.colors.accent,
  // Darker variant of primary for emphasis states with gold theme
  primaryDark: '#B8911F',
  onPrimary: BRAND_CONFIG.colors.onPrimary,
  
  // Accent colors - from BRAND_CONFIG
  accent: BRAND_CONFIG.colors.accent,
  success: BRAND_CONFIG.colors.success,
  warning: BRAND_CONFIG.colors.warning,
  error: BRAND_CONFIG.colors.error,
  
  // UI elements - from BRAND_CONFIG
  border: BRAND_CONFIG.darkTheme.border,
  shadow: BRAND_CONFIG.darkTheme.shadow,
  overlay: 'rgba(0,0,0,0.7)',
  
  // Tournament specific colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Status colors - from BRAND_CONFIG
  active: '#66BB6A',
  inactive: '#616161',
  
  // Gradients - from BRAND_CONFIG
  gradients: {
    hero: BRAND_CONFIG.gradients.hero as [string, string],
    card: [BRAND_CONFIG.darkTheme.surface, BRAND_CONFIG.darkTheme.background] as [string, string],
    accent: BRAND_CONFIG.gradients.accent as [string, string],
  },
  
  // Typography and layout
  typography,
  layout,
};

interface ThemeContextType {
  theme: BrandTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// Map BrandTheme to React Navigation theme
export function toNavigationTheme(brandTheme: BrandTheme): NavigationTheme {
  const base = brandTheme.mode === 'dark' ? NavDark : NavLight;
  return {
    ...base,
    dark: brandTheme.mode === 'dark',
    colors: {
      ...base.colors,
      primary: brandTheme.primary,
      background: brandTheme.background,
      card: brandTheme.surface,
      text: brandTheme.text,
      border: brandTheme.border,
      notification: brandTheme.accent,
    },
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@trophy_cast_theme_mode';

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Calculate current theme based on mode and system preference
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    saveThemePreference(themeMode);
  }, [themeMode]);

  const loadThemePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setThemeMode('dark');
    } else if (themeMode === 'dark') {
      setThemeMode('system');
    } else {
      setThemeMode('light');
    }
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    isDark,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to create themed styles
export const createThemedStyles = <T extends Record<string, any>>(
  styleFactory: (theme: BrandTheme) => T
) => {
  return (theme: BrandTheme): T => styleFactory(theme);
};