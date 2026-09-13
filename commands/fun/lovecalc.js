function scoreFor(a, b) {
  const combined = `${a.toLowerCase()}${b.toLowerCase()}`;
  let hash = 0;
  for (const ch of combined) hash = (hash * 31 + ch.charCodeAt(0)) % 1000;
  return hash % 101;
}

export default {
  name: 'lovecalc',
  alias: ['love'],
  description: 'Calculate a love percentage between two names. Usage: .lovecalc John Jane',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    if (args.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: .lovecalc <name1> <name2>' }, { quoted: msg });
    const mid = Math.ceil(args.length / 2);
    const name1 = args.slice(0, mid).join(' ');
    const name2 = args.slice(mid).join(' ');
    const percent = scoreFor(name1, name2);
    await sock.sendMessage(chatId, { text: `💘 ${name1} + ${name2} = *${percent}%* match!` }, { quoted: msg });
  }
};
