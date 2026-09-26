import { REPLY_FONT_STYLES } from '../../lib/replyFont.js';

export default {
  name: 'setreplyfont',
  ownerOnly: true,
  description: `Make EVERY bot reply (menus included) render in a fancy unicode font, bot-wide (owner only). Usage: .setreplyfont <style|off>`,
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const style = (args[0] || '').toLowerCase();
    if (!style) {
      const settings = ctx.getGlobalSettings();
      return sock.sendMessage(chatId, { text: `ℹ️ Reply font is currently *${settings.replyFont || 'off'}*.\nUsage: .setreplyfont <style|off>\nStyles: off, ${REPLY_FONT_STYLES.join(', ')}` }, { quoted: msg });
    }
    if (style !== 'off' && !REPLY_FONT_STYLES.includes(style)) {
      return sock.sendMessage(chatId, { text: `❌ Unknown style "${style}".\nStyles: off, ${REPLY_FONT_STYLES.join(', ')}` }, { quoted: msg });
    }
    ctx.setGlobalSetting('replyFont', style);
    await sock.sendMessage(chatId, { text: `✅ Bot-wide reply font set to *${style}*. Every reply (including menus) will now use it.` }, { quoted: msg });
  }
};
