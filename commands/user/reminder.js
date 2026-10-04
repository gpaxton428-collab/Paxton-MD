import { reply, usage } from '../../lib/helpers/reply.js';

const MAX_PENDING_PER_USER = 5;
const pending = new Map(); // sender -> count

export default {
  name: 'reminder',
  alias: ['remindme', 'remind'],
  description: 'Set a reminder in this chat (max 24h; lost if the bot restarts). Usage: .reminder 10m Take the food out',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || chatId;
    const match = args[0] && args[0].match(/^([0-9]{1,5})(s|m|h)$/i);
    const note = args.slice(1).join(' ').trim();
    if (!match || !note) return reply(sock, msg, usage(prefix, 'reminder <10s|10m|2h> <message>', 'reminder 30m call mum'));
    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    const ms = amount * (unit === 's' ? 1000 : unit === 'm' ? 60000 : 3600000);
    if (ms < 5000) return reply(sock, msg, '❌ Minimum reminder time is 5 seconds.');
    if (ms > 24 * 3600 * 1000) return reply(sock, msg, '❌ Max reminder time is 24 hours.');
    if ((pending.get(sender) || 0) >= MAX_PENDING_PER_USER) return reply(sock, msg, `❌ You already have ${MAX_PENDING_PER_USER} active reminders.`);
    pending.set(sender, (pending.get(sender) || 0) + 1);
    await reply(sock, msg, `⏰ Reminder set for ${match[1]}${unit}: "${note.slice(0, 200)}"`);
    setTimeout(() => {
      pending.set(sender, Math.max(0, (pending.get(sender) || 1) - 1));
      sock.sendMessage(chatId, { text: `⏰ *Reminder:* ${note.slice(0, 200)}`, mentions: [sender] }, { quoted: msg }).catch(() => {});
    }, ms).unref?.();
  }
};
