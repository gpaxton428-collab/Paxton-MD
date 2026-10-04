export default {
  name: 'anagram',
  description: 'Check if two words/phrases are anagrams of each other. Usage: .anagram listen silent',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    const parts = text.split(',').length > 1 ? text.split(',') : args.length >= 2 ? [args.slice(0, args.length / 2).join(' '), args.slice(args.length / 2).join(' ')] : null;
    if (!parts || parts.length < 2) return sock.sendMessage(chatId, { text: '❌ Usage: .anagram <word1>, <word2>' }, { quoted: msg });
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join('');
    const isAnagram = norm(parts[0]) === norm(parts[1]) && norm(parts[0]).length > 0;
    await sock.sendMessage(chatId, { text: isAnagram ? '✅ Yes, those are anagrams!' : '❌ Nope, not anagrams.' }, { quoted: msg });
  }
};
