import { sendRuntime } from '../../lib/helpers/statusText.js';

export default {
  name: 'runtime',
  alias: ['uptime'],
  description: 'Show how long the bot has been running, plus status and plugin count. Usage: .runtime',
  async execute(sock, msg, args, prefix, ctx) {
    await sendRuntime(sock, msg, ctx);
  }
};
