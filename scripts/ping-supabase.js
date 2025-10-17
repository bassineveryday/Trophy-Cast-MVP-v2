/* Where Every Cast Counts. */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Set SUPABASE_URL/EXPO_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY/EXPO_PUBLIC_SUPABASE_ANON_KEY env vars first.');
  process.exit(1);
}
const supabase = createClient(url, anon, { auth: { persistSession: false } });

async function check(table, columns = '*') {
  const { data, error } = await supabase.from(table).select(columns).limit(1);
  return { table, ok: !error, error: error?.message || null, sample: data?.[0] || null };
}

(async () => {
  const targets = [
    ['tournament_events', 'event_id, tournament_name, event_date'],
    ['tournament_results', 'result_id, member_id, aoy_points, points, event_date'],
    ['aoy_standings', 'member_id, season_year, aoy_rank, total_aoy_points'],
    ['profiles', 'id, member_code, name'],
  ];
  const results = [];
  for (const [t, cols] of targets) results.push(await check(t, cols));
  console.table(results);
})();
