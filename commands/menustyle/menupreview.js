import { STYLE_DESCRIPTIONS, STYLE_COUNT } from '../../lib/menu/styles.js';
import { SCOPES } from '../../lib/menu/scopes.js';
import { reply } from '../../lib/helpers/reply.js';

export default {
  name: 'menupreview',
  description: 'Describe every menu style and view without switching. Usage: .menupreview',
  async execute(sock, msg, args, prefix) {
    const styles = Object.entries(STYLE_DESCRIPTIONS).map(([n, d]) => `*${n}.* ${d}`).join('\n');
    const views = Object.entries(SCOPES).map(([k, v]) => `${v.icon} *${k}* — ${v.title}`).join('\n');
    await reply(sock, msg, `🎨 *Menu styles (1-${STYLE_COUNT})*\n${styles}\n\n*Views*\n${views}\n\nOwner: ${prefix}menustyle <n> [view|all]\nGroup admin: ${prefix}setmenustyle <n>`);
  }
};
