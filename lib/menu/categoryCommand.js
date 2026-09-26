// Factory for the per-category shortcut commands (.aimenu, .funmenu, ...).
import { planMenu, buildCategory } from './index.js';
import { isSenderAdmin } from '../groupHelper.js';
import { reply } from '../helpers/reply.js';
import { replyWithActions } from '../helpers/actionReply.js';

export function createCategoryMenuCommand({ name, category, ownerOnly = false, alias }) {
  return {
    name, alias, ownerOnly,
    description: `Show the ${category} commands. Usage: .${name} [page]`,
    async execute(sock, msg, args, prefix, ctx) {
      const chatId = msg.key.remoteJid;
      const inGroup = chatId.endsWith('@g.us');
      const isOwnerOrSudo = !!ctx.isOwnerOrSudo?.();
      const isAdmin = inGroup && !isOwnerOrSudo ? await isSenderAdmin(sock, chatId, msg.key.participant || chatId).catch(() => false) : false;
      const { scope } = planMenu(ctx, { requested: null, isOwner: isOwnerOrSudo, isAdmin, inGroup });
      const text = buildCategory(ctx, { category, page: args[0], scope, isOwner: !!ctx.isOwner?.() });
      if (!text) return replyWithActions(sock, msg, `🔎 There are no *${category}* commands available to you here.\nSend ${prefix}menu list to see what you can use.`, [
        { text: '🏠 Main Menu', id: `${prefix}menu` },
        { text: '📋 Menu List', id: `${prefix}menu list` }
      ]);
      const pageMatch = text.match(/Page\s+(\d+)\/(\d+)/i);
      const page = pageMatch ? Number(pageMatch[1]) : 1;
      const pages = pageMatch ? Number(pageMatch[2]) : 1;
      const actions = [];
      if (page > 1) actions.push({ text: '⬅️ Previous', id: `${prefix}${name} ${page - 1}` });
      if (page < pages) actions.push({ text: '➡️ Next', id: `${prefix}${name} ${page + 1}` });
      actions.push({ text: '🏠 Main Menu', id: `${prefix}menu` });
      await replyWithActions(sock, msg, text, actions);
    }
  };
}
