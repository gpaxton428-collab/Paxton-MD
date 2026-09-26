import { createFunCommand } from '../../lib/helpers/funCommand.js';

export default createFunCommand({
  name: 'dare',
  description: 'Get a random Truth or Dare "dare" challenge. Usage: .dare',
  kind: 'dare', icon: '🔥', title: 'Dare',
  fallback: [
    'Send the last photo in your gallery.', 'Speak in an accent for the next 5 messages.', 'Do 10 pushups and send a video.',
    'Let the group pick your WhatsApp status for a day.', 'Post an embarrassing childhood story.'
  ]
});
