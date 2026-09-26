import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'flirt',
  alias: ['flirtline'],
  description: 'Get a random flirty line. Usage: .flirt',
  kind: 'flirt', icon: '💘',
  fallback: [
    'Is it hot in here, or is it just you?', "If I could rearrange the alphabet, I'd put U and I together.",
    "You must be tired, because you've been running through my mind all day."
  ]
});
