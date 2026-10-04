import crypto from 'crypto';

export default {
  name: 'uuid',
  description: 'Generate a random UUID v4. Usage: .uuid',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    await sock.sendMessage(chatId, { text: `🆔 ${id}` }, { quoted: msg });
  }
};
