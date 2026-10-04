import { replyForwarded } from '../../lib/helpers/forwarded.js';

export default {
  name: 'version',
  description: 'Show the bot version and Node.js runtime version.',
  async execute(sock, msg, args, prefix, ctx) {
    await replyForwarded(sock, msg, `📦 ${ctx.BOT_NAME} v${ctx.VERSION}\n🟢 Node ${process.version}`);
  }
};
