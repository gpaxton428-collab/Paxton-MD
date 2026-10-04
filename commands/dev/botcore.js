import { formatRuntimeHMS } from '../../lib/utils/format.js';
import { replyForwarded } from '../../lib/helpers/forwarded.js';

export default {
  name: 'botcore',
  alias: ['core'],
  ownerOnly: true,
  strictOwner: true,
  description: 'Consolidated core health check — connection, memory, uptime, commands, last error (owner only). Usage: .botcore',
  async execute(sock, msg, args, currentPrefix, ctx) {
    const connected = ctx.isWhatsAppConnected ? ctx.isWhatsAppConnected() : true;
    const mem = process.memoryUsage();
    const lastError = globalThis.__paxtonLastError;
    const text = [
      '🩺 *Bot Core*',
      '',
      `WhatsApp: ${connected ? 'Connected 🟢' : 'Disconnected 🔴'}`,
      `Uptime: ${formatRuntimeHMS(process.uptime())}`,
      `Memory: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB used`,
      `Prefix: ${(ctx.getPrefixList?.() || [currentPrefix]).join(' ')}`,
      `Commands: ${ctx.getTotalCommandCount()}`,
      `Last error: ${lastError ? lastError.time : 'none since startup'}`
    ].join('\n');
    await replyForwarded(sock, msg, text);
  }
};
