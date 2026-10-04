const VIBES = ['Immaculate ✨', 'A little chaotic 🌀', 'Main character energy 🎬', 'Sleepy but valid 😴', 'Certified good vibes 🌈', 'Suspiciously calm 🧘'];

export default {
  name: 'vibecheck',
  description: "Random vibe check for today. Usage: .vibecheck",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = VIBES[Math.floor(Math.random() * VIBES.length)];
    await sock.sendMessage(chatId, { text: `🎛️ Vibe check: ${pick}` }, { quoted: msg });
  }
};
