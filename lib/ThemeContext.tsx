import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

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
}

export const lightTheme: ColorScheme = {
  // Background colors
  background: '#f8f9fa',
  surface: '#ffffff',
  card: '#ffffff',
  
  // Text colors
  text: '#2c3e50',
  textSecondary: '#34495e',
  textMuted: '#7f8c8d',
  
  // Primary colors
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#388E3C',
  
  // Accent colors
  accent: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#E91E63',
  
  // UI elements
  border: '#e0e0e0',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  
  // Tournament specific colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Status colors
  active: '#4CAF50',
  inactive: '#9E9E9E',
};

export const darkTheme: ColorScheme = {
  // Background colors
  background: '#121212',
  surface: '#1e1e1e',
  card: '#2d2d2d',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#e0e0e0',
  textMuted: '#9e9e9e',
  
  // Primary colors
  primary: '#66BB6A',
  primaryLight: '#A5D6A7',
  primaryDark: '#43A047',
  
  // Accent colors
  accent: '#64B5F6',
  success: '#66BB6A',
  warning: '#FFB74D',
  error: '#F06292',
  
  // UI elements
  border: '#404040',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.7)',
  
  // Tournament specific colors
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Status colors
  active: '#66BB6A',
  inactive: '#616161',
};

interface ThemeContextType {
  theme: ColorScheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
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
  styleFactory: (theme: ColorScheme) => T
) => {
  return (theme: ColorScheme): T => styleFactory(theme);
};