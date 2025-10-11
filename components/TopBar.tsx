import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../lib/ThemeContext';

interface RightAction {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface Props {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: RightAction;
  testID?: string;
}

export default function TopBar({ title, subtitle, showBack, rightAction, testID }: Props) {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  return (
    <View style={styles.container} testID={testID}>
      {showBack ? (
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={theme?.primary || '#007AFF'} />
        </TouchableOpacity>
      ) : <View style={styles.backPlaceholder} />}

      <View style={styles.titles}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightAction ? (
        <TouchableOpacity style={styles.right} onPress={rightAction.onPress} accessibilityRole="button" accessibilityLabel={rightAction.accessibilityLabel || 'Action'}>
          <Ionicons name={rightAction.icon as any} size={20} color={theme?.primary || '#007AFF'} />
        </TouchableOpacity>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPlaceholder: {
    width: 44,
  },
  titles: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  rightPlaceholder: {
    width: 44,
  },
  right: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
