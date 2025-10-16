import React from 'react';
import { View, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';

interface ChipProps {
  icon?: keyof typeof Ionicons.glyphMap;
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconColor?: string;
  backgroundColor?: string;
  borderColor?: string;
}

// Helper to apply alpha to a hex color
const withAlpha = (hexOrRgba: string, alpha: number) => {
  if (hexOrRgba.startsWith('#')) {
    const hex = hexOrRgba.replace('#', '');
    const full = hex.length === 3 ? hex.split('').map(c => c + c).join('') : hex;
    const bigint = parseInt(full, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexOrRgba; // assume already rgba or variable
};

export const Chip: React.FC<ChipProps> = ({
  icon,
  text,
  style,
  textStyle,
  iconColor,
  backgroundColor,
  borderColor,
}) => {
  const { theme } = useTheme();
  const resolvedIcon = iconColor ?? theme.onPrimary;
  
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: backgroundColor || withAlpha(theme.onPrimary, 0.12),
          borderColor: borderColor || withAlpha(theme.onPrimary, 0.35),
          borderRadius: theme.layout.radius.md,
          paddingHorizontal: theme.layout.spacing.sm,
          paddingVertical: theme.layout.spacing.xs,
        },
        style,
      ]}
    >
      {icon && <Ionicons name={icon} size={14} color={resolvedIcon} />}
      <Text
        style={[
          styles.chipText,
          {
            color: theme.onPrimary,
            fontSize: theme.typography.sizes.label,
            fontFamily: theme.typography.family.bold,
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = true }) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderRadius: theme.layout.radius.lg,
          padding: theme.layout.spacing.lg,
        },
        elevated && {
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: theme.layout.elevation.md },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: theme.layout.elevation.md,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface SectionHeaderProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  iconColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  iconColor,
  style,
  titleStyle,
}) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.sectionHeader,
        {
          paddingBottom: theme.layout.spacing.sm,
          marginBottom: theme.layout.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={iconColor || theme.primary}
          style={{ marginRight: theme.layout.spacing.xs }}
        />
      )}
      <Text
        style={[
          styles.sectionTitle,
          {
            fontSize: theme.typography.sizes.h3,
            fontFamily: theme.typography.family.bold,
            color: theme.text,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  chipText: {
    // Dynamic styles applied inline
  },
  card: {
    // Dynamic styles applied inline
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    // Dynamic styles applied inline
  },
});
