import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'fact',
  alias: ['funfact', 'funfacts'],
  description: 'Get a random fun fact. Usage: .fact',
  kind: 'fact', icon: '💡',
  fallback: [
    'Honey never spoils — archaeologists have found 3000-year-old honey that is still edible.',
    'Octopuses have three hearts.', 'Bananas are berries, but strawberries are not.',
    'A day on Venus is longer than a year on Venus.', 'Wombat poop is cube-shaped.'
  ]
});
