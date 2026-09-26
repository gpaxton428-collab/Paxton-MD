const EMOJIS = ['😀','🐶','🚀','🍕','🌈','🔥','⚡','🎉','🌙','🐉','🎮','🍩','🏔️','🌊','🦄'];

export default {
  name: 'emojistory',
  description: 'Generate a random emoji story (5 emojis). Usage: .emojistory',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const shuffled = [...EMOJIS].sort(() => Math.random() - 0.5).slice(0, 5);
    await sock.sendMessage(chatId, { text: shuffled.join(' ') }, { quoted: msg });
  }
};
