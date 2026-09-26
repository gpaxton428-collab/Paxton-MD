import { createAiCommand } from '../../lib/helpers/aiCommand.js';

export default createAiCommand({ name: 'codellama', provider: 'codellama', alias: ['codellm'], label: 'Code Llama (coding questions)' });
