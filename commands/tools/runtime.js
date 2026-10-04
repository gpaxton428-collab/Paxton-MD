import { buildRuntimeText } from '../../lib/helpers/statusText.js';
import { replyForwarded } from '../../lib/helpers/forwarded.js';

export default {
  name: 'runtime',
  alias: ['uptime'],
  description: 'Show how long the bot has been running, plus status and plugin count. Usage: .runtime',
  async execute(sock, msg, args, prefix, ctx) { await replyForwarded(sock, msg, buildRuntimeText(ctx)); }
};
