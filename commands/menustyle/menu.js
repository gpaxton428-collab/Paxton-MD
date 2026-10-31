import { safeErrorMessage } from '../../lib/utils/errors.js';
// Text-only, compact, permission-aware main menu.
//   .menu                → menu for who you are (owner / admin / group / user)
//   .menu <view>         → public | private | group | owner | admin | user (never above your rights)
//   .menu <category>     → drill-down, e.g. .menu ai   .menu download 2
//   .menu list           → category index only
import { isSenderAdmin, getGroupMetadata } from '../../lib/groupHelper.js';
import { planMenu, buildMainMenu, buildIndex, buildCategory, resolveCategory } from '../../lib/menu/index.js';
import { SCOPE_NAMES } from '../../lib/menu/scopes.js';
import { getAdsCard } from '../../lib/menu/ads.js';
import { pickMenuImage } from '../../lib/menu/image.js';
import { reply } from '../../lib/helpers/reply.js';
import { logger } from '../../lib/utils/logger.js';

export default {
  name: 'menu',
  alias: ['help', 'commands'],
  description: 'Show the command menu. Usage: .menu [view|category|list]',
  async execute(sock, msg, args, prefix, ctx) {
    const chatId = msg.key.remoteJid;
    const senderJid = msg.key.participant || chatId;
    const inGroup = chatId.endsWith('@g.us');
    const isOwner = !!ctx.isOwner?.();
    const isOwnerOrSudo = !!ctx.isOwnerOrSudo?.();
    const isAdmin = inGroup && !isOwnerOrSudo ? await isSenderAdmin(sock, chatId, senderJid).catch(() => false) : false;

    try {
      const word = (args[0] || '').toLowerCase();
      const { scope: entitled } = planMenu(ctx, { requested: null, isOwner: isOwnerOrSudo, isAdmin, inGroup });
      let groupName;
      if (inGroup) groupName = (await getGroupMetadata(sock, chatId))?.subject;
      const mention = { mentions: [senderJid] };
      sock.sendPresenceUpdate('composing', chatId).catch(() => {});

      if (['list', 'short', 'index', 'categories'].includes(word)) {
        return await sock.sendMessage(chatId, { text: buildIndex(ctx, { scope: entitled, senderJid, isOwner }), ...mention }, { quoted: msg });
      }

      const category = resolveCategory(word);
      if (category) {
        const text = buildCategory(ctx, { category, page: args[1], scope: entitled, isOwner });
        return reply(sock, msg, text || `🔎 There are no *${word}* commands available to you here.\nSend ${prefix}menu list to see what you can use.`);
      }

      if (word && !SCOPE_NAMES.includes(word) && word !== 'all') {
        return reply(sock, msg, `❓ Unknown menu "${word.slice(0, 20)}".\nTry ${prefix}menu list, ${prefix}menu <category>, or one of: ${SCOPE_NAMES.join(', ')}.`);
      }

      const { scope } = planMenu(ctx, { requested: word === 'all' ? 'owner' : word, isOwner: isOwnerOrSudo, isAdmin, inGroup });
      const { text } = buildMainMenu(ctx, { scope, senderJid, groupName, groupJid: inGroup ? chatId : null, isOwner });

      const card = getAdsCard(ctx.getGlobalSettings());
      const extra = { ...mention, ...(card ? { contextInfo: card } : {}) };

      // One message: the menu picture with the whole command list as its
      // caption. If the picture is switched off or can't be sent, fall back to
      // the same text on its own (retrying once) so the list never goes missing.
      if (ctx.getGlobalSettings().menuImage ?? true) {
        try {
          return await sock.sendMessage(chatId, { image: pickMenuImage(), caption: text, ...extra }, { quoted: msg });
        } catch (err) {
          logger.warn('menu', `menu image+caption failed, falling back to text: ${safeErrorMessage(err)}`);
        }
      }
      try {
        await sock.sendMessage(chatId, { text, ...extra }, { quoted: msg });
      } catch (err) {
        logger.warn('menu', `menu send failed, retrying: ${safeErrorMessage(err)}`);
        await new Promise((r) => setTimeout(r, 1200));
        try {
          await sock.sendMessage(chatId, { text, ...extra }, { quoted: msg });
        } catch (err2) {
          await reply(sock, msg, `❌ The menu failed to send: ${safeErrorMessage(err2)}\nTry ${prefix}menu list for a shorter version.`);
        }
      }
    } finally {
      sock.sendPresenceUpdate('paused', chatId).catch(() => {});
    }
  }
};
