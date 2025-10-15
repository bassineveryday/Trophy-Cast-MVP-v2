/**
 * Tests for React Query hooks
 * Ensures proper caching, error handling, and data fetching behavior
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAOYStandings, useTournamentEvents, useAOYStandingsByMember } from '../hooks/useQueries';
import * as supabaseModule from '../lib/supabase';

// Mock the Supabase module
jest.mock('../lib/supabase', () => ({
  fetchAOYStandings: jest.fn(),
  fetchTournamentEvents: jest.fn(),
}));

const mockedSupabase = {
  fetchAOYStandings: supabaseModule.fetchAOYStandings as jest.MockedFunction<typeof supabaseModule.fetchAOYStandings>,
  fetchTournamentEvents: supabaseModule.fetchTournamentEvents as jest.MockedFunction<typeof supabaseModule.fetchTournamentEvents>,
};

// Test wrapper with fresh QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientTestWrapper';
  return Wrapper;
};

describe('useQueries hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAOYStandings', () => {
    it('successfully fetches and returns AOY standings', async () => {
      const mockData = [
        {
          member_id: 'DBM001',
          season_year: 2025,
          aoy_rank: 1,
          member_name: 'John Doe',
          boater_status: 'Boater',
          total_aoy_points: 400,
        },
        {
          member_id: 'DBM019',
          season_year: 2025,
          aoy_rank: 2,
          member_name: 'Tai Hunt',
          boater_status: 'Non-Boater',
          total_aoy_points: 380,
        },
      ];

      mockedSupabase.fetchAOYStandings.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const { result } = renderHook(() => useAOYStandings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(mockedSupabase.fetchAOYStandings).toHaveBeenCalledTimes(1);
    });

    it('handles errors when fetching AOY standings fails', async () => {
      const mockError = new Error('Database connection failed');

      mockedSupabase.fetchAOYStandings.mockResolvedValue({
        data: [],
        error: mockError,
      });

      const { result } = renderHook(() => useAOYStandings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it('provides loading state during fetch', () => {
      mockedSupabase.fetchAOYStandings.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHook(() => useAOYStandings(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useTournamentEvents', () => {
    it('successfully fetches tournament events', async () => {
      const mockEvents = [
        {
          event_id: 'evt-001',
          tournament_code: 'T001',
          tournament_name: 'Spring Classic',
          event_date: '2025-04-15',
          lake: 'Cherry Creek Reservoir',
          participants: 25,
        },
        {
          event_id: 'evt-002',
          tournament_code: 'T002',
          tournament_name: 'Summer Showdown',
          event_date: '2025-06-20',
          lake: 'Chatfield Reservoir',
          participants: 30,
        },
      ];

      mockedSupabase.fetchTournamentEvents.mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const { result } = renderHook(() => useTournamentEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockEvents);
      expect(result.current.error).toBeNull();
    });

    it('handles tournament events fetch errors', async () => {
      const mockError = new Error('Network error');

      mockedSupabase.fetchTournamentEvents.mockResolvedValue({
        data: [],
        error: mockError,
      });

      const { result } = renderHook(() => useTournamentEvents(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('useAOYStandingsByMember', () => {
    const mockStandings = [
      {
        member_id: 'DBM019',
        season_year: 2025,
        aoy_rank: 2,
        member_name: 'Tai Hunt',
        boater_status: 'Non-Boater',
        total_aoy_points: 380,
      },
      {
        member_id: 'DBM001',
        season_year: 2025,
        aoy_rank: 1,
        member_name: 'John Doe',
        boater_status: 'Boater',
        total_aoy_points: 400,
      },
    ];

    it('fetches specific member AOY standing', async () => {
      mockedSupabase.fetchAOYStandings.mockResolvedValue({
        data: mockStandings,
        error: null,
      });

      const { result } = renderHook(() => useAOYStandingsByMember('DBM019'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStandings[0]);
    });

    it('does not run query when memberId is null', () => {
      const { result } = renderHook(() => useAOYStandingsByMember(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(mockedSupabase.fetchAOYStandings).not.toHaveBeenCalled();
    });

    it('handles member not found scenario', async () => {
      mockedSupabase.fetchAOYStandings.mockResolvedValue({
        data: mockStandings,
        error: null,
      });

      const { result } = renderHook(() => useAOYStandingsByMember('DBM999'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain('No AOY standing found for member DBM999');
    });
  });
});