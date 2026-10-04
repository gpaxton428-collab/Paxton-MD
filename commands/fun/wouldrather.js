import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'wouldrather',
  alias: ['wyr', 'wouldyourather', 'wyr2'],
  description: 'Get a random "would you rather" question. Usage: .wouldrather',
  kind: 'wouldyourather', icon: '🤔', title: 'Would You Rather?',
  fallback: [
    'Would you rather have the ability to fly or be invisible?',
    'Would you rather always be 10 minutes late or 20 minutes early?',
    'Would you rather live without music or without movies?',
    'Would you rather be able to talk to animals or speak every human language?',
    'Would you rather have unlimited money or unlimited time?'
  ]
});
