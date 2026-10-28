// Per-user economy/XP store. One JSON file, keyed by WhatsApp JID,
// written atomically (see lib/utils/jsonStore.js) so a crash mid-save
// can't corrupt everyone's balance. In-memory cache mirrors the file
// so reads don't hit disk on every message.
import fs from 'fs';
import path from 'path';
import { ROOT_DIR } from '../config/index.js';
import { writeJsonSync } from './utils/jsonStore.js';

const FILE = path.join(ROOT_DIR, 'data', 'economy.json');
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const WORK_COOLDOWN_MS = 60 * 60 * 1000;

let cache = null;
function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch {
    cache = {};
  }
  return cache;
}
function save() { writeJsonSync(FILE, cache); }

function xpForLevel(level) { return 100 * level * level; } // 100, 400, 900, 1600...
function levelForXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function getUser(jid) {
  const db = load();
  if (!db[jid]) db[jid] = { coins: 0, xp: 0, lastDaily: 0, lastWork: 0 };
  return db[jid];
}

export function addCoins(jid, amount) {
  const user = getUser(jid);
  user.coins = Math.max(0, user.coins + amount);
  save();
  return user.coins;
}

export function addXp(jid, amount) {
  const user = getUser(jid);
  const before = levelForXp(user.xp);
  user.xp += amount;
  const after = levelForXp(user.xp);
  save();
  return { xp: user.xp, level: after, leveledUp: after > before };
}

export function getLevel(jid) { return levelForXp(getUser(jid).xp); }
export function xpProgress(jid) {
  const { xp } = getUser(jid);
  const level = levelForXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  return { level, xp, into: xp - floor, need: ceil - floor };
}

export function claimDaily(jid) {
  const user = getUser(jid);
  const now = Date.now();
  const remaining = user.lastDaily + DAILY_COOLDOWN_MS - now;
  if (remaining > 0) return { ok: false, remaining };
  const reward = 100 + Math.floor(Math.random() * 150);
  user.coins += reward;
  user.lastDaily = now;
  save();
  return { ok: true, reward, coins: user.coins };
}

export function claimWork(jid) {
  const user = getUser(jid);
  const now = Date.now();
  const remaining = user.lastWork + WORK_COOLDOWN_MS - now;
  if (remaining > 0) return { ok: false, remaining };
  const reward = 20 + Math.floor(Math.random() * 60);
  user.coins += reward;
  user.lastWork = now;
  save();
  return { ok: true, reward, coins: user.coins };
}

export function transfer(fromJid, toJid, amount) {
  const from = getUser(fromJid);
  if (from.coins < amount) return { ok: false, reason: 'insufficient' };
  from.coins -= amount;
  getUser(toJid).coins += amount;
  save();
  return { ok: true };
}

export function leaderboard({ by = 'coins', limit = 10 } = {}) {
  const db = load();
  return Object.entries(db)
    .map(([jid, u]) => ({ jid, coins: u.coins, level: levelForXp(u.xp), xp: u.xp }))
    .sort((a, b) => (by === 'xp' ? b.xp - a.xp : b.coins - a.coins))
    .slice(0, limit);
}

export function formatCooldown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
