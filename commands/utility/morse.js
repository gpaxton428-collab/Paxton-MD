const MORSE = { a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---',
  k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-',
  u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/' };

export default {
  name: 'morse',
  description: 'Convert text to Morse code. Usage: .morse SOS',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const text = args.join(' ').toLowerCase();
    if (!text) return sock.sendMessage(chatId, { text: '❌ Usage: .morse <text>' }, { quoted: msg });
    const encoded = text.split('').map((c) => MORSE[c] ?? c).join(' ');
    await sock.sendMessage(chatId, { text: `📡 ${encoded}` }, { quoted: msg });
  }
};
