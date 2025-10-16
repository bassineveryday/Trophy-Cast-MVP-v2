import { getTournamentStatusValue, getTournamentStatusText } from '../components/TournamentStatus';

describe('TournamentStatus helpers', () => {
  const toISODate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();

  it('returns pending when date is missing', () => {
    const { status, daysDiff } = getTournamentStatusValue(undefined);
    expect(status).toBe('pending');
    expect(daysDiff).toBeNull();
    expect(getTournamentStatusText(status, daysDiff)).toBe('Pending');
  });

  it('returns completed for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    const { status, daysDiff } = getTournamentStatusValue(toISODate(past));
    expect(status).toBe('completed');
    expect(daysDiff).toBeLessThan(0);
    expect(getTournamentStatusText(status, daysDiff)).toBe('Completed');
  });

  it('returns Today for same-day', () => {
    const today = new Date();
    const { status, daysDiff } = getTournamentStatusValue(toISODate(today));
    expect(status).toBe('upcoming');
    expect(daysDiff).toBe(0);
    expect(getTournamentStatusText(status, daysDiff)).toBe('Today');
  });

  it('returns upcoming within 7 days', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 5);
    const { status, daysDiff } = getTournamentStatusValue(toISODate(soon));
    expect(status).toBe('upcoming');
    expect(daysDiff).toBeGreaterThanOrEqual(1);
    const text = getTournamentStatusText(status, daysDiff);
    expect(text).toMatch(/day/);
  });

  it('returns scheduled for future beyond a week', () => {
    const future = new Date();
    future.setDate(future.getDate() + 30);
    const { status, daysDiff } = getTournamentStatusValue(toISODate(future));
    expect(status).toBe('scheduled');
    expect(daysDiff).toBeGreaterThan(7);
    expect(getTournamentStatusText(status, daysDiff)).toBe('Scheduled');
  });
});
