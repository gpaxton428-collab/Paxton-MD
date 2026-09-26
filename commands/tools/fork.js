export default {
  name: 'fork',
  description: "Get the link to fork the bot's own repo on GitHub. Usage: .fork",
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const text = `🍴 *Fork Paxton MD*\n\nhttps://github.com/gpaxton428-collab/Paxton-MD/fork\n\nStar the repo too if you find it useful: https://github.com/gpaxton428-collab/Paxton-MD`;
    await sock.sendMessage(chatId, { text }, { quoted: msg });
  }
};
