import { createConverterCommand } from '../../lib/helpers/converterCommand.js';

export default createConverterCommand({ name: 'stickertovideo', path: '/converter/sticker-to-video', input: 'sticker', description: 'Convert an animated sticker URL to a video. Usage: .stickertovideo <sticker url>', send: (video) => ({ video }) });
