import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'pickupline',
  description: 'Get a random pickup line. Usage: .pickupline',
  kind: 'pickupline', icon: '😏',
  fallback: [
    'Are you a magician? Because whenever I look at you, everyone else disappears.',
    'Do you have a map? I keep getting lost in your eyes.',
    "Is your name Google? Because you're everything I've been searching for.",
    "If you were a vegetable, you'd be a cute-cumber."
  ]
});
