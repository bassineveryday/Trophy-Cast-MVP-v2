import React, { useEffect, useMemo, useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  testID?: string;
};

export default function TournamentSearch({ value, onChange, placeholder = 'Search tournaments...', debounceMs = 150, testID }: Props) {
  const { theme } = useTheme();
  const [text, setText] = useState(value);
  const styles = useMemo(() => createStyles(theme), [theme]);
  // Use a tiny debounce in Jest to avoid flakiness, keep normal UX otherwise
  const DEBOUNCE_MS = process.env.JEST_WORKER_ID ? 1 : debounceMs;

  useEffect(() => setText(value), [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (text !== value) onChange(text);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [text, value, onChange, DEBOUNCE_MS]);

  return (
    <View
      style={styles.searchContainer}
      accessibilityRole="search"
      accessibilityLabel="Search tournaments"
    >
      <Ionicons name="search-outline" size={20} color={theme.textSecondary} style={styles.searchIcon} />
      <TextInput
        testID={testID || 'tournament.search'}
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={text}
        onChangeText={setText}
      />
      {text.length > 0 && (
        <TouchableOpacity onPress={() => setText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  searchContainer: {
    alignItems: 'center',
    backgroundColor: theme.mode === 'light' ? '#f8f8f8' : theme.surface,
    borderColor: theme.border,
    borderRadius: theme.layout.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
    marginBottom: theme.layout.spacing.md,
    paddingHorizontal: theme.layout.spacing.md,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontFamily: theme.typography.family.regular,
    color: theme.text,
  },
  clearButton: {
    padding: 4,
  },
});
