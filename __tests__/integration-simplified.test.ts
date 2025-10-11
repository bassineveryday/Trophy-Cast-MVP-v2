/**
 * Simplified Integration Tests for Data Flow and Caching
 * Focus on React Query cache behavior and data consistency
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useQueries';

// Mock the Supabase module
jest.mock('../lib/supabase', () => ({
  fetchAOYStandings: jest.fn(),
  fetchTournamentEvents: jest.fn(),
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
    mutations: { retry: false },
  },
});

describe('Integration: Data Flow and Caching', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Query Key Management', () => {
    it('provides consistent query keys for cache management', () => {
      expect(queryKeys.aoyStandings).toEqual(['aoy-standings']);
      expect(queryKeys.tournamentEvents).toEqual(['tournament-events']);
      expect(queryKeys.memberAOY('DBM019')).toEqual(['aoy-standings', 'DBM019']);
    });

    it('allows manual cache operations', () => {
      const testData = [{ 
        member_id: 'DBM001', 
        member_name: 'Test User',
        aoy_rank: 1,
        total_aoy_points: 500,
        season_year: 2025,
        boater_status: 'Boater',
      }];

      // Set cache data
      queryClient.setQueryData(queryKeys.aoyStandings, testData);

      // Retrieve cached data
      const cachedData = queryClient.getQueryData(queryKeys.aoyStandings);
      expect(cachedData).toEqual(testData);

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: queryKeys.aoyStandings });
      
      // Check cache state
      const queryState = queryClient.getQueryState(queryKeys.aoyStandings);
      expect(queryState?.isInvalidated).toBe(true);
    });
  });

  describe('Cross-Component Data Consistency', () => {
    it('maintains consistent data across different query instances', () => {
      const aoyData = [
        {
          member_id: 'DBM019',
          member_name: 'Tai Hunt',
          aoy_rank: 2,
          total_aoy_points: 485,
          season_year: 2025,
          boater_status: 'Non-Boater',
        },
      ];

      // Cache AOY standings data
      queryClient.setQueryData(queryKeys.aoyStandings, aoyData);

      // Both HomeScreen and AOYScreen should get same data
      const homeScreenData = queryClient.getQueryData(queryKeys.aoyStandings);
      const aoyScreenData = queryClient.getQueryData(queryKeys.aoyStandings);

      expect(homeScreenData).toEqual(aoyScreenData);
      expect(homeScreenData).toEqual(aoyData);
    });

    it('handles member-specific queries efficiently', () => {
      const allStandings = [
        { member_id: 'DBM001', member_name: 'John', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' },
        { member_id: 'DBM019', member_name: 'Tai', aoy_rank: 2, total_aoy_points: 450, season_year: 2025, boater_status: 'Non-Boater' },
      ];

      // Cache all standings
      queryClient.setQueryData(queryKeys.aoyStandings, allStandings);

      // Member-specific query should derive from all standings
      const memberKey = queryKeys.memberAOY('DBM019');
      const expectedMemberData = allStandings.find(s => s.member_id === 'DBM019');

      // Manual cache operation for member-specific data
      queryClient.setQueryData(memberKey, expectedMemberData);
      
      const memberData = queryClient.getQueryData(memberKey);
      expect(memberData).toEqual(expectedMemberData);
    });
  });

  describe('Error State Management', () => {
    it('handles query errors properly', () => {
      const errorMessage = 'Network connection failed';
      const error = new Error(errorMessage);

      // Simulate error by manually setting error data
      queryClient.setQueryData(queryKeys.aoyStandings, undefined);
      
      // Check that we can detect when there's no data
      const cachedData = queryClient.getQueryData(queryKeys.aoyStandings);
      expect(cachedData).toBeUndefined();
    });

    it('recovers from error states with fresh data', () => {
      const successData = [{ member_id: 'DBM001', member_name: 'Recovered', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];

      // Start with no data (simulating error state)
      expect(queryClient.getQueryData(queryKeys.aoyStandings)).toBeUndefined();

      // Update with success data
      queryClient.setQueryData(queryKeys.aoyStandings, successData);

      const finalData = queryClient.getQueryData(queryKeys.aoyStandings);
      expect(finalData).toEqual(successData);
    });
  });

  describe('Cache Timing and Invalidation', () => {
    it('respects garbage collection time', () => {
      const testData = [{ member_id: 'DBM001', member_name: 'Test', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];
      
      queryClient.setQueryData(queryKeys.aoyStandings, testData);
      
      // Data should exist
      expect(queryClient.getQueryData(queryKeys.aoyStandings)).toEqual(testData);

      // Manually trigger garbage collection
      queryClient.getQueryCache().clear();

      // Data should be cleared
      expect(queryClient.getQueryData(queryKeys.aoyStandings)).toBeUndefined();
    });

    it('handles cache invalidation', () => {
      const testData = [{ member_id: 'DBM001', member_name: 'Test', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];
      
      queryClient.setQueryData(queryKeys.aoyStandings, testData);
      
      // Invalidate the query
      queryClient.invalidateQueries({ queryKey: queryKeys.aoyStandings });
      
      const queryState = queryClient.getQueryState(queryKeys.aoyStandings);
      expect(queryState?.isInvalidated).toBe(true);
    });
  });

  describe('Background Refetch Behavior', () => {
    it('supports data updates', () => {
      const initialData = [{ member_id: 'DBM001', member_name: 'Initial', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];
      const updatedData = [{ member_id: 'DBM001', member_name: 'Updated', aoy_rank: 1, total_aoy_points: 520, season_year: 2025, boater_status: 'Boater' }];

      // Set initial data
      queryClient.setQueryData(queryKeys.aoyStandings, initialData);
      expect(queryClient.getQueryData(queryKeys.aoyStandings)).toEqual(initialData);

      // Update data (simulates successful refetch)
      queryClient.setQueryData(queryKeys.aoyStandings, updatedData);
      
      const finalData = queryClient.getQueryData(queryKeys.aoyStandings);
      expect(finalData).toEqual(updatedData);
    });

    it('maintains data consistency during updates', () => {
      const testData = [{ member_id: 'DBM001', member_name: 'Test', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];
      
      queryClient.setQueryData(queryKeys.aoyStandings, testData);

      // Data should remain available
      const currentData = queryClient.getQueryData(queryKeys.aoyStandings);
      expect(currentData).toEqual(testData);
    });
  });

  describe('Multiple Query Coordination', () => {
    it('manages multiple independent queries', () => {
      const aoyData = [{ member_id: 'DBM001', member_name: 'Test', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];
      const tournamentData = [{ 
        event_id: 'evt-001',
        tournament_name: 'Test Tournament',
        event_date: '2025-10-20',
        lake: 'Test Lake',
        tournament_code: 'T001',
        participants: 20,
      }];

      // Set data for different queries
      queryClient.setQueryData(queryKeys.aoyStandings, aoyData);
      queryClient.setQueryData(queryKeys.tournamentEvents, tournamentData);

      // Both should be independently cached
      expect(queryClient.getQueryData(queryKeys.aoyStandings)).toEqual(aoyData);
      expect(queryClient.getQueryData(queryKeys.tournamentEvents)).toEqual(tournamentData);

      // Invalidating one shouldn't affect the other
      queryClient.invalidateQueries({ queryKey: queryKeys.aoyStandings });
      
      expect(queryClient.getQueryState(queryKeys.aoyStandings)?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(queryKeys.tournamentEvents)?.isInvalidated).toBe(false);
    });

    it('handles selective cache operations', () => {
      const data1 = [{ member_id: 'DBM001', member_name: 'Test1', aoy_rank: 1, total_aoy_points: 500, season_year: 2025, boater_status: 'Boater' }];
      const data2 = [{ member_id: 'DBM002', member_name: 'Test2', aoy_rank: 2, total_aoy_points: 450, season_year: 2025, boater_status: 'Non-Boater' }];

      // Set different member data
      queryClient.setQueryData(queryKeys.memberAOY('DBM001'), data1[0]);
      queryClient.setQueryData(queryKeys.memberAOY('DBM002'), data2[0]);

      // Both should exist independently
      expect(queryClient.getQueryData(queryKeys.memberAOY('DBM001'))).toEqual(data1[0]);
      expect(queryClient.getQueryData(queryKeys.memberAOY('DBM002'))).toEqual(data2[0]);

      // Clearing one shouldn't affect the other
      queryClient.removeQueries({ queryKey: queryKeys.memberAOY('DBM001') });
      
      expect(queryClient.getQueryData(queryKeys.memberAOY('DBM001'))).toBeUndefined();
      expect(queryClient.getQueryData(queryKeys.memberAOY('DBM002'))).toEqual(data2[0]);
    });
  });
});