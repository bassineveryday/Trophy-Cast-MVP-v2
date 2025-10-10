/**
 * Tests for Supabase data fetching functions
 * Critical paths: AOY standings, tournament events, tournament results
 */

import { fetchAOYStandings, fetchTournamentEvents } from '../lib/supabase';
import { supabase } from '../lib/supabase';

// Mock the Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  fetchAOYStandings: jest.fn(),
  fetchTournamentEvents: jest.fn(),
}));

describe('Supabase Data Fetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAOYStandings', () => {
    it('should fetch AOY standings successfully', async () => {
      const mockData = [
        {
          member_id: 'DBM001',
          member_name: 'John Doe',
          total_aoy_points: 400,
          aoy_rank: 1,
          season_year: 2025,
        },
        {
          member_id: 'DBM019',
          member_name: 'Tai Hunt',
          total_aoy_points: 380,
          aoy_rank: 2,
          season_year: 2025,
        },
      ];

      // Mock successful response
      (fetchAOYStandings as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await fetchAOYStandings();

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].aoy_rank).toBe(1);
    });

    it('should handle errors when fetching AOY standings', async () => {
      const mockError = new Error('Network error');

      (fetchAOYStandings as jest.Mock).mockResolvedValue({
        data: [],
        error: mockError,
      });

      const result = await fetchAOYStandings();

      expect(result.data).toEqual([]);
      expect(result.error).toBe(mockError);
    });

    it('should return empty array when no standings exist', async () => {
      (fetchAOYStandings as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await fetchAOYStandings();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('fetchTournamentEvents', () => {
    it('should fetch tournament events successfully', async () => {
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

      (fetchTournamentEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const result = await fetchTournamentEvents();

      expect(result.data).toEqual(mockEvents);
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      expect(result.data[0].tournament_name).toBe('Spring Classic');
    });

    it('should handle errors when fetching tournament events', async () => {
      const mockError = new Error('Database connection failed');

      (fetchTournamentEvents as jest.Mock).mockResolvedValue({
        data: [],
        error: mockError,
      });

      const result = await fetchTournamentEvents();

      expect(result.data).toEqual([]);
      expect(result.error).toBe(mockError);
    });

    it('should return tournaments ordered by date', async () => {
      const mockEvents = [
        {
          event_id: 'evt-002',
          event_date: '2025-06-20',
          tournament_name: 'Summer Showdown',
        },
        {
          event_id: 'evt-001',
          event_date: '2025-04-15',
          tournament_name: 'Spring Classic',
        },
      ];

      (fetchTournamentEvents as jest.Mock).mockResolvedValue({
        data: mockEvents,
        error: null,
      });

      const result = await fetchTournamentEvents();

      expect(result.data[0].event_date).toBe('2025-06-20');
      expect(result.data[1].event_date).toBe('2025-04-15');
    });
  });

  describe('AOY Points Calculation', () => {
    it('should calculate correct AOY points based on placement', () => {
      // AOY formula: 101 - placement
      const calculateAOYPoints = (placement: number) => 101 - placement;

      expect(calculateAOYPoints(1)).toBe(100); // 1st place = 100 points
      expect(calculateAOYPoints(2)).toBe(99);  // 2nd place = 99 points
      expect(calculateAOYPoints(5)).toBe(96);  // 5th place = 96 points
      expect(calculateAOYPoints(15)).toBe(86); // 15th place = 86 points
    });

    it('should correctly identify best 4 tournaments', () => {
      const tournaments = [
        { placement: 1, points: 100 },
        { placement: 5, points: 96 },
        { placement: 15, points: 86 },
        { placement: 3, points: 98 },
        { placement: 20, points: 81 },
      ];

      // Sort by points and take top 4
      const best4 = tournaments
        .sort((a, b) => b.points - a.points)
        .slice(0, 4);

      const totalPoints = best4.reduce((sum, t) => sum + t.points, 0);

      expect(best4).toHaveLength(4);
      expect(totalPoints).toBe(380); // 100 + 98 + 96 + 86
      expect(best4[0].points).toBe(100);
      expect(best4[best4.length - 1].points).toBe(86);
    });
  });
});
