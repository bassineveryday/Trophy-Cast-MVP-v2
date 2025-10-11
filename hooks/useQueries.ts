/**
 * React Query hooks for Tournament data
 * 
 * These hooks provide intelligent caching, background refetching,
 * and automatic retry logic for all tournament-related data.
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchAOYStandings, fetchTournamentEvents, AOYStandingsRow, TournamentEvent } from '../lib/supabase';

/**
 * Hook to fetch AOY (Angler of the Year) standings
 * 
 * Features:
 * - Cached for 5 minutes (staleTime)
 * - Background refresh on window focus
 * - Automatic retries on failure
 * - Loading and error states
 * 
 * @returns Query result with AOY standings data
 * @example
 * const { data: standings, isLoading, error, refetch } = useAOYStandings();
 */
export function useAOYStandings(): UseQueryResult<AOYStandingsRow[], Error> {
  return useQuery({
    queryKey: ['aoy-standings'],
    queryFn: async () => {
      const { data, error } = await fetchAOYStandings();
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,   // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch tournament events
 * 
 * Features:
 * - Cached for 10 minutes (events change less frequently)
 * - Background refresh on network reconnection
 * - Optimized for tournament scheduling use cases
 * 
 * @returns Query result with tournament events data
 * @example
 * const { data: events, isLoading, error } = useTournamentEvents();
 * const upcomingEvents = events?.filter(e => new Date(e.event_date) > new Date());
 */
export function useTournamentEvents(): UseQueryResult<TournamentEvent[], Error> {
  return useQuery({
    queryKey: ['tournament-events'],
    queryFn: async () => {
      const { data, error } = await fetchTournamentEvents();
      if (error) {
        throw error;
      }
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 15,    // 15 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch AOY standings for a specific member
 * 
 * @param memberId - The member ID to fetch standings for
 * @returns Query result with member's AOY data
 */
export function useAOYStandingsByMember(memberId: string | null): UseQueryResult<AOYStandingsRow, Error> {
  return useQuery({
    queryKey: ['aoy-standings', memberId],
    queryFn: async () => {
      if (!memberId) throw new Error('Member ID is required');
      
      const { data, error } = await fetchAOYStandings();
      if (error) throw error;
      
      const memberStanding = data.find((standing: AOYStandingsRow) => standing.member_id === memberId);
      if (!memberStanding) {
        throw new Error(`No AOY standing found for member ${memberId}`);
      }
      
      return memberStanding;
    },
    enabled: !!memberId, // Only run query if memberId is provided
    staleTime: 1000 * 60 * 5,
  });
}

// Query keys for external use (e.g., manual invalidation)
export const queryKeys = {
  aoyStandings: ['aoy-standings'] as const,
  tournamentEvents: ['tournament-events'] as const,
  memberAOY: (memberId: string) => ['aoy-standings', memberId] as const,
};