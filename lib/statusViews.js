import fs from 'fs';

// Backs .statusview — tracks who's viewed statuses the bot itself posted.
// Baileys reports view receipts through 'messages.update' events; the
// exact shape has varied across versions, so the reader in index.js
// checks several known field names rather than assuming one.
const STATUS_VIEW_FILE = './data/status_views.json';

function loadStatusViews() {
  try { return JSON.parse(fs.readFileSync(STATUS_VIEW_FILE, 'utf8')); } catch { return {}; }
}
function saveStatusViews(data) {
  try {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync(STATUS_VIEW_FILE, JSON.stringify(data, null, 2));
  } catch {}
}

export function recordStatusPost(messageId) {
  if (!messageId) return;
  const data = loadStatusViews();
  data[messageId] = { postedAt: Date.now(), viewers: {} };
  const ids = Object.keys(data).sort((a, b) => data[b].postedAt - data[a].postedAt);
  for (const id of ids.slice(20)) delete data[id];
  saveStatusViews(data);
}

export function recordStatusView(messageId, viewerJid) {
  if (!messageId || !viewerJid) return;
  const data = loadStatusViews();
  if (!data[messageId]) return;
  if (!data[messageId].viewers[viewerJid]) data[messageId].viewers[viewerJid] = Date.now();
  saveStatusViews(data);
}

export function getRecentStatusPosts(n = 1) {
  const data = loadStatusViews();
  return Object.entries(data)
    .sort((a, b) => b[1].postedAt - a[1].postedAt)
    .slice(0, n)
    .map(([id, v]) => ({ id, ...v }));
}
