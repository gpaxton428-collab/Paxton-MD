export default {
  name: 'vcf',
  description: 'Create and send a contact card. Usage: .vcf Name;Number (e.g. .vcf John;27691234567)',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const input = args.join(' ');
    const [name, rawNumber] = input.split(';').map((s) => s?.trim());
    const number = rawNumber?.replace(/[^0-9]/g, '');
    if (!name || !number) return sock.sendMessage(chatId, { text: '❌ Usage: .vcf Name;Number (e.g. .vcf John;27691234567)' }, { quoted: msg });

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`;
    await sock.sendMessage(chatId, { contacts: { displayName: name, contacts: [{ vcard }] } }, { quoted: msg });
  }
};
