import { createConverterCommand } from '../../lib/helpers/converterCommand.js';

export default createConverterCommand({ name: 'giftovideo', path: '/converter/gif-to-video', input: 'gif', description: 'Convert a GIF URL to an MP4 video. Usage: .giftovideo <gif url>', send: (video) => ({ video }) });
