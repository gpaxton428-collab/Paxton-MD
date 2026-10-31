import path from 'path';
import fs from 'fs';
import { ROOT_DIR } from '../../config/index.js';
import { writeJsonSync } from '../../lib/utils/jsonStore.js';
import { reply, senderOf, usage } from '../../lib/helpers/reply.js';

const FILE = path.join(ROOT_DIR, 'data', 'notes.json');
const MAX_NOTES = 50, MAX_LEN = 500;
const load = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } };
const keyOf = (msg) => senderOf(msg).split('@')[0].split(':')[0];

export default {
  name: 'notes',
  alias: ['note'],
  description: 'Your private notes. Usage: .notes add <text> | .notes | .notes get <n> | .notes del <n> | .notes clear',
  async execute(sock, msg, args, prefix) {
    const db = load(), id = keyOf(msg);
    const list = db[id] || [];
    const sub = (args[0] || '').toLowerCase();
    const save = () => { db[id] = list; writeJsonSync(FILE, db); };

    if (sub === 'add') {
      const text = args.slice(1).join(' ').trim().slice(0, MAX_LEN);
      if (!text) return reply(sock, msg, usage(prefix, 'notes add <text>', 'notes add buy airtime'));
      if (list.length >= MAX_NOTES) return reply(sock, msg, `❌ You have ${MAX_NOTES} notes already. Delete some first.`);
      list.push({ text, at: Date.now() }); save();
      return reply(sock, msg, `📝 Saved as note *#${list.length}*.`);
    }
    if (sub === 'get' || sub === 'del') {
      const n = parseInt(args[1], 10);
      if (!n || n < 1 || n > list.length) return reply(sock, msg, `❌ Pick a note number between 1 and ${list.length}.`);
      if (sub === 'get') return reply(sock, msg, `📝 *Note #${n}*\n\n${list[n - 1].text}`);
      list.splice(n - 1, 1); save();
      return reply(sock, msg, `🗑️ Note #${n} deleted.`);
    }
    if (sub === 'clear') { const c = list.length; list.length = 0; save(); return reply(sock, msg, `🗑️ Cleared ${c} note${c === 1 ? '' : 's'}.`); }
    if (!list.length) return reply(sock, msg, `📝 You have no notes.\nAdd one with ${prefix}notes add <text>`);
    await reply(sock, msg, `📝 *Your notes (${list.length})*\n\n${list.map((n, i) => `${i + 1}. ${n.text.length > 80 ? `${n.text.slice(0, 77)}...` : n.text}`).join('\n')}\n\n${prefix}notes get <n> · ${prefix}notes del <n>`);
  }
};
