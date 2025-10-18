import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AOYStandingsRow, TournamentEvent } from '../supabase';
import { supabase } from '../supabase';

// Safe number parsing helper
function toNumber(value: any, defaultValue: number = 0): number {
  if (value == null) return defaultValue;
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

// Normalize cash_payout values which may be stored as strings like "$350.00" or numeric
function normalizePayout(raw: any): number {
  if (raw == null) return 0;
  // prefer numeric payout if provided
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  // strip non-numeric except dot and minus
  try {
    const s = String(raw).replace(/[^0-9.-]+/g, '').trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  } catch (e) {
    return 0;
  }
}

// Normalize member names for robust matching (trim, lowercase, unicode normalize)
function normalizeName(n: any) {
  if (n == null) return '';
  try {
    return String(n).normalize('NFKC').trim().toLowerCase();
  } catch (e) {
    return String(n).trim().toLowerCase();
  }
}

// Centralized query key management
export const queryKeys = {
  aoyStandings: (season_year?: number, club_id?: string) => 
    ['aoy-standings', season_year, club_id] as const,
  tournaments: ['tournaments'] as const,
  tournamentResults: (memberId: string) => ['tournament-results', memberId] as const,
  tournamentParticipants: (eventId: string) => ['tournament-participants', eventId] as const,
  dashboard: (memberId: string) => ['dashboard', memberId] as const,
  profile: (userId: string) => ['profile', userId] as const,
};

export function useAOYStandings(options?: { season_year?: number; club_id?: string }) {
  return useQuery({
    queryKey: queryKeys.aoyStandings(options?.season_year, options?.club_id),
    queryFn: async () => {
      // require at runtime so test mocks that replace the module are respected
      // when Jest replaces the implementation via jest.mock
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { fetchAOYStandings: fetchFn } = require('../supabase');
      const { data, error } = await fetchFn(options?.season_year, options?.club_id);
      if (error) throw error;
      return (data || []) as AOYStandingsRow[];
    },
  });
}

export function useTournaments() {
  return useQuery({
    queryKey: queryKeys.tournaments,
    queryFn: async () => {
      // require at runtime to ensure test-time module mocks are respected
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { fetchTournamentEvents: fetchFn } = require('../supabase');
      const { data, error } = await fetchFn();
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
          seasonStats: { tournaments: 0, bestFinish: null, totalWeight: 0, bigFish: 0, wins: 0 },
        };
      }

      // Last tournament
      // DEBUG: log the memberCode used for the query to help diagnose caching / stale bundle issues
      // (dev-only; will show in browser console when this hook runs)
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('🔍 DEBUG: Querying with memberCode:', memberCode);
      }

      const { data: lastRaw, error: lastError } = await supabase
        .from('tournament_results')
        .select('event_date, lake, tournament_name, place, weight_lbs, aoy_points, cash_payout')
        .eq('member_id', memberCode)
        .order('event_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('🔍 DEBUG: Query returned (lastTournament):', { lastRaw, lastError, memberCode });
      }

      if (lastError) throw lastError;

      const lastTournament = lastRaw
        ? {
            event_date: lastRaw.event_date,
            lake: lastRaw.lake,
            tournament_name: lastRaw.tournament_name,
            place: lastRaw.place != null ? toNumber(lastRaw.place) : null,
            weight_lbs: toNumber(lastRaw.weight_lbs, 0),
            aoy_points: toNumber(lastRaw.aoy_points, 0),
            payout: normalizePayout(lastRaw.cash_payout ?? lastRaw.payout),
          }
        : null;

      // AOY standing - get current season AOY rank for member (filter by current year)
      const currentYear = new Date().getFullYear();
      const { data: aoyRaws, error: aoyError } = await supabase
        .from('aoy_standings')
        .select('aoy_rank, total_aoy_points, season_year')
        .eq('member_id', memberCode)
        .eq('season_year', currentYear)
        .maybeSingle();
      if (aoyError) throw aoyError;
      const aoyData = aoyRaws
        ? { aoy_rank: aoyRaws.aoy_rank ?? null, total_aoy_points: toNumber(aoyRaws.total_aoy_points, 0) }
        : null;

      // Earnings for current season
      const seasonStartDate = `${currentYear}-01-01`;
      const { data: earningsRows, error: earningsError } = await supabase
        .from('tournament_results')
        .select('cash_payout, payout')
        .eq('member_id', memberCode)
        .gte('event_date', seasonStartDate);
      if (earningsError) throw earningsError;
      const earnings = (earningsRows || []).reduce((sum: number, r: any) => sum + normalizePayout(r.cash_payout ?? r.payout), 0);

      // Next tournament
      const { data: nextRaw, error: nextError } = await supabase
        .from('events_public')
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
        .select('place, weight_lbs, big_fish, cash_payout, payout')
        .eq('member_id', memberCode)
        .gte('event_date', seasonStartDate);
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
        // Count wins (place === 1)
        wins: (statsRows || []).reduce((cnt: number, r: any) => cnt + ((r.place != null && Number(r.place) === 1) ? 1 : 0), 0),
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
    // Run the query function even when eventId is undefined so the hook
    // returns a stable, defined data shape (empty array) instead of
    // leaving `data` undefined when React Query disables the query.
    enabled: true,
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
    // Always enable so callers that pass undefined still receive a defined
    // array result (empty) rather than `data` being undefined.
    enabled: true,
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

// Multi-day aggregation: detect sibling day events (same base name and nearby dates), fetch per-day results and compute combined final
export function useMultiDayTournamentResults(tournamentCode?: string) {
  return useQuery({
    queryKey: ['multi-day-results', tournamentCode || ''],
    queryFn: async () => {
      if (!tournamentCode) return { dayEvents: [], dayResults: {}, combined: [] };

      // fetch base event row: try by tournament_code first, then by event_id
      let eventRow: any = null;
      const { data: byCode } = await supabase
        .from('events_public')
        .select('event_id, tournament_code, tournament_name, event_date, lake')
        .eq('tournament_code', tournamentCode)
        .maybeSingle();
      if (byCode) eventRow = byCode;
      else {
        const { data: byId } = await supabase
          .from('events_public')
          .select('event_id, tournament_code, tournament_name, event_date, lake')
          .eq('event_id', tournamentCode)
          .maybeSingle();
        if (byId) eventRow = byId;
      }

  const baseName = (eventRow?.tournament_name || tournamentCode || '').replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, '').trim();
      const refDate = eventRow?.event_date ? new Date(eventRow.event_date) : new Date();
      const from = new Date(refDate); from.setDate(refDate.getDate() - 3);
      const to = new Date(refDate); to.setDate(refDate.getDate() + 3);

      const { data: siblingEvents } = await supabase
        .from('events_public')
        .select('event_id, tournament_code, tournament_name, event_date, lake')
        .ilike('tournament_name', `%${baseName}%`)
        .gte('event_date', from.toISOString().slice(0,10))
        .lte('event_date', to.toISOString().slice(0,10));

      const dayEvents = (siblingEvents || []).sort((a: any, b: any) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
      const codes = (dayEvents.length ? dayEvents.map((d:any) => d.tournament_code) : [tournamentCode]).filter(Boolean);

      // Fetch results matching any of the discovered tournament_code or event_id values.
      // Build an OR expression covering both fields for each code/id.
      let allRows: any[] | null = null;
      if (codes.length) {
        const orParts: string[] = codes.reduce((acc: string[], c: string) => {
          acc.push(`tournament_code.eq.${c}`);
          acc.push(`event_id.eq.${c}`);
          return acc;
        }, [] as string[]);
        const orExpr = orParts.join(',');
        const { data } = await supabase
          .from('tournament_results')
          .select('*')
          .or(orExpr as string);
        allRows = data;
      } else {
        allRows = [];
      }

      const dayResults: Record<string, any[]> = {};
      codes.forEach((c: string) => dayResults[c] = []);
      (allRows || []).forEach((r: any) => {
        if (!r.tournament_code) return;
        dayResults[r.tournament_code] = dayResults[r.tournament_code] || [];
        dayResults[r.tournament_code].push(r);
      });

      const combinedMap = new Map<string, any>();
      // First-pass: build entries, preferring member_id as key. If member_id missing, we'll try to merge by normalized name.
      (allRows || []).forEach((r: any) => {
        const norm = normalizeName(r.member_name);
        // prefer member_id when present; otherwise use normalized name as temporary key
        let id = r.member_id ? String(r.member_id) : norm || String(r.member_name || '');

        // If a member_id row arrives after a name-only row for the same angler, merge the name-keyed entry into the member_id entry
        if (r.member_id && norm) {
          const memberKey = String(r.member_id);
          const normKey = norm;
          if (combinedMap.has(normKey) && normKey !== memberKey) {
            const normEntry = combinedMap.get(normKey);
            const memberEntry = combinedMap.get(memberKey) || { member_id: r.member_id, member_name: normEntry.member_name || r.member_name, total_weight: 0, total_aoy: 0, total_payout: 0, big_fish: 0, places: [] };
            // merge normEntry into memberEntry
            memberEntry.total_weight += Number(normEntry.total_weight || 0);
            memberEntry.total_aoy += Number(normEntry.total_aoy || 0);
            memberEntry.total_payout += Number(normEntry.total_payout || 0);
            memberEntry.big_fish = Math.max(memberEntry.big_fish || 0, Number(normEntry.big_fish || 0));
            memberEntry.places = Array.from(new Set([...(memberEntry.places || []), ...(normEntry.places || [])]));
            combinedMap.set(memberKey, memberEntry);
            combinedMap.delete(normKey);
          }
          id = memberKey;
        }

        // If we don't have member_id but an existing entry exists for the same normalized name under a different key (for example an entry keyed by member_id), merge into that key
        if (!r.member_id && norm) {
          for (const [k, v] of combinedMap) {
            if (normalizeName(v.member_name) === norm && k !== norm) {
              id = k;
              break;
            }
          }
        }

        const existing = combinedMap.get(id) || { member_id: r.member_id || null, member_name: r.member_name, total_weight: 0, total_aoy: 0, total_payout: 0, big_fish: 0, places: [] };
        // prefer a real member_id when available
        if (!existing.member_id && r.member_id) existing.member_id = r.member_id;
        existing.member_name = existing.member_name || r.member_name;
        existing.total_weight += Number(r.weight_lbs || 0);
        existing.total_aoy += Number(r.aoy_points || 0);
  existing.total_payout += normalizePayout(r.cash_payout ?? r.payout);
        existing.big_fish = Math.max(existing.big_fish, Number(r.big_fish || 0));
        if (r.place != null) existing.places.push(Number(r.place));
        combinedMap.set(id, existing);
      });

      const combined = Array.from(combinedMap.values()).map((v: any) => ({
        ...v,
        best_place: v.places.length ? Math.min(...v.places) : null
      }));

      // sort using the shared helper so tests can reuse same logic
      const { sortCombinedRows } = getMultiDayHelpers();
      sortCombinedRows(combined);

      return { dayEvents, dayResults, combined };
    },
    // Ensure the hook returns a stable structure even when no tournamentCode
    // is provided so callers/tests can rely on defined fields.
    enabled: true,
  });
}

// Exportable helpers for aggregation and sorting so they can be unit tested
export function getMultiDayHelpers() {
  function sortCombinedRows(rows: any[]) {
    rows.sort((a: any, b: any) => {
      if ((b.total_weight || 0) !== (a.total_weight || 0)) return (b.total_weight || 0) - (a.total_weight || 0);
      return (a.best_place || 999) - (b.best_place || 999);
    });
    return rows;
  }

  function aggregateDayRows(allRows: any[]) {
    const combinedMap = new Map<string, any>();
    (allRows || []).forEach((r: any) => {
      const norm = normalizeName(r.member_name);
      
      // Always prefer member_id as the primary key when available
      // If no member_id, use normalized name as fallback
      let finalKey = r.member_id ? String(r.member_id) : (norm || String(r.member_name || ''));
      
      // Check if this person already exists in the map (by matching normalized name)
      if (norm) {
        for (const [existingKey, existingValue] of combinedMap) {
          const existingNorm = normalizeName(existingValue.member_name);
          if (existingNorm === norm) {
            // Found a match! Now decide which key to use
            const existingHasId = existingValue.member_id != null;
            const currentHasId = r.member_id != null;
            
            if (currentHasId) {
              // Current row has member_id - use it as the final key
              if (existingKey !== String(r.member_id)) {
                // Need to migrate: remove old key, we'll re-add with new key below
                const migratedData = combinedMap.get(existingKey)!;
                combinedMap.delete(existingKey);
                finalKey = String(r.member_id);
                // Update the migrated data with member_id
                migratedData.member_id = r.member_id;
                combinedMap.set(finalKey, migratedData);
              } else {
                finalKey = existingKey;
              }
            } else if (existingHasId) {
              // Existing has member_id, current doesn't - use existing key
              finalKey = existingKey;
            } else {
              // Neither has member_id - use whichever key exists
              finalKey = existingKey;
            }
            break;
          }
        }
      }
      
      const existing = combinedMap.get(finalKey) || { member_id: r.member_id || null, member_name: r.member_name, total_weight: 0, total_aoy: 0, total_payout: 0, big_fish: 0, places: [] };
      if (!existing.member_id && r.member_id) existing.member_id = r.member_id;
      existing.member_name = existing.member_name || r.member_name;
      existing.total_weight += Number(r.weight_lbs || 0);
      existing.total_aoy += Number(r.aoy_points || 0);
  existing.total_payout += normalizePayout(r.cash_payout ?? r.payout);
      existing.big_fish = Math.max(existing.big_fish, Number(r.big_fish || 0));
      if (r.place != null) existing.places.push(Number(r.place));
      combinedMap.set(finalKey, existing);
    });
    const combined = Array.from(combinedMap.values()).map((v: any) => ({
      ...v,
      best_place: v.places.length ? Math.min(...v.places) : null
    }));
    sortCombinedRows(combined);
    return combined;
  }

  return { sortCombinedRows, aggregateDayRows };
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
        .select('tournament_code, event_id, member_id')
        .or(orExpr as string);

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
    // Always enabled so callers that pass an empty array still receive a
    // defined object (empty) rather than `data` being undefined.
    enabled: true,
  });
}

// Group multi-day tournaments into single entries (e.g., Norton Day 1 + Day 2 → "Norton 8-2/8-3")
export function useGroupedTournaments() {
  const { data: tournaments = [], isLoading, error, refetch, isRefetching } = useTournaments();
  
  return {
    data: React.useMemo(() => {
      // Group tournaments by base name (strip date from tournament_name)
      const grouped = new Map<string, TournamentEvent[]>();
      
      tournaments.forEach(tournament => {
        // Extract base name by removing date patterns (e.g., "Norton 8-2-25" → "Norton", "Cedar 5-3-25" → "Cedar")
        const baseName = (tournament.tournament_name || '')
          .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, '') // Remove full dates
          .replace(/\b\d{1,2}[-/]\d{1,2}\b/g, '') // Remove month-day patterns
          .trim();
        
        if (!grouped.has(baseName)) {
          grouped.set(baseName, []);
        }
        grouped.get(baseName)!.push(tournament);
      });
      
      // Convert groups to combined entries
      const result: TournamentEvent[] = [];
      
      grouped.forEach((events, baseName) => {
        // Sort by date
        const sortedEvents = events.sort((a, b) => {
          const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
          const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
          return dateA - dateB;
        });
        
        // Check if events are within 3 days of each other (multi-day tournament)
        const isMultiDay = sortedEvents.length > 1 && sortedEvents.every((event, idx) => {
          if (idx === 0) return true;
          const prevDate = new Date(sortedEvents[idx - 1].event_date || '');
          const currDate = new Date(event.event_date || '');
          const diffDays = Math.abs((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 3;
        });
        
        if (isMultiDay) {
          // Create combined entry for multi-day tournament
          const firstEvent = sortedEvents[0];
          const lastEvent = sortedEvents[sortedEvents.length - 1];
          
          // Format date range (e.g., "8-2/8-3" from "2025-08-02" and "2025-08-03")
          const firstDate = firstEvent.event_date ? new Date(firstEvent.event_date) : null;
          const lastDate = lastEvent.event_date ? new Date(lastEvent.event_date) : null;
          
          let dateRange = '';
          if (firstDate && lastDate) {
            const firstMonth = firstDate.getMonth() + 1;
            const firstDay = firstDate.getDate();
            const lastMonth = lastDate.getMonth() + 1;
            const lastDay = lastDate.getDate();
            
            if (firstMonth === lastMonth) {
              dateRange = `${firstMonth}-${firstDay}/${lastDay}`;
            } else {
              dateRange = `${firstMonth}-${firstDay}/${lastMonth}-${lastDay}`;
            }
          }
          
          // Combine tournament names (e.g., "Norton 8-2/8-3")
          const combinedName = dateRange ? `${baseName} ${dateRange}` : baseName;
          
          // Combine tournament codes (use first event's code as primary)
          const combinedCodes = sortedEvents.map(e => e.tournament_code).filter(Boolean).join(',');
          
          result.push({
            ...firstEvent,
            tournament_name: combinedName,
            tournament_code: firstEvent.tournament_code, // Keep first code as primary
            // Store all codes for navigation
            _multiDayCodes: combinedCodes,
            _isMultiDay: true,
            // Use first event's date as the representative date
            event_date: firstEvent.event_date,
          } as any);
        } else {
          // Single-day tournament(s) - add each separately
          result.push(...sortedEvents);
        }
      });
      
      // Sort final result by date
      return result.sort((a, b) => {
        const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
        const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
        return dateB - dateA; // Most recent first
      });
    }, [tournaments]),
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}

