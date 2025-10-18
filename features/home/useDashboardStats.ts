/**
 * useDashboardStats.ts - Dashboard statistics hook
 *
 * Returns mock data for:
 * - Catches (this month)
 * - Plans (upcoming trips)
 * - Tournaments (next 30 days)
 * - Performance (last 5 trips trend)
 *
 * TODO: Replace mock data with Supabase queries:
 * - Catches: SELECT count(*) FROM catches WHERE angler_id = $me AND date_trunc('month', caught_at) = date_trunc('month', now())
 * - Plans: SELECT count(*) FROM trips/events WHERE start_at BETWEEN now() AND now()+30d
 * - Tournaments: SELECT count(*) FROM tournaments WHERE date BETWEEN now() AND now()+30d
 * - Performance: Compute avg weight/success last-5 vs previous-5 trips
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Dashboard statistics data + navigation callbacks
 */
export type DashboardStatsData = {
  catches: number;
  plans: number;
  tournaments: number;
  performanceText: string; // "↑ 12%", "↓ 5%", or "Stable"
  performanceSub: string;  // "last 5 trips" or other context
  onOpenTrophyRoom: () => void;
  onOpenPlans: () => void;
  onOpenTournaments: () => void;
  onOpenCoach: () => void;
};

/**
 * Hook to fetch and manage dashboard statistics
 *
 * @returns { data, loading } - Stats data and loading state
 */
export function useDashboardStats() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStatsData | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      // TODO: Replace with real Supabase queries
      // For now, mock believable data:
      const mockStats = {
        catches: 5,
        plans: 2,
        tournaments: 1,
        performanceText: '↑ 8%',
        performanceSub: 'last 5 trips',
      };

      // Simulate network delay (skeleton state demo)
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!cancelled) {
        setStats({
          ...mockStats,
          onOpenTrophyRoom: () => {
            console.log('📸 Navigate to Trophy Room');
            navigation.navigate('TrophyRoom' as never);
          },
          onOpenPlans: () => {
            console.log('📅 Navigate to Plans');
            // TODO: Navigate to Plans screen
          },
          onOpenTournaments: () => {
            console.log('🏆 Navigate to Tournaments');
            navigation.navigate('Tournaments' as never);
          },
          onOpenCoach: () => {
            console.log('🤖 Navigate to AI Coach');
            navigation.navigate('AICoach' as never);
          },
        });
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation]);

  // Memoize stats to prevent unnecessary re-renders
  const data = useMemo(() => stats, [stats]);

  return { data, loading };
}
