export default {
  name: 'jsonformat',
  alias: ['prettyjson'],
  description: 'Pretty-print a JSON string. Usage: .jsonformat {"a":1,"b":2}',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const raw = args.join(' ');
    if (!raw) return sock.sendMessage(chatId, { text: '❌ Usage: .jsonformat <json text>' }, { quoted: msg });
    try {
      const parsed = JSON.parse(raw);
      const pretty = JSON.stringify(parsed, null, 2);
      await sock.sendMessage(chatId, { text: `\`\`\`${pretty.slice(0, 3000)}\`\`\`` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Invalid JSON: ${error.message}` }, { quoted: msg });
    }
  }
};
