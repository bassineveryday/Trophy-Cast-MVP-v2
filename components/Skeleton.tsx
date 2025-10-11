import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton loading component with animated pulse effect
 * Used to show placeholder content while data is loading
 * 
 * @example
 * <Skeleton width="100%" height={20} borderRadius={4} />
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity,
        } as any,
        style,
      ]}
    />
  );
};

/**
 * Card skeleton for tournament and profile cards
 */
export const CardSkeleton: React.FC = () => (
  <View style={styles.cardContainer}>
    <Skeleton width="100%" height={120} borderRadius={8} />
    <View style={styles.cardContent}>
      <Skeleton width="70%" height={24} />
      <Skeleton width="50%" height={16} style={{ marginTop: 8 }} />
      <Skeleton width="90%" height={16} style={{ marginTop: 4 }} />
    </View>
  </View>
);

/**
 * List skeleton showing multiple card skeletons
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </View>
);

/**
 * Table row skeleton for standings
 */
export const TableRowSkeleton: React.FC = () => (
  <View style={styles.tableRow}>
    <Skeleton width={40} height={16} />
    <Skeleton width="40%" height={16} />
    <Skeleton width={60} height={16} />
    <Skeleton width={60} height={16} />
  </View>
);

/**
 * Dashboard skeleton for home screen
 */
export const DashboardSkeleton: React.FC = () => (
  <View style={styles.dashboardContainer}>
    {/* Stats Cards */}
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={32} style={{ marginTop: 12 }} />
      </View>
      <View style={styles.statCard}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="80%" height={32} style={{ marginTop: 12 }} />
      </View>
    </View>

    {/* Last Tournament Card */}
    <View style={styles.section}>
      <Skeleton width="50%" height={24} style={{ marginBottom: 16 }} />
      <CardSkeleton />
    </View>

    {/* Next Tournament Card */}
    <View style={styles.section}>
      <Skeleton width="50%" height={24} style={{ marginBottom: 16 }} />
      <CardSkeleton />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e1e8ed',
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dashboardContainer: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
});

export default Skeleton;
