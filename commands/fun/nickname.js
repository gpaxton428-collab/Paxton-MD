const PREFIXES = ['Lil', 'Big', 'Captain', 'Doctor', 'Master', 'Sir', 'Lady', 'Professor', 'Agent', 'Chief'];
const SUFFIXES = ['the Great', 'the Wise', 'the Bold', 'the Swift', 'the Legend', 'of the North', 'the Unstoppable'];

export default {
  name: 'nickname',
  description: 'Generate a fun nickname from a name. Usage: .nickname John',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const name = args.join(' ');
    if (!name) return sock.sendMessage(chatId, { text: '❌ Usage: .nickname <name>' }, { quoted: msg });
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    await sock.sendMessage(chatId, { text: `🏷️ ${prefix} ${name} ${suffix}` }, { quoted: msg });
  }
};
