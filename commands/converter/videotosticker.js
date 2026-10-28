import { createLocalConverterCommand } from '../../lib/helpers/localConverterCommand.js';

export default createLocalConverterCommand({
  name: 'videotosticker', input: 'video', outExt: 'webp',
  description: 'Convert a replied short video/GIF to an animated sticker (local, no API key). Usage: reply to a video with .videotosticker',
  ffmpegArgs: ['-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15', '-t', '6', '-an', '-loop', '0', '-vcodec', 'libwebp', '-lossless', '0', '-qscale', '60', '-preset', 'default'],
  send: (buf) => ({ sticker: buf }),
});
