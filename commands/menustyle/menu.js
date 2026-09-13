// Image shown as the menu's caption image.
const MENU_IMAGE_URL = 'https://i.ibb.co/DD4L3fVg/a-high-contrast-neon-cyberpunk-anime-style-circul.png';

export default {
  name: 'menu',
  alias: ['help'],
  description: 'Show the full command menu in whichever style is currently set. Usage: .menu',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const { BOT_NAME, BOT_MODE, VERSION, OWNER_NUMBER, isPrefixless, commandCategories, os, getGlobalSettings, channelContextInfo, CHANNEL_LINE, getTotalCommandCount } = ctx;
    const totalCommands = getTotalCommandCount();
    const chatId = msg.key.remoteJid;
    const senderJid = msg.key.participant || msg.key.remoteJid;

    try { await sock.sendPresenceUpdate('composing', chatId); } catch {}

    const menuSettings = getGlobalSettings();
    const style = Number(menuSettings.menuStyle) || 1;
    const footer = menuSettings.menuFooter || 'Powered by Paxton';
    let helpText = '';

    if (style === 2) {
      // Style 2 — clean minimal list, no boxes
      helpText += `⚡ *${BOT_NAME}*\n`;
      helpText += `Owner: Paxton  •  Prefix: ${isPrefixless ? 'none' : currentPrefix}  •  Commands: ${totalCommands}\n\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `*${category.toUpperCase()}*\n`;
        helpText += cmdList.map((cmd) => `${currentPrefix}${cmd}`).join(', ') + '\n\n';
      }
      helpText += `_${footer}_`;
    } else if (style === 3) {
      // Style 3 — numbered, compact
      helpText += `┌─❖ *${BOT_NAME}* ❖─┐\n`;
      helpText += `│ 👑 Paxton   🟢 Online\n`;
      helpText += `└──────────────┘\n\n`;
      let n = 1;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `▸ *${category.toUpperCase()}*\n`;
        cmdList.forEach((cmd) => { helpText += `   ${n++}. ${currentPrefix}${cmd}\n`; });
        helpText += `\n`;
      }
      helpText += `> ${footer}`;
    } else if (style === 6) {
      // Style 6 — "straight" plain list: bold category name, then a bare
      // line per command. No box/border characters at all.
      helpText += `*${BOT_NAME}*\n`;
      helpText += `Prefix: ${isPrefixless ? 'none' : currentPrefix} · ${totalCommands} commands\n\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `*${category.charAt(0).toUpperCase()}${category.slice(1)}*\n`;
        cmdList.forEach((cmd) => { helpText += `${cmd}\n`; });
        helpText += `\n`;
      }
      helpText += `${CHANNEL_LINE}\n\n_${footer}_`;
    } else if (style === 8) {
      // Style 8 ("menu2") — boxed header + bulleted categories
      helpText += `╭─⌈ 🤖 *${BOT_NAME}* ⌋\n`;
      helpText += `│ 👑 Owner: Paxton\n`;
      helpText += `│ 💬 Prefix: [ ${isPrefixless ? 'none' : currentPrefix} ]\n`;
      helpText += `│ 📦 Commands: ${totalCommands}\n`;
      helpText += `╰⊷\n\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `╭─⊷ *${category.toUpperCase()}*\n│\n`;
        cmdList.forEach((cmd) => { helpText += `│  • ${currentPrefix}${cmd}\n`; });
        helpText += `│\n╰─⊷\n\n`;
      }
      helpText += `╭─⊷ *📢 CHANNEL*\n│\n│  view channel below ⬇️\n│\n╰─⊷\n\n`;
      helpText += `*${footer}*`;
    } else if (style === 4) {
      // Style 4 — card style, centered header, diamond bullets
      helpText += `◈━━━━━━━━━━━━━━━◈\n`;
      helpText += `   ⚡ *${BOT_NAME}* ⚡\n`;
      helpText += `◈━━━━━━━━━━━━━━━◈\n`;
      helpText += `👑 Owner: Paxton   🟢 Online   📦 ${totalCommands} cmds\n\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `◆ *${category.toUpperCase()}*\n`;
        cmdList.forEach((cmd) => { helpText += `  ⟢ ${currentPrefix}${cmd}\n`; });
        helpText += `\n`;
      }
      helpText += `◈━━━ ${footer} ━━━◈`;
    } else if (style === 5) {
      // Style 5 — ultra-compact single-line-per-category
      helpText += `⚡ *${BOT_NAME}* | Prefix: ${isPrefixless ? 'none' : currentPrefix} | ${totalCommands} cmds\n`;
      helpText += `━━━━━━━━━━━━━━━━━━━━\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `*${category.toUpperCase()}:* ${cmdList.map((c) => currentPrefix + c).join(' · ')}\n`;
      }
      helpText += `━━━━━━━━━━━━━━━━━━━━\n${footer}`;
    } else if (style === 7) {
      // Style 7 — bold-serif header card + boxed categories
      const toBoldSerif = (s) => {
        const bold = '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗';
        const plain = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return [...s].map((c) => { const i = plain.indexOf(c); return i === -1 ? c : bold[i]; }).join('');
      };
      const uptimeSec = process.uptime();
      const uh = Math.floor(uptimeSec / 3600);
      const um = Math.floor((uptimeSec % 3600) / 60);
      const us = Math.floor(uptimeSec % 60);
      let ramMb = '?';
      try { ramMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(0); } catch {}
      helpText += `╭─❏『 *${toBoldSerif(BOT_NAME)}* 』\n`;
      helpText += `│ *Mode:* ${BOT_MODE}\n`;
      helpText += `│ *Prefix:* [ ${isPrefixless ? 'none' : currentPrefix} ]\n`;
      helpText += `│ *User:* @${(senderJid || '').split('@')[0]}\n`;
      helpText += `│ *Plugins:* ${totalCommands}\n`;
      helpText += `│ *Version:* ${VERSION}\n`;
      helpText += `│ *Uptime:* ${uh}h ${um}m ${us}s\n`;
      helpText += `│ *Time Now:* ${new Date().toLocaleTimeString()}\n`;
      helpText += `│ *Owner:* ${OWNER_NUMBER || 'Not set'}\n`;
      helpText += `│ *Server Ram:* ${ramMb}MB\n`;
      helpText += `╰─❏\n\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `╭─❏ ◈『 *${toBoldSerif(category.toUpperCase())}*』 ◈ \n`;
        cmdList.forEach((cmd) => { helpText += `├❏ ${currentPrefix}${cmd}\n`; });
        helpText += `╰─❏\n\n`;
      }
      helpText += `_${footer}_`;
    } else {
      // Style 1 — boxed (original/default)
      helpText += `╭━━━〔 🌑 ${BOT_NAME.toUpperCase()} V${VERSION} 〕━━━┈⊷\n`;
      helpText += `┃ 👑 Owner: Paxton ⚡\n`;
      helpText += `┃ 📦 Plugins: ${totalCommands}\n`;
      helpText += `┃ 📊 Status: 🟢 ONLINE\n`;
      helpText += `╰━━━━━━━━━━━━━━━┈⊷\n\n`;
      for (const category of commandCategories.keys()) {
        const cmdList = commandCategories.get(category);
        helpText += `╭━━━〔 ${category.toUpperCase()} 〕━━━┈⊷\n`;
        cmdList.forEach((cmd) => { helpText += `┃ ✓ ${currentPrefix}${cmd}\n`; });
        helpText += `╰━━━━━━━━━━━━━━━┈⊷\n\n`;
      }
      helpText += `> ${footer}`;
    }

    const includeChannel = style === 6 || style === 8;
    const menuContextInfo = { mentionedJid: [senderJid], ...(includeChannel ? channelContextInfo() : {}) };
    // Sent as a single image message with the full menu as its caption —
    // no separate loading placeholder, no follow-up text message.
    await sock.sendMessage(chatId, { image: { url: MENU_IMAGE_URL }, caption: helpText, contextInfo: menuContextInfo });
    try { await sock.sendPresenceUpdate('paused', chatId); } catch {}
  }
};
