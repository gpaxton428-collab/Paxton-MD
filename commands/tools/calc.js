export default {
  name: 'calc',
  alias: ['calculate'],
  description: 'Evaluate a basic math expression. Usage: .calc 12 * (4 + 3)',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const expr = args.join(' ');
    if (!expr) return sock.sendMessage(chatId, { text: '❌ Usage: .calc <expression>' }, { quoted: msg });
    if (!/^[0-9+\-*/().%\s]+$/.test(expr)) return sock.sendMessage(chatId, { text: '❌ Only numbers and + - * / % ( ) are allowed.' }, { quoted: msg });
    try {
      const result = Function(`"use strict"; return (${expr})`)();
      await sock.sendMessage(chatId, { text: `🧮 ${expr} = *${result}*` }, { quoted: msg });
    } catch {
      await sock.sendMessage(chatId, { text: '❌ Invalid expression.' }, { quoted: msg });
    }
  }
};
