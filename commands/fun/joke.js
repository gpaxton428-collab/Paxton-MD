import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'joke',
  description: 'Get a random joke. Usage: .joke',
  kind: 'joke', icon: '😂',
  fallback: [
    "Why don't scientists trust atoms? Because they make up everything!",
    'I told my computer I needed a break. It said: "No problem, I\'ll go to sleep."',
    'Why did the developer go broke? Because he used up all his cache.',
    'What do you call a bear with no teeth? A gummy bear.'
  ],
  format: (i) => `😂 ${i.text}${i.answer ? `\n\n${i.answer}` : ''}`
});
