/* AOY Audit: recompute Best-4 per season from tournament_results and compare to aoy_standings. */
const { createClient } = require('@supabase/supabase-js');

// --- Arg parsing / flags ---
const args = process.argv.slice(2);
const flags = {};
for (const a of args) {
  if (a.startsWith('--')) {
    const [k, v] = a.replace(/^--/, '').split('=');
    flags[k] = v === undefined ? true : v;
  }
}
const VERBOSE = !!flags.verbose;
const LIMIT_DIFFS = Number(flags['limit-diffs'] ?? 20);
const SEASON = Number(flags.season ?? process.env.AOY_SEASON ?? NaN);

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

function toNumberMaybe(x) {
  if (x == null || x === '') return 0;
  if (typeof x === 'number') return Number.isFinite(x) ? x : 0;
  const cleaned = String(x).replace(/[^0-9.\-]+/g, '');
  const n = cleaned.includes('.') ? parseFloat(cleaned) : parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : 0;
}

(async () => {
  // Load results
  const { data: results, error: resultsError, count: _ } = await supabase
    .from('tournament_results')
    .select('member_id, aoy_points, points, event_date');
  if (resultsError) {
    console.error('Error loading tournament_results:', resultsError.message);
    process.exit(2);
  }

  if (VERBOSE) {
    console.log(`Loaded ${results?.length ?? 0} tournament_results rows`);
  }

  // Build map: { season_year -> { member_id -> [pts...] } }
  const map = new Map();
  for (const r of results || []) {
    const year = seasonYear(r.event_date);
    if (!year) continue;
    if (!Number.isNaN(SEASON) && year !== SEASON) continue; // season filter
    const pts = r.aoy_points != null && r.aoy_points !== ''
      ? toNumberMaybe(r.aoy_points)
      : toNumberMaybe(r.points);
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

  if (VERBOSE) {
    const seasonMsg = Number.isNaN(SEASON) ? 'all seasons' : `season ${SEASON}`;
    console.log(`Recomputed ${recomputed.length} member-season totals for ${seasonMsg}`);
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
  for (const row of aoy || []) {
    if (!Number.isNaN(SEASON) && Number(row.season_year) !== SEASON) continue;
    idx.set(`${row.member_id}|${row.season_year}`, toNumberMaybe(row.total_aoy_points));
  }

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
    const seasonMsg = Number.isNaN(SEASON) ? '' : ` for season ${SEASON}`;
    console.error(`AOY-AUDIT FAILED: ${diffs.length} mismatch(es) detected${seasonMsg} (showing up to ${LIMIT_DIFFS}):`);
    console.table(diffs.slice(0, LIMIT_DIFFS));
    if (VERBOSE) {
      const sample = diffs[0];
      console.error('Sample mismatch detail:', sample);
      // Fetch raw inputs that contributed to recompute for the first mismatch
      try {
        const member = sample.member_id;
        const season = sample.season_year;
        // Filter tournament_results rows to the same season by applying our seasonYear parser in JS
        const related = (results || []).filter((r) => r.member_id === member && seasonYear(r.event_date) === season);
        // Also fetch events' event_date alongside for visibility
        // Note: For simplicity, re-query Supabase for joined info limited to this member
        const { data: joinedRows } = await supabase
          .from('tournament_results')
          .select('member_id, member_name, event_id, event_date, aoy_points, points')
          .eq('member_id', member);
        const joinedMap = new Map();
        for (const jr of joinedRows || []) {
          const k = `${jr.member_id}|${jr.event_id}|${jr.event_date}`;
          joinedMap.set(k, jr);
        }
        const considered = related
          .map((r) => ({
            member_id: r.member_id,
            event_date: r.event_date,
            season_year: seasonYear(r.event_date),
            aoy_points: r.aoy_points,
            points: r.points,
            used_pts: (r.aoy_points != null && r.aoy_points !== '') ? toNumberMaybe(r.aoy_points) : toNumberMaybe(r.points),
          }))
          .sort((a, b) => b.used_pts - a.used_pts);
        console.error('First mismatch raw inputs (top 5 considered points):');
        console.table(considered.slice(0, 5));
      } catch (e) {
        console.error('Failed to print mismatch raw inputs:', e?.message || e);
      }
    }
    process.exit(1);
  } else {
    const seasonMsg = Number.isNaN(SEASON) ? '' : ` for season ${SEASON}`;
    console.log(`AOY-AUDIT OK: no diffs found${seasonMsg}.`);
    process.exit(0);
  }
})();
