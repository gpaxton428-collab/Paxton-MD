// Writes WhatsApp sticker-pack EXIF metadata (pack name + author) into a
// webp buffer, so every sticker made by this bot is branded consistently
// instead of carrying over whatever pack name the source sticker had.
//
// node-webpmux is imported lazily (inside the function, not at the top of
// this file) on purpose: a top-level import here would mean that if
// node-webpmux ever fails to install on a given host, every file that
// imports brandSticker (steal.js, stickercrop.js, stickertext.js) would
// fail to load entirely — silently vanishing from the command list and
// throwing off the bot's total command count. Lazy-loading it means those
// commands still load and register normally either way, and only the
// branding step itself degrades gracefully if the package is missing.
export async function brandSticker(webpBuffer, packname = 'Paxton MD', author = 'Paxton MD') {
  try {
    const { default: webpmux } = await import('node-webpmux');
    const img = new webpmux.Image();
    await img.load(webpBuffer);
    const json = {
      'sticker-pack-id': `paxton-md-${Date.now()}`,
      'sticker-pack-name': packname,
      'sticker-pack-publisher': author,
      emojis: ['🤖']
    };
    const exifHeader = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifHeader, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    img.exif = exif;
    return await img.save(null);
  } catch {
    // Package missing, corrupt webp, whatever — fall back to the original
    // buffer rather than losing the sticker entirely.
    return webpBuffer;
  }
}
