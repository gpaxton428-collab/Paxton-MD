import { createConverterCommand } from '../../lib/helpers/converterCommand.js';

export default createConverterCommand({
  name: 'urltosticker', path: '/converter/img-to-sticker', input: 'image',
  description: 'Convert an image URL directly to a sticker (for an attached image, use .imgtosticker instead). Usage: .urltosticker <image url>',
  send: (sticker) => ({ sticker })
});
