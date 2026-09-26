// Remembers the last .songs result list per chat+sender so ".play 2"
// can pick from it. In-memory, 5 minute TTL.
const TTL = 5 * 60 * 1000;
const store = new Map();
const keyOf = (chatId, sender) => `${chatId}|${sender}`;

export function saveResults(chatId, sender, tracks) {
  store.set(keyOf(chatId, sender), { tracks, at: Date.now() });
  if (store.size > 500) for (const [k, v] of store) if (Date.now() - v.at > TTL) store.delete(k);
}
export function pickResult(chatId, sender, index) {
  const entry = store.get(keyOf(chatId, sender));
  if (!entry || Date.now() - entry.at > TTL) return null;
  return entry.tracks[index - 1] || null;
}
