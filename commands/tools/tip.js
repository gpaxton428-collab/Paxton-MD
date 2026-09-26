export default {
  name: 'tip',
  description: 'Calculate a tip and total bill. Usage: .tip 50 15 (bill, tip%)',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const bill = parseFloat(args[0]);
    const percent = parseFloat(args[1]) || 15;
    if (isNaN(bill) || bill <= 0) return sock.sendMessage(chatId, { text: '❌ Usage: .tip <bill> [tip%]' }, { quoted: msg });
    const tip = (bill * percent) / 100;
    const total = bill + tip;
    await sock.sendMessage(chatId, { text: `💵 Tip (${percent}%): ${tip.toFixed(2)}\nTotal: ${total.toFixed(2)}` }, { quoted: msg });
  }
};
