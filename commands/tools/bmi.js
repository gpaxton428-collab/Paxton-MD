export default {
  name: 'bmi',
  description: 'Calculate BMI. Usage: .bmi <weight in kg> <height in cm>',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const weight = parseFloat(args[0]);
    const heightCm = parseFloat(args[1]);
    if (!weight || !heightCm) return sock.sendMessage(chatId, { text: '❌ Usage: .bmi <weight kg> <height cm>' }, { quoted: msg });
    const heightM = heightCm / 100;
    const bmi = (weight / (heightM * heightM)).toFixed(1);
    let category = 'Normal';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 30) category = 'Overweight';
    else if (bmi >= 30) category = 'Obese';
    await sock.sendMessage(chatId, { text: `⚖️ BMI: *${bmi}* (${category})` }, { quoted: msg });
  }
};
