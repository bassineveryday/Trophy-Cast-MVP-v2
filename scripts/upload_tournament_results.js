#!/usr/bin/env node
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

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { // escaped quote
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function cleanMoney(val) {
  if (!val) return null;
  const s = String(val).replace(/\$/g, '').replace(/,/g, '').trim();
  if (s === '') return null;
  const f = parseFloat(s);
  return Number.isFinite(f) ? f : null;
}

function toNumberOrNull(val, isFloat = false) {
  if (val == null) return null;
  const s = String(val).trim();
  if (s === '') return null;
  const n = isFloat ? parseFloat(s) : parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/upload_tournament_results.js <input.csv> [batchSize]');
    process.exit(2);
  }

  const inputPath = path.resolve(args[0]);
  const batchSize = parseInt(args[1] || '100', 10);

  if (!fs.existsSync(inputPath)) {
    console.error('Input file not found:', inputPath);
    process.exit(3);
  }

  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('.env.local not found in project root. Please create it with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(4);
  }

  const env = parseEnvFile(envPath);
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(5);
  }

  const text = fs.readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').filter(l => l.trim() !== '');
  if (lines.length === 0) {
    console.error('CSV is empty');
    process.exit(6);
  }

  // header
  const header = parseCsvLine(lines[0]);
  const colIndex = {};
  header.forEach((h, i) => colIndex[h.trim()] = i);

  // ignore primary key if present
  const pkCandidates = ['result_id', 'id'];
  let pkIndex = -1;
  for (const pk of pkCandidates) {
    if (pk in colIndex) { pkIndex = colIndex[pk]; break; }
  }
  if (pkIndex >= 0) {
    console.log('Found primary key column at index', pkIndex, '(', header[pkIndex], '). It will be excluded from upload.');
  } else {
    console.log('No primary key column found (result_id/id). Proceeding without removal.');
  }

  // prepare rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    // pad
    while (cols.length < header.length) cols.push('');
    const obj = {};
    for (let j = 0; j < header.length; j++) {
      if (j === pkIndex) continue; // skip PK
      const key = header[j].trim();
      let val = cols[j] !== undefined ? cols[j] : '';
      // clean common columns
      if (['place','fish_count','aoy_points'].includes(key)) {
        val = toNumberOrNull(val, false);
      } else if (['weight_lbs','big_bass_lbs'].includes(key)) {
        val = toNumberOrNull(val, true);
      } else if (['cash_payout','big_bass_payout','boat_weight_payout'].includes(key)) {
        val = cleanMoney(val);
      } else if (val === '') {
        val = null;
      }
      obj[key] = val;
    }
    rows.push(obj);
  }

  console.log('Prepared', rows.length, 'rows for upload. Uploading in batches of', batchSize);

  const restBase = url.replace(/\/+$/, '') + '/rest/v1/tournament_results';

  // upload in batches
  const fetch = global.fetch || (await import('node-fetch')).default;
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    try {
      const res = await fetch(restBase, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anon,
          'Authorization': `Bearer ${anon}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(batch),
      });
      const text = await res.text();
      if (!res.ok) {
        console.error('Batch upload failed: HTTP', res.status, res.statusText);
        console.error('Response:', text.slice(0, 2000));
        process.exitCode = 1;
        return;
      }
      const data = JSON.parse(text);
      uploaded += data.length;
      console.log(`Uploaded batch ${i/batchSize + 1}: ${data.length} rows (total uploaded: ${uploaded})`);
    } catch (err) {
      console.error('Upload error:', err.message);
      process.exitCode = 1;
      return;
    }
  }

  console.log('Upload complete. Total rows uploaded:', uploaded);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
