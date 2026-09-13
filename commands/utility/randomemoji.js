const POOL = ['😀','😂','😍','🤔','😎','🥳','😴','🤯','🙃','😇','🤠','🥶','🤩','😱','🧐'];

export default {
  name: 'randomemoji',
  description: 'Get a handful of random emojis. Usage: .randomemoji [count]',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const count = Math.min(Math.max(parseInt(args[0], 10) || 5, 1), 20);
    const picks = Array.from({ length: count }, () => POOL[Math.floor(Math.random() * POOL.length)]);
    await sock.sendMessage(chatId, { text: picks.join(' ') }, { quoted: msg });
  }
};
