// Quick check script that runs a few selects the client uses to ensure PostgREST doesn't return 400s
// Usage: node scripts/client_query_check.js
// Load local env file so this script targets the same Supabase project as the app
try { require('dotenv').config({ path: '.env.local' }); } catch (e) { /* ignore if dotenv missing */ }

// Create a small Supabase client directly so this script runs under Node without importing TS modules
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in environment');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

async function run() {
  console.log('Using Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

  try {
    console.log('\n1) tournament_results (cash_payout + payout)');
    const { data: t1, error: e1 } = await supabase
      .from('tournament_results')
      .select('event_date, lake, tournament_name, place, weight_lbs, aoy_points, cash_payout, payout')
      .order('event_date', { ascending: false })
      .limit(1);
    if (e1) console.error('Error:', e1);
    else console.log('Success - rows:', (t1 && t1.length) ? t1.length : 0, t1 && t1[0] ? Object.keys(t1[0]) : 'no-row');

    console.log('\n2) tournament_results (payout only)');
    const { data: t2, error: e2 } = await supabase
      .from('tournament_results')
      .select('payout')
      .limit(1);
    if (e2) console.error('Error:', e2);
    else console.log('Success - rows:', (t2 && t2.length) ? t2.length : 0, t2 && t2[0] ? Object.keys(t2[0]) : 'no-row');

    console.log('\n3) tournament_events (basic)');
    const { data: ev, error: evErr } = await supabase
      .from('tournament_events')
      .select('event_id, tournament_code, tournament_name, event_date, lake')
      .limit(3);
    if (evErr) console.error('Error:', evErr);
    else console.log('Success - rows:', (ev && ev.length) ? ev.length : 0);

    console.log('\n4) AOY standings (sample)');
    const { data: aoy, error: aoyErr } = await supabase
      .from('aoy_standings')
      .select('*')
      .limit(1);
    if (aoyErr) console.error('Error:', aoyErr);
    else console.log('Success - rows:', (aoy && aoy.length) ? aoy.length : 0);

    console.log('\nAll checks complete.');
  } catch (err) {
    console.error('Unhandled error:', err);
  }
}

run();
