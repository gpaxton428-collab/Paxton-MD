const MOODS = ['😄 Cheerful', '😎 Cool & Confident', '😴 Sleepy', '🤔 Thoughtful', '🥳 Energetic', '😌 Calm', '😤 Determined', '🤩 Excited'];

export default {
  name: 'mood',
  description: "Get a random mood suggestion for today. Usage: .mood",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = MOODS[Math.floor(Math.random() * MOODS.length)];
    await sock.sendMessage(chatId, { text: `🎭 Today's mood: ${pick}` }, { quoted: msg });
  }
};
