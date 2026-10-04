import { setGlobalSetting } from '../../lib/settingsStore.js';

export default {
  name: 'settimezone',
  alias: ['timezone'],
  ownerOnly: true,
  description: 'Set the timezone used for time/date display (owner only). Usage: .settimezone Africa/Johannesburg',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const tz = args[0];
    if (!tz) return sock.sendMessage(chatId, { text: '❌ Usage: .settimezone <IANA timezone, e.g. Africa/Johannesburg>' }, { quoted: msg });
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
    } catch {
      return sock.sendMessage(chatId, { text: '❌ That timezone name is not recognized.' }, { quoted: msg });
    }
    setGlobalSetting('timezone', tz);
    await sock.sendMessage(chatId, { text: `✅ Timezone set to *${tz}*.` }, { quoted: msg });
  }
};
