import { createConverterCommand } from '../../lib/helpers/converterCommand.js';

export default createConverterCommand({ name: 'videotosticker', path: '/converter/video-to-sticker', input: 'video', description: 'Convert a video URL to a sticker. Usage: .videotosticker <video url>', send: (sticker) => ({ sticker }) });
