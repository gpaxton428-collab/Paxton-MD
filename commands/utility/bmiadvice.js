export default {
  name: 'idealweight',
  description: 'Rough ideal weight estimate from height (Devine formula, informational only). Usage: .idealweight 175 (cm) male|female',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const heightCm = parseFloat(args[0]);
    const gender = (args[1] || 'male').toLowerCase();
    if (isNaN(heightCm) || heightCm < 100 || heightCm > 250) return sock.sendMessage(chatId, { text: '❌ Usage: .idealweight <height in cm> [male|female]' }, { quoted: msg });
    const heightIn = heightCm / 2.54;
    const base = gender === 'female' ? 45.5 : 50;
    const perInch = 2.3;
    const ideal = base + perInch * Math.max(0, heightIn - 60);
    await sock.sendMessage(chatId, { text: `⚖️ Rough estimate (Devine formula): ${ideal.toFixed(1)} kg\n_This is a general reference, not medical advice._` }, { quoted: msg });
  }
};
