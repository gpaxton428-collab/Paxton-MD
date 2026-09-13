export default {
  name: 'joke',
  description: 'Get a random joke.',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    try {
      const res = await fetch('https://official-joke-api.appspot.com/random_joke');
      const data = await res.json();
      await sock.sendMessage(chatId, { text: `😂 ${data.setup}\n\n${data.punchline}` }, { quoted: msg });
    } catch {
      await sock.sendMessage(chatId, { text: "😂 Why don't scientists trust atoms? Because they make up everything!" }, { quoted: msg });
    }
  }
};
