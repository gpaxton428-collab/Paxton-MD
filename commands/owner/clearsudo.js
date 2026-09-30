import { removeSudo, clearAllSudo, listSudo } from '../../lib/sudo.js';

export default {
  name: 'clearsudo',
  description: 'Remove sudo access (owner only). Usage: .clearsudo <number>, or .clearsudo all',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    if (!ctx.isOwner()) return sock.sendMessage(chatId, { text: '❌ Only the real owner can manage sudo.' }, { quoted: msg });

    if ((args[0] || '').toLowerCase() === 'all') {
      const count = clearAllSudo();
      return sock.sendMessage(chatId, { text: `✅ Cleared all ${count} sudo user(s).` }, { quoted: msg });
    }
    const number = args[0]?.replace(/[^0-9]/g, '');
    if (!number) {
      const list = listSudo();
      return sock.sendMessage(chatId, { text: list.length ? `📋 Sudo users: ${list.map((n) => '+' + n).join(', ')}` : 'No sudo users set.\nUsage: .clearsudo <number>, or .clearsudo all' }, { quoted: msg });
    }
    const existed = removeSudo(number);
    await sock.sendMessage(chatId, { text: existed ? `✅ Removed +${number} from sudo.` : `ℹ️ +${number} wasn't sudo.` }, { quoted: msg });
  }
};
