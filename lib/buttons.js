// WhatsApp deprecated classic buttonsMessage/templateMessage for most
// clients in 2023 — they're only reliably supported on the official
// Business API now. This uses the newer "interactive native flow"
// format, which sometimes works on regular WhatsApp/Business app but
// is genuinely inconsistent across client versions and OSes. Test with
// .buttontest before relying on this anywhere real — if nothing shows
// up but plain text, that's WhatsApp's client rejecting it, not a bug
// here to "fix"; there's no reliable button format left for personal
// accounts.
export async function sendButtons(sock, jid, { text, footer, buttons, quoted }) {
  const rows = buttons.map((b) => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({ display_text: b.text, id: b.id || b.text })
  }));

  return sock.sendMessage(jid, {
    text,
    footer: footer || '',
    interactiveButtons: rows
  }, quoted ? { quoted } : {});
}
