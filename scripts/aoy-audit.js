/* AOY Audit: recompute Best-4 per season from tournament_results and compare to aoy_standings. */
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error('Set SUPABASE_URL/EXPO_PUBLIC_SUPABASE_URL and SUPABASE_ANON_KEY/EXPO_PUBLIC_SUPABASE_ANON_KEY env vars first.');
  process.exit(2);
}
const supabase = createClient(url, anon, { auth: { persistSession: false } });

function seasonYear(d) {
  if (!d) return null;
  const m = String(d).trim().match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

(async () => {
  const { data: results, error: resultsError } = await supabase
    .from('tournament_results')
    .select('member_id, aoy_points, points, event_date');
  if (resultsError) {
    console.error('Error loading tournament_results:', resultsError.message);
    process.exit(2);
  }

  // Build map: { season_year -> { member_id -> [pts...] } }
  const map = new Map();
  for (const r of results || []) {
    const year = seasonYear(r.event_date);
    if (!year) continue;
  const pts = (r.aoy_points != null && r.aoy_points !== '') ? parseInt(r.aoy_points, 10) : (typeof r.points === 'number' ? r.points : parseInt(r.points, 10) || 0);
    if (!map.has(year)) map.set(year, new Map());
    const members = map.get(year);
    if (!members.has(r.member_id)) members.set(r.member_id, []);
    members.get(r.member_id).push(pts || 0);
  }

  // Compute best-4 totals
  const recomputed = []; // { member_id, season_year, total }
  for (const [year, members] of map.entries()) {
    for (const [member, arr] of members.entries()) {
      arr.sort((a, b) => b - a);
      const total = (arr.slice(0, 4).reduce((s, x) => s + (x || 0), 0)) || 0;
      recomputed.push({ member_id: member, season_year: year, total });
    }
  }

  // Load aoy_standings
  const { data: aoy, error: aoyError } = await supabase
    .from('aoy_standings')
    .select('member_id, season_year, total_aoy_points');
  if (aoyError) {
    console.error('Error loading aoy_standings:', aoyError.message);
    process.exit(2);
  }

  // Index aoy
  const idx = new Map(); // key: `${member_id}|${year}` -> total
  for (const row of aoy || []) idx.set(`${row.member_id}|${row.season_year}`, Number(row.total_aoy_points) || 0);

  // Compare
  const diffs = [];
  for (const r of recomputed) {
    const key = `${r.member_id}|${r.season_year}`;
    const viewTotal = idx.get(key);
    if (viewTotal == null) continue; // not in view
    if (Number(viewTotal) !== Number(r.total)) {
      diffs.push({ member_id: r.member_id, season_year: r.season_year, viewTotal, recomputed: r.total, diff: Number(viewTotal) - Number(r.total) });
    }
  }

  if (diffs.length) {
    console.error('AOY-AUDIT FAILED: mismatches detected (showing up to 20):');
    console.table(diffs.slice(0, 20));
    process.exit(1);
  } else {
    console.log('AOY-AUDIT OK: no diffs found.');
    process.exit(0);
  }
})();
