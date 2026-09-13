export default {
  name: 'palindrome',
  description: 'Check if a word or phrase is a palindrome. Usage: .palindrome racecar',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .palindrome <word or phrase>' }, { quoted: msg });
    const isPalindrome = text === text.split('').reverse().join('');
    await sock.sendMessage(chatId, { text: isPalindrome ? '✅ Yes, that is a palindrome!' : '❌ Not a palindrome.' }, { quoted: msg });
  }
};
