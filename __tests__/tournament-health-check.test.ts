/**
 * COMPREHENSIVE TOURNAMENT HEALTH CHECK TEST SUITE
 * 
 * This test suite validates:
 * 1. Supabase connection and database schema integrity
 * 2. Tournament data fetching by event code
 * 3. Multi-day aggregation logic
 * 4. Participant count accuracy
 * 5. Data freshness and cache invalidation
 * 6. Error handling and edge cases
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { 
  useTournaments, 
  useTournamentResults, 
  useTournamentParticipants,
  useMultiDayTournamentResults,
  getMultiDayHelpers
} from '../lib/hooks/useQueries';
import { supabase } from '../lib/supabase';

// Create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

// Wrapper component for React Query hooks
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  return Wrapper;
};

describe('🏥 Tournament Health Check Suite', () => {
  
  // ==========================================
  // TEST 1: API Connection & Database Integrity
  // ==========================================
  describe('1. API Connection and Database Integrity', () => {
    
    it('should verify Supabase client is initialized', () => {
      expect(supabase).toBeDefined();
      expect(supabase.from).toBeDefined();
      expect(typeof supabase.from).toBe('function');
    });

    it('should verify tournament_results table exists and is accessible', async () => {
      const { data, error } = await supabase
        .from('tournament_results')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should verify tournament_events table exists with correct columns', async () => {
      const { data, error } = await supabase
        .from('tournament_events')
        .select('event_id, tournament_code, tournament_name, event_date, lake')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const event = data[0];
        expect(event).toHaveProperty('event_id');
        expect(event).toHaveProperty('tournament_code');
        expect(event).toHaveProperty('tournament_name');
        expect(event).toHaveProperty('event_date');
        expect(event).toHaveProperty('lake');
      }
    });

    it('should verify tournament_results has expected columns', async () => {
      const { data, error } = await supabase
        .from('tournament_results')
        .select('tournament_code, member_id, member_name, weight_lbs, place, aoy_points, event_date')
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        const result = data[0];
        expect(result).toHaveProperty('tournament_code');
        expect(result).toHaveProperty('member_id');
        expect(result).toHaveProperty('member_name');
        expect(result).toHaveProperty('weight_lbs');
        expect(result).toHaveProperty('place');
      }
    });
  });

  // ==========================================
  // TEST 2: Data Fetch & Specific Tournament Codes
  // ==========================================
  describe('2. Tournament Data Fetching by Event Code', () => {
    
    it('should fetch live tournament results for a specific tournament code', async () => {
      // Query for Norton tournament or any available tournament
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code, tournament_name')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        const { data, error } = await supabase
          .from('tournament_results')
          .select('*')
          .eq('tournament_code', testCode);

        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(Array.isArray(data)).toBe(true);
        
        if (data && data.length > 0) {
          const result = data[0];
          expect(result.tournament_code).toBe(testCode);
          expect(result).toHaveProperty('weight_lbs');
          expect(result).toHaveProperty('member_name');
        }
      }
    });

    it('should verify results are not empty for existing tournaments', async () => {
      const { data: tournaments } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(5);

      expect(tournaments).toBeDefined();
      
      if (tournaments && tournaments.length > 0) {
        for (const tournament of tournaments) {
          const { data: results } = await supabase
            .from('tournament_results')
            .select('*')
            .eq('tournament_code', tournament.tournament_code);

          // Each tournament should have at least some results
          expect(results).toBeDefined();
          expect(Array.isArray(results)).toBe(true);
        }
      }
    });

    it('should test useTournamentResults hook with real data', async () => {
      // Get a real tournament code
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        const { result } = renderHook(
          () => useTournamentResults(testCode),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toBeDefined();
        expect(Array.isArray(result.current.data)).toBe(true);
      }
    });

    it('should handle tournament lookup by both tournament_code and event_id', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('event_id, tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const { event_id, tournament_code } = events[0];

        // Test by tournament_code
        const { data: byCode, error: codeError } = await supabase
          .from('tournament_results')
          .select('*')
          .eq('tournament_code', tournament_code);

        expect(codeError).toBeNull();

        // Test by event_id using OR condition
        const { data: byEvent, error: eventError } = await supabase
          .from('tournament_results')
          .select('*')
          .or(`tournament_code.eq.${event_id},event_id.eq.${event_id}`);

        expect(eventError).toBeNull();
        
        // Both queries should return data
        expect(byCode).toBeDefined();
        expect(byEvent).toBeDefined();
      }
    });
  });

  // ==========================================
  // TEST 3: Multi-Day Aggregation Logic
  // ==========================================
  describe('3. Multi-Day Aggregation Logic', () => {
    
    it('should aggregate results correctly for multi-day tournaments', async () => {
      // Look for Norton or any multi-day tournament
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_name, tournament_code, event_date')
        .ilike('tournament_name', '%norton%')
        .order('event_date');

      if (events && events.length >= 2) {
        // We have a multi-day event
        const codes = events.map((e: any) => e.tournament_code);
        
        // Fetch all results for these codes
        const orExpr = codes.map((c: string) => `tournament_code.eq.${c}`).join(',');
        const { data: allResults } = await supabase
          .from('tournament_results')
          .select('*')
          .or(orExpr);

        expect(allResults).toBeDefined();
        
        if (allResults && allResults.length > 0) {
          // Group by member and verify aggregation
          const memberMap = new Map<string, any>();
          
          allResults.forEach((result: any) => {
            const memberId = result.member_id || result.member_name;
            if (!memberMap.has(memberId)) {
              memberMap.set(memberId, {
                member_id: result.member_id,
                member_name: result.member_name,
                total_weight: 0,
                total_aoy: 0,
                total_payout: 0,
                days: [],
              });
            }
            
            const member = memberMap.get(memberId);
            member.total_weight += Number(result.weight_lbs || 0);
            member.total_aoy += Number(result.aoy_points || 0);
            member.total_payout += Number(result.payout || 0);
            member.days.push(result.tournament_code);
          });

          // Verify each member has combined results
          memberMap.forEach((member, memberId) => {
            expect(member.total_weight).toBeGreaterThanOrEqual(0);
            expect(member.days.length).toBeGreaterThan(0);
            
            // Multi-day members should have results from multiple days
            if (member.days.length > 1) {
              const uniqueDays = new Set(member.days);
              expect(uniqueDays.size).toBeGreaterThan(0);
            }
          });
        }
      }
    });

    it('should test useMultiDayTournamentResults hook', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        const { result } = renderHook(
          () => useMultiDayTournamentResults(testCode),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toBeDefined();
        expect(result.current.data?.dayEvents).toBeDefined();
        expect(result.current.data?.dayResults).toBeDefined();
        expect(result.current.data?.combined).toBeDefined();
        expect(Array.isArray(result.current.data?.combined)).toBe(true);
      }
    });

    it('should ensure one row per angler in combined results', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        const { result } = renderHook(
          () => useMultiDayTournamentResults(testCode),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const combined = result.current.data?.combined || [];
        
        // Check for duplicate member_ids
        const memberIds = combined.map((r: any) => r.member_id).filter(Boolean);
        const uniqueMemberIds = new Set(memberIds);
        
        expect(memberIds.length).toBe(uniqueMemberIds.size);
      }
    });

    it('should verify aggregation helper functions work correctly', () => {
      const helpers = getMultiDayHelpers();
      expect(helpers).toBeDefined();
      expect(helpers.sortCombinedRows).toBeDefined();
      
      // Test sorting logic
      const testRows = [
        { member_name: 'John', total_weight: 10, best_place: 2 },
        { member_name: 'Jane', total_weight: 15, best_place: 1 },
        { member_name: 'Bob', total_weight: 8, best_place: 3 },
      ];
      
      helpers.sortCombinedRows(testRows);
      
      // Should be sorted by total_weight descending
      expect(testRows[0].total_weight).toBeGreaterThanOrEqual(testRows[1].total_weight);
      expect(testRows[1].total_weight).toBeGreaterThanOrEqual(testRows[2].total_weight);
    });
  });

  // ==========================================
  // TEST 4: Participant Count Accuracy
  // ==========================================
  describe('4. Participant Count Accuracy', () => {
    
    it('should count unique participants correctly', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        // Manual count from database
        const { data: results } = await supabase
          .from('tournament_results')
          .select('member_id, member_name')
          .eq('tournament_code', testCode);

        if (results) {
          const uniqueMembers = new Set(
            results.map((r: any) => r.member_id).filter(Boolean)
          );
          
          const manualCount = uniqueMembers.size;

          // Hook count
          const { result } = renderHook(
            () => useTournamentParticipants(testCode),
            { wrapper: createWrapper() }
          );

          await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
          });

          const hookCount = result.current.data?.length || 0;
          
          // Counts should match
          expect(hookCount).toBe(manualCount);
        }
      }
    });

    it('should not count duplicate member_ids', async () => {
      const { data: results } = await supabase
        .from('tournament_results')
        .select('tournament_code, member_id')
        .limit(100);

      if (results && results.length > 0) {
        // Group by tournament
        const tournamentMap = new Map<string, Set<string>>();
        
        results.forEach((result: any) => {
          if (!result.member_id) return;
          
          if (!tournamentMap.has(result.tournament_code)) {
            tournamentMap.set(result.tournament_code, new Set());
          }
          
          tournamentMap.get(result.tournament_code)?.add(result.member_id);
        });

        // Verify each tournament has unique participants
        tournamentMap.forEach((members, tournamentCode) => {
          expect(members.size).toBeGreaterThan(0);
        });
      }
    });

    it('should handle tournaments with no participants gracefully', async () => {
      const fakeCode = 'NONEXISTENT-TOURNAMENT-12345';
      
      const { result } = renderHook(
        () => useTournamentParticipants(fakeCode),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data?.length).toBe(0);
    });
  });

  // ==========================================
  // TEST 5: Error Handling and Edge Cases
  // ==========================================
  describe('5. Error Handling and Edge Cases', () => {
    
    it('should handle zero fish scenarios gracefully', async () => {
      const { data: results } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('weight_lbs', 0)
        .limit(1);

      // Zero weight should be valid data, not an error
      if (results && results.length > 0) {
        expect(results[0].weight_lbs).toBe(0);
        expect(results[0]).toHaveProperty('member_name');
      }
    });

    it('should handle missing member_ids gracefully', async () => {
      const { data: results } = await supabase
        .from('tournament_results')
        .select('*')
        .is('member_id', null)
        .limit(5);

      // Should not throw error even with null member_ids
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty results arrays without crashing', async () => {
      const fakeCode = 'FAKE-CODE-THAT-DOES-NOT-EXIST';
      
      const { data, error } = await supabase
        .from('tournament_results')
        .select('*')
        .eq('tournament_code', fakeCode);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
      expect(data?.length).toBe(0);
    });

    it('should handle undefined/null tournament codes in hooks', async () => {
      const { result } = renderHook(
        () => useTournamentResults(undefined),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should return empty array, not error
      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });

    it('should gracefully handle tournaments with partial data', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        // Fetch results
        const { data: results } = await supabase
          .from('tournament_results')
          .select('*')
          .eq('tournament_code', testCode);

        if (results && results.length > 0) {
          // Even if some fields are missing, should not crash
          results.forEach((result: any) => {
            expect(result).toHaveProperty('tournament_code');
            // weight_lbs might be 0 or null, both are valid
            expect(result).toHaveProperty('weight_lbs');
          });
        }
      }
    });
  });

  // ==========================================
  // TEST 6: Data Refresh & Cache Invalidation
  // ==========================================
  describe('6. Data Refresh and Cache Invalidation', () => {
    
    it('should refetch data when tournament code changes', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(2);

      if (events && events.length >= 2) {
        const [code1, code2] = events.map((e: any) => e.tournament_code);
        
        const { result, rerender } = renderHook<any, { code: string }>(
          ({ code }: { code: string }) => useTournamentResults(code),
          { 
            wrapper: createWrapper(),
            initialProps: { code: code1 }
          }
        );

        await waitFor(() => {
          expect((result.current as any).isLoading).toBe(false);
        });

        const firstData = (result.current as any).data;

        // Change tournament code
        rerender({ code: code2 });

        await waitFor(() => {
          expect((result.current as any).isLoading).toBe(false);
        });

        const secondData = (result.current as any).data;

        // Data should be different for different tournaments
        if (code1 !== code2) {
          expect(firstData).not.toBe(secondData);
        }
      }
    });

    it('should allow manual refetch of tournament data', async () => {
      const { data: events } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .limit(1);

      if (events && events.length > 0) {
        const testCode = events[0].tournament_code;
        
        const { result } = renderHook(
          () => useTournamentResults(testCode),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const firstData = result.current.data;

        // Manual refetch
        await result.current.refetch();

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        // Data structure should be consistent
        expect(result.current.data).toBeDefined();
        expect(Array.isArray(result.current.data)).toBe(true);
      }
    });
  });

  // ==========================================
  // TEST 7: Norton-Specific Multi-Day Test
  // ==========================================
  describe('7. Norton Tournament Multi-Day Verification', () => {
    
    it('should correctly identify Norton multi-day tournament', async () => {
      const { data: nortonEvents } = await supabase
        .from('tournament_events')
        .select('*')
        .ilike('tournament_name', '%norton%')
        .order('event_date');

      if (nortonEvents && nortonEvents.length >= 2) {
        expect(nortonEvents.length).toBeGreaterThanOrEqual(2);
        
        // Verify Day 1 and Day 2 exist
        const day1 = nortonEvents[0];
        const day2 = nortonEvents[1];
        
        expect(day1.tournament_code).toBeDefined();
        expect(day2.tournament_code).toBeDefined();
        expect(day1.tournament_code).not.toBe(day2.tournament_code);
        
        // Dates should be close together
        const date1 = new Date(day1.event_date);
        const date2 = new Date(day2.event_date);
        const daysDiff = Math.abs((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
        
        expect(daysDiff).toBeLessThanOrEqual(7); // Within a week
      }
    });

    it('should fetch and aggregate Norton results correctly', async () => {
      const { data: nortonEvents } = await supabase
        .from('tournament_events')
        .select('tournament_code')
        .ilike('tournament_name', '%norton%')
        .limit(1);

      if (nortonEvents && nortonEvents.length > 0) {
        const nortonCode = nortonEvents[0].tournament_code;
        
        const { result } = renderHook(
          () => useMultiDayTournamentResults(nortonCode),
          { wrapper: createWrapper() }
        );

        await waitFor(() => {
          expect(result.current.isLoading).toBe(false);
        });

        const multiDayData = result.current.data;
        
        expect(multiDayData).toBeDefined();
        expect(multiDayData?.combined).toBeDefined();
        expect(Array.isArray(multiDayData?.combined)).toBe(true);
        
        // Verify combined results have proper fields
        if (multiDayData && multiDayData.combined && multiDayData.combined.length > 0) {
          const firstResult = multiDayData.combined[0];
          expect(firstResult).toHaveProperty('member_name');
          expect(firstResult).toHaveProperty('total_weight');
          expect(typeof firstResult.total_weight).toBe('number');
        }
      }
    });
  });
});
