import { useQuery } from '@tanstack/react-query';
import {
  fetchAOYStandings,
  fetchTournamentEvents,
  AOYStandingsRow,
  TournamentEvent,
} from '../supabase';
import { supabase } from '../supabase';

// Safe number parsing helper
function toNumber(value: any, defaultValue: number = 0): number {
  if (value == null) return defaultValue;
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

// Centralized query key management
export const queryKeys = {
  aoyStandings: ['aoy-standings'] as const,
  tournaments: ['tournaments'] as const,
  tournamentResults: (memberId: string) => ['tournament-results', memberId] as const,
  dashboard: (memberId: string) => ['dashboard', memberId] as const,
  profile: (userId: string) => ['profile', userId] as const,
};

export function useAOYStandings() {
  return useQuery({
    queryKey: queryKeys.aoyStandings,
    queryFn: async () => {
      const { data, error } = await fetchAOYStandings();
      if (error) throw error;
      return (data || []) as AOYStandingsRow[];
    },
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: async () => {
      const { data, error } = await fetchTournamentEvents();
      if (error) throw error;
      return (data || []) as TournamentEvent[];
    },
  });
}

export function useDashboard(memberCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dashboard(memberCode || ''),
    queryFn: async () => {
      if (!memberCode) {
        return {
          lastTournament: null,
          aoyData: null,
          earnings: 0,
          nextTournament: null,
          seasonStats: { tournaments: 0, bestFinish: null, totalWeight: 0, bigFish: 0 },
        };
      }

      // Last tournament
      // DEBUG: log the memberCode used for the query to help diagnose caching / stale bundle issues
      // (dev-only; will show in browser console when this hook runs)
      // eslint-disable-next-line no-console
      console.log('🔍 DEBUG: Querying with memberCode:', memberCode);

      const { data: lastRaw, error: lastError } = await supabase
        .from('tournament_results')
        .select('event_date, lake, tournament_name, place, weight_lbs, aoy_points, payout')
        .eq('member_id', memberCode)
        .order('event_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // eslint-disable-next-line no-console
      console.log('🔍 DEBUG: Query returned (lastTournament):', { lastRaw, lastError, memberCode });

      if (lastError) throw lastError;

      const lastTournament = lastRaw
        ? {
            event_date: lastRaw.event_date,
            lake: lastRaw.lake,
            tournament_name: lastRaw.tournament_name,
            place: lastRaw.place != null ? toNumber(lastRaw.place) : null,
            weight_lbs: toNumber(lastRaw.weight_lbs, 0),
            aoy_points: toNumber(lastRaw.aoy_points, 0),
            payout: toNumber(lastRaw.payout, 0),
          }
        : null;

      // AOY standing
      const { data: aoyRaw, error: aoyError } = await supabase
        .from('aoy_standings')
        .select('aoy_rank, total_aoy_points')
        .eq('member_id', memberCode)
        .maybeSingle();
      if (aoyError) throw aoyError;
      const aoyData = aoyRaw
        ? { aoy_rank: aoyRaw.aoy_rank ?? null, total_aoy_points: toNumber(aoyRaw.total_aoy_points, 0) }
        : null;

      // Earnings for 2025
      const { data: earningsRows, error: earningsError } = await supabase
        .from('tournament_results')
        .select('payout')
        .eq('member_id', memberCode)
        .gte('event_date', '2025-01-01');
      if (earningsError) throw earningsError;
  const earnings = (earningsRows || []).reduce((sum: number, r: any) => sum + toNumber(r.payout, 0), 0);

      // Next tournament
      const { data: nextRaw, error: nextError } = await supabase
        .from('tournament_events')
        .select('lake, event_date, tournament_name')
        .gte('event_date', new Date().toISOString().slice(0, 10))
        .order('event_date', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (nextError) throw nextError;
      const nextTournament = nextRaw ? { lake: nextRaw.lake, event_date: nextRaw.event_date, tournament_name: nextRaw.tournament_name } : null;

      // Season stats
      const { data: statsRows, error: statsError } = await supabase
        .from('tournament_results')
        .select('place, weight_lbs, big_fish')
        .eq('member_id', memberCode)
        .gte('event_date', '2025-01-01');
      if (statsError) throw statsError;

      const seasonStats = {
        tournaments: statsRows?.length || 0,
        bestFinish: (statsRows || []).reduce((min: number | null, r: any) => {
          const p = r.place != null ? toNumber(r.place, Infinity) : null;
          if (p == null) return min;
          if (min == null) return p;
          return p < min ? p : min;
        }, null as number | null),
        totalWeight: (statsRows || []).reduce((sum: number, r: any) => sum + toNumber(r.weight_lbs, 0), 0),
        bigFish: (statsRows || []).reduce((max: number, r: any) => Math.max(max, toNumber(r.big_fish, 0)), 0),
      };

      return {
        lastTournament,
        aoyData,
        earnings,
        nextTournament,
        seasonStats,
      };
    },
    enabled: !!memberCode,
  });
}

export function useMemberResults(memberCode: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournamentResults(memberCode || ''),
    queryFn: async () => {
      if (!memberCode) throw new Error('No member code provided');

      const { data, error } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('member_id', memberCode)
        .order('event_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!memberCode,
  });
}

// Fetch all results for a specific tournament event (by event_id)
export function useTournamentResults(eventId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-results-by-event', eventId || ''],
    queryFn: async () => {
      if (!eventId) throw new Error('No eventId provided');

      // select result rows and include nested member/profile info when available
      // Adjust the nested select to match your Supabase schema: here we try to select
      // a joined member record (from 'members' or 'profiles' depending on your schema)
      const { data, error } = await supabase
        .from('tournament_results')
        .select(`*, member:profiles(id, name, member_code, dbm_number, avatar_url)`)
        .eq('event_id', eventId)
        .order('place', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!eventId,
  });
}

