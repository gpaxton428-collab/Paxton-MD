// Short per-user conversation memory for the chatbot (.chatbot), so DM/mention
// replies can refer back to what was just said. Capped and persisted to disk
// (debounced) so it survives restarts without growing unbounded.
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'chatbot_memory.json');
const MAX_TURNS = 8;      // user+assistant pairs kept per conversation
const MAX_USERS = 500;    // oldest conversations are dropped past this
const TTL_MS = 1000 * 60 * 60 * 24 * 7; // a week of inactivity clears a conversation

let memory = new Map(); // key -> { turns: [{role,text,ts}], updatedAt }
let dirty = false;

function load() {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const obj = JSON.parse(raw);
    memory = new Map(Object.entries(obj));
  } catch { memory = new Map(); }
}
load();

function save() {
  if (!dirty) return;
  dirty = false;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(Object.fromEntries(memory)));
  } catch { /* non-fatal: memory just won't persist this run */ }
}
setInterval(save, 15000).unref?.();

function prune() {
  const now = Date.now();
  for (const [key, entry] of memory) if (now - entry.updatedAt > TTL_MS) memory.delete(key);
  while (memory.size > MAX_USERS) memory.delete(memory.keys().next().value);
}

// One conversation per (chat, sender) pair, so a group mention and a DM with
// the same person don't bleed into each other.
export const memoryKey = (chatId, senderJid) => `${chatId}|${senderJid}`;

export function getHistory(key) {
  return memory.get(key)?.turns ?? [];
}

export function appendTurn(key, role, text) {
  if (!text) return;
  const entry = memory.get(key) ?? { turns: [], updatedAt: 0 };
  entry.turns.push({ role, text: String(text).slice(0, 1000) });
  if (entry.turns.length > MAX_TURNS * 2) entry.turns = entry.turns.slice(-MAX_TURNS * 2);
  entry.updatedAt = Date.now();
  memory.set(key, entry);
  dirty = true;
  prune();
}

export function clearHistory(key) { memory.delete(key); dirty = true; }

// Builds a single prompt string (history + the new message) for providers
// that only take a flat prompt.
export function withHistory(key, newText) {
  const turns = getHistory(key);
  if (!turns.length) return newText;
  const context = turns.map((t) => `${t.role === 'user' ? 'User' : 'Assistant'}: ${t.text}`).join('\n');
  return `${context}\nUser: ${newText}\nAssistant:`;
}
