import React, { ReactNode } from 'react';
import { View, Platform } from 'react-native';
import { AnimatePresence, motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimatedTabContentProps {
  value: string | number;
  activeValue: string | number;
  children: ReactNode;
}

/**
 * AnimatedTabContent wraps tab panel content with smooth transitions
 * Respects prefers-reduced-motion for accessibility
 * 
 * @example
 * <AnimatedTabContent value="tournament" activeValue={activeTab}>
 *   <TournamentList />
 * </AnimatedTabContent>
 */
export function AnimatedTabContent({
  value,
  activeValue,
  children,
}: AnimatedTabContentProps) {
  const prefersReducedMotion = useReducedMotion();
  const isActive = value === activeValue;

  // Skip animation wrapper on native or when reduced motion is preferred
  if (Platform.OS !== 'web' || prefersReducedMotion) {
    return isActive ? <View>{children}</View> : null;
  }

  // Web: use framer-motion for smooth transitions
  const MotionView = motion.div;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <MotionView
          key={String(value)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
          style={{
            width: '100%',
          }}
        >
          {children}
        </MotionView>
      )}
    </AnimatePresence>
  );
}

interface AnimatedTabsProps {
  activeTab: string | number;
  children: ReactNode;
}

/**
 * AnimatedTabs container for tab content with smooth transitions
 * Handles AnimatePresence context for child AnimatedTabContent components
 * 
 * @example
 * <AnimatedTabs activeTab={currentTab}>
 *   <AnimatedTabContent value="tab1" activeValue={currentTab}>
 *     <Content1 />
 *   </AnimatedTabContent>
 *   <AnimatedTabContent value="tab2" activeValue={currentTab}>
 *     <Content2 />
 *   </AnimatedTabContent>
 * </AnimatedTabs>
 */
export function AnimatedTabs({ activeTab, children }: AnimatedTabsProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
}

export default AnimatedTabs;
