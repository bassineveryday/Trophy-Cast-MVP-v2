import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/**
 * EmptyState component for when there's no data to display
 * Provides a friendly message and optional action button
 * 
 * @example
 * <EmptyState
 *   icon="fish-outline"
 *   title="No Tournaments Yet"
 *   message="Check back soon for upcoming tournaments!"
 *   actionLabel="Refresh"
 *   onAction={loadTournaments}
 * />
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'information-circle-outline',
  title,
  message,
  actionLabel,
  onAction,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color="#bdc3c7" />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.button} 
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          accessibilityHint="Reload the data to check for new items"
        >
          <Ionicons name="refresh-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    paddingTop: 64,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
