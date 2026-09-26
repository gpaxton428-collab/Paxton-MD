import { createConverterCommand } from '../../lib/helpers/converterCommand.js';

export default createConverterCommand({ name: 'videotogif', path: '/converter/video-to-gif', input: 'video', description: 'Convert a video URL to a GIF. Usage: .videotogif <video url>', send: (image) => ({ image, mimetype: 'image/gif' }) });
