import { createAiCommand } from '../../lib/helpers/aiCommand.js';

export default createAiCommand({ name: 'claude', provider: 'claude', alias: ['opus'], label: 'Claude' });
