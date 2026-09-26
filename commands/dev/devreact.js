import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'devreact',
  description: 'Control the developer-only reaction. Usage: .devreact on|off|emoji <emoji>',
  ownerOnly: true,
  strictOwner: true,
  async execute(sock, msg, args, prefix, ctx) {
    const choice = (args[0] || '').toLowerCase();
    const settings = ctx.getGlobalSettings();
    if (!choice || choice === 'status') {
      return reply(sock, msg, `👑 *Dev React*\nStatus: *${settings.devReactEnabled !== false ? 'ON' : 'OFF'}*\nEmoji: ${settings.devReactEmoji || '👑'}\nNumber: *+27 797 352 930*`);
    }
    if (choice === 'on' || choice === 'off') {
      ctx.setGlobalSetting('devReactEnabled', choice === 'on');
      return reply(sock, msg, `✅ Dev-only reaction turned *${choice.toUpperCase()}*.`);
    }
    if (choice === 'emoji') {
      const emoji = args.slice(1).join(' ').trim();
      if (!emoji) return reply(sock, msg, `❌ Usage: ${prefix}devreact emoji <emoji>`);
      ctx.setGlobalSetting('devReactEmoji', emoji.slice(0, 8));
      return reply(sock, msg, `✅ Dev reaction emoji set to ${emoji.slice(0, 8)}`);
    }
    return reply(sock, msg, `❌ Usage: ${prefix}devreact on|off|emoji <emoji>`);
  }
};
