export default {
  name: 'mathquiz',
  description: 'Get a random math problem to solve. Usage: .mathquiz',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const a = Math.floor(Math.random() * 50) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    let answer;
    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;
    await sock.sendMessage(chatId, { text: `➗ *Math Quiz*\nWhat is ${a} ${op} ${b}?\n\n_Answer: ||${answer}||_` }, { quoted: msg });
  }
};
