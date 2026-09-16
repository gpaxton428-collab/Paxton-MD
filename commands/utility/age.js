export default {
  name: 'age',
  description: 'Calculate age from a birth date. Usage: .age 1998-05-14',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const input = args[0];
    const dob = input && new Date(input);
    if (!dob || isNaN(dob.getTime())) return sock.sendMessage(chatId, { text: '❌ Usage: .age YYYY-MM-DD' }, { quoted: msg });
    const now = new Date();
    let years = now.getFullYear() - dob.getFullYear();
    const m = now.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
    await sock.sendMessage(chatId, { text: `🎂 You are *${years}* years old.` }, { quoted: msg });
  }
};
