// Plugin (command) loader.
//  - one broken file never stops the others (failures are collected)
//  - duplicate names and conflicting aliases are skipped and reported
//  - metadata is validated
//  - reload builds a fresh registry first and swaps it in, so the bot never
//    runs with an empty command table
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { categoryOverride } from '../menu/categories.js';
import { logger } from '../utils/logger.js';

const NAME_RE = /^[^\s/\\]{1,32}$/;
const SKIP = /\.(test|disabled)\./;

function* walk(dir) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  entries.sort((a, b) => a.name.localeCompare(b.name));
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && e.name.endsWith('.js') && !SKIP.test(e.name)) yield full;
  }
}

export async function scanCommands(rootDir, { bust = false } = {}) {
  const started = Date.now();
  const root = path.resolve(rootDir);
  const commands = new Map(), categories = new Map(), meta = new Map();
  const aliasCandidates = [];
  const report = { loaded: 0, failed: [], duplicates: [], aliasConflicts: [], durationMs: 0 };

  for (const file of walk(root)) {
    const rel = path.relative(root, file);
    const folder = rel.split(path.sep)[0];
    const category = rel.includes(path.sep) ? folder : 'general';
    try {
      const url = pathToFileURL(file).href + (bust ? `?v=${Date.now()}` : '');
      const mod = await import(url);
      const cmd = mod.default || mod;
      if (!cmd || typeof cmd !== 'object' || typeof cmd.name !== 'string') throw new Error('no default export with a "name"');
      if (typeof cmd.execute !== 'function') throw new Error(`"${cmd.name}" has no execute() function`);
      const name = cmd.name.toLowerCase();
      if (!NAME_RE.test(name)) throw new Error(`invalid command name "${cmd.name}"`);
      if (commands.has(name)) { report.duplicates.push({ name, kept: meta.get(name).file, skipped: rel }); continue; }
      const cat = categoryOverride(cmd, category);
      cmd.category = cat;
      commands.set(name, cmd);
      meta.set(name, { file: rel, category: cat, folder: category });
      if (!categories.has(cat)) categories.set(cat, []);
      categories.get(cat).push(cmd.name);
      for (const a of Array.isArray(cmd.alias) ? cmd.alias : []) if (typeof a === 'string' && a.trim()) aliasCandidates.push([a.toLowerCase().trim(), name]);
      report.loaded++;
    } catch (err) {
      report.failed.push({ file: rel, error: String(err.message).split('\n')[0] });
      logger.warn('plugins', `failed to load ${rel}: ${String(err.message).split('\n')[0]}`);
    }
  }

  const aliases = new Map();
  for (const [alias, target] of aliasCandidates) {
    if (commands.has(alias)) { report.aliasConflicts.push({ alias, command: target, reason: 'same as a command name' }); continue; }
    if (aliases.has(alias) && aliases.get(alias) !== target) { report.aliasConflicts.push({ alias, command: target, reason: `already used by ${aliases.get(alias)}` }); continue; }
    aliases.set(alias, target);
  }
  report.durationMs = Date.now() - started;
  return { commands, aliases, categories, meta, report };
}

// Loads into the live maps used by index.js (kept by reference).
export async function loadInto(target, rootDir, opts = {}) {
  const next = await scanCommands(rootDir, opts);
  if (!next.report.loaded) throw new Error('No commands could be loaded — keeping the current set.');
  for (const key of ['commands', 'aliases', 'categories', 'meta']) {
    target[key].clear();
    for (const [k, v] of next[key]) target[key].set(k, v);
  }
  target.report = next.report;
  return next.report;
}
