const POWERS = ['Invisibility', 'Flight', 'Super strength', 'Telepathy', 'Time travel', 'Teleportation', 'Shapeshifting', 'Mind control', 'Super speed', 'Healing touch'];
export default {
  name: 'superpower',
  description: "Discover the superpower you'd get today. Usage: .superpower",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const pick = POWERS[Math.floor(Math.random() * POWERS.length)];
    await sock.sendMessage(chatId, { text: `🦸 Your superpower today: *${pick}*` }, { quoted: msg });
  }
};
