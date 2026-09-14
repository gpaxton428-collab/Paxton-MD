const DESCRIPTIONS = {
  1: 'Boxed style with rounded corners — the original/default look.',
  2: 'Clean minimal list, no boxes — fastest to read.',
  3: 'Numbered, compact list.',
  4: 'Card style with a centered header and diamond bullets.',
  5: 'Ultra-compact — one line per category.',
  6: 'Straight plain list — bold category name, bare command lines, no boxes. Includes a View Channel link.',
  7: 'Bold-serif header card with boxed categories, popular MD-bot look.',
  8: '"menu2" — boxed header + bulleted categories. Includes a View Channel link.'
};

export default {
  name: 'menupreview',
  description: 'See a short description of every .menu style (1-8) without switching. Usage: .menupreview',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const text = Object.entries(DESCRIPTIONS).map(([num, desc]) => `*${num}.* ${desc}`).join('\n');
    await sock.sendMessage(chatId, { text: `🎨 *Menu Styles*\n${text}\n\nUse .menustyle <1-8> to switch.` }, { quoted: msg });
  }
};
