#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

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
    if (c.includes(',') || c.includes('"') || c.includes('\n')) {
      return '"' + c.replace(/"/g, '""') + '"';
    }
    return c;
  }).join(',');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/fix_csv_remove_pk.js <input.csv> <output.csv> [columnName]');
    console.error('Example: node scripts/fix_csv_remove_pk.js ./DBM.csv ./DBM_fixed.csv result_id');
    process.exit(2);
  }

  const input = path.resolve(args[0]);
  const output = path.resolve(args[1]);
  const columnName = args[2] || 'result_id';

  if (!fs.existsSync(input)) {
    console.error('Input file not found:', input);
    process.exit(3);
  }

  const text = fs.readFileSync(input, 'utf8');
  // Normalize line endings then split
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  if (lines.length === 0) {
    console.error('Empty file');
    process.exit(4);
  }

  // Find header (first non-empty line)
  let headerLineIndex = 0;
  while (headerLineIndex < lines.length && lines[headerLineIndex].trim() === '') headerLineIndex++;
  if (headerLineIndex >= lines.length) {
    console.error('No header found');
    process.exit(5);
  }

  const headerCols = parseCsvLine(lines[headerLineIndex]);
  const idx = headerCols.findIndex(h => h.trim().toLowerCase() === columnName.toLowerCase());
  if (idx === -1) {
    console.warn(`Column '${columnName}' not found in header. No changes made.`);
    fs.writeFileSync(output, text, 'utf8');
    console.log('Wrote output (unchanged):', output);
    process.exit(0);
  }

  console.log(`Removing column '${headerCols[idx]}' at index ${idx}`);

  const outLines = [];
  // header
  const newHeader = headerCols.filter((_, i) => i !== idx);
  outLines.push(toCsvLine(newHeader));

  // process remaining lines
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue; // skip empty
    const cols = parseCsvLine(line);
    // If a row has fewer columns than header, pad
    while (cols.length < headerCols.length) cols.push('');
    const newCols = cols.filter((_, j) => j !== idx);
    outLines.push(toCsvLine(newCols));
  }

  fs.writeFileSync(output, outLines.join('\n'), 'utf8');
  console.log('Wrote fixed CSV to', output);
  console.log('You can now import the output CSV into Supabase; the primary key column has been removed so the DB will assign keys.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
