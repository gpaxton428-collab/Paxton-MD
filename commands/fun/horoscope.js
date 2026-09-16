const SIGNS = {
  aries: 'Bold moves pay off today.', taurus: 'Patience brings a steady reward.', gemini: 'A conversation changes your outlook.',
  cancer: 'Home and family bring comfort.', leo: 'Your confidence shines bright.', virgo: 'Details matter — double-check your work.',
  libra: 'Balance is key today.', scorpio: 'Trust your instincts.', sagittarius: 'Adventure calls your name.',
  capricorn: 'Hard work is finally noticed.', aquarius: 'An unusual idea leads somewhere great.', pisces: 'Your intuition is spot on today.'
};

export default {
  name: 'horoscope',
  description: 'Get your horoscope for the day. Usage: .horoscope <zodiac sign>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const sign = (args[0] || '').toLowerCase();
    if (!SIGNS[sign]) return sock.sendMessage(chatId, { text: `❌ Usage: .horoscope <sign>\nSigns: ${Object.keys(SIGNS).join(', ')}` }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🔮 *${sign[0].toUpperCase()}${sign.slice(1)}:* ${SIGNS[sign]}` }, { quoted: msg });
  }
};
