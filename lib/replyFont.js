import { applyFont, FONT_MAPS } from '../commands/menustyle/font.js';

export const REPLY_FONT_STYLES = Object.keys(FONT_MAPS);

// Wraps sock.sendMessage ONCE so every text reply anywhere in the bot —
// index.js and every command file — transparently passes through the
// configured global font style, without needing to touch each of the
// ~330 places that call sock.sendMessage individually. Safe because
// applyFont leaves any character not in the font's map (numbers, emoji,
// box-drawing characters like ╭─❏) completely untouched — it only ever
// remaps letters, so menu styling/formatting can't break.
export function wrapSendMessageWithFont(sock, getGlobalSettings) {
  const original = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options) => {
    try {
      const style = getGlobalSettings().replyFont;
      if (style && style !== 'off' && content && typeof content === 'object') {
        if (typeof content.text === 'string') {
          const styled = applyFont(content.text, style);
          if (styled) content = { ...content, text: styled };
        } else if (typeof content.caption === 'string') {
          const styled = applyFont(content.caption, style);
          if (styled) content = { ...content, caption: styled };
        }
      }
    } catch {}
    return original(jid, content, options);
  };
}
