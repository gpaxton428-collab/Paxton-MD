const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function chunkToWords(n) {
  let str = '';
  if (n >= 100) { str += `${ONES[Math.floor(n / 100)]} hundred `; n %= 100; }
  if (n >= 20) { str += `${TENS[Math.floor(n / 10)]} `; n %= 10; }
  if (n > 0) str += `${ONES[n]} `;
  return str.trim();
}

function numberToWords(num) {
  if (num === 0) return 'zero';
  const scales = ['', 'thousand', 'million', 'billion'];
  let scaleIndex = 0;
  let words = [];
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) words.unshift(`${chunkToWords(chunk)} ${scales[scaleIndex]}`.trim());
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  return words.join(' ');
}

export default {
  name: 'numbertowords',
  alias: ['num2words'],
  description: 'Spell out a number in words. Usage: .numbertowords 12345',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const num = parseInt(args[0], 10);
    if (isNaN(num) || num < 0 || num > 999999999999) return sock.sendMessage(chatId, { text: '❌ Usage: .numbertowords <positive number>' }, { quoted: msg });
    await sock.sendMessage(chatId, { text: `🔤 ${numberToWords(num)}` }, { quoted: msg });
  }
};
