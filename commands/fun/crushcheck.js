export default {
  name: 'crushcheck',
  description: 'Get a random (joke) compatibility reading with your crush. Usage: .crushcheck',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pct = Math.floor(Math.random() * 101);
    await sock.sendMessage(chatId, { text: `💘 Crush compatibility: ${pct}%\n\n_Purely random — for fun only!_` }, { quoted: msg });
  }
};
