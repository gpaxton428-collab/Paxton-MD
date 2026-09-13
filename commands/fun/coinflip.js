export default {
  name: 'coinflip',
  alias: ['flip'],
  description: 'Flip a coin.',
  async execute(sock, msg) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    await sock.sendMessage(msg.key.remoteJid, { text: `🪙 *${result}!*` }, { quoted: msg });
  }
};
