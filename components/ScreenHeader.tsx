/**
 * ScreenHeader.tsx - Reusable header with settings icon
 *
 * Features:
 * - Left: Title
 * - Right: Settings icon (navigates to profile)
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onSettingsPress?: () => void;
}

export default function ScreenHeader({
  title,
  subtitle,
  onSettingsPress,
}: ScreenHeaderProps) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      // Default: navigate to Profile screen
      navigation.navigate('Profile' as never);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <TouchableOpacity
        style={styles.settingsButton}
        onPress={handleSettingsPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="settings" size={24} color="#C9A646" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0B1A2F',
    borderBottomColor: '#1A2A3F',
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
  },
  settingsButton: {
    padding: 8,
    marginLeft: 12,
  },
});
