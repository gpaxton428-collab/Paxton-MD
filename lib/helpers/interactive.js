/**
 * Paxton-MD interactive message helper.
 *
 * WhatsApp's old `buttons`/`templateButtons` payloads are deprecated and may
 * be silently hidden by newer WhatsApp clients.  We therefore prefer the
 * native-flow helper when it is installed, and always retain a plain-text
 * fallback so a menu/repo command can never fail just because interactive UI
 * is unavailable.
 */
let helperPromise;
let baileysPromise;

async function loadBaileys() {
  if (!baileysPromise) {
    baileysPromise = import('@whiskeysockets/baileys').catch(() => null);
  }
  return baileysPromise;
}

async function loadHelper() {
  if (!helperPromise) {
    helperPromise = import('baileys_helper')
      .then((m) => m.default ? { ...m.default, ...m } : m)
      .catch(() => null);
  }
  return helperPromise;
}

function normalizeButtons(buttons = []) {
  return buttons.map((b) => {
    if (b.name && b.buttonParamsJson) return b;
    return {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: String(b.text || b.displayText || b.buttonText?.displayText || 'Open').slice(0, 20),
        id: String(b.id || b.buttonId || '')
      })
    };
  });
}

export async function sendInteractive(sock, jid, data, options = {}) {
  const helper = await loadHelper();
  const baileys = await loadBaileys();
  const buttons = normalizeButtons(data.buttons || data.interactiveButtons || []);
  let payload = { ...data, interactiveButtons: buttons, buttons: undefined };

  // Native Baileys 7 interactive messages can carry a real media header.
  // Build that header only when an image is requested so `.menu` can remain
  // one WhatsApp message: image + caption/body + buttons.
  if (data.image && buttons.length && baileys?.prepareWAMessageMedia && baileys?.proto) {
    try {
      const prepared = await baileys.prepareWAMessageMedia(
        { image: data.image },
        { upload: sock.waUploadToServer }
      );
      const header = baileys.proto.Message.InteractiveMessage.Header.fromObject({
        title: String(data.title || ''),
        hasMediaAttachment: true,
        ...prepared
      });
      const interactiveMessage = baileys.proto.Message.InteractiveMessage.fromObject({
        header,
        body: { text: String(data.caption ?? data.text ?? '') },
        footer: { text: String(data.footer || '') },
        nativeFlowMessage: { buttons }
      });
      payload = { interactiveMessage };
    } catch {
      // If media preparation fails, the helper can still send a button-only
      // message and the fallback below keeps the command usable.
    }
  }

  if (helper?.sendInteractiveMessage && buttons.length) {
    try {
      return await helper.sendInteractiveMessage(sock, jid, payload, options);
    } catch (err) {
      // Fall through to a normal message. Interactive rendering is controlled
      // by WhatsApp's client/server and must never break a command.
    }
  }

  const fallback = data.fallbackText || [
    data.title ? `*${data.title}*` : '',
    data.text || data.caption || '',
    data.footer || '',
    buttons.length ? `\n${buttons.map((b) => {
      try { return `• ${JSON.parse(b.buttonParamsJson).display_text} → ${JSON.parse(b.buttonParamsJson).id}`; }
      catch { return ''; }
    }).filter(Boolean).join('\n')}` : ''
  ].filter(Boolean).join('\n');

  const sendOpts = options.quoted ? { quoted: options.quoted } : undefined;
  if (data.image) {
    try { return await sock.sendMessage(jid, { image: data.image, caption: data.caption ?? data.text ?? fallback }, sendOpts); }
    catch {}
  }
  return sock.sendMessage(jid, { text: fallback }, sendOpts);
}

export function quickButton(displayText, id) {
  return { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: displayText, id }) };
}

export function urlButton(displayText, url) {
  return { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: displayText, url, merchant_url: url }) };
}

export function copyButton(displayText, copyCode) {
  return { name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: displayText, id: String(copyCode), copy_code: String(copyCode) }) };
}

export function selectButton(title, sections) {
  return { name: 'single_select', buttonParamsJson: JSON.stringify({ title, sections }) };
}
