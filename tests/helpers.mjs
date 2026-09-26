// Shared test fixtures. No network and no WhatsApp connection needed.
process.env.WOLVAREX_API_KEY = 'test-key-1234567890abcdef';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanCommands } from '../lib/plugins/loader.js';
import { getGlobalSettings } from '../lib/settingsStore.js';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const SECRET = process.env.WOLVAREX_API_KEY;

export function fakeSock() {
  const sent = [];
  const sock = {
    sent, user: { id: '27000000000:1@s.whatsapp.net' },
    async sendMessage(jid, content, opts) { sent.push({ jid, content, opts }); return { key: { id: `m${sent.length}`, remoteJid: jid } }; },
    sendPresenceUpdate: async () => {},
    queries: [], async query(node) { this.queries.push(node); return {}; }
  };
  return sock;
}
export const fakeMsg = (text = '', jid = '111@s.whatsapp.net') => ({ key: { remoteJid: jid, id: 'X1', fromMe: false }, message: { conversation: text } });

export async function realCtx(overrides = {}) {
  const reg = await scanCommands(path.join(ROOT, 'commands'));
  return {
    reg,
    ctx: {
      commands: reg.commands, commandAliases: reg.aliases, commandCategories: reg.categories, commandMeta: reg.meta, pluginReport: reg.report,
      getTotalCommandCount: () => reg.commands.size, getGlobalSettings, isPrefixless: false,
      getCurrentPrefix: () => '.', getPrefixList: () => ['.'], BOT_MODE: 'public', BOT_NAME: 'Paxton MD', VERSION: '2.6.0',
      isWhatsAppConnected: () => true, isOwner: () => false, isOwnerOrSudo: () => false, ...overrides
    }
  };
}

// Replace global fetch for one test; `handler(url, init)` returns a Response.
export function mockFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push(String(url)); return handler(String(url), init); };
  return { calls, restore() { globalThis.fetch = original; } };
}
export const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
