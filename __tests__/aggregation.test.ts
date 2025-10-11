import { getMultiDayHelpers } from '../lib/hooks/useQueries';

describe('multi-day aggregation helpers', () => {
  const { aggregateDayRows, sortCombinedRows } = getMultiDayHelpers();

  test('aggregateDayRows sums weights and computes best place', () => {
    const rows = [
      { member_id: 'm1', member_name: 'Alice', weight_lbs: 5.5, aoy_points: 10, place: 2 },
      { member_id: 'm1', member_name: 'Alice', weight_lbs: 3.25, aoy_points: 5, place: 3 },
      { member_id: 'm2', member_name: 'Bob', weight_lbs: 8.0, aoy_points: 20, place: 1 },
    ];

    const combined = aggregateDayRows(rows);
    // Should have two combined rows
    expect(combined.length).toBe(2);
    const alice = combined.find((r: any) => r.member_id === 'm1');
    const bob = combined.find((r: any) => r.member_id === 'm2');
    expect(alice).toBeDefined();
    expect(Math.abs(alice.total_weight - 8.75)).toBeLessThan(0.0001);
    expect(alice.best_place).toBe(2);
    expect(bob.best_place).toBe(1);
  });

  test('sortCombinedRows orders by total_weight then best_place', () => {
    const rows = [
      { member_id: 'a', total_weight: 10, best_place: 2 },
      { member_id: 'b', total_weight: 12, best_place: 5 },
      { member_id: 'c', total_weight: 10, best_place: 1 },
    ];
    sortCombinedRows(rows);
    expect(rows[0].member_id).toBe('b'); // highest weight
    // between a and c (both weight 10), c best_place 1 should come before a
    expect(rows[1].member_id).toBe('c');
    expect(rows[2].member_id).toBe('a');
  });
});
