#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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

function toJsonRow(headerCols, cols) {
  const obj = {};
  for (let i = 0; i < headerCols.length; i++) {
    const key = headerCols[i];
    const val = typeof cols[i] === 'undefined' ? '' : cols[i];
    const n = String(val).replace(/\$/g, '').replace(/,/g, '').trim();
    if (n !== '' && !isNaN(Number(n))) {
      obj[key] = Number(n);
    } else if (val === '') {
      obj[key] = null;
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

async function uploadBatch(url, anon, table, rows) {
  const endpoint = `${url.replace(/\/+$/, '')}/rest/v1/${table}`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  const data = await res.json();
  return data;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/upload_include_pk.js <input.csv> [batchSize] [table]');
    process.exit(2);
  }
  const input = path.resolve(args[0]);
  const batchSize = Number(args[1] || 100);
  const table = args[2] || 'tournament_results';

  if (!fs.existsSync(input)) { console.error('Input not found', input); process.exit(3); }
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) { console.error('.env.local not found'); process.exit(4); }
  const env = parseEnvFile(envPath);
  const url = env.EXPO_PUBLIC_SUPABASE_URL;
  const anon = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) { console.error('Missing env vars'); process.exit(5); }

  const raw = fs.readFileSync(input, 'utf8');
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let headerIdx = 0; while (headerIdx < lines.length && lines[headerIdx].trim() === '') headerIdx++;
  if (headerIdx >= lines.length) { console.error('No header'); process.exit(6); }
  const header = parseCsvLine(lines[headerIdx]);

  const rows = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln || ln.trim() === '') continue;
    const cols = parseCsvLine(ln);
    while (cols.length < header.length) cols.push('');
    const json = toJsonRow(header, cols);
    rows.push(json);
  }

  console.log(`Prepared ${rows.length} rows. Uploading in batches of ${batchSize}...`);
  let uploaded = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    console.log(`Uploading batch ${Math.floor(i/batchSize)+1} (${batch.length} rows)...`);
    try {
      const res = await uploadBatch(url, anon, table, batch);
      uploaded += Array.isArray(res) ? res.length : 0;
      console.log(`Batch OK: ${Array.isArray(res) ? res.length : 0}`);
    } catch (err) {
      console.error('Batch failed:', err.message);
      const dbg = path.resolve(path.dirname(input), `failed_batch_${Math.floor(i/batchSize)+1}.json`);
      fs.writeFileSync(dbg, JSON.stringify(batch, null, 2), 'utf8');
      console.error('Wrote failed batch to', dbg);
      process.exit(7);
    }
  }
  console.log(`Upload complete: ${uploaded} rows uploaded to ${table}`);
}

main().catch(e => { console.error(e); process.exit(1); });
