import { reply } from '../../lib/helpers/reply.js';

const NAMES = ['togstatus', 'status', 'statusview', 'statusreact', 'ghostarchive', 'vv', 'vv2', 'ghost'];

export default {
  name: 'vaultmenu',
  ownerOnly: true,
  description: 'Show the status/vault commands. Usage: .vaultmenu',
  async execute(sock, msg, args, prefix, ctx) {
    const lines = NAMES.map((n) => ctx.commands.get(n)).filter(Boolean)
      .map((c) => `▸ *${prefix}${c.name}*\n   ${(c.description || '').split(/\.?\s*Usage:/)[0].slice(0, 70)}`);
    await reply(sock, msg, `╭─〔 🗄️ *STATUS & VAULT* 〕\n│ _beyond the normal, quietly_\n╰──────────────\n\n${lines.join('\n')}`);
  }
};
