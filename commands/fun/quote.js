import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'quote',
  description: 'Get a random quote. Usage: .quote',
  kind: 'quote', icon: '💬',
  fallback: [
    'The best way to predict the future is to create it.', 'Simplicity is the ultimate sophistication.',
    'The only way to do great work is to love what you do.', "It always seems impossible until it's done.",
    'Well done is better than well said.'
  ],
  format: (i) => `💬 "${i.text}"${i.author ? `\n\n— ${i.author}` : ''}`
});
