import { reply } from '../../lib/helpers/reply.js';

const WORDS = ['javascript', 'algorithm', 'database', 'network', 'server', 'browser', 'compiler', 'framework', 'library', 'variable', 'function', 'interface', 'protocol', 'encryption', 'deployment', 'repository', 'middleware', 'callback', 'whatsapp', 'keyboard', 'elephant', 'volcano', 'adventure', 'universe'];
const STAGES = ['😐', '😮', '😬', '😰', '😨', '😱', '💀'];
const MAX_WRONG = 6;
const games = new Map();

const shown = (g) => [...g.word].map((c) => (g.guessed.has(c) ? c.toUpperCase() : '_')).join(' ');
const wrong = (g) => [...g.guessed].filter((c) => !g.word.includes(c));

export default {
  name: 'hangman',
  alias: ['hm'],
  description: 'Word guessing game. Usage: .hangman to start, .hm <letter> to guess, .hm stop to quit',
  async execute(sock, msg, args, prefix) {
    const chatId = msg.key.remoteJid;
    const arg = (args[0] || '').toLowerCase();
    const g = games.get(chatId);

    if (arg === 'stop') {
      games.delete(chatId);
      return reply(sock, msg, g ? `🛑 Hangman stopped. The word was *${g.word.toUpperCase()}*.` : '🛑 No game was running.');
    }
    if (/^[a-z]$/.test(arg)) {
      if (!g) return reply(sock, msg, `❓ No game running. Send ${prefix}hangman to start.`);
      if (g.guessed.has(arg)) return reply(sock, msg, `⚠️ *${arg.toUpperCase()}* was already guessed.`);
      g.guessed.add(arg);
      const w = wrong(g).length;
      if (![...g.word].some((c) => !g.guessed.has(c))) { games.delete(chatId); return reply(sock, msg, `🎉 *You won!* The word was *${g.word.toUpperCase()}*`); }
      if (w >= MAX_WRONG) { games.delete(chatId); return reply(sock, msg, `💀 *Game over!* The word was *${g.word.toUpperCase()}*`); }
      return reply(sock, msg, `${STAGES[w]} *Hangman*\n\n${shown(g)}\n\n❌ Wrong (${w}/${MAX_WRONG}): ${wrong(g).join(' ').toUpperCase() || 'none'}\n💡 ${prefix}hm <letter>`);
    }
    if (g) return reply(sock, msg, `${STAGES[wrong(g).length]} *Hangman in progress*\n\n${shown(g)}\n\n💡 ${prefix}hm <letter>  ·  ${prefix}hm stop`);
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    games.set(chatId, { word, guessed: new Set() });
    await reply(sock, msg, `🎮 *Hangman started!*\n\n${[...word].map(() => '_').join(' ')}  (${word.length} letters)\n\n💡 Guess with ${prefix}hm <letter>`);
  }
};
