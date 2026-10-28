import { createLocalConverterCommand } from '../../lib/helpers/localConverterCommand.js';

export default createLocalConverterCommand({
  name: 'stickertoimg', alias: ['stickertoimage', 'toimg'], input: 'sticker', outExt: 'png',
  description: 'Convert a replied sticker to a still image (local, no API key). Usage: reply to a sticker with .stickertoimg',
  ffmpegArgs: ['-frames:v', '1'],
  send: (buf) => ({ image: buf }),
});
