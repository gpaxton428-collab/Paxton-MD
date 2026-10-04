const MORSE_TO_CHAR = { '.-': 'a', '-...': 'b', '-.-.': 'c', '-..': 'd', '.': 'e', '..-.': 'f', '--.': 'g', '....': 'h',
  '..': 'i', '.---': 'j', '-.-': 'k', '.-..': 'l', '--': 'm', '-.': 'n', '---': 'o', '.--.': 'p', '--.-': 'q',
  '.-.': 'r', '...': 's', '-': 't', '..-': 'u', '...-': 'v', '.--': 'w', '-..-': 'x', '-.--': 'y', '--..': 'z',
  '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7',
  '---..': '8', '----.': '9', '/': ' ' };

export default {
  name: 'demorse',
  description: 'Convert Morse code back to text. Usage: .demorse ... --- ...',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ');
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .demorse <morse code>' }, { quoted: msg });
    const decoded = text.split(' ').map((c) => MORSE_TO_CHAR[c] ?? c).join('');
    await sock.sendMessage(chatId, { text: `📡 ${decoded}` }, { quoted: msg });
  }
};
