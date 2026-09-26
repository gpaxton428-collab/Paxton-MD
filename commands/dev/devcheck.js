import { detectImageBackends } from '../../lib/helpers/imageProcessor.js';
import { isConfigured } from '../../lib/api/wolvarex.js';
import { config } from '../../config/index.js';

export default {
  name: 'devcheck',
  ownerOnly: true,
  description: 'Developer diagnostics: plugins, load failures, image backends, API key, last error. Usage: .devcheck',
  async execute(sock, msg, args, prefix, ctx) {
    const report = ctx.pluginReport || { loaded: 0, failed: [], duplicates: [], aliasConflicts: [] };
    const backends = await detectImageBackends();
    const last = globalThis.__paxtonLastError;
    const lines = [
      '🛠️ *Dev Check*', '',
      `📦 Version: ${ctx.VERSION} · Node ${process.version} · ${config.platform}`,
      `🔌 Plugins loaded: ${report.loaded} (${ctx.commands.size} registered) · aliases: ${ctx.commandAliases?.size ?? '?'}`,
      `⚠️ Failed to load: ${report.failed.length}${report.failed.length ? `\n${report.failed.slice(0, 8).map((f) => `  • ${f.file}: ${f.error}`).join('\n')}` : ''}`,
      `♻️ Duplicates skipped: ${report.duplicates.length}${report.duplicates.length ? `\n${report.duplicates.slice(0, 5).map((d) => `  • ${d.name}: ${d.skipped} (kept ${d.kept})`).join('\n')}` : ''}`,
      `🔀 Alias conflicts: ${report.aliasConflicts.length}${report.aliasConflicts.length ? `\n${report.aliasConflicts.slice(0, 5).map((d) => `  • ${d.alias} → ${d.command}: ${d.reason}`).join('\n')}` : ''}`,
      `🔑 Wolvarex key: ${isConfigured() ? '✅ configured' : '❌ missing'}`,
      `🖼️ Image backends: ${Object.entries(backends).map(([k, v]) => `${v ? '✅' : '❌'} ${k}`).join(' · ')}`,
      `🩺 WhatsApp: ${ctx.isWhatsAppConnected?.() ? 'connected 🟢' : 'disconnected 🔴'}`,
      `🪵 Last error: ${last ? `${last.time} [${last.scope}] ${last.message.slice(0, 160)}` : 'none since startup'}`
    ];
    await sock.sendMessage(msg.key.remoteJid, { text: lines.join('\n') }, { quoted: msg });
  }
};
