// Multiplayer Tic-Tac-Toe. One active game per chat, stored in memory
// (resets if the bot restarts — fine for a casual game like this, no
// database needed). Doesn't call any external API, so unlike .video
// above this is guaranteed to work regardless of wolvarex's uptime.
import { getMentionedJids } from '../../lib/groupHelper.js';

const games = new Map(); // chatId -> { board, players: { X: jid, O: jid }, turn, startedAt }

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

const CELL_EMOJI = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function renderBoard(board) {
  const cell = (i) => (board[i] === 'X' ? '❌' : board[i] === 'O' ? '⭕' : CELL_EMOJI[i]);
  return [0, 3, 6].map((r) => [cell(r), cell(r + 1), cell(r + 2)].join(' ')).join('\n');
}

function checkWinner(board) {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every((c) => c)) return 'draw';
  return null;
}

function mention(jid) { return `@${jid.split('@')[0]}`; }

export default {
  name: 'tictactoe',
  alias: ['ttt'],
  description: 'Play multiplayer Tic-Tac-Toe in a group. Usage: .tictactoe @opponent to start, .tictactoe <1-9> to move, .tictactoe end to cancel, .tictactoe board to reprint.',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    if (!chatId.endsWith('@g.us')) return sock.sendMessage(chatId, { text: '❌ Tic-Tac-Toe only works in groups (need two players).' }, { quoted: msg });

    const sub = (args[0] || '').toLowerCase();
    const existing = games.get(chatId);

    // .tictactoe end
    if (sub === 'end' || sub === 'cancel') {
      if (!existing) return sock.sendMessage(chatId, { text: 'ℹ️ No active game in this chat.' }, { quoted: msg });
      if (![existing.players.X, existing.players.O].includes(sender)) {
        return sock.sendMessage(chatId, { text: '❌ Only a player in this game can end it.' }, { quoted: msg });
      }
      games.delete(chatId);
      return sock.sendMessage(chatId, { text: '🛑 Game ended.' }, { quoted: msg });
    }

    // .tictactoe board
    if (sub === 'board') {
      if (!existing) return sock.sendMessage(chatId, { text: 'ℹ️ No active game — start one with .tictactoe @opponent' }, { quoted: msg });
      const turnJid = existing.players[existing.turn];
      return sock.sendMessage(chatId, {
        text: `⭕❌ *Tic-Tac-Toe*\n\n${renderBoard(existing.board)}\n\nTurn: ${existing.turn} (${mention(turnJid)})`,
        mentions: [turnJid]
      }, { quoted: msg });
    }

    // .tictactoe <1-9> — make a move
    const cellNum = parseInt(sub, 10);
    if (Number.isInteger(cellNum) && cellNum >= 1 && cellNum <= 9) {
      if (!existing) return sock.sendMessage(chatId, { text: '❌ No active game — start one with .tictactoe @opponent' }, { quoted: msg });
      const mySymbol = existing.players.X === sender ? 'X' : existing.players.O === sender ? 'O' : null;
      if (!mySymbol) return sock.sendMessage(chatId, { text: '❌ You\'re not a player in this game.' }, { quoted: msg });
      if (existing.turn !== mySymbol) return sock.sendMessage(chatId, { text: `⏳ Not your turn — waiting on ${mention(existing.players[existing.turn])}.`, mentions: [existing.players[existing.turn]] }, { quoted: msg });
      const idx = cellNum - 1;
      if (existing.board[idx]) return sock.sendMessage(chatId, { text: '❌ That cell is already taken.' }, { quoted: msg });

      existing.board[idx] = mySymbol;
      const result = checkWinner(existing.board);
      if (result === 'draw') {
        games.delete(chatId);
        return sock.sendMessage(chatId, { text: `🤝 *It's a draw!*\n\n${renderBoard(existing.board)}` }, { quoted: msg });
      }
      if (result) {
        games.delete(chatId);
        const winnerJid = existing.players[result];
        return sock.sendMessage(chatId, { text: `🎉 *${mention(winnerJid)} wins!* (${result})\n\n${renderBoard(existing.board)}`, mentions: [winnerJid] }, { quoted: msg });
      }
      existing.turn = existing.turn === 'X' ? 'O' : 'X';
      const nextJid = existing.players[existing.turn];
      return sock.sendMessage(chatId, {
        text: `${renderBoard(existing.board)}\n\nTurn: ${existing.turn} (${mention(nextJid)})`,
        mentions: [nextJid]
      }, { quoted: msg });
    }

    // Otherwise: try to start a new game against a mentioned opponent
    const mentioned = getMentionedJids(msg).filter((j) => j !== sender);
    const opponent = mentioned[0];
    if (!opponent) {
      return sock.sendMessage(chatId, { text: '❌ Usage:\n.tictactoe @opponent — start a game\n.tictactoe <1-9> — make a move\n.tictactoe board — reprint the board\n.tictactoe end — cancel the game' }, { quoted: msg });
    }
    if (existing) return sock.sendMessage(chatId, { text: '❌ A game is already in progress in this chat. Use .tictactoe end to cancel it first.' }, { quoted: msg });

    const game = { board: Array(9).fill(null), players: { X: sender, O: opponent }, turn: 'X', startedAt: Date.now() };
    games.set(chatId, game);
    await sock.sendMessage(chatId, {
      text: `⭕❌ *Tic-Tac-Toe started!*\n\n${mention(sender)} (❌) vs ${mention(opponent)} (⭕)\n\n${renderBoard(game.board)}\n\nTurn: X (${mention(sender)})\nMove with: .tictactoe <1-9>`,
      mentions: [sender, opponent]
    }, { quoted: msg });
  }
};
