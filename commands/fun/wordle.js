// Wordle — classic 5-letter word guessing game, playable solo or shared
// in a group. One active game per chat, stored in memory (resets on
// restart, same tradeoff as .tictactoe — no database needed for a
// casual game like this).
const WORDS = [
  'about', 'above', 'abuse', 'actor', 'acute', 'admit', 'adopt', 'adult', 'after', 'again',
  'agent', 'agree', 'ahead', 'alarm', 'album', 'alert', 'alike', 'alive', 'allow', 'alone',
  'along', 'alter', 'among', 'anger', 'angle', 'angry', 'apart', 'apple', 'apply', 'arena',
  'argue', 'arise', 'array', 'aside', 'asset', 'audio', 'audit', 'avoid', 'awake', 'award',
  'aware', 'badly', 'baker', 'bases', 'basic', 'basis', 'beach', 'began', 'begin', 'being',
  'below', 'bench', 'billy', 'birth', 'black', 'blame', 'blank', 'blind', 'block', 'blood',
  'board', 'boost', 'booth', 'bound', 'brain', 'brand', 'bread', 'break', 'breed', 'brief',
  'bring', 'broad', 'broke', 'brown', 'build', 'built', 'buyer', 'cable', 'calm', 'camera',
  'candy', 'carry', 'catch', 'cause', 'chain', 'chair', 'chaos', 'charm', 'chart', 'chase',
  'cheap', 'check', 'chest', 'chief', 'child', 'china', 'chose', 'civil', 'claim', 'class',
  'clean', 'clear', 'click', 'climb', 'clock', 'close', 'cloud', 'coach', 'coast', 'could',
  'count', 'court', 'cover', 'craft', 'crash', 'crazy', 'cream', 'crime', 'cross', 'crowd',
  'crown', 'crude', 'curve', 'cycle', 'daily', 'dance', 'dealt', 'death', 'debut', 'delay',
  'depth', 'doing', 'doubt', 'dozen', 'draft', 'drama', 'drawn', 'dream', 'dress', 'drill',
  'drink', 'drive', 'drove', 'dying', 'eager', 'early', 'earth', 'eight', 'elite', 'empty',
  'enemy', 'enjoy', 'enter', 'entry', 'equal', 'error', 'event', 'every', 'exact', 'exist',
  'extra', 'faith', 'fault', 'fiber', 'field', 'fifth', 'fifty', 'fight', 'final', 'first',
  'fixed', 'flash', 'fleet', 'floor', 'fluid', 'focus', 'force', 'forth', 'forty', 'forum',
  'found', 'frame', 'fresh', 'front', 'fruit', 'fully', 'funny', 'giant', 'given', 'glass',
  'globe', 'going', 'grace', 'grade', 'grand', 'grant', 'grass', 'great', 'green', 'gross',
  'group', 'grown', 'guard', 'guess', 'guest', 'guide', 'happy', 'harsh', 'heart', 'heavy',
  'hence', 'horse', 'hotel', 'house', 'human', 'ideal', 'image', 'index', 'inner', 'input',
  'issue', 'joint', 'jones', 'judge', 'known', 'label', 'large', 'laser', 'later', 'laugh',
  'layer', 'learn', 'lease', 'least', 'leave', 'legal', 'level', 'light', 'limit', 'links',
  'lives', 'local', 'logic', 'loose', 'lower', 'lucky', 'lunch', 'lying', 'magic', 'major',
  'maker', 'march', 'match', 'maybe', 'mayor', 'meant', 'media', 'metal', 'might', 'minor',
  'minus', 'mixed', 'model', 'money', 'month', 'moral', 'motor', 'mount', 'mouse', 'mouth',
  'movie', 'music', 'needs', 'never', 'newly', 'night', 'noise', 'north', 'noted', 'novel',
  'nurse', 'occur', 'ocean', 'offer', 'often', 'order', 'other', 'ought', 'paint', 'panel',
  'paper', 'party', 'peace', 'phase', 'phone', 'photo', 'piece', 'pilot', 'pitch', 'place',
  'plain', 'plane', 'plant', 'plate', 'point', 'pound', 'power', 'press', 'price', 'pride',
  'prime', 'print', 'prior', 'prize', 'proof', 'proud', 'prove', 'queen', 'quick', 'quiet',
  'quite', 'radio', 'raise', 'range', 'rapid', 'ratio', 'reach', 'ready', 'realm', 'rebel',
  'refer', 'relax', 'reply', 'right', 'rival', 'river', 'robot', 'roman', 'rough', 'round',
  'route', 'royal', 'rural', 'scale', 'scene', 'scope', 'score', 'sense', 'serve', 'seven',
  'shall', 'shape', 'share', 'sharp', 'sheet', 'shelf', 'shell', 'shift', 'shine', 'shirt',
  'shock', 'shoot', 'short', 'shown', 'sight', 'simon', 'since', 'sixth', 'sixty', 'sized',
  'skill', 'sleep', 'slide', 'small', 'smart', 'smile', 'smith', 'smoke', 'solid', 'solve',
  'sorry', 'sound', 'south', 'space', 'spare', 'speak', 'speed', 'spend', 'spent', 'split',
  'spoke', 'sport', 'staff', 'stage', 'stake', 'stand', 'start', 'state', 'steam', 'steel',
  'stick', 'still', 'stock', 'stone', 'stood', 'store', 'storm', 'story', 'strip', 'stuck',
  'study', 'stuff', 'style', 'sugar', 'suite', 'super', 'sweet', 'table', 'taken', 'taste',
  'taxes', 'teach', 'terry', 'texas', 'thank', 'theft', 'their', 'theme', 'there', 'these',
  'thick', 'thing', 'think', 'third', 'those', 'three', 'threw', 'throw', 'tight', 'times',
  'tired', 'title', 'today', 'topic', 'total', 'touch', 'tough', 'tower', 'track', 'trade',
  'train', 'treat', 'trend', 'trial', 'tried', 'tries', 'truck', 'truly', 'trust', 'truth',
  'twice', 'under', 'undue', 'union', 'unity', 'until', 'upper', 'upset', 'urban', 'usage',
  'usual', 'valid', 'value', 'video', 'virus', 'visit', 'vital', 'voice', 'waste', 'watch',
  'water', 'wheel', 'where', 'which', 'while', 'white', 'whole', 'whose', 'woman', 'women',
  'world', 'worry', 'worse', 'worst', 'worth', 'would', 'wound', 'write', 'wrong', 'wrote',
  'young', 'youth',
];

const games = new Map(); // chatId -> { answer, guesses: string[], startedAt }
const MAX_GUESSES = 6;
const LETTER_BOXES = { a: '🟩', b: '🟨', c: '⬛' };

function scoreGuess(guess, answer) {
  const result = new Array(5).fill('c');
  const answerLetters = answer.split('');
  const guessLetters = guess.split('');
  for (let i = 0; i < 5; i++) {
    if (guessLetters[i] === answerLetters[i]) { result[i] = 'a'; answerLetters[i] = null; }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'a') continue;
    const idx = answerLetters.indexOf(guessLetters[i]);
    if (idx !== -1) { result[i] = 'b'; answerLetters[idx] = null; }
  }
  return result;
}

function renderRow(guess, result) {
  const boxes = result.map((r) => LETTER_BOXES[r]).join('');
  return `${boxes}  ${guess.toUpperCase().split('').join(' ')}`;
}

function renderGame(game, extra = '') {
  const rows = game.guesses.map((g) => renderRow(g, scoreGuess(g, game.answer))).join('\n');
  const left = MAX_GUESSES - game.guesses.length;
  return `🟩 *Wordle*\n\n${rows || '_No guesses yet._'}\n\n${extra}${left} guess${left === 1 ? '' : 'es'} left. Reply with *.wordle <5-letter word>*.`;
}

export default {
  name: 'wordle',
  description: 'Play Wordle in chat — guess the 5-letter word in 6 tries. Usage: .wordle to start/show, .wordle <word> to guess, .wordle end to give up.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const sub = (args[0] || '').toLowerCase();

    if (sub === 'end' || sub === 'giveup' || sub === 'quit') {
      const existing = games.get(chatId);
      if (!existing) return sock.sendMessage(chatId, { text: 'ℹ️ No active game in this chat.' }, { quoted: msg });
      games.delete(chatId);
      return sock.sendMessage(chatId, { text: `🏳️ Gave up. The word was *${existing.answer.toUpperCase()}*.` }, { quoted: msg });
    }

    let game = games.get(chatId);
    if (!game) {
      game = { answer: WORDS[Math.floor(Math.random() * WORDS.length)], guesses: [], startedAt: Date.now() };
      games.set(chatId, game);
      if (!sub) return sock.sendMessage(chatId, { text: renderGame(game, '🆕 New game started!\n\n') }, { quoted: msg });
    }

    if (!sub) return sock.sendMessage(chatId, { text: renderGame(game) }, { quoted: msg });

    const guess = sub.toLowerCase();
    if (!/^[a-z]{5}$/.test(guess)) {
      return sock.sendMessage(chatId, { text: '❌ Guess a single 5-letter English word, e.g. *.wordle crane*' }, { quoted: msg });
    }
    if (!WORDS.includes(guess)) {
      return sock.sendMessage(chatId, { text: `❌ *${guess.toUpperCase()}* isn't in my word list — try another 5-letter word.` }, { quoted: msg });
    }

    game.guesses.push(guess);

    if (guess === game.answer) {
      games.delete(chatId);
      return sock.sendMessage(chatId, { text: `${renderRow(guess, scoreGuess(guess, game.answer))}\n\n🎉 *Solved in ${game.guesses.length}/${MAX_GUESSES}!* The word was *${game.answer.toUpperCase()}*.` }, { quoted: msg });
    }

    if (game.guesses.length >= MAX_GUESSES) {
      games.delete(chatId);
      return sock.sendMessage(chatId, { text: `${renderGame(game)}\n\n💀 Out of guesses — the word was *${game.answer.toUpperCase()}*.` }, { quoted: msg });
    }

    await sock.sendMessage(chatId, { text: renderGame(game) }, { quoted: msg });
  }
};
