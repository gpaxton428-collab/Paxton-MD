import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'truth',
  description: 'Get a random Truth or Dare "truth" question. Usage: .truth',
  kind: 'truth', icon: '🤫', title: 'Truth',
  fallback: [
    'What is your biggest fear?', "What is the most embarrassing thing you've done?", 'Who was your first crush?',
    "What's the weirdest dream you've ever had?", "What's your biggest regret?"
  ]
});
