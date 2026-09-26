import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'reloadplugins',
  alias: ['reloadcmds'],
  ownerOnly: true,
  description: 'Re-scan the commands folder without restarting (owner only). Usage: .reloadplugins',
  async execute(sock, msg, args, prefix, ctx) {
    try {
      const report = await ctx.reloadPlugins();
      const problems = report.failed.length + report.duplicates.length + report.aliasConflicts.length;
      await reply(sock, msg, `♻️ *Plugins reloaded*\n\n📦 Loaded: ${report.loaded}\n⏱️ ${report.durationMs} ms\n${problems ? `⚠️ Problems: ${problems} — see ${prefix}plugins failed` : '✅ No problems'}`);
    } catch (err) {
      await reply(sock, msg, `❌ Reload failed — the previous plugins are still active.\n${String(err.message).slice(0, 150)}`);
    }
  }
};
