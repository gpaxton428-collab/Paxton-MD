import { getRecentStatusPosts } from '../../lib/statusViews.js';

export default {
  name: 'statusview',
  ownerOnly: true,
  description: "Who viewed your most recent posted status — counts and times (owner only, and only for statuses posted via .togstatus/.setstatus). Usage: .statusview [n]",
  async execute(sock, msg, args, currentPrefix, ctx) {
    const chatId = msg.key.remoteJid;
    const n = parseInt(args[0], 10) || 1;
    const posts = getRecentStatusPosts(n);
    const post = posts[n - 1];
    if (!post) return sock.sendMessage(chatId, { text: 'ℹ️ No tracked status posts yet — post one with .togstatus first.' }, { quoted: msg });
    const viewers = Object.entries(post.viewers || {});
    if (!viewers.length) {
      return sock.sendMessage(chatId, { text: `👀 *Status Views* (posted ${new Date(post.postedAt).toLocaleString()})\n\nNo views recorded yet.\n\n_Note: view tracking depends on WhatsApp/Baileys actually delivering view receipts, which isn't fully guaranteed on every version._` }, { quoted: msg });
    }
    const lines = await Promise.all(viewers.map(async ([jid, ts]) => {
      const num = ctx?.resolveDisplayNumber ? await ctx.resolveDisplayNumber(jid) : jid.split('@')[0];
      return `👤 @${num} — ${new Date(ts).toLocaleTimeString()}`;
    }));
    await sock.sendMessage(chatId, {
      text: `👀 *Status Views* (posted ${new Date(post.postedAt).toLocaleString()})\n*${viewers.length} view${viewers.length === 1 ? '' : 's'}*\n\n${lines.join('\n')}`,
      mentions: viewers.map(([jid]) => jid)
    }, { quoted: msg });
  }
};
