#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

function toCsvLine(cols) {
  return cols.map(c => {
    if (c == null) return '';
    const s = String(c);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(',');
}

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (
    c ^ crypto.randomBytes(1)[0] & 15 >> c / 4).toString(16)
  );
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node scripts/fill_pk_csv.js <input.csv> [output.csv] [pkColumnName]');
    process.exit(2);
  }
  const input = path.resolve(args[0]);
  const output = args[1] ? path.resolve(args[1]) : path.resolve(path.dirname(input), path.basename(input, path.extname(input)) + '_with_ids' + path.extname(input));
  const pkName = args[2] || 'result_id';

  if (!fs.existsSync(input)) { console.error('Input not found', input); process.exit(3); }
  const raw = fs.readFileSync(input, 'utf8');
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  let headerIdx = 0; while (headerIdx < lines.length && lines[headerIdx].trim() === '') headerIdx++;
  if (headerIdx >= lines.length) { console.error('No header'); process.exit(4); }
  const header = parseCsvLine(lines[headerIdx]);
  const pkIndex = header.findIndex(h => h.trim().toLowerCase() === pkName.toLowerCase());
  if (pkIndex === -1) {
    console.error('PK column not found in header:', pkName); process.exit(5);
  }

  const seen = new Set();
  const outLines = [];
  outLines.push(toCsvLine(header));

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const ln = lines[i];
    if (!ln || ln.trim() === '') continue;
    const cols = parseCsvLine(ln);
    while (cols.length < header.length) cols.push('');
    let val = cols[pkIndex] ? String(cols[pkIndex]).trim() : '';
    if (!val || seen.has(val)) {
      // generate uuid
      val = uuid();
      cols[pkIndex] = val;
    }
    seen.add(val);
    outLines.push(toCsvLine(cols));
  }

  fs.writeFileSync(output, outLines.join('\n'), 'utf8');
  console.log('Wrote fixed CSV to', output);
}

main().catch(e => { console.error(e); process.exit(1); });
