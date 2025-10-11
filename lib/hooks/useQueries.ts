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
  tournamentParticipants: (eventId: string) => ['tournament-participants', eventId] as const,
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

// Helper: get unique participants from results rows
function uniqueParticipants(rows: any[] = []) {
  const map = new Map<string, { member_id: string; member_name: string }>();
  for (const r of rows) {
    if (!r || !r.member_id) continue;
    if (!map.has(r.member_id)) {
      map.set(r.member_id, { member_id: r.member_id, member_name: r.member_name || '' });
    }
  }
  return Array.from(map.values());
}

export function useTournamentParticipants(eventId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tournamentParticipants(eventId || ''),
    queryFn: async () => {
      if (!eventId) return [] as Array<{ member_id: string; member_name: string }>;

      // Match either tournament_code or event_id to be resilient to caller params
      const { data, error } = await supabase
        .from('tournament_results')
        .select('member_id, member_name')
        .or(`tournament_code.eq.${eventId},event_id.eq.${eventId}`);

      if (error) throw error;

      return uniqueParticipants(data || []);
    },
    enabled: !!eventId,
  });
}

export function useTournamentResults(eventId: string | undefined) {
  return useQuery({
    queryKey: ['tournament-results-by-event', eventId || ''],
    queryFn: async () => {
      if (!eventId) return [] as any[];

      // Support lookup by either tournament_code or event_id (some callers pass event_id)
      const { data, error } = await supabase
        .from('tournament_results')
        .select('*')
        .or(`tournament_code.eq.${eventId},event_id.eq.${eventId}`)
        .order('place', { ascending: true });

      if (error) throw error;
      return (data || []) as any[];
    },
    enabled: !!eventId,
  });
}

export function useRecentTournamentResults(limit: number = 5) {
  return useQuery({
    queryKey: ['recent-tournament-results', String(limit)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournament_results')
        .select('event_date, lake, tournament_name, place, member_name, member_id, weight_lbs')
        .order('event_date', { ascending: false })
        .limit(limit as number);

      if (error) throw error;
      return (data || []) as any[];
    },
  });
}

// Fetch participant counts for a batch of tournament codes (single query)
// Accept an array of lookup keys (objects) that may contain tournament_code and/or event_id.
// Returns a map where the key is either the tournament_code (preferred) or the event_id when code missing.
export function useParticipantCounts(lookups: Array<{ code?: string; eventId?: string }> = []) {
  const key = lookups.map(l => `${l.code || ''}::${l.eventId || ''}`).join(',');
  return useQuery({
    queryKey: ['participant-counts', key],
    queryFn: async () => {
      if (!lookups || lookups.length === 0) return {} as Record<string, number>;

      // Build OR expression supporting both tournament_code and event_id
      const orParts: string[] = [];
      for (const l of lookups) {
        if (l.code) orParts.push(`tournament_code.eq.${l.code}`);
        if (l.eventId) orParts.push(`event_id.eq.${l.eventId}`);
      }
      if (orParts.length === 0) return {} as Record<string, number>;

      const orExpr = orParts.join(',');
      const { data, error } = await supabase
        .from('tournament_results')
        .select('tournament_code, event_id, member_id');

      if (error) throw error;

      const rows = data || [];
      const map: Record<string, Set<string>> = {};
      for (const r of rows) {
        const code = r.tournament_code || null;
        const evt = r.event_id || null;
        const memberId = r.member_id || null;
        if (!memberId) continue;
        // prefer code as key, otherwise use event id
        const k = code || evt;
        if (!k) continue;
        map[k] = map[k] || new Set<string>();
        map[k].add(memberId);
      }

      const counts: Record<string, number> = {};
      for (const k of Object.keys(map)) counts[k] = map[k].size;
      return counts;
    },
    enabled: lookups.length > 0,
  });
}

