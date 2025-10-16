import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TournamentDetailScreen from '../screens/TournamentDetailScreen';

// Basic navigation/route mock
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => ({ params: { tournamentId: 'evt-123' } }),
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

// Mock hooks used by the screen to provide deterministic data
jest.mock('../lib/hooks/useQueries', () => {
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

describe('TournamentDetailScreen', () => {
  it('renders overview by default and allows switching tabs', () => {
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
});
