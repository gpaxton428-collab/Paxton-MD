// Lets an admin talk to the bot in plain language ("hey Paxton kick this
// guy") instead of typing the exact slash command. Deliberately narrow:
// only a small fixed set of admin actions, only triggered by a wake word,
// only usable by someone who's already a group admin, and it always
// re-executes the SAME command file a real ".kick"/".promote"/etc would
// use — so all the normal permission/target-resolution logic still
// applies. This is an intent classifier, not a free-form agent: the AI
// (when used at all) only ever picks one word from a fixed list.

const ACTION_KEYWORDS = {
  kick: ['kick', 'remove him', 'remove her', 'remove them', 'boot him', 'boot her', 'get rid of'],
  promote: ['promote', 'make admin', 'make him admin', 'make her admin', 'give admin'],
  demote: ['demote', 'remove admin', 'take away admin', 'strip admin'],
  warn: ['warn'],
  mute: ['mute the group', 'mute group', 'lock the group', 'lock group'],
  unmute: ['unmute the group', 'unmute group', 'unlock the group', 'unlock group'],
  repo: ['show repo', 'show the repo', "show our repo", 'repo link', 'source code', 'github'],
  owner: ["who's your owner", 'who is your owner', 'whos your owner', 'who made you', 'who owns you', 'your owner']
};

// Actions here don't need an admin-only permission check or a mentioned
// target — they're informational, same bar as any regular user command.
const NO_ADMIN_REQUIRED = new Set(['repo', 'owner']);

const TARGET_REQUIRED = new Set(['kick', 'promote', 'demote', 'warn']);

function buildWakeRegex(botName) {
  const firstName = (botName || 'Paxton').split(' ')[0];
  // "hey paxton", "ok paxton,", "paxton please", "yo paxton:", or just
  // "hey ai" / "hey assistant" as a generic alternate wake word.
  return new RegExp(`^(hey|hi|yo|ok|okay)?[\\s,]*(${firstName}|ai|assistant)[,:!.]?\\s+`, 'i');
}

// Fast, free, deterministic path — covers the overwhelming majority of
// realistic phrasing without needing any AI call at all.
function keywordMatch(text) {
  const lower = text.toLowerCase();
  for (const [action, phrases] of Object.entries(ACTION_KEYWORDS)) {
    if (phrases.some((p) => lower.includes(p))) return action;
  }
  return null;
}

// AI fallback for phrasing that doesn't hit a keyword — strictly a
// single-word classification, never free text, never executed directly.
async function aiClassify(text, getAiReply) {
  const prompt = `Classify the following group-chat instruction into exactly one word from this list: kick, promote, demote, warn, mute, unmute, repo, owner, none. Reply with ONLY that single word, nothing else.\n\nInstruction: "${text}"`;
  try {
    const reply = await getAiReply(prompt);
    if (!reply) return null;
    const word = reply.trim().toLowerCase().replace(/[^a-z]/g, '');
    return Object.keys(ACTION_KEYWORDS).includes(word) ? word : null;
  } catch {
    return null;
  }
}

const MISSION_LINES = [
  '🫡 On it — consider it handled.',
  '⚔️ Currently on a mission... executing now.',
  '🎯 Copy that. Taking care of it.',
  '🛠️ Roger — running that now.'
];

export async function classifyNaturalCommand(text, getAiReply) {
  const kw = keywordMatch(text);
  if (kw) return kw;
  return aiClassify(text, getAiReply);
}

export function matchWakeWord(text, botName) {
  const re = buildWakeRegex(botName);
  const match = re.exec(text);
  if (!match) return null;
  return text.slice(match[0].length).trim();
}

export function needsAdmin(action) {
  return !NO_ADMIN_REQUIRED.has(action);
}

export function needsTarget(action) {
  return TARGET_REQUIRED.has(action);
}

export function randomMissionLine() {
  return MISSION_LINES[Math.floor(Math.random() * MISSION_LINES.length)];
}
