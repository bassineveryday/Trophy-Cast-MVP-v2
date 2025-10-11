import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../lib/ThemeContext';
import { fadeIn, createFadeInStyle, createSlideUpStyle, slideUp } from '../utils/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  animation?: 'fade' | 'slideUp';
}

/**
 * AnimatedCard - A card that animates in when mounted
 * @param children - Content to render inside the card
 * @param delay - Delay before animation starts (ms)
 * @param style - Additional styles to apply
 * @param animation - Animation type: 'fade' or 'slideUp'
 */
export default function AnimatedCard({ 
  children, 
  delay = 0, 
  style,
  animation = 'slideUp'
}: AnimatedCardProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();

  useEffect(() => {
    // Reset animation value on mount or when children change
    animValue.setValue(0);
    
    const timer = setTimeout(() => {
      if (animation === 'fade') {
        fadeIn(animValue, 300);
      } else {
        slideUp(animValue, 400);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, animation, children, animValue]);

  const animatedStyle = animation === 'fade' 
    ? createFadeInStyle(animValue)
    : createSlideUpStyle(animValue, 30);

  return (
    <Animated.View style={[
      animatedStyle, 
      {
        backgroundColor: theme.card,
        shadowColor: theme.shadow,
        borderRadius: 12,
        elevation: 2,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      style
    ]}>
      {children}
    </Animated.View>
  );
}
