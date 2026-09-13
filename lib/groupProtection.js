import { getGroupSettings, addActionWarning } from './settingsStore.js';
import { isBotAdmin } from './groupHelper.js';

// Called on action === 'add' (join) or action === 'remove' (leave) from
// group-participants.update. The settings/config commands for this
// (.welcome, .goodbye, .setwelcometext, .setgoodbyetext) already existed,
// but nothing ever actually sent the message — this was silently dead.
export async function handleWelcomeGoodbye(sock, update, getGlobalSettingsFn) {
  const groupJid = update.id;
  if (!groupJid?.endsWith('@g.us')) return;
  if (update.action !== 'add' && update.action !== 'remove') return;
  const settings = getGroupSettings(groupJid);
  const isJoin = update.action === 'add';
  if (isJoin && !settings.welcome) return;
  if (!isJoin && !settings.goodbye) return;

  let groupName = '';
  try { groupName = (await sock.groupMetadata(groupJid)).subject; } catch {}

  const emoji = settings.groupEmoji || (isJoin ? '🎉' : '👋');
  const template = isJoin
    ? (settings.welcomeText || `Welcome to the group, @user! ${emoji}`)
    : (settings.goodbyeText || `Goodbye, @user. ${emoji}`);

  for (const participant of update.participants) {
    const text = template.replace(/@user/gi, `@${participant.split('@')[0]}`).replace(/@group/gi, groupName || 'the group');
    try {
      let imageUrl = null;
      if (isJoin && getGlobalSettingsFn?.().welcomeImage) {
        try { imageUrl = await sock.profilePictureUrl(participant, 'image'); } catch { imageUrl = null; }
      }
      if (imageUrl) {
        await sock.sendMessage(groupJid, { image: { url: imageUrl }, caption: text, mentions: [participant] });
      } else {
        await sock.sendMessage(groupJid, { text, mentions: [participant] });
      }
    } catch {}
  }
}

// Called on action === 'add' — kicks new joiners whose number's country
// code isn't in the group's allow-list, if .antifake is enabled and an
// allow-list has been set with .allowedcodes.
export async function handleAntifake(sock, update) {
  const groupJid = update.id;
  if (update.action !== 'add' || !groupJid?.endsWith('@g.us')) return;
  const settings = getGroupSettings(groupJid);
  if (!settings.antifake || !settings.allowedCountryCodes?.length) return;
  const botIsAdmin = await isBotAdmin(sock, groupJid);
  if (!botIsAdmin) return;

  for (const participant of update.participants) {
    const number = participant.split('@')[0];
    const matches = settings.allowedCountryCodes.some((code) => number.startsWith(code));
    if (!matches) {
      try {
        await sock.groupParticipantsUpdate(groupJid, [participant], 'remove');
        await sock.sendMessage(groupJid, { text: `🛡️ Removed @${number} — number not from an allowed region.`, mentions: [participant] });
      } catch {}
    }
  }
}

const MAX_ACTION_WARNINGS = 3;

// Called from sock.ev.on('group-participants.update', ...) in index.js.
// Handles both antidemote and antipromote: if an unauthorized admin
// demotes/promotes someone, the bot reverts the action. What happens to
// the people involved depends on the group's action setting:
//   'demote' (default) — warn the actor, kick only the actor once they
//                         hit MAX_ACTION_WARNINGS.
//   'remove'            — immediately kick the actor. For antipromote,
//                         also kicks whoever they promoted (they're not
//                         someone the group owner chose to trust either).
export async function handleGroupProtection(sock, update, ownerJid) {
  const groupJid = update.id;
  if (!groupJid?.endsWith('@g.us')) return;
  const action = update.action;
  if (action !== 'demote' && action !== 'promote') return;

  const actor = update.author;
  if (!actor) return; // Baileys didn't report who did it — nothing safe to act on
  if (actor === ownerJid) return; // owner can always demote/promote freely
  const actorNumber = actor.split('@')[0];
  const botNumber = sock.user?.id?.split(':')[0];
  if (actorNumber === botNumber) return; // the bot itself performed the action

  const settings = getGroupSettings(groupJid);
  const toggleKey = action === 'demote' ? 'antidemote' : 'antipromote';
  if (!settings[toggleKey]) return;

  const botIsAdmin = await isBotAdmin(sock, groupJid);
  if (!botIsAdmin) return; // can't revert or kick without admin rights

  try {
    // Revert the action
    const revertAction = action === 'demote' ? 'promote' : 'demote';
    await sock.groupParticipantsUpdate(groupJid, update.participants, revertAction);
  } catch {}

  const label = action === 'demote' ? 'demoting an admin' : 'promoting someone';
  const actionMode = (action === 'demote' ? settings.antidemoteAction : settings.antipromoteAction) || 'demote';

  if (actionMode === 'remove') {
    // Immediate removal, no grace warnings.
    const toKick = new Set([actor]);
    if (action === 'promote') update.participants.forEach((p) => toKick.add(p)); // kick the promoted user(s) too
    try {
      await sock.groupParticipantsUpdate(groupJid, [...toKick], 'remove');
      await sock.sendMessage(groupJid, {
        text: `🛡️ Removed @${actorNumber}${action === 'promote' ? ' and the user(s) they promoted' : ''} for ${label} without permission.`,
        mentions: [...toKick]
      });
    } catch {}
    return;
  }

  const count = addActionWarning(groupJid, actor, toggleKey);
  if (count >= MAX_ACTION_WARNINGS) {
    try {
      await sock.groupParticipantsUpdate(groupJid, [actor], 'remove');
      await sock.sendMessage(groupJid, {
        text: `🛡️ @${actorNumber} was removed for ${label} without permission (${count}/${MAX_ACTION_WARNINGS} warnings).`,
        mentions: [actor]
      });
    } catch {}
  } else {
    try {
      await sock.sendMessage(groupJid, {
        text: `🛡️ @${actorNumber} — that action was reverted. Warning ${count}/${MAX_ACTION_WARNINGS} for ${label} without permission.`,
        mentions: [actor]
      });
    } catch {}
  }
}
