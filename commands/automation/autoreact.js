import { replyWithActions } from '../../lib/helpers/actionReply.js';

export default {
  name: 'autoreact',
  ownerOnly: true,
  description: 'Toggle the bot reacting with ⚡ to every command it receives (owner only). Usage: .autoreact on/off',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const choice = (args[0] || '').toLowerCase();
    if (choice !== 'on' && choice !== 'off') return replyWithActions(sock, msg, '⚙️ *Auto-react Control*\nChoose an action below.', [
      { text: '🟢 ON', id: `${currentPrefix}autoreact on` },
      { text: '🔴 OFF', id: `${currentPrefix}autoreact off` },
      { text: '🏠 Main Menu', id: `${currentPrefix}menu` }
    ]);
    ctx.setGlobalSetting('autoReact', choice === 'on');
    return replyWithActions(sock, msg, `✅ Auto-react ${choice === 'on' ? 'enabled ⚡' : 'disabled'}.`, [
      { text: '🟢 ON', id: `${currentPrefix}autoreact on` },
      { text: '🔴 OFF', id: `${currentPrefix}autoreact off` },
      { text: '🏠 Main Menu', id: `${currentPrefix}menu` }
    ]);
  }
};
