import { setAfk } from '../../lib/helpers/afk.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'afk',
  description: 'Mark yourself as away. People who tag you get told. Usage: .afk [reason]',
  async execute(sock, msg, args) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const reason = args.join(' ').trim() || 'AFK';
    setAfk(sender, reason);
    await reply(sock, msg, `💤 You are now AFK.\n📝 ${reason.slice(0, 120)}\n\n_Send any message to come back._`);
  }
};
