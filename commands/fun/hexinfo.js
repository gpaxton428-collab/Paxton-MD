export default {
  name: 'hexinfo',
  description: 'Get RGB and HSL values for a hex color code. Usage: .hexinfo #RRGGBB',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    let hex = (args[0] || '').replace('#', '');
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return sock.sendMessage(chatId, { text: '❌ Usage: .hexinfo #RRGGBB (e.g. .hexinfo #8b7bff)' }, { quoted: msg });
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    let h = 0, s = 0;
    const d = max - min;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === r / 255) h = ((g / 255 - b / 255) / d) % 6;
      else if (max === g / 255) h = (b / 255 - r / 255) / d + 2;
      else h = (r / 255 - g / 255) / d + 4;
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    await sock.sendMessage(chatId, {
      text: `🎨 *Hex Info: #${hex}*\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${h}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }, { quoted: msg });
  }
};
