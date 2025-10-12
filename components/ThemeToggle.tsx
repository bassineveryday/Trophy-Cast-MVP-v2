import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode } from '../lib/ThemeContext';

interface ThemeToggleProps {
  showLabel?: boolean;
  compact?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = true, 
  compact = false 
}) => {
  const { theme, themeMode, isDark, setThemeMode, toggleTheme } = useTheme();

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return 'phone-portrait';
      default:
        return 'sunny';
    }
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Default';
      default:
        return 'Light Mode';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactButton, { backgroundColor: theme.card }]}
        onPress={toggleTheme}
      >
        <Ionicons 
          name={getThemeIcon(themeMode)} 
          size={20} 
          color={theme.text} 
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <Ionicons name="color-palette" size={24} color={theme.primary} />
        <Text style={[styles.title, { color: theme.text }]}>
          App Theme
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
          <TouchableOpacity
            key={mode}
            style={[
              styles.option,
              { borderBottomColor: theme.border },
              themeMode === mode && { backgroundColor: theme.surface }
            ]}
            onPress={() => setThemeMode(mode)}
          >
            <View style={styles.optionLeft}>
              <Ionicons
                name={getThemeIcon(mode)}
                size={20}
                color={themeMode === mode ? theme.primary : theme.textMuted}
              />
              <Text
                style={[
                  styles.optionText,
                  { color: themeMode === mode ? theme.primary : theme.text }
                ]}
              >
                {getThemeLabel(mode)}
              </Text>
            </View>
            
            <View style={styles.optionRight}>
              {themeMode === mode && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={theme.primary}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.surface }]}>
        <Ionicons name="information-circle" size={16} color={theme.textMuted} />
        <Text style={[styles.infoText, { color: theme.textMuted }]}>
          System Default follows your device's appearance settings
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  optionRight: {
    minWidth: 24,
    alignItems: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
});

export default ThemeToggle;