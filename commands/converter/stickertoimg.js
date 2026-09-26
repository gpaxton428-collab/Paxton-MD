import { createConverterCommand } from '../../lib/helpers/converterCommand.js';

export default createConverterCommand({ name: 'stickertoimg', path: '/converter/sticker-to-img', input: 'sticker', description: 'Convert a sticker URL to a still image. Usage: .stickertoimg <sticker url>', send: (image) => ({ image }) });
