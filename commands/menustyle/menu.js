// Text-only, compact, permission-aware main menu.
//   .menu                → menu for who you are (owner / admin / group / user)
//   .menu <view>         → public | private | group | owner | admin | user (never above your rights)
//   .menu <category>     → drill-down, e.g. .menu ai   .menu download 2
//   .menu list           → category index only
import { config } from '../../config/index.js';
import { isSenderAdmin, getGroupMetadata } from '../../lib/groupHelper.js';
import { planMenu, buildMainMenu, buildIndex, buildCategory, resolveCategory } from '../../lib/menu/index.js';
import { SCOPE_NAMES } from '../../lib/menu/scopes.js';
import { reply } from '../../lib/helpers/reply.js';
import { sendInteractive, quickButton, selectButton, copyButton } from '../../lib/helpers/interactive.js';

function buildCategorySelector(ctx, scope, isOwner, prefix) {
  const labels = {
    admin: '🛡️ Admin', ai: '🤖 AI', automation: '⚙️ Automation', 'bot-settings': '🔧 Settings',
    converter: '🔄 Converter', dev: '🧑‍💻 Dev', fun: '🎲 Fun', group: '👥 Group', media: '🖼️ Media',
    owner: '👑 Owner', sudo: '🔑 Sudo', tools: '🧰 Tools', user: '👤 User', download: '⬇️ Download',
    search: '🔎 Search', utility: '🧮 Utility', menustyle: '🎨 Menu Style'
  };
  const allowed = new Set(['admin','ai','automation','bot-settings','converter','dev','fun','group','media','owner','sudo','tools','user','download','search','utility','menustyle']);
  const keys = Object.keys(labels).filter((key) => allowed.has(key) && (isOwner || !['owner','sudo','dev'].includes(key)));
  return selectButton('📚 Choose Category', [{
    title: 'Paxton MD Categories',
    rows: keys.map((key) => ({ title: labels[key], description: `Open ${labels[key].replace(/^\S+\s/, '')}`, id: `${prefix}menu ${key}` }))
  }]);
}


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
      const { text, header } = buildMainMenu(ctx, { scope, senderJid, groupName, groupJid: inGroup ? chatId : null, isOwner });

      const channelCtx = ctx.channelContextInfo ? ctx.channelContextInfo() : undefined;
      // Keep the menu as ONE message. The image becomes the native interactive
      // header and `header` remains the caption/body shown with it.
      const menuButtons = [
        quickButton('🏓 Ping', `${prefix}ping`),
        quickButton('🟢 Alive', `${prefix}alive`),
        quickButton('📦 Repo', `${prefix}repo`),
        buildCategorySelector(ctx, scope, isOwner, prefix)
      ];
      if (isOwner) menuButtons.push(copyButton('📋 Copy Number', '27797352930'));
      const allButtons = menuButtons;
      await sendInteractive(sock, chatId, {
        ...(ctx.getGlobalSettings().menuImage ? { image: { url: config.menu.imageUrl } } : {}),
        title: header.split('\n')[0]?.replace(/^[^A-Za-z0-9]+/, '').slice(0, 60) || 'Paxton MD',
        caption: header,
        text,
        footer: '⚡ Paxton-Tech • Tap a quick action or use the commands above',
        buttons: allButtons,
        fallbackText: ctx.getGlobalSettings().menuImage ? `${header}\n\n${text}` : text,
        contextInfo: channelCtx,
        mentions: mention.mentions
      }, { quoted: msg });
    } finally {
      sock.sendPresenceUpdate('paused', chatId).catch(() => {});
    }
  }
};
