const SIGNS = [
  [120, 'Aquarius'], [219, 'Pisces'], [321, 'Aries'], [420, 'Taurus'],
  [521, 'Gemini'], [621, 'Cancer'], [723, 'Leo'], [823, 'Virgo'],
  [923, 'Libra'], [1023, 'Scorpio'], [1122, 'Sagittarius'], [1222, 'Capricorn'], [1231, 'Capricorn']
];

export default {
  name: 'zodiac',
  description: 'Find your zodiac sign from a birth date. Usage: .zodiac 05-14 (MM-DD)',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const match = (args[0] || '').match(/^(\d{1,2})-(\d{1,2})$/);
    if (!match) return sock.sendMessage(chatId, { text: '❌ Usage: .zodiac MM-DD (e.g. .zodiac 05-14)' }, { quoted: msg });
    const key = parseInt(match[1], 10) * 100 + parseInt(match[2], 10);
    const sign = SIGNS.find(([cutoff]) => key <= cutoff)?.[1] || 'Capricorn';
    await sock.sendMessage(chatId, { text: `♈ Your zodiac sign is *${sign}*` }, { quoted: msg });
  }
};
