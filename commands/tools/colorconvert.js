export default {
  name: 'colorconvert',
  alias: ['hex2rgb'],
  description: 'Convert a hex color code to RGB. Usage: .colorconvert #ff5733',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const hex = (args[0] || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return sock.sendMessage(chatId, { text: '❌ Usage: .colorconvert <#hexcolor>' }, { quoted: msg });
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    await sock.sendMessage(chatId, { text: `🎨 #${hex.toUpperCase()} → rgb(${r}, ${g}, ${b})` }, { quoted: msg });
  }
};
