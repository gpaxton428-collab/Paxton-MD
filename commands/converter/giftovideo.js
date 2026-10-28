import { createLocalConverterCommand } from '../../lib/helpers/localConverterCommand.js';

export default createLocalConverterCommand({
  name: 'giftovideo', input: 'video', outExt: 'mp4',
  description: 'Convert a replied GIF to an MP4 video (local, no API key). Usage: reply to a GIF with .giftovideo',
  ffmpegArgs: ['-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2'],
  send: (buf) => ({ video: buf }),
});
