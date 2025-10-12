import React, { ReactNode } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';
import { makeStyles, spacing, borderRadius, fontSize, fontWeight } from '../lib/designTokens';

interface ListRowProps {
  // Avatar/Icon
  avatarSource?: ImageSourcePropType | string;
  avatarText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  
  // Content
  title: string;
  subtitle?: string;
  metadata?: string;
  badge?: string;
  badgeColor?: string;
  
  // Right side
  rightValue?: string | number;
  rightLabel?: string;
  rightColor?: string;
  
  // Interaction
  onPress?: () => void;
  disabled?: boolean;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Style
  showChevron?: boolean;
}

const MIN_TOUCH_HEIGHT = 56;

const styles = makeStyles((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: MIN_TOUCH_HEIGHT,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarTextContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.circle,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: theme.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs - 2,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: theme.textSecondary,
    marginBottom: 2,
  },
  metadata: {
    fontSize: fontSize.xs,
    color: theme.textMuted,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  rightValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: theme.text,
  },
  rightLabel: {
    fontSize: fontSize.xs,
    color: theme.textMuted,
    marginTop: 2,
  },
  chevron: {
    marginLeft: spacing.sm,
  },
}));

/**
 * Reusable ListRow component with avatar, content, and right-aligned value
 * Minimum touch height of 56px for accessibility
 * 
 * @example
 * <ListRow
 *   avatarText="JD"
 *   title="John Doe"
 *   subtitle="Member ID: 123"
 *   rightValue="250"
 *   rightLabel="points"
 *   onPress={() => {}}
 *   accessibilityLabel="John Doe, 250 points"
 * />
 */
export default function ListRow({
  avatarSource,
  avatarText,
  icon,
  iconColor,
  title,
  subtitle,
  metadata,
  badge,
  badgeColor,
  rightValue,
  rightLabel,
  rightColor,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  showChevron = false,
}: ListRowProps) {
  const { theme } = useTheme();
  const themedStyles = styles(theme);

  const renderAvatar = () => {
    if (avatarSource) {
      const source = typeof avatarSource === 'string' 
        ? { uri: avatarSource } 
        : avatarSource;
      
      return (
        <View style={themedStyles.avatarContainer}>
          <Image source={source} style={themedStyles.avatarImage} />
        </View>
      );
    }

    if (avatarText) {
      return (
        <View style={themedStyles.avatarContainer}>
          <View style={themedStyles.avatarTextContainer}>
            <Text style={themedStyles.avatarText}>{avatarText}</Text>
          </View>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={themedStyles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={iconColor || theme.primary} 
          />
        </View>
      );
    }

    return null;
  };

  const content = (
    <View style={[themedStyles.container, disabled && themedStyles.disabled]}>
      {renderAvatar()}
      
      <View style={themedStyles.contentContainer}>
        <View style={themedStyles.titleRow}>
          <Text style={themedStyles.title} numberOfLines={1}>
            {title}
          </Text>
          {badge && (
            <View style={[themedStyles.badge, { backgroundColor: badgeColor || theme.accent }]}>
              <Text style={themedStyles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        
        {subtitle && (
          <Text style={themedStyles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        
        {metadata && (
          <Text style={themedStyles.metadata} numberOfLines={1}>
            {metadata}
          </Text>
        )}
      </View>

      {(rightValue !== undefined || rightLabel) && (
        <View style={themedStyles.rightContainer}>
          {rightValue !== undefined && (
            <Text style={[themedStyles.rightValue, rightColor && { color: rightColor }]}>
              {rightValue}
            </Text>
          )}
          {rightLabel && (
            <Text style={themedStyles.rightLabel}>{rightLabel}</Text>
          )}
        </View>
      )}

      {showChevron && (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.textMuted} 
          style={themedStyles.chevron}
        />
      )}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      accessible={true}
      accessibilityLabel={accessibilityLabel || title}
    >
      {content}
    </View>
  );
}
