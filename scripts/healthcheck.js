const fs = require('fs');
const path = require('path');

function parseEnvFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
  return env;
}

async function run() {
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('No .env.local found at', envPath);
    process.exitCode = 2;
    return;
  }

  const env = parseEnvFile(envPath);
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exitCode = 2;
    return;
  }

  const restBase = url.replace(/\/+$/, '') + '/rest/v1';

  const endpoints = [
    { path: '/profiles', name: 'profiles' },
    { path: '/tournament_events', name: 'tournament_events' },
    { path: '/aoy_standings', name: 'aoy_standings' },
  ];

  console.log('Supabase REST base:', restBase);

  for (const e of endpoints) {
    const full = restBase + e.path + '?select=*&limit=1';
    try {
      const res = await fetch(full, { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
      const text = await res.text();
      console.log(`- ${e.name}: HTTP ${res.status} ${res.statusText}`);
      try {
        const data = JSON.parse(text);
        console.log(`  sample length: ${Array.isArray(data) ? data.length : 'non-array'}; sample keys: ${Array.isArray(data) && data[0] ? Object.keys(data[0]).join(',') : 'n/a'}`);
      } catch (err) {
        console.log('  response (non-json):', text.slice(0, 200));
      }
    } catch (err) {
      console.error(`- ${e.name}: request error:`, err.message);
    }
  }

  // Check auth health via /auth/v1/user (requires cookie or jwt) - instead try getting anon project info via /rest/v1
  try {
    const res = await fetch(restBase + '/profiles?select=id&limit=1', { headers: { apikey: anon, Authorization: `Bearer ${anon}` } });
    console.log('Auth check via profiles endpoint status:', res.status);
  } catch (err) {
    console.error('Auth check error:', err.message);
  }
}

run().catch((e) => {
  console.error('Healthcheck failed:', e);
  process.exitCode = 1;
});
