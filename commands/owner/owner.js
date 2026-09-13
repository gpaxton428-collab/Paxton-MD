const DEV_NUMBER = '27697344852';

export default {
  name: 'owner',
  alias: ['dev', 'developer'],
  description: 'Send the developer\'s contact card.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:Paxton\n' +
      'ORG:Paxton MD;\n' +
      `TEL;type=CELL;type=VOICE;waid=${DEV_NUMBER}:+${DEV_NUMBER}\n` +
      'END:VCARD';

    await sock.sendMessage(chatId, {
      contacts: {
        displayName: 'Paxton',
        contacts: [{ vcard }]
      }
    }, { quoted: msg });
  }
};
