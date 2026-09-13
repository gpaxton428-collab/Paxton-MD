export default {
  name: 'remindme',
  alias: ['remind'],
  description: 'Set a reminder in this chat. Usage: .remindme 10m Take the food out',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const timeArg = args[0];
    const note = args.slice(1).join(' ').trim();
    const match = timeArg && timeArg.match(/^([0-9]+)(s|m|h)$/i);
    if (!match || !note) {
      return sock.sendMessage(chatId, { text: '❌ Usage: .remindme <10s|10m|10h> <message>' }, { quoted: msg });
    }
    const [, amountStr, unit] = match;
    const amount = parseInt(amountStr, 10);
    const multiplier = unit.toLowerCase() === 's' ? 1000 : unit.toLowerCase() === 'm' ? 60000 : 3600000;
    const ms = amount * multiplier;
    if (ms > 24 * 60 * 60 * 1000) {
      return sock.sendMessage(chatId, { text: '❌ Max reminder time is 24 hours.' }, { quoted: msg });
    }
    await sock.sendMessage(chatId, { text: `⏰ Reminder set for ${amountStr}${unit}: "${note}"` }, { quoted: msg });
    setTimeout(() => {
      sock.sendMessage(chatId, { text: `⏰ *Reminder:* ${note}`, mentions: [msg.key.participant || chatId] }).catch(() => {});
    }, ms);
  }
};
