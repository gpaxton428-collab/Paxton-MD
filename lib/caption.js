// One consistent footer for every caption the bot sends on media
// (images/videos/audio/stickers-with-caption). Previously each command
// wrote its own caption ad hoc — some branded, most not — so results
// looked inconsistent depending on which command sent them.
export function brandCaption(text) {
  const body = (text || '').trim();
  return body ? `${body}\n\n_Paxton MD_` : '_Paxton MD_';
}
