/*
Node script to import day2_norton.csv into Supabase's tournament_results table.
Usage:
  node insert_day2.js --dry
  node insert_day2.js --run

Requirements:
  - Install dependencies: npm install node-fetch csv-parse dotenv
  - Create a .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for --run mode.

This script does a dry-run by default. --run will perform inserts using the service role key.
It upserts rows by a composite key of (tournament_code, member_name, event_date, weight_lbs) to avoid duplicates.
*/

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const parse = require('csv-parse/lib/sync');

const args = process.argv.slice(2);
const runMode = args.includes('--run');
const dryRun = !runMode;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (runMode && (!SUPABASE_URL || !SUPABASE_KEY)) {
  console.error('When running with --run you must set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or the environment.');
  process.exit(1);
}

function loadCsv() {
  const csvPath = path.join(__dirname, '..', 'day2_norton.csv');
  const raw = fs.readFileSync(csvPath, 'utf8');
  const records = parse(raw, { columns: true, skip_empty_lines: true });
  return records;
}

async function upsertRows(rows) {
  // Build the payload for Supabase REST.
  // We will call the insert endpoint with on_conflict for a unique constraint. 
  // Note: The table must have a unique index to honor on_conflict; if not, we'll attempt simple insert and ignore errors.

  const endpoint = `${SUPABASE_URL}/rest/v1/tournament_results`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows.map(r => ({
      tournament_code: r.tournament_code,
      event_date: r.event_date,
      tournament_name: r.tournament_name,
      member_name: r.member_name,
      fish_count: r.fish_count ? Number(r.fish_count) : null,
      weight_lbs: r.weight_lbs ? Number(r.weight_lbs) : null,
      place: r.place ? Number(r.place) : null,
    })))
  });

  const text = await res.text();
  return { status: res.status, text };
}

(async function main() {
  console.log('Loading CSV...');
  const rows = loadCsv();
  console.log(`Loaded ${rows.length} rows.`);

  if (dryRun) {
    console.log('Dry run mode. Preview of first 5 rows:');
    console.log(rows.slice(0,5));
    console.log('To execute inserts, run: node scripts/insert_day2.js --run (with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set)');
    return;
  }

  console.log('Running live insert...');
  try {
    const result = await upsertRows(rows);
    console.log('Supabase response status:', result.status);
    console.log(result.text.slice(0, 2000));
  } catch (err) {
    console.error('Insert failed:', err.message || err);
  }
})();
