const PAIRS = [['Tea', 'Coffee'], ['Beach', 'Mountains'], ['Morning', 'Night'], ['Sweet', 'Savory'], ['Books', 'Movies'], ['Summer', 'Winter']];

export default {
  name: 'thisorthat',
  description: 'Get a random "this or that" quick-fire question. Usage: .thisorthat',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pair = PAIRS[Math.floor(Math.random() * PAIRS.length)];
    await sock.sendMessage(chatId, { text: `⚡ ${pair[0]} or ${pair[1]}?` }, { quoted: msg });
  }
};
