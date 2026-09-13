const LEET_MAP = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7', l: '1', g: '9' };

export default {
  name: 'leet',
  alias: ['1337'],
  description: 'Convert text to leetspeak. Usage: .leet hello',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .leet <text>' }, { quoted: msg });
    const result = text.toLowerCase().split('').map((c) => LEET_MAP[c] ?? c).join('');
    await sock.sendMessage(chatId, { text: `👾 ${result}` }, { quoted: msg });
  }
};
