import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const GLOBAL_FILE = path.join(DATA_DIR, 'settings.json');
const GROUP_FILE = path.join(DATA_DIR, 'group_settings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return fallback;
    const raw = fs.readFileSync(file, 'utf8');
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const GLOBAL_DEFAULTS = {
  alwaysOnline: false,
  autoRead: false,
  autoTyping: false,
  autoRecording: false,
  antidelete: false,
  autobio: false,
  botMode: 'public',
  language: 'en',
  timezone: 'UTC',
  menuStyle: 1,
  menuFooter: 'Powered by Paxton',
  anticall: false,
  autoViewStatus: false,
  antivv: false,
  welcomeImage: false,
  mutedGroups: [],
  globalBlacklist: [],
  chatbotEnabled: false
};

export function getGlobalSettings() {
  return { ...GLOBAL_DEFAULTS, ...readJson(GLOBAL_FILE, {}) };
}

export function setGlobalSetting(key, value) {
  const current = getGlobalSettings();
  current[key] = value;
  writeJson(GLOBAL_FILE, current);
  return current;
}

const DEFAULT_BADWORDS = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'nigger', 'nigga', 'cunt', 'whore', 'slut', 'faggot', 'retard'];

const GROUP_DEFAULTS = {
  antilink: false,
  antilinkMode: 'invite', // 'invite' = only WhatsApp group invite links, 'all' = any link
  antibadword: false,
  badwords: DEFAULT_BADWORDS,
  antitag: false,
  antidemote: false,
  antidemoteAction: 'demote', // 'demote' = warn + eventually kick actor, 'remove' = kick actor immediately
  antipromote: false,
  antipromoteAction: 'demote', // 'demote' = warn + eventually kick actor, 'remove' = kick actor + promoted user immediately
  antispam: false,
  antifake: false,
  autosavevcf: false,
  chatbotFullReply: false,
  groupEmoji: '',
  allowedCountryCodes: [],
  welcome: true,
  goodbye: true,
  welcomeText: '',
  goodbyeText: '',
  rules: '',
  warnings: {},
  actionWarnings: {}
};

function allGroupSettings() {
  return readJson(GROUP_FILE, {});
}

export function getGroupSettings(groupJid) {
  const all = allGroupSettings();
  return { ...GROUP_DEFAULTS, ...(all[groupJid] || {}) };
}

export function setGroupSetting(groupJid, key, value) {
  const all = allGroupSettings();
  const current = { ...GROUP_DEFAULTS, ...(all[groupJid] || {}) };
  current[key] = value;
  all[groupJid] = current;
  writeJson(GROUP_FILE, all);
  return current;
}

export function addWarning(groupJid, userJid) {
  const settings = getGroupSettings(groupJid);
  const count = (settings.warnings[userJid] || 0) + 1;
  settings.warnings[userJid] = count;
  const all = allGroupSettings();
  all[groupJid] = settings;
  writeJson(GROUP_FILE, all);
  return count;
}

export function resetWarning(groupJid, userJid) {
  const settings = getGroupSettings(groupJid);
  delete settings.warnings[userJid];
  const all = allGroupSettings();
  all[groupJid] = settings;
  writeJson(GROUP_FILE, all);
}

export function addBadWord(groupJid, word) {
  const settings = getGroupSettings(groupJid);
  const w = word.toLowerCase().trim();
  if (!settings.badwords.includes(w)) settings.badwords.push(w);
  return setGroupSetting(groupJid, 'badwords', settings.badwords);
}

export function removeBadWord(groupJid, word) {
  const settings = getGroupSettings(groupJid);
  const w = word.toLowerCase().trim();
  const updated = settings.badwords.filter((x) => x !== w);
  return setGroupSetting(groupJid, 'badwords', updated);
}

// Separate warning track for automated anti-* protections (antidemote,
// antipromote, antispam) so they don't share a counter with manual .warn.
export function addActionWarning(groupJid, userJid, type) {
  const settings = getGroupSettings(groupJid);
  const key = `${type}:${userJid}`;
  const count = (settings.actionWarnings[key] || 0) + 1;
  settings.actionWarnings[key] = count;
  const all = allGroupSettings();
  all[groupJid] = settings;
  writeJson(GROUP_FILE, all);
  return count;
}

export function resetActionWarning(groupJid, userJid, type) {
  const settings = getGroupSettings(groupJid);
  delete settings.actionWarnings[`${type}:${userJid}`];
  const all = allGroupSettings();
  all[groupJid] = settings;
  writeJson(GROUP_FILE, all);
}
