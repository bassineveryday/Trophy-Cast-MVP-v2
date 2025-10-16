import React from 'react';
import { render } from '@testing-library/react-native';
import HeroBanner from '../components/HeroBanner';
import * as AuthContext from '../lib/AuthContext';
import * as useQueries from '../lib/hooks/useQueries';

// Minimal mock profile
const baseProfile = {
  id: 'id',
  member_code: 'DBM019',
  name: 'Tai Hunt',
  hometown: 'Denver, CO',
  created_at: new Date().toISOString(),
};

describe('HeroBanner', () => {
  beforeEach(() => {
    jest.spyOn(useQueries, 'useAOYStandings').mockReturnValue({ data: null } as any);
    jest.spyOn(useQueries, 'useDashboard').mockReturnValue({ data: null } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders initials when no avatar_url and uses image when provided', () => {
    // No avatar: expect initials
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ profile: baseProfile } as any);
    const { rerender, getByLabelText } = render(<HeroBanner />);
    expect(getByLabelText('Avatar initials TH')).toBeTruthy();

    // With avatar: expect image to be present
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ profile: { ...baseProfile, avatar_url: 'https://example.com/a.png' } } as any);
    rerender(<HeroBanner />);
    expect(getByLabelText('Profile avatar image')).toBeTruthy();
  });

  it('renders tagline text when provided', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ profile: baseProfile } as any);
    const { getByTestId } = render(<HeroBanner tagline="Tight lines!" />);
    expect(getByTestId('hero.tagline').props.children).toBe('Tight lines!');
  });

  it('shows countdown for today/future and hides for past', () => {
    jest.spyOn(AuthContext, 'useAuth').mockReturnValue({ profile: baseProfile } as any);

    const todayISO = new Date();
    todayISO.setHours(0, 0, 0, 0);
    const toISO = (d: Date) => new Date(d).toISOString();

    const dashWithDate = (iso: string) => ({ data: { nextTournament: { event_date: iso, lake: 'Cherry Creek' }, seasonStats: {}, aoyData: {} } });

    // Past event: countdown hidden
    jest.spyOn(useQueries, 'useDashboard').mockReturnValueOnce(dashWithDate(toISO(new Date(todayISO.getTime() - 86400000))) as any);
  const { rerender, queryByLabelText, getByLabelText, getByText } = render(<HeroBanner />);
  expect(queryByLabelText(/Next tournament/)).toBeNull();

    // Today: shows "Today"
    jest.spyOn(useQueries, 'useDashboard').mockReturnValueOnce(dashWithDate(toISO(todayISO)) as any);
  rerender(<HeroBanner />);
  expect(getByLabelText(/Next tournament/)).toBeTruthy();
  expect(getByText(/Today/)).toBeTruthy();

    // Future: shows "In N days"
    jest.spyOn(useQueries, 'useDashboard').mockReturnValueOnce(dashWithDate(toISO(new Date(todayISO.getTime() + 3 * 86400000))) as any);
    rerender(<HeroBanner />);
    expect(getByText(/In 3 days/)).toBeTruthy();
  });
});
