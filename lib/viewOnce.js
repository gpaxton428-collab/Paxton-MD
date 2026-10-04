// Shared by the auto anti-viewonce hook (index.js) and the manual
// .vv / .vv2 commands, so all three recognize the same set of
// view-once message shapes instead of drifting out of sync.
export function extractViewOnceMedia(messageContent) {
  let m = messageContent;
  if (!m) return null;
  if (m.ephemeralMessage?.message) m = m.ephemeralMessage.message;
  if (m.deviceSentMessage?.message) m = m.deviceSentMessage.message;
  const wrapped = m.viewOnceMessageV2?.message || m.viewOnceMessageV2Extension?.message || m.viewOnceMessage?.message;
  if (wrapped?.imageMessage) return { type: 'image', media: wrapped.imageMessage };
  if (wrapped?.videoMessage) return { type: 'video', media: wrapped.videoMessage };
  if (m.imageMessage?.viewOnce) return { type: 'image', media: m.imageMessage };
  if (m.videoMessage?.viewOnce) return { type: 'video', media: m.videoMessage };
  return null;
}

export async function downloadViewOnceMedia(vo) {
  const { downloadContentFromMessage } = await import('@whiskeysockets/baileys');
  const stream = await downloadContentFromMessage(vo.media, vo.type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
