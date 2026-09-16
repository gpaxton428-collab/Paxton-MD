import { setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'resetmenustyle',
  ownerOnly: true,
  description: 'Reset the .menu display back to the default style (owner only). Usage: .resetmenustyle',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    setGlobalSetting('menuStyle', 1);
    await sock.sendMessage(chatId, { text: '✅ Menu style reset to default (1). Send .menu to view it.' }, { quoted: msg });
  }
};
