import { createLocalConverterCommand } from '../../lib/helpers/localConverterCommand.js';

export default createLocalConverterCommand({
  name: 'videotogif', input: 'video', outExt: 'gif',
  description: 'Convert a replied video to a GIF (local, no API key). Usage: reply to a video with .videotogif',
  ffmpegArgs: ['-vf', 'fps=12,scale=320:-1:flags=lanczos', '-t', '10'],
  send: (buf) => ({ image: buf, mimetype: 'image/gif' }),
});
