// Runs `node --check` on every project JS file.
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const skip = new Set(['node_modules', '.git', 'data', 'session']);
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (/\.m?js$/.test(e.name)) files.push(p);
  }
})(root);
let bad = 0;
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); }
  catch (err) { bad++; console.error(`✗ ${path.relative(root, f)}\n${String(err.stderr).split('\n').slice(0, 4).join('\n')}`); }
}
console.log(`${files.length - bad}/${files.length} files pass the syntax check`);
process.exit(bad ? 1 : 0);
