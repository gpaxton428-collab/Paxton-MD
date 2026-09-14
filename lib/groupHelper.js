// Shared helpers for group-management commands.

export async function getGroupMetadata(sock, groupJid) {
  try {
    return await sock.groupMetadata(groupJid);
  } catch {
    return null;
  }
}

export function isGroupChat(jid) {
  return typeof jid === 'string' && jid.endsWith('@g.us');
}

// WhatsApp's JID for the same person can show up in different shapes —
// with a ":deviceId" suffix from multi-device senders, or as a totally
// separate @lid identifier instead of @s.whatsapp.net — while group
// metadata often lists a different shape than msg.key.participant uses.
// A strict `p.id === senderJid` check breaks the moment those don't
// match exactly, which is exactly why admin checks were failing for
// actual admins. Normalize before comparing, and check every id-like
// field a participant entry might carry.
function normalizeJidUser(jid) {
  if (!jid) return null;
  return jid.split('@')[0].split(':')[0];
}

function jidMatchesParticipant(participant, jid) {
  if (!jid || !participant) return false;
  const targetUser = normalizeJidUser(jid);
  const candidateIds = [participant.id, participant.jid, participant.lid, participant.phoneNumber].filter(Boolean);
  return candidateIds.some((id) => id === jid || normalizeJidUser(id) === targetUser);
}

export async function isSenderAdmin(sock, groupJid, senderJid) {
  const metadata = await getGroupMetadata(sock, groupJid);
  if (!metadata) return false;
  const participant = metadata.participants.find((p) => jidMatchesParticipant(p, senderJid));
  return !!participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

export async function isBotAdmin(sock, groupJid) {
  const metadata = await getGroupMetadata(sock, groupJid);
  if (!metadata) return false;
  const participant = metadata.participants.find((p) => jidMatchesParticipant(p, sock.user?.id));
  return !!participant && (participant.admin === 'admin' || participant.admin === 'superadmin');
}

// Resolve the target user's JID from a quoted/replied message, an @mention, or a raw number argument.
export function getTargetJid(msg, args) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  if (contextInfo?.participant) return contextInfo.participant;
  const mentioned = contextInfo?.mentionedJid;
  if (Array.isArray(mentioned) && mentioned.length > 0) return mentioned[0];
  if (args && args[0]) {
    const digits = args[0].replace(/[^0-9]/g, '');
    if (digits.length >= 8) return `${digits}@s.whatsapp.net`;
  }
  return null;
}

export function getAllMentionCandidates(msg, args) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const jids = new Set();
  if (contextInfo?.participant) jids.add(contextInfo.participant);
  if (Array.isArray(contextInfo?.mentionedJid)) contextInfo.mentionedJid.forEach((j) => jids.add(j));
  if (args) {
    for (const arg of args) {
      const digits = arg.replace(/[^0-9]/g, '');
      if (digits.length >= 8) jids.add(`${digits}@s.whatsapp.net`);
    }
  }
  return [...jids];
}

// Collect @mentions from wherever WhatsApp actually puts them. Antitag was
// only reading extendedTextMessage.contextInfo, so a mass-tag sent as an
// image/video caption (mentions live under imageMessage/videoMessage's own
// contextInfo, not extendedTextMessage) slipped straight through.
export function getMentionedJids(msg) {
  const m = msg.message || {};
  const sources = [
    m.extendedTextMessage?.contextInfo,
    m.imageMessage?.contextInfo,
    m.videoMessage?.contextInfo,
    m.conversation ? m.contextInfo : null
  ];
  const jids = new Set();
  for (const ctx of sources) {
    if (Array.isArray(ctx?.mentionedJid)) ctx.mentionedJid.forEach((j) => jids.add(j));
  }
  return [...jids];
}

export function replyText(sock, msg, text) {
  return sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
}
