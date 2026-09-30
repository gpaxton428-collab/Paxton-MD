export default {
  name: 'currency',
  alias: ['convert', 'exchange'],
  description: 'Convert between currencies. Usage: .currency 100 USD ZAR',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const [amountStr, from, to] = args;
    const amount = parseFloat(amountStr);
    if (!amount || !from || !to) return sock.sendMessage(chatId, { text: '❌ Usage: .currency <amount> <from> <to>\nExample: .currency 100 USD ZAR' }, { quoted: msg });
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from.toUpperCase()}`);
      const data = await res.json();
      const rate = data?.rates?.[to.toUpperCase()];
      if (!rate) return sock.sendMessage(chatId, { text: '❌ Unknown currency code.' }, { quoted: msg });
      const converted = (amount * rate).toFixed(2);
      await sock.sendMessage(chatId, { text: `💱 ${amount} ${from.toUpperCase()} = *${converted} ${to.toUpperCase()}*` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Conversion failed: ${error.message}` }, { quoted: msg });
    }
  }
};
