import NodeCache from '@cacheable/node-cache';

// Kept outside individual sockets so reconnects do not reset retry counters.
// This follows the current Baileys example pattern for message resend handling.
export const msgRetryCounterCache = new NodeCache({
  stdTTL: 600,
  checkperiod: 120,
  useClones: false
});

export function clearRetryCache() {
  try { msgRetryCounterCache.flushAll(); } catch {}
}
