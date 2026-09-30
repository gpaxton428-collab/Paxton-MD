export default {
  name: 'viewvcf',
  description: 'Show the raw details of a replied contact card. Reply to a shared contact with .viewvcf',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const contact = quoted?.contactMessage || quoted?.contactsArrayMessage?.contacts?.[0];
    if (!contact) return sock.sendMessage(chatId, { text: '❌ Reply to a shared contact with .viewvcf' }, { quoted: msg });
    const vcard = contact.vcard || '(no vcard data)';
    await sock.sendMessage(chatId, { text: `📇 *${contact.displayName || 'Contact'}*\n\n\`\`\`${vcard}\`\`\`` }, { quoted: msg });
  }
};
