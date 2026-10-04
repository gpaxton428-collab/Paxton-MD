// Factory for the per-category shortcut commands (.aimenu, .funmenu, ...).
import { planMenu, buildCategory } from './index.js';
import { isSenderAdmin } from '../groupHelper.js';
import { reply } from '../helpers/reply.js';

export function createCategoryMenuCommand({ name, category, ownerOnly = false, strictOwner = false, alias }) {
  return {
    name, alias, ownerOnly, strictOwner,
    description: `Show the ${category} commands. Usage: .${name} [page]`,
    async execute(sock, msg, args, prefix, ctx) {
      const chatId = msg.key.remoteJid;
      const inGroup = chatId.endsWith('@g.us');
      const isOwnerOrSudo = !!ctx.isOwnerOrSudo?.();
      const isAdmin = inGroup && !isOwnerOrSudo ? await isSenderAdmin(sock, chatId, msg.key.participant || chatId).catch(() => false) : false;
      const { scope } = planMenu(ctx, { requested: null, isOwner: isOwnerOrSudo, isAdmin, inGroup });
      const text = buildCategory(ctx, { category, page: args[0], scope, isOwner: !!ctx.isOwner?.() });
      await reply(sock, msg, text || `🔎 There are no *${category}* commands available to you here.\nSend ${prefix}menu list to see what you can use.`);
    }
  };
}
