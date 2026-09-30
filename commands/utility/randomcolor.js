export default {
  name: 'randomcolor',
  description: 'Generate a random hex color.',
  async execute(sock, msg) {
    const hex = '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    await sock.sendMessage(msg.key.remoteJid, { text: `🎨 ${hex}` }, { quoted: msg });
  }
};
