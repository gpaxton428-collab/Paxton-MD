import fs from 'fs'; import path from 'path'; import { builtinModules } from 'module';
// Usage: node scripts/audit-imports.mjs [dir]  — exits 1 on missing files or undeclared packages.
const root = process.argv[2] || '.';
const pkg = JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const deps = new Set([...Object.keys(pkg.dependencies||{}), ...Object.keys(pkg.optionalDependencies||{})]);
const builtins = new Set([...builtinModules.flatMap(m=>[m,'node:'+m]), 'node:test', 'node:sqlite']);
function walk(d, out=[]) { for (const e of fs.readdirSync(d,{withFileTypes:true})) { if (['node_modules','.git'].includes(e.name)) continue; const p=path.join(d,e.name); e.isDirectory()?walk(p,out):/\.(m?js)$/.test(e.name)&&out.push(p);} return out; }
const files = walk(root);
const bare = new Map(), rel = [];
const re = /(?:import\s+(?:[^'"]*?from\s+)?|import\(\s*|export\s+[^'"]*?from\s+)['"]([^'"]+)['"]/g;
for (const f of files) {
  const src = fs.readFileSync(f,'utf8');
  let m; while ((m = re.exec(src))) {
    const s = m[1];
    if (s.startsWith('.')) { const t = path.resolve(path.dirname(f), s); if (!fs.existsSync(t)) rel.push(`${f} -> ${s}`); }
    else if (!s.startsWith('file:')) { const name = s.startsWith('@') ? s.split('/').slice(0,2).join('/') : s.split('/')[0]; if (!builtins.has(s) && !builtins.has(name)) { if(!bare.has(name)) bare.set(name,[]); bare.get(name).push(f);} }
  }
}
console.log('files scanned:', files.length);
console.log('\nMISSING RELATIVE IMPORTS:', rel.length ? '\n'+rel.join('\n') : 'none');
const undeclared = [...bare.keys()].filter(n=>!deps.has(n));
console.log('\nUNDECLARED PACKAGES:', undeclared.length ? undeclared.map(n=>`${n} <- ${[...new Set(bare.get(n))].slice(0,3).join(', ')}`).join('\n') : 'none');
const unused = [...deps].filter(n=>!bare.has(n));
console.log('\nDECLARED BUT UNIMPORTED:', unused.join(', ')||'none');
process.exit(rel.length || undeclared.length ? 1 : 0);
