import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { 
  fetchAOYStandings, 
  fetchTournamentEvents, 
  AOYStandingsRow, 
  TournamentEvent 
} from '../supabase';
import { supabase } from '../supabase';

/**
 * Query Keys - Centralized query key management
 * Ensures consistent cache invalidation and refetching
 */
export const queryKeys = {
  aoyStandings: ['aoy-standings'] as const,
  tournaments: ['tournaments'] as const,
  tournamentResults: (memberId: string) => ['tournament-results', memberId] as const,
  dashboard: (memberId: string) => ['dashboard', memberId] as const,
  profile: (userId: string) => ['profile', userId] as const,
};

/**
 * Hook: Fetch AOY (Angler of the Year) Standings
 * 
 * Retrieves the current season's AOY rankings with automatic
 * caching and background refetching.
 * 
 * @returns Query result with standings data, loading, and error states
 */
export function useAOYStandings() {
  return useQuery({
    queryKey: queryKeys.aoyStandings,
    queryFn: async () => {
      const { data, error } = await fetchAOYStandings();
      if (error) throw new Error(typeof error === 'string' ? error : 'Failed to fetch AOY standings');
      return data || [];
    },
  });
}

/**
 * Hook: Fetch Tournament Events
 * 
 * Retrieves all tournament events (past and upcoming) with
 * intelligent caching for better performance.
 * 
 * @returns Query result with tournament data, loading, and error states
 */
export function useTournaments() {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: async () => {
      const { data, error } = await fetchTournamentEvents();
      if (error) throw new Error(typeof error === 'string' ? error : 'Failed to fetch tournaments');
      return data || [];
    },
  });
}

/**
 * Hook: Fetch User Dashboard Data
 * 
 * Retrieves comprehensive dashboard data for a specific member:
 * - Last tournament result
 * - Current AOY standing
 * - Season earnings
 * - Next tournament
 * - Season statistics
 * 
 * @param memberCode - Denver Bassmasters member code (e.g., "DBM019")
 * @returns Query result with dashboard data
 */
export function useDashboard(memberCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dashboard(memberCode || ''),
    queryFn: async () => {
      if (!memberCode) throw new Error('No member code provided');

      // Last tournament
      const { data: lastTournament } = await supabase
        .from('tournament_results_rows')
        .select('event_date, lake, tournament_name, place, weight_lbs, aoy_points, cash_payout')
        .eq('member_id', memberCode)
        .order('event_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // AOY standing
      const { data: aoyData } = await supabase
        .from('aoy_standings_rows')
        .select('aoy_rank, total_aoy_points')
        .eq('member_id', memberCode)
        .maybeSingle();

      // Earnings for 2025
      const { data: earningsRows } = await supabase
        .from('tournament_results_rows')
        .select('cash_payout')
        .eq('member_id', memberCode)
        .gte('event_date', '2025-01-01');

      const earnings = earningsRows?.reduce(
        (sum: number, r: any) => sum + (parseFloat(r.cash_payout) || 0), 
        0
      ) || 0;

      // Next tournament
      const { data: nextTournament } = await supabase
        .from('tournament_events_rows')
        .select('lake, event_date, tournament_name')
        .gte('event_date', new Date().toISOString().slice(0, 10))
        .order('event_date', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Season stats
      const { data: statsRows } = await supabase
        .from('tournament_results_rows')
        .select('place, weight_lbs, big_fish')
        .eq('member_id', memberCode)
        .gte('event_date', '2025-01-01');

      const seasonStats = {
        tournaments: statsRows?.length || 0,
        bestFinish: statsRows?.reduce(
          (min: number | null, r: any) => r.place && (!min || r.place < min) ? r.place : min, 
          null as number | null
        ),
        totalWeight: statsRows?.reduce(
          (sum: number, r: any) => sum + (r.weight_lbs || 0), 
          0
        ) || 0,
        bigFish: statsRows?.reduce(
          (max: number, r: any) => r.big_fish && r.big_fish > max ? r.big_fish : max, 
          0
        ) || 0,
      };

      return {
        lastTournament,
        aoyData,
        earnings,
        nextTournament,
        seasonStats,
      };
    },
    enabled: !!memberCode, // Only run query if memberCode exists
  });
}

/**
 * Hook: Fetch Tournament Results for a Member
 * 
 * Retrieves all tournament results for a specific member,
 * useful for profile screens and detailed history views.
 * 
 * @param memberCode - Member's unique code
 * @returns Query result with tournament results
 */
export function useMemberResults(memberCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournamentResults(memberCode || ''),
    queryFn: async () => {
      if (!memberCode) throw new Error('No member code provided');

      const { data, error } = await supabase
        .from('tournament_results_rows')
        .select('*')
        .eq('member_id', memberCode)
        .order('event_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!memberCode,
  });
}
