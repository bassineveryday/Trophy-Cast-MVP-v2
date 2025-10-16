import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Basic navigation/route mock
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => ({ params: { tournamentId: 'evt-123' } }),
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('TournamentDetailScreen', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders overview by default and allows switching tabs', async () => {
    // Base mocks: no multi-day data
    jest.doMock('../lib/hooks/useQueries', () => {
      const original = jest.requireActual('../lib/hooks/useQueries');
      return {
        __esModule: true,
        ...original,
        useTournaments: () => ({ data: [{ event_id: 'evt-123', tournament_code: 'TC-123', tournament_name: 'Test Derby', event_date: '2025-09-13', lake: 'Norton' }], refetch: jest.fn() }),
        useTournamentResults: () => ({ data: [], isLoading: false, error: null, refetch: jest.fn() }),
        useTournamentParticipants: () => ({ data: [], isLoading: false, error: null, refetch: jest.fn() }),
        useMultiDayTournamentResults: () => ({ data: { dayEvents: [], dayResults: {}, combined: [] }, isLoading: false }),
      };
    });

    const TournamentDetailScreen = require('../screens/TournamentDetailScreen').default;
    const { getByText } = render(<TournamentDetailScreen />);

    // Overview content
    expect(getByText('Tournament Details')).toBeTruthy();

    // Switch to participants
    fireEvent.press(getByText('Participants'));
    expect(getByText('Participants')).toBeTruthy();

    // Switch to results
    fireEvent.press(getByText('Results'));
    expect(getByText('Results')).toBeTruthy();
  });

  it('shows multi-day tabs and renders Day 2 with movement and Final with combined headers', async () => {
    jest.doMock('../lib/hooks/useQueries', () => {
      const original = jest.requireActual('../lib/hooks/useQueries');
      return {
        __esModule: true,
        ...original,
        useTournaments: () => ({ data: [{ event_id: 'evt-123', tournament_code: 'TC-123', tournament_name: 'Test Derby', event_date: '2025-09-13', lake: 'Norton' }], refetch: jest.fn() }),
        useTournamentResults: () => ({ data: [], isLoading: false, error: null, refetch: jest.fn() }),
        useTournamentParticipants: () => ({ data: [], isLoading: false, error: null, refetch: jest.fn() }),
        useMultiDayTournamentResults: () => ({
          data: {
            dayEvents: [
              { tournament_code: 'TC-123-D1', event_date: '2025-09-13' },
              { tournament_code: 'TC-123-D2', event_date: '2025-09-14' },
            ],
            dayResults: {
              'TC-123-D1': [
                { id: 'r1', member_id: 'M1', member_name: 'Alice', weight_lbs: '10.5', fish_count: 3, place: 1 },
                { id: 'r2', member_id: 'M2', member_name: 'Bob', weight_lbs: '8.25', fish_count: 2, place: 2 },
              ],
              'TC-123-D2': [
                { id: 'r3', member_id: 'M2', member_name: 'Bob', weight_lbs: '9.0', fish_count: 3, place: 1 },
                { id: 'r4', member_id: 'M1', member_name: 'Alice', weight_lbs: '7.75', fish_count: 2, place: 2 },
              ],
            },
            combined: [],
          },
          isLoading: false,
        }),
      };
    });

    const TournamentDetailScreen = require('../screens/TournamentDetailScreen').default;
    const { getByText, queryByText } = render(<TournamentDetailScreen />);

    // Navigate to Results
    fireEvent.press(getByText('Results'));

    // Tabs should be present
    await waitFor(() => {
      expect(getByText('Day 1')).toBeTruthy();
      expect(getByText('Day 2')).toBeTruthy();
      expect(getByText('Final')).toBeTruthy();
    });

    // Switch to Day 2 and expect movement header
    fireEvent.press(getByText('Day 2'));
    expect(getByText('Move')).toBeTruthy();

    // Switch to Final and expect combined headers
    fireEvent.press(getByText('Final'));
    expect(getByText('Total Wt')).toBeTruthy();
    expect(getByText('AOY')).toBeTruthy();

    // Move header should not be in Final view
    expect(queryByText('Move')).toBeNull();
  });
});
