import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'device',
  alias: ['checkdevice', 'wainfo'],
  description: 'Show what device a message was sent from. Usage: reply to a message with .device',
  async execute(sock, msg, args, prefix) {
    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo;
    const id = ctxInfo?.stanzaId;
    if (!id) return reply(sock, msg, `❌ Reply to a message with ${prefix}device`);
    const { getDevice } = await import('@whiskeysockets/baileys');
    const who = (ctxInfo.participant || '').split('@')[0].split(':')[0];
    await reply(sock, msg, `📱 *Device check*\n\n👤 Sender: ${who ? `@${who}` : 'unknown'}\n📲 Device: *${getDevice(id)}*`, who ? { mentions: [ctxInfo.participant] } : {});
  }
};
