/* Where Every Cast Counts. */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const includeExt = new Set(['.ts', '.tsx', '.js', '.jsx']);
const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.turbo', '.next', 'out', 'coverage', '.vscode', 'android', 'ios']);

const usedTables = new Set();
const sqlTables = new Set();

const fromRe = /supabase\.from\(\s*['"]([a-z0-9_]+)['"]\s*\)/gi;
const sqlFromJoinRe = /\b(from|join)\s+["']?([a-z0-9_\.]+)["']?/gi;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoreDirs.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else {
      const ext = path.extname(entry.name);
      if (!includeExt.has(ext)) continue;
      const file = path.join(dir, entry.name);
      let content = '';
      try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
      let m;
      while ((m = fromRe.exec(content)) !== null) usedTables.add(m[1]);
      while ((m = sqlFromJoinRe.exec(content)) !== null) {
        const tbl = m[2]?.replace(/^[a-z0-9_]+\./i, '');
        if (tbl) sqlTables.add(tbl);
      }
    }
  }
}

walk(root);

const all = new Set([...usedTables, ...sqlTables]);
console.log('Tables referenced via supabase.from():');
console.log([...usedTables].sort().join('\n') || '(none)');
console.log('\nTables referenced in raw SQL (from/join):');
console.log([...sqlTables].sort().join('\n') || '(none)');
console.log('\nALL referenced tables:');
console.log([...all].sort().join('\n') || '(none)');
