import { transfer, getUser } from '../../lib/economyStore.js';
import { getTargetJid } from '../../lib/groupHelper.js';
import { reply, usage } from '../../lib/helpers/reply.js';

export default {
  name: 'give',
  alias: ['pay', 'givecoins'],
  description: 'Give some of your coins to someone else. Usage: .give @mention <amount>',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const target = getTargetJid(msg, args);
    const amount = parseInt(args.find((a) => /^\d+$/.test(a)) || '', 10);
    if (!target || !amount || amount <= 0) return reply(sock, msg, usage(prefix, 'give @mention <amount>', 'give @1234 50'));
    if (target === sender) return reply(sock, msg, '❌ You can\'t give coins to yourself.');
    const result = transfer(sender, target, amount);
    if (!result.ok) return reply(sock, msg, `❌ You don't have *${amount}* coins to give. Your balance: *${getUser(sender).coins}*.`);
    await sock.sendMessage(chatId, { text: `✅ You gave *🪙 ${amount}* coins to @${target.split('@')[0]}.`, mentions: [target] }, { quoted: msg });
  }
};
