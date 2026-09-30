// ============================================================
//  Paxton Tech — OPEN SOURCE EDITION
//  ☯️ Paxton Tech — WhatsApp Bot Framework
// ============================================================

const originalConsoleMethods = {
    log: console.log, info: console.info, warn: console.warn,
    error: console.error, debug: console.debug, trace: console.trace,
    dir: console.dir, dirxml: console.dirxml, table: console.table,
    time: console.time, timeEnd: console.timeEnd, timeLog: console.timeLog,
    group: console.group, groupEnd: console.groupEnd, groupCollapsed: console.groupCollapsed,
    clear: console.clear, count: console.count, countReset: console.countReset,
    assert: console.assert, profile: console.profile, profileEnd: console.profileEnd,
    timeStamp: console.timeStamp, context: console.context
};

const shouldShowLog = (args) => {
    if (args.length === 0) return true;
    const firstArg = args[0];
    if (typeof firstArg !== 'string') return true;
    const lowerMsg = firstArg.toLowerCase();
    if (lowerMsg.includes('command') ||
        lowerMsg.includes('✅') || lowerMsg.includes('❌') ||
        lowerMsg.includes('👥') || lowerMsg.includes('👤')) return true;
    if (!lowerMsg.includes('baileys') && !lowerMsg.includes('signal') &&
        !lowerMsg.includes('session') && !lowerMsg.includes('buffer') &&
        !lowerMsg.includes('key')) return true;
    const noisyPatterns = ['closing session','Closing open session', 'sessionentry', 'registrationid',
        'currentratchet', 'buffer', '05 ', '0x', 'failed to decrypt'];
    return !noisyPatterns.some(pattern => lowerMsg.includes(pattern));
};

for (const method of Object.keys(originalConsoleMethods)) {
    if (typeof console[method] === 'function') {
        console[method] = function (...args) {
            if (shouldShowLog(args)) originalConsoleMethods[method].apply(console, args);
        };
    }
}

function setupProcessFilter() {
    const originalStdoutWrite = process.stdout.write;
    const originalStderrWrite = process.stderr.write;
    const sessionPatterns = ['closing session','Closing open session','sessionentry','registrationid','currentratchet',
        'indexinfo','pendingprekey','_chains','ephemeralkeypair','lastremoteephemeralkey','rootkey','basekey'];
    const filterOutput = (chunk) => {
        const lowerChunk = chunk.toString().toLowerCase();
        return !sessionPatterns.some(p => lowerChunk.includes(p));
    };
    process.stdout.write = function (chunk, encoding, callback) {
        if (filterOutput(chunk)) return originalStdoutWrite.call(this, chunk, encoding, callback);
        if (callback) callback(); return true;
    };
    process.stderr.write = function (chunk, encoding, callback) {
        if (filterOutput(chunk)) return originalStderrWrite.call(this, chunk, encoding, callback);
        if (callback) callback(); return true;
    };
}

process.env.DEBUG = '';
process.env.NODE_ENV = 'production';
process.env.BAILEYS_LOG_LEVEL = 'fatal';
process.env.PINO_LOG_LEVEL = 'fatal';
process.env.BAILEYS_DISABLE_LOG = 'true';
process.env.DISABLE_BAILEYS_LOG = 'true';
process.env.PINO_DISABLE = 'true';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import os from 'os';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';
import { getGlobalSettings, setGlobalSetting, getGroupSettings, addActionWarning, addWarning } from './lib/settingsStore.js';
import { handleGroupProtection, handleAntifake } from './lib/groupProtection.js';
import { isBotAdmin, isSenderAdmin, getMentionedJids } from './lib/groupHelper.js';
import { extractViewOnceMedia, downloadViewOnceMedia } from './lib/viewOnce.js';
import { getAiReply } from './lib/aiApi.js';
import { isSudo } from './lib/sudo.js';

dotenv.config({ path: './.env' });

let messageLogCounter = 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSION_DIR = './session';
const BOT_NAME = process.env.BOT_NAME || 'Paxton Tech';
const VERSION = '1.0.0';
const DEFAULT_PREFIX = process.env.PREFIX || '.';
const OWNER_FILE = './owner.json';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_SETTINGS_FILE = './bot_settings.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';
const BLOCKED_USERS_FILE = './blocked_users.json';
const WELCOME_DATA_FILE = './data/welcome_data.json';
const AUTO_CONNECT_ON_LINK = true;
const AUTO_CONNECT_ON_START = true;
const RATE_LIMIT_ENABLED = true;
const MIN_COMMAND_DELAY = 1000;
const STICKER_DELAY = 2000;
// Disabled by default — this pointed at the original template's own
// WhatsApp community group. Auto-joining a group under a different
// brand's name without it being your own group isn't appropriate to
// carry over. Set your own GROUP_LINK below and flip this back on if
// you want the auto-join-on-owner-link feature.
const AUTO_JOIN_ENABLED = false;
const AUTO_JOIN_DELAY = 2000;
const SEND_WELCOME_MESSAGE = true;
const GROUP_LINK = process.env.GROUP_LINK || 'https://chat.whatsapp.com/DIDhRW19119EICPJpxdpTc'; // set your own via .env GROUP_LINK
const GROUP_INVITE_CODE = GROUP_LINK.split('/').pop();
const GROUP_NAME = 'PAXTON TECH SQUAD ☯️';
const AUTO_JOIN_LOG_FILE = './auto_join_log.json';

function silenceBaileysCompletely() {
    try { const pino = require('pino'); pino({ level: 'silent', enabled: false }); } catch {}
}
silenceBaileysCompletely();
console.clear();
setupProcessFilter();

class UltraCleanLogger {
    static log(...args) {
        const message = args.join(' ').toLowerCase();
        const suppressPatterns = ['buffer','timeout','transaction','failed to decrypt','received error','sessionerror','bad mac','stream errored','baileys','whatsapp','ws','closing session','Closing open session','sessionentry','_chains','registrationid','currentratchet','indexinfo','pendingprekey','ephemeralkeypair','lastremoteephemeralkey','rootkey','basekey','signal','key','ratchet','encryption','decryption','qr','scan','pairing','connection.update','creds.update','messages.upsert','group','participant','metadata','presence.update','chat.update','message.receipt.update','message.update','keystore','keypair','pubkey','privkey','<buffer','05 ','0x','signalkey','signalprotocol','sessionstate','senderkey','groupcipher','signalgroup'];
        for (const pattern of suppressPatterns) { if (message.includes(pattern)) return; }
        const timestamp = chalk.gray(`[${new Date().toLocaleTimeString()}]`);
        const cleanArgs = args.map(arg => typeof arg === 'string' ? arg.replace(/\n\s+/g, ' ') : arg);
        originalConsoleMethods.log(timestamp, ...cleanArgs);
    }
    static error(...args) {
        const message = args.join(' ');
        if (message.toLowerCase().includes('fatal') || message.toLowerCase().includes('critical') || message.includes('❌')) {
            const timestamp = chalk.red(`[${new Date().toLocaleTimeString()}]`);
            originalConsoleMethods.error(timestamp, ...args);
        }
    }
    static success(...args) { originalConsoleMethods.log(chalk.green(`[${new Date().toLocaleTimeString()}]`), chalk.green('✅'), ...args); }
    static info(...args) { originalConsoleMethods.log(chalk.blue(`[${new Date().toLocaleTimeString()}]`), chalk.blue('ℹ️'), ...args); }
    static warning(...args) { originalConsoleMethods.log(chalk.yellow(`[${new Date().toLocaleTimeString()}]`), chalk.yellow('⚠️'), ...args); }
    static event(...args) { originalConsoleMethods.log(chalk.magenta(`[${new Date().toLocaleTimeString()}]`), chalk.magenta('🎭'), ...args); }
    static command(...args) { originalConsoleMethods.log(chalk.cyan(`[${new Date().toLocaleTimeString()}]`), chalk.cyan('💬'), ...args); }
    static critical(...args) { originalConsoleMethods.error(chalk.red(`[${new Date().toLocaleTimeString()}]`), chalk.red('🚨'), ...args); }
    static group(...args) { originalConsoleMethods.log(chalk.magenta(`[${new Date().toLocaleTimeString()}]`), chalk.magenta('👥'), ...args); }
    static member(...args) { originalConsoleMethods.log(chalk.cyan(`[${new Date().toLocaleTimeString()}]`), chalk.cyan('👤'), ...args); }
}

console.log = UltraCleanLogger.log;
console.error = UltraCleanLogger.error;
console.info = UltraCleanLogger.info;
console.warn = UltraCleanLogger.warning;
console.debug = () => {};
console.critical = UltraCleanLogger.critical;
global.logSuccess = UltraCleanLogger.success;
global.logInfo = UltraCleanLogger.info;
global.logWarning = UltraCleanLogger.warning;
global.logEvent = UltraCleanLogger.event;
global.logCommand = UltraCleanLogger.command;
global.logGroup = UltraCleanLogger.group;
global.logMember = UltraCleanLogger.member;

const ultraSilentLogger = {
    level: 'silent', trace: () => {}, debug: () => {}, info: () => {}, warn: () => {},
    error: () => {}, fatal: () => {}, child: () => ultraSilentLogger, log: () => {},
    success: () => {}, warning: () => {}, event: () => {}, command: () => {}
};

class RateLimitProtection {
    constructor() {
        this.commandTimestamps = new Map();
        this.userCooldowns = new Map();
        this.globalCooldown = Date.now();
        this.stickerSendTimes = new Map();
        setInterval(() => this.cleanup(), 60000);
    }
    canSendCommand(chatId, userId, command) {
        if (!RATE_LIMIT_ENABLED) return { allowed: true };
        const now = Date.now();
        const userKey = `${userId}_${command}`;
        const chatKey = `${chatId}_${command}`;
        if (this.userCooldowns.has(userKey)) {
            const timeDiff = now - this.userCooldowns.get(userKey);
            if (timeDiff < MIN_COMMAND_DELAY) return { allowed: false, reason: `Please wait ${Math.ceil((MIN_COMMAND_DELAY - timeDiff) / 1000)}s before using ${command} again.` };
        }
        if (this.commandTimestamps.has(chatKey)) {
            const timeDiff = now - this.commandTimestamps.get(chatKey);
            if (timeDiff < MIN_COMMAND_DELAY) return { allowed: false, reason: `Command cooldown: ${Math.ceil((MIN_COMMAND_DELAY - timeDiff) / 1000)}s remaining.` };
        }
        if (now - this.globalCooldown < 250) return { allowed: false, reason: 'System is busy. Please try again in a moment.' };
        this.userCooldowns.set(userKey, now);
        this.commandTimestamps.set(chatKey, now);
        this.globalCooldown = now;
        return { allowed: true };
    }
    async waitForSticker(chatId) {
        if (!RATE_LIMIT_ENABLED) { await this.delay(STICKER_DELAY); return; }
        const now = Date.now();
        const lastSticker = this.stickerSendTimes.get(chatId) || 0;
        const timeDiff = now - lastSticker;
        if (timeDiff < STICKER_DELAY) await this.delay(STICKER_DELAY - timeDiff);
        this.stickerSendTimes.set(chatId, Date.now());
    }
    delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
    cleanup() {
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        for (const [key, timestamp] of this.userCooldowns.entries()) { if (now - timestamp > fiveMinutes) this.userCooldowns.delete(key); }
        for (const [key, timestamp] of this.commandTimestamps.entries()) { if (now - timestamp > fiveMinutes) this.commandTimestamps.delete(key); }
    }
}

const rateLimiter = new RateLimitProtection();

let prefixCache = DEFAULT_PREFIX;
let prefixHistory = [];
let isPrefixless = false;

function getCurrentPrefix() { return isPrefixless ? '' : prefixCache; }

function savePrefixToFile(newPrefix) {
    try {
        const isNone = newPrefix === 'none' || newPrefix === '""' || newPrefix === "''" || newPrefix === '';
        fs.writeFileSync(PREFIX_CONFIG_FILE, JSON.stringify({ prefix: isNone ? '' : newPrefix, isPrefixless: isNone, setAt: new Date().toISOString(), timestamp: Date.now(), version: VERSION, previousPrefix: prefixCache, previousIsPrefixless: isPrefixless }, null, 2));
        fs.writeFileSync(BOT_SETTINGS_FILE, JSON.stringify({ prefix: isNone ? '' : newPrefix, isPrefixless: isNone, prefixSetAt: new Date().toISOString(), prefixChangedAt: Date.now(), previousPrefix: prefixCache, previousIsPrefixless: isPrefixless, version: VERSION }, null, 2));
        return true;
    } catch (error) { UltraCleanLogger.error(`Error saving prefix: ${error.message}`); return false; }
}

function loadPrefixFromFiles() {
    try {
        if (fs.existsSync(PREFIX_CONFIG_FILE)) {
            const config = JSON.parse(fs.readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
            if (config.isPrefixless !== undefined) isPrefixless = config.isPrefixless;
            if (config.prefix !== undefined) {
                if (config.prefix.trim() === '' && config.isPrefixless) return '';
                if (config.prefix.trim() !== '') return config.prefix.trim();
            }
        }
        if (fs.existsSync(BOT_SETTINGS_FILE)) {
            const settings = JSON.parse(fs.readFileSync(BOT_SETTINGS_FILE, 'utf8'));
            if (settings.isPrefixless !== undefined) isPrefixless = settings.isPrefixless;
            if (settings.prefix && settings.prefix.trim() !== '') return settings.prefix.trim();
        }
    } catch (error) { UltraCleanLogger.warning(`Error loading prefix: ${error.message}`); }
    return DEFAULT_PREFIX;
}

function updatePrefixImmediately(newPrefix) {
    const oldPrefix = prefixCache;
    const oldIsPrefixless = isPrefixless;
    const isNone = newPrefix === 'none' || newPrefix === '""' || newPrefix === "''" || newPrefix === '';
    if (isNone) { isPrefixless = true; prefixCache = ''; }
    else {
        if (!newPrefix || newPrefix.trim() === '') return { success: false, error: 'Empty prefix' };
        if (newPrefix.length > 5) return { success: false, error: 'Prefix too long' };
        prefixCache = newPrefix.trim(); isPrefixless = false;
    }
    if (typeof global !== 'undefined') { global.prefix = getCurrentPrefix(); global.CURRENT_PREFIX = getCurrentPrefix(); global.isPrefixless = isPrefixless; }
    process.env.PREFIX = getCurrentPrefix();
    savePrefixToFile(newPrefix);
    prefixHistory.push({ oldPrefix: oldIsPrefixless ? 'none' : oldPrefix, newPrefix: isPrefixless ? 'none' : prefixCache, isPrefixless, oldIsPrefixless, timestamp: new Date().toISOString(), time: Date.now() });
    if (prefixHistory.length > 10) prefixHistory = prefixHistory.slice(-10);
    updateTerminalHeader();
    return { success: true, oldPrefix: oldIsPrefixless ? 'none' : oldPrefix, newPrefix: isPrefixless ? 'none' : prefixCache, isPrefixless, timestamp: new Date().toISOString() };
}

function updateTerminalHeader() {
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
    console.clear();
    console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════════════╗
║   ☯️ ${chalk.bold(`${BOT_NAME.toUpperCase()} v${VERSION}`)}
║   💬 Prefix  : ${prefixDisplay}
║   🔧 Auto Fix: ✅ ENABLED
║   🛡️ Rate Limit Protection: ✅ ACTIVE
║   🔗 Auto-Connect on Link: ${AUTO_CONNECT_ON_LINK ? '✅' : '❌'}
║   🔐 Login Methods: Pairing Code | Session ID
╚══════════════════════════════════════════════════════════════════════╝
`));
}

prefixCache = '.';
isPrefixless = prefixCache === '' ? true : false;
updateTerminalHeader();

function detectPlatform() {
    if (process.env.PANEL) return 'Panel';
    if (process.env.HEROKU) return 'Heroku';
    if (process.env.RENDER) return 'Render';
    if (process.env.REPLIT) return 'Replit';
    if (process.env.VERCEL) return 'Vercel';
    return 'Local/VPS';
}

let OWNER_NUMBER = null, OWNER_JID = null, OWNER_CLEAN_JID = null, OWNER_CLEAN_NUMBER = null, OWNER_LID = null;
let SOCKET_INSTANCE = null, isConnected = false, store = null;
let heartbeatInterval = null, lastActivityTime = Date.now(), connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 10;
let BOT_MODE = 'public', WHITELIST = new Set(), AUTO_LINK_ENABLED = true;
let AUTO_CONNECT_COMMAND_ENABLED = true, AUTO_ULTIMATE_FIX_ENABLED = true;
let isWaitingForPairingCode = false, RESTART_AUTO_FIX_ENABLED = true;
let hasAutoConnectedOnStart = false;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class JidManager {
    constructor() {
        this.ownerJids = new Set();
        this.ownerLids = new Set();
        this.owner = null;
        this.loadOwnerData();
        this.loadWhitelist();
        UltraCleanLogger.success('JID Manager initialized');
    }
    loadOwnerData() {
        try {
            if (fs.existsSync(OWNER_FILE)) {
                const data = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8'));
                const ownerJid = data.OWNER_JID;
                if (ownerJid) {
                    const cleaned = this.cleanJid(ownerJid);
                    this.owner = { rawJid: ownerJid, cleanJid: cleaned.cleanJid, cleanNumber: cleaned.cleanNumber, isLid: cleaned.isLid, linkedAt: data.linkedAt || new Date().toISOString() };
                    this.ownerJids.clear(); this.ownerLids.clear();
                    this.ownerJids.add(cleaned.cleanJid); this.ownerJids.add(ownerJid);
                    if (cleaned.isLid) { this.ownerLids.add(ownerJid); this.ownerLids.add(ownerJid.split('@')[0]); OWNER_LID = ownerJid; }
                    OWNER_JID = ownerJid; OWNER_NUMBER = cleaned.cleanNumber; OWNER_CLEAN_JID = cleaned.cleanJid; OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                }
            }
        } catch {}
    }
    loadWhitelist() {
        try {
            if (fs.existsSync(WHITELIST_FILE)) {
                const data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8'));
                if (data.whitelist && Array.isArray(data.whitelist)) data.whitelist.forEach(item => WHITELIST.add(item));
            }
        } catch {}
    }
    cleanJid(jid) {
        if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        const isLid = jid.includes('@lid');
        if (isLid) return { raw: jid, cleanJid: jid, cleanNumber: jid.split('@')[0], isLid: true };
        const [numberPart] = jid.split('@')[0].split(':');
        const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        const cleanNumber = numberPart.replace(/[^0-9]/g, '');
        const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
        return { raw: jid, cleanJid: `${normalizedNumber}@${serverPart}`, cleanNumber: normalizedNumber, isLid: false };
    }
    isOwner(msg) {
        if (!msg || !msg.key) return false;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = this.cleanJid(senderJid);
        if (!this.owner || !this.owner.cleanNumber) return false;
        // Baileys 7: when the sender id is a @lid, the phone-number id comes in these fields.
        for (const alt of [msg.key.participantAlt, msg.key.remoteJidAlt]) {
            if (!alt || typeof alt !== 'string' || !alt.includes('@s.whatsapp.net')) continue;
            const altClean = this.cleanJid(alt);
            if (this.ownerJids.has(altClean.cleanJid) || this.ownerJids.has(alt)) return true;
        }
        if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) return true;
        if (cleaned.isLid) {
            const lidNumber = cleaned.cleanNumber;
            if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) return true;
            if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) return true;
        }
        return false;
    }
    setNewOwner(newJid, isAutoLinked = false) {
        try {
            const cleaned = this.cleanJid(newJid);
            this.ownerJids.clear(); this.ownerLids.clear(); WHITELIST.clear();
            this.owner = { rawJid: newJid, cleanJid: cleaned.cleanJid, cleanNumber: cleaned.cleanNumber, isLid: cleaned.isLid, linkedAt: new Date().toISOString(), autoLinked: isAutoLinked };
            this.ownerJids.add(cleaned.cleanJid); this.ownerJids.add(newJid);
            if (cleaned.isLid) { this.ownerLids.add(newJid); this.ownerLids.add(newJid.split('@')[0]); OWNER_LID = newJid; } else { OWNER_LID = null; }
            OWNER_JID = newJid; OWNER_NUMBER = cleaned.cleanNumber; OWNER_CLEAN_JID = cleaned.cleanJid; OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            fs.writeFileSync(OWNER_FILE, JSON.stringify({ OWNER_JID: newJid, OWNER_NUMBER: cleaned.cleanNumber, OWNER_CLEAN_JID: cleaned.cleanJid, OWNER_CLEAN_NUMBER: cleaned.cleanNumber, ownerLID: cleaned.isLid ? newJid : null, linkedAt: new Date().toISOString(), autoLinked: isAutoLinked, previousOwnerCleared: true, version: VERSION }, null, 2));
            UltraCleanLogger.success(`New owner set: ${cleaned.cleanJid}`);
            return { success: true, owner: this.owner, isLid: cleaned.isLid };
        } catch { return { success: false, error: 'Failed to set new owner' }; }
    }
    getOwnerInfo() {
        return { ownerJid: this.owner?.cleanJid || null, ownerNumber: this.owner?.cleanNumber || null, ownerLid: OWNER_LID || null, jidCount: this.ownerJids.size, lidCount: this.ownerLids.size, whitelistCount: WHITELIST.size, isLid: this.owner?.isLid || false, linkedAt: this.owner?.linkedAt || null };
    }
}

// Bootstrap owner.json from an OWNER_NUMBER env var if the file doesn't
// exist yet. owner.json is gitignored on purpose (so a real owner number
// doesn't sit in a public repo) — but that means a fresh deploy from git
// has NO owner file at all, and the bot falls back to auto-claiming
// whoever messages it first as owner. Setting OWNER_NUMBER in your host's
// environment variables (Render, panel, etc.) survives every redeploy
// and fixes that regardless of what git does or doesn't track.
const DEFAULT_OWNER_NUMBER = '27797352930'; // Paxton Tech owner; OWNER_NUMBER env var overrides it
(function bootstrapOwnerFromEnv() {
    try {
        if (fs.existsSync(OWNER_FILE)) return;
        const num = (process.env.OWNER_NUMBER || DEFAULT_OWNER_NUMBER).replace(/[^0-9]/g, '');
        if (!num) return;
        const jid = `${num}@s.whatsapp.net`;
        fs.writeFileSync(OWNER_FILE, JSON.stringify({
            OWNER_JID: jid, OWNER_NUMBER: num, OWNER_CLEAN_JID: jid, OWNER_CLEAN_NUMBER: num,
            ownerLID: null, linkedAt: new Date().toISOString(), autoLinked: false,
            previousOwnerCleared: true, version: VERSION
        }, null, 2));
    } catch {}
})();

const jidManager = new JidManager();

class NewMemberDetector {
    constructor() {
        this.enabled = true;
        this.detectedMembers = new Map();
        this.groupMembersCache = new Map();
        this.loadDetectionData();
        UltraCleanLogger.success('New Member Detector initialized');
    }
    loadDetectionData() {
        try {
            if (fs.existsSync('./data/member_detection.json')) {
                const data = JSON.parse(fs.readFileSync('./data/member_detection.json', 'utf8'));
                if (data.detectedMembers) for (const [g, m] of Object.entries(data.detectedMembers)) this.detectedMembers.set(g, m);
            }
        } catch (error) { UltraCleanLogger.warning(`Could not load member detection data: ${error.message}`); }
    }
    saveDetectionData() {
        try {
            const data = { detectedMembers: {}, updatedAt: new Date().toISOString(), totalGroups: this.detectedMembers.size };
            for (const [groupId, members] of this.detectedMembers.entries()) data.detectedMembers[groupId] = members;
            if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
            fs.writeFileSync('./data/member_detection.json', JSON.stringify(data, null, 2));
        } catch (error) { UltraCleanLogger.warning(`Could not save member detection data: ${error.message}`); }
    }
    async detectNewMembers(sock, groupUpdate) {
        try {
            if (!this.enabled) return null;
            const { id: groupId, action } = groupUpdate;
            if (action === 'add' || action === 'invite') {
                const rawParticipants = groupUpdate.participants || [];
                const metadata = await sock.groupMetadata(groupId);
                const groupName = metadata.subject || 'Unknown Group';
                let cachedMembers = this.groupMembersCache.get(groupId) || new Set();
                const newMembers = [];

                for (const raw of rawParticipants) {
                    const participant = typeof raw === 'string' ? raw : (raw?.id || raw?.jid || String(raw));
                    if (!participant || !participant.includes('@')) continue;

                    if (!cachedMembers.has(participant)) {
                        try {
                            const userInfo = await sock.onWhatsApp(participant);
                            const userName = userInfo?.[0]?.name || participant.split('@')[0];
                            const userNumber = participant.split('@')[0];
                            newMembers.push({ jid: participant, name: userName, number: userNumber, addedAt: new Date().toISOString(), timestamp: Date.now(), action, addedBy: groupUpdate.actor || 'unknown' });
                            cachedMembers.add(participant);
                            logMember(`➕ ${action.toUpperCase()}: ${userName} (+${userNumber})`);
                            logGroup(`👥 Group: ${groupName}`);
                        } catch (error) { UltraCleanLogger.warning(`Could not get user info for ${participant}: ${error.message}`); }
                    }
                }

                this.groupMembersCache.set(groupId, cachedMembers);
                if (newMembers.length > 0) {
                    const groupEvents = this.detectedMembers.get(groupId) || [];
                    groupEvents.push(...newMembers);
                    this.detectedMembers.set(groupId, groupEvents.slice(-50));
                    if (Math.random() < 0.2) this.saveDetectionData();
                    return newMembers;
                }
            }
            return null;
        } catch (error) { UltraCleanLogger.error(`Member detection error: ${error.message}`); return null; }
    }
    getStats() {
        let totalEvents = 0;
        for (const events of this.detectedMembers.values()) totalEvents += events.length;
        return { enabled: this.enabled, totalGroups: this.detectedMembers.size, totalEvents, cachedGroups: this.groupMembersCache.size };
    }
}

const memberDetector = new NewMemberDetector();

class AutoGroupJoinSystem {
    constructor() {
        this.invitedUsers = new Set();
        this.loadInvitedUsers();
        UltraCleanLogger.success('Auto-Join System initialized');
    }
    loadInvitedUsers() {
        try {
            if (fs.existsSync(AUTO_JOIN_LOG_FILE)) {
                const data = JSON.parse(fs.readFileSync(AUTO_JOIN_LOG_FILE, 'utf8'));
                data.users.forEach(user => this.invitedUsers.add(user));
            }
        } catch {}
    }
    saveInvitedUser(userJid) {
        try {
            this.invitedUsers.add(userJid);
            let data = { users: [], lastUpdated: new Date().toISOString(), totalInvites: 0 };
            if (fs.existsSync(AUTO_JOIN_LOG_FILE)) data = JSON.parse(fs.readFileSync(AUTO_JOIN_LOG_FILE, 'utf8'));
            if (!data.users.includes(userJid)) { data.users.push(userJid); data.totalInvites = data.users.length; data.lastUpdated = new Date().toISOString(); fs.writeFileSync(AUTO_JOIN_LOG_FILE, JSON.stringify(data, null, 2)); }
        } catch (error) { UltraCleanLogger.error(`❌ Error saving invited user: ${error.message}`); }
    }
    isOwner(userJid, jidManager) {
        if (!jidManager.owner || !jidManager.owner.cleanNumber) return false;
        return userJid === jidManager.owner.cleanJid || userJid === jidManager.owner.rawJid || userJid.includes(jidManager.owner.cleanNumber);
    }
    async sendWelcomeMessage(sock, userJid) {
        if (!SEND_WELCOME_MESSAGE) return;
        try { await sock.sendMessage(userJid, { text: `🎉 *WELCOME TO Paxton Tech!*\n\n☯️ *PAXTON TECH* 🖤
BORN IN DARKNESS. BUILT TO DOMINATE.

Thank you for connecting! 🤖\nYou're being automatically invited to our community group...\nPlease wait... ⏳` }); } catch (error) { UltraCleanLogger.error(`❌ Could not send welcome message: ${error.message}`); }
    }
    async sendGroupInvitation(sock, userJid, isOwner = false) {
        try {
            await sock.sendMessage(userJid, { text: isOwner ? `👑 *OWNER AUTO-JOIN*\n\nYou are being automatically added to the group...\n🔗 ${GROUP_LINK}` : `🔗 *GROUP INVITATION*\n\nJoin our community: ${GROUP_LINK}\n*Group Name:* ${GROUP_NAME}` });
            return true;
        } catch (error) { UltraCleanLogger.error(`❌ Could not send group invitation: ${error.message}`); return false; }
    }
    async attemptAutoAdd(sock, userJid, isOwner = false) {
        try {
            let groupId;
            try { groupId = await sock.groupAcceptInvite(GROUP_INVITE_CODE); } catch (inviteError) { throw new Error('Could not access group with invite code'); }
            await sock.groupParticipantsUpdate(groupId, [userJid], 'add');
            await sock.sendMessage(userJid, { text: `✅ *SUCCESSFULLY JOINED!*\n\nYou have been added to the group! 🎉` });
            return true;
        } catch (error) {
            UltraCleanLogger.error(`❌ Auto-add failed for ${userJid}: ${error.message}`);
            await sock.sendMessage(userJid, { text: `⚠️ *MANUAL JOIN REQUIRED*\n\nPlease join manually:\n${GROUP_LINK}` });
            return false;
        }
    }
    async autoJoinGroup(sock, userJid) {
        if (!AUTO_JOIN_ENABLED) return false;
        if (this.invitedUsers.has(userJid)) return false;
        const isOwner = this.isOwner(userJid, jidManager);
        await this.sendWelcomeMessage(sock, userJid);
        await new Promise(resolve => setTimeout(resolve, AUTO_JOIN_DELAY));
        await this.sendGroupInvitation(sock, userJid, isOwner);
        await new Promise(resolve => setTimeout(resolve, 3000));
        const success = await this.attemptAutoAdd(sock, userJid, isOwner);
        this.saveInvitedUser(userJid);
        return success;
    }
}

const autoGroupJoinSystem = new AutoGroupJoinSystem();

class UltimateFixSystem {
    constructor() { this.fixedJids = new Set(); this.fixApplied = false; this.restartFixAttempted = false; }
    async applyUltimateFix(sock, senderJid, cleaned, isFirstUser = false, isRestart = false) {
        try {
            const originalIsOwner = jidManager.isOwner;
            jidManager.isOwner = function (message) {
                try {
                    if (message?.key?.fromMe) return true;
                    if (!this.owner || !this.owner.cleanNumber) this.loadOwnerDataFromFile?.();
                    return originalIsOwner.call(this, message);
                } catch { return message?.key?.fromMe || false; }
            };
            jidManager.loadOwnerDataFromFile = function () {
                try {
                    if (fs.existsSync('./owner.json')) {
                        const data = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                        let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
                        if (cleanNumber && cleanNumber.includes(':')) cleanNumber = cleanNumber.split(':')[0];
                        this.owner = { cleanNumber, cleanJid: data.OWNER_CLEAN_JID || data.OWNER_JID, rawJid: data.OWNER_JID, isLid: (data.OWNER_CLEAN_JID || data.OWNER_JID)?.includes('@lid') || false };
                        return true;
                    }
                } catch {}
                return false;
            };
            global.OWNER_NUMBER = cleaned.cleanNumber; global.OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            global.OWNER_JID = cleaned.cleanJid; global.OWNER_CLEAN_JID = cleaned.cleanJid;
            this.fixedJids.add(senderJid); this.fixApplied = true;
            UltraCleanLogger.success(`✅ Ultimate Fix applied: ${cleaned.cleanJid}`);
            return { success: true, jid: cleaned.cleanJid, number: cleaned.cleanNumber, isLid: cleaned.isLid, isRestart };
        } catch (error) { UltraCleanLogger.error(`Ultimate Fix failed: ${error.message}`); return { success: false, error: 'Fix failed' }; }
    }
    isFixNeeded(jid) { return !this.fixedJids.has(jid); }
    shouldRunRestartFix(ownerJid) { return fs.existsSync(OWNER_FILE) && this.isFixNeeded(ownerJid) && !this.restartFixAttempted && RESTART_AUTO_FIX_ENABLED; }
    markRestartFixAttempted() { this.restartFixAttempted = true; }
}

const ultimateFixSystem = new UltimateFixSystem();

class AutoConnectOnStart {
    constructor() { this.hasRun = false; this.isEnabled = AUTO_CONNECT_ON_START; }
    async trigger(sock) {
        try {
            if (!this.isEnabled || this.hasRun) return;
            if (!sock || !sock.user?.id) return;
            const ownerJid = sock.user.id;
            const cleaned = jidManager.cleanJid(ownerJid);
            const mockMsg = { key: { remoteJid: ownerJid, fromMe: true, id: 'auto-start-' + Date.now(), participant: ownerJid }, message: { conversation: '.connect' } };
            await delay(2000);
            await handleConnectCommand(sock, mockMsg, [], cleaned);
            this.hasRun = true; hasAutoConnectedOnStart = true;
        } catch (error) { UltraCleanLogger.error(`Auto-connect on start failed: ${error.message}`); }
    }
    reset() { this.hasRun = false; hasAutoConnectedOnStart = false; }
}

const autoConnectOnStart = new AutoConnectOnStart();

class AutoLinkSystem {
    constructor() { this.linkAttempts = new Map(); this.MAX_ATTEMPTS = 3; this.autoConnectEnabled = AUTO_CONNECT_ON_LINK; }
    async shouldAutoLink(sock, msg) {
        if (!AUTO_LINK_ENABLED) return false;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = jidManager.cleanJid(senderJid);
        if (!jidManager.owner || !jidManager.owner.cleanNumber) {
            UltraCleanLogger.info(`🔗 New owner detected: ${cleaned.cleanJid}`);
            const result = await this.autoLinkNewOwner(sock, senderJid, cleaned, true);
            if (result && this.autoConnectEnabled) setTimeout(async () => { await this.triggerAutoConnect(sock, msg, cleaned, true); }, 1500);
            return result;
        }
        if (msg.key.fromMe) return false;
        if (jidManager.isOwner(msg)) return false;
        const currentOwnerNumber = jidManager.owner.cleanNumber;
        if (this.isSimilarNumber(cleaned.cleanNumber, currentOwnerNumber)) {
            if (!jidManager.ownerJids.has(cleaned.cleanJid)) {
                jidManager.ownerJids.add(cleaned.cleanJid); jidManager.ownerJids.add(senderJid);
                if (AUTO_ULTIMATE_FIX_ENABLED && ultimateFixSystem.isFixNeeded(senderJid)) setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, false); }, 800);
                await this.sendDeviceLinkedMessage(sock, senderJid, cleaned);
                if (this.autoConnectEnabled) setTimeout(async () => { await this.triggerAutoConnect(sock, msg, cleaned, false); }, 1500);
                return true;
            }
        }
        return false;
    }
    isSimilarNumber(num1, num2) {
        if (!num1 || !num2) return false;
        if (num1 === num2) return true;
        if (num1.includes(num2) || num2.includes(num1)) return true;
        if (num1.length >= 6 && num2.length >= 6) return num1.slice(-6) === num2.slice(-6);
        return false;
    }
    async autoLinkNewOwner(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const result = jidManager.setNewOwner(senderJid, true);
            if (!result.success) return false;
            await this.sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser);
            if (AUTO_ULTIMATE_FIX_ENABLED) setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(sock, senderJid, cleaned, isFirstUser); }, 1200);
            if (AUTO_JOIN_ENABLED) setTimeout(async () => { try { await autoGroupJoinSystem.autoJoinGroup(sock, senderJid); } catch (error) { UltraCleanLogger.error(`❌ Auto-join for new owner failed: ${error.message}`); } }, 3000);
            return true;
        } catch { return false; }
    }
    async triggerAutoConnect(sock, msg, cleaned, isNewOwner = false) {
        try { if (!this.autoConnectEnabled) return; await handleConnectCommand(sock, msg, [], cleaned); } catch (error) { UltraCleanLogger.error(`Auto-connect failed: ${error.message}`); }
    }
    async sendImmediateSuccessMessage(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const currentPrefix = getCurrentPrefix();
            const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
            await sock.sendMessage(senderJid, { text: `✅ *${BOT_NAME.toUpperCase()} v${VERSION} CONNECTED!*\n\n${isFirstUser ? '🎉 *FIRST TIME SETUP COMPLETE!*\n\n' : '🔄 *NEW OWNER LINKED!*\n\n'}📋 *YOUR INFORMATION:*\n├─ Your Number: +${cleaned.cleanNumber}\n├─ Device Type: ${cleaned.isLid ? 'Linked Device 🔗' : 'Regular Device 📱'}\n├─ Prefix: ${prefixDisplay}\n└─ Status: ✅ LINKED SUCCESSFULLY\n\n🎉 *You're all set!*` });
        } catch {}
    }
    async sendDeviceLinkedMessage(sock, senderJid, cleaned) {
        try { await sock.sendMessage(senderJid, { text: `📱 *Device Linked Successfully!*\n\n✅ You can now use owner commands from this device.\n🎉 All systems are now active!` }); } catch {}
    }
}

const autoLinkSystem = new AutoLinkSystem();

// ============================================================
//  AUTO VIEW STATUS HANDLER
// ============================================================

async function handleAutoViewStatus(sock, message) {
    try {
        if (message.key?.remoteJid !== 'status@broadcast') return;
        if (!getGlobalSettings().autoViewStatus) return;
        await sock.readMessages([message.key]);
    } catch (error) {}
}

async function handleConnectCommand(sock, msg, args, cleaned) {
    try {
        const chatJid = msg.key.remoteJid || cleaned.cleanJid;
        const start = Date.now();
        const currentPrefix = getCurrentPrefix();
        const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
        const platform = detectPlatform();
        const loadingMessage = await sock.sendMessage(chatJid, { text: `☯️ *${BOT_NAME}* is checking connection... █▒▒▒▒▒▒▒▒▒` }, { quoted: msg });
        const latency = Date.now() - start;
        const uptime = process.uptime();
        const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
        const isOwnerUser = jidManager.isOwner(msg);
        const memberStats = memberDetector ? memberDetector.getStats() : null;
        let statusEmoji, statusText, mood;
        if (latency <= 100) { statusEmoji = '🟢'; statusText = 'Excellent'; mood = '⚡Superb Connection'; }
        else if (latency <= 300) { statusEmoji = '🟡'; statusText = 'Good'; mood = '📡Stable Link'; }
        else { statusEmoji = '🔴'; statusText = 'Slow'; mood = '🌑Needs Optimization'; }
        await delay(Math.max(500, 1000 - (Date.now() - start)));
        await sock.sendMessage(chatJid, { text: `\n╭━━🌕 *CONNECTION STATUS* 🌕━━╮\n┃  ⚡ *User:* ${cleaned.cleanNumber}\n┃  🔴 *Prefix:* ${prefixDisplay}\n┃  🐾 *Ultimatefix:* ${isOwnerUser ? '✅' : '❌'}\n┃  🏗️ *Platform:* ${platform}\n┃  ⏱️ *Latency:* ${latency}ms ${statusEmoji}\n┃  ⏰ *Uptime:* ${h}h ${m}m ${s}s\n┃  👥 *Members:* ${memberStats ? memberStats.totalEvents + ' events' : 'Not loaded'}\n┃  🔗 *Status:* ${statusText}\n┃  🎯 *Mood:* ${mood}\n┃  👑 *Owner:* ${isOwnerUser ? '✅ Yes' : '❌ No'}\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n_☯️ Stay sharp — ..._\n`, edit: loadingMessage.key }, { quoted: msg });
        UltraCleanLogger.command(`Connect from ${cleaned.cleanNumber}`);
        return true;
    } catch { return false; }
}

class StatusDetector {
    constructor() {
        this.detectionEnabled = true; this.statusLogs = []; this.lastDetection = null;
        this.setupDataDir(); this.loadStatusLogs();
        UltraCleanLogger.success('Status Detector initialized');
    }
    setupDataDir() { try { if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true }); } catch (error) { UltraCleanLogger.error(`Error setting up data directory: ${error.message}`); } }
    loadStatusLogs() {
        try {
            if (fs.existsSync('./data/status_detection_logs.json')) {
                const data = JSON.parse(fs.readFileSync('./data/status_detection_logs.json', 'utf8'));
                if (Array.isArray(data.logs)) this.statusLogs = data.logs.slice(-100);
            }
        } catch {}
    }
    saveStatusLogs() {
        try { fs.writeFileSync('./data/status_detection_logs.json', JSON.stringify({ logs: this.statusLogs.slice(-1000), updatedAt: new Date().toISOString(), count: this.statusLogs.length }, null, 2)); } catch {}
    }
    async detectStatusUpdate(msg) {
        try {
            if (!this.detectionEnabled) return null;
            const sender = msg.key.participant || 'unknown';
            const shortSender = sender.split('@')[0];
            const timestamp = msg.messageTimestamp || Date.now();
            const statusTime = new Date(timestamp * 1000).toLocaleTimeString();
            const statusInfo = this.extractStatusInfo(msg);
            UltraCleanLogger.info(`👁️ Status from ${shortSender} at ${statusTime} [${statusInfo.type}]`);
            const logEntry = { sender: shortSender, fullSender: sender, type: statusInfo.type, caption: statusInfo.caption, fileInfo: statusInfo.fileInfo, postedAt: statusTime, detectedAt: new Date().toLocaleTimeString(), timestamp: Date.now() };
            this.statusLogs.push(logEntry); this.lastDetection = logEntry;
            if (this.statusLogs.length % 5 === 0) this.saveStatusLogs();
            return logEntry;
        } catch { return null; }
    }
    extractStatusInfo(msg) {
        try {
            const message = msg.message;
            let type = 'unknown', caption = '', fileInfo = '';
            if (message.imageMessage) { type = 'image'; caption = message.imageMessage.caption || ''; }
            else if (message.videoMessage) { type = 'video'; caption = message.videoMessage.caption || ''; }
            else if (message.audioMessage) { type = 'audio'; }
            else if (message.extendedTextMessage) { type = 'text'; caption = message.extendedTextMessage.text || ''; }
            else if (message.conversation) { type = 'text'; caption = message.conversation; }
            else if (message.stickerMessage) { type = 'sticker'; }
            return { type, caption: caption.substring(0, 100), fileInfo };
        } catch { return { type: 'unknown', caption: '', fileInfo: '' }; }
    }
    getStats() {
        return { totalDetected: this.statusLogs.length, lastDetection: this.lastDetection ? `${this.lastDetection.sender} - ${this.getTimeAgo(this.lastDetection.timestamp)}` : 'None', detectionEnabled: this.detectionEnabled };
    }
    getTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Just now'; if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60); if (hours < 24) return `${hours}h ago`; return `${Math.floor(hours / 24)}d ago`;
    }
}

let statusDetector = null;

function isUserBlocked(jid) {
    try { if (fs.existsSync(BLOCKED_USERS_FILE)) { const data = JSON.parse(fs.readFileSync(BLOCKED_USERS_FILE, 'utf8')); return data.users && data.users.includes(jid); } } catch {}
    return false;
}

function checkBotMode(msg, commandName) {
    try {
        if (jidManager.isOwner(msg)) return true;
        if (fs.existsSync(BOT_MODE_FILE)) { const modeData = JSON.parse(fs.readFileSync(BOT_MODE_FILE, 'utf8')); BOT_MODE = modeData.mode || 'public'; } else { BOT_MODE = 'public'; }
        const chatJid = msg.key.remoteJid;
        switch (BOT_MODE) {
            case 'public': return true; case 'private': return false; case 'silent': return false;
            case 'group-only': return chatJid.includes('@g.us');
            case 'maintenance': return ['ping', 'status', 'uptime', 'help', 'menu'].includes(commandName);
            default: return true;
        }
    } catch { return true; }
}

function startHeartbeat(sock) {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(async () => { if (isConnected && sock) { try { await sock.sendPresenceUpdate('available'); lastActivityTime = Date.now(); } catch {} } }, 60 * 1000);
}

function stopHeartbeat() { if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; } }

function ensureSessionDir() { if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true }); }

function cleanSession() { try { if (fs.existsSync(SESSION_DIR)) fs.rmSync(SESSION_DIR, { recursive: true, force: true }); return true; } catch { return false; } }

class MessageStore {
    constructor() { this.messages = new Map(); this.maxMessages = 100; }
    addMessage(jid, messageId, message) {
        try {
            const key = `${jid}|${messageId}`;
            this.messages.set(key, { ...message, timestamp: Date.now() });
            if (this.messages.size > this.maxMessages) this.messages.delete(this.messages.keys().next().value);
        } catch {}
    }
    getMessage(jid, messageId) { try { return this.messages.get(`${jid}|${messageId}`) || null; } catch { return null; } }
}

const commands = new Map();
const commandCategories = new Map();

async function loadCommandsFromFolder(folderPath, category = 'general') {
    const absolutePath = path.resolve(folderPath);
    if (!fs.existsSync(absolutePath)) return;
    try {
        const items = fs.readdirSync(absolutePath);
        let categoryCount = 0;
        for (const item of items) {
            const fullPath = path.join(absolutePath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) { await loadCommandsFromFolder(fullPath, item); }
            else if (item.endsWith('.js')) {
                try {
                    if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    const commandModule = await import(`file://${fullPath}`);
                    const command = commandModule.default || commandModule;
                    if (command && command.name) {
                        command.category = category;
                        commands.set(command.name.toLowerCase(), command);
                        if (!commandCategories.has(category)) commandCategories.set(category, []);
                        commandCategories.get(category).push(command.name);
                        categoryCount++;
                        if (Array.isArray(command.alias)) command.alias.forEach(alias => commands.set(alias.toLowerCase(), command));
                    }
                } catch {}
            }
        }
        if (categoryCount > 0) UltraCleanLogger.info(`${categoryCount} commands loaded from ${category}`);
    } catch {}
}

function parsePaxtonTechSession(sessionString) {
    try {
        let cleaned = sessionString.trim().replace(/^["']|["']$/g, '');
        const PREFIX = 'PAXTON-TECH:';
        if (cleaned.startsWith(PREFIX)) {
            // FIX: the original used a hardcoded substring(9), which is
            // shorter than this prefix's actual length and left stray
            // characters glued onto the base64 payload. Use the prefix's
            // real length instead of a magic number.
            const base64Part = cleaned.slice(PREFIX.length).trim();
            if (!base64Part) throw new Error(`No data after ${PREFIX}`);
            try { return JSON.parse(Buffer.from(base64Part, 'base64').toString('utf8')); } catch { return JSON.parse(base64Part); }
        }
        try { return JSON.parse(Buffer.from(cleaned, 'base64').toString('utf8')); } catch { return JSON.parse(cleaned); }
    } catch (error) { UltraCleanLogger.error('❌ Failed to parse session:', error.message); return null; }
}

async function authenticateWithSessionId(sessionId) {
    try {
        const sessionData = parsePaxtonTechSession(sessionId);
        if (!sessionData) throw new Error('Could not parse session data');
        if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });
        fs.writeFileSync(path.join(SESSION_DIR, 'creds.json'), JSON.stringify(sessionData, null, 2));
        UltraCleanLogger.success('💾 Session saved to session/creds.json');
        return true;
    } catch (error) { UltraCleanLogger.error('❌ Session authentication failed:', error.message); throw error; }
}

class LoginManager {
    constructor() { this.rl = readline.createInterface({ input: process.stdin, output: process.stdout }); }
    async selectMode() {
        // Some free panel hosts don't let you add custom environment
        // variables at all on their free tiers. Since they always give you
        // a file manager though, fall back to a plain text file the user
        // can paste their session string into directly, no env var needed.
        let fileSession = null;
        try {
            if (fs.existsSync('./session_id.txt')) {
                const raw = fs.readFileSync('./session_id.txt', 'utf8').trim();
                if (raw && !raw.startsWith('#')) fileSession = raw;
            }
        } catch {}

        if (process.env.SESSION_ID || fileSession || process.env.AUTO_LOGIN === "true") {
            console.log("Panel detected - Auto-login");
            if (process.env.SESSION_ID || fileSession) return await this.sessionIdMode(fileSession);
            return await this.pairingCodeMode();
        }
        console.log(chalk.yellow('\n☯️ ' + BOT_NAME + ' v' + VERSION + ' - LOGIN SYSTEM'));
        console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
        console.log(chalk.blue('2) Clean Session & Start Fresh'));
        console.log(chalk.magenta('3) Use Session ID from Environment'));
        const choice = await this.ask('Choose option (1-3, default 1): ');
        switch (choice.trim()) {
            case '1': return await this.pairingCodeMode();
            case '2': return await this.cleanStartMode();
            case '3': return await this.sessionIdMode();
            default: return await this.pairingCodeMode();
        }
    }
    async sessionIdMode(fileSession = null) {
        let sessionId = process.env.SESSION_ID || fileSession;
        if (!sessionId || sessionId.trim() === '') {
            const input = await this.ask('\nWould you like to:\n1) Paste Session ID now\n2) Go back to main menu\nChoice (1-2): ');
            if (input.trim() === '1') { sessionId = await this.ask('Paste your Session ID (PAXTON-TECH:... or base64): '); if (!sessionId || sessionId.trim() === '') return await this.selectMode(); }
            else return await this.selectMode();
        }
        try { await authenticateWithSessionId(sessionId); return { mode: 'session', sessionId: sessionId.trim() }; }
        catch { console.log(chalk.yellow('📝 Falling back to pairing code mode...')); return await this.pairingCodeMode(); }
    }
    async pairingCodeMode() {
        console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
        const phone = await this.ask('Phone number (with country code, no +): ');
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if (!cleanPhone || cleanPhone.length < 10) { console.log(chalk.red('❌ Invalid phone number')); return await this.selectMode(); }
        return { mode: 'pair', phone: cleanPhone };
    }
    async cleanStartMode() {
        const confirm = await this.ask('This will delete all session data. Are you sure? (y/n): ');
        if (confirm.toLowerCase() === 'y') { cleanSession(); return await this.pairingCodeMode(); }
        return await this.pairingCodeMode();
    }
    ask(question) { return new Promise((resolve) => { this.rl.question(chalk.yellow(question), resolve); }); }
    close() { if (this.rl) this.rl.close(); }
}

async function startBot(loginMode = 'pair', loginData = null) {
    try {
        UltraCleanLogger.info('🚀 Initializing WhatsApp connection...');
        if (loginMode === 'session' && loginData) {
            try { await authenticateWithSessionId(loginData); } catch { const lm = new LoginManager(); const nm = await lm.pairingCodeMode(); lm.close(); loginMode = nm.mode; loginData = nm.phone; }
        }
        commands.clear(); commandCategories.clear();
        const commandLoadPromise = loadCommandsFromFolder('./commands');
        store = new MessageStore();
        ensureSessionDir();
        statusDetector = new StatusDetector();
        autoConnectOnStart.reset();
        const { default: makeWASocket } = await import('@whiskeysockets/baileys');
        const { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        let state, saveCreds;
        try { const authState = await useMultiFileAuthState(SESSION_DIR); state = authState.state; saveCreds = authState.saveCreds; }
        catch { cleanSession(); const freshAuth = await useMultiFileAuthState(SESSION_DIR); state = freshAuth.state; saveCreds = freshAuth.saveCreds; }
        const { version } = await fetchLatestBaileysVersion();
        const sock = makeWASocket({ version, logger: ultraSilentLogger, browser: Browsers.ubuntu('Chrome'), printQRInTerminal: false, auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, ultraSilentLogger) }, markOnlineOnConnect: true, generateHighQualityLinkPreview: true, connectTimeoutMs: 120000, keepAliveIntervalMs: 60000, emitOwnEvents: true, mobile: false, getMessage: async (key) => store?.getMessage(key.remoteJid, key.id) || null, defaultQueryTimeoutMs: 20000 });
        SOCKET_INSTANCE = sock; connectionAttempts = 0; isWaitingForPairingCode = false;

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'open') {
                isConnected = true; startHeartbeat(sock);
                await handleSuccessfulConnection(sock, loginMode, loginData);
                isWaitingForPairingCode = false;
                triggerRestartAutoFix(sock).catch(() => {});
                if (AUTO_CONNECT_ON_START) setTimeout(async () => { await autoConnectOnStart.trigger(sock); }, 2000);
                if (AUTO_JOIN_ENABLED && sock.user?.id) {
                    setTimeout(async () => {
                        try {
                            let ownerJid = sock.user.id;
                            if (fs.existsSync(OWNER_FILE)) { try { const od = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8')); if (od.OWNER_JID) ownerJid = od.OWNER_JID; } catch {} }
                            if (autoGroupJoinSystem.invitedUsers.has(ownerJid)) return;
                            const success = await autoGroupJoinSystem.autoJoinGroup(sock, ownerJid);
                            if (success) { try { const od = JSON.parse(fs.readFileSync(OWNER_FILE, 'utf8')); od.lastAutoJoin = new Date().toISOString(); od.autoJoinedGroup = true; fs.writeFileSync(OWNER_FILE, JSON.stringify(od, null, 2)); } catch {} }
                        } catch (error) { UltraCleanLogger.error(`❌ Auto-join system error: ${error.message}`); }
                    }, 15000);
                }
            }
            if (connection === 'close') {
                isConnected = false; stopHeartbeat();
                if (statusDetector) statusDetector.saveStatusLogs();
                if (memberDetector) memberDetector.saveDetectionData();
                await handleConnectionCloseSilently(lastDisconnect, loginMode, loginData);
                isWaitingForPairingCode = false;
            }
            if (connection === 'connecting') {
                UltraCleanLogger.info('🔄 Establishing connection...');
                if (loginMode === 'pair' && loginData && !state.creds.registered && !isWaitingForPairingCode) {
                    isWaitingForPairingCode = true;
                    console.log("\n========================================\n🔑 PAIRING CODE - COPY const requestPairingCode = async ENTER ON WHATSAPP\n========================================\n");
                    const requestPairingCode = async (attempt = 1) => {
                        try {
                            const code = await sock.requestPairingCode(loginData);
                            const cleanCode = code.replace(/\s+/g, '');
                            const formattedCode = cleanCode.length === 8 ? `${cleanCode.substring(0, 4)}-${cleanCode.substring(4, 8)}` : cleanCode;
                            console.clear();
                            console.log(chalk.greenBright(`\n╔══════════════════════════════════════════╗\n║         🔗 PAIRING CODE - ${BOT_NAME}        \n╠══════════════════════════════════════════╣\n║ 📞 Phone  : ${chalk.cyan(loginData)}\n║ 🔑 Code   : ${chalk.yellow.bold(formattedCode)}\n║ ⏰ Expires : 10 minutes\n╚══════════════════════════════════════════╝\n`));
                            console.log(chalk.cyan('📱 INSTRUCTIONS:'));
                            console.log(chalk.white('1. Open WhatsApp → Settings → Linked Devices'));
                            console.log(chalk.white('2. Tap "Link a Device"'));
                            console.log(chalk.yellow.bold(`3. Enter code: ${formattedCode}\n`));
                            let remaining = 600;
                            const timer = setInterval(() => {
                                if (remaining <= 0 || isConnected) { clearInterval(timer); return; }
                                const m = Math.floor(remaining / 60), s = remaining % 60;
                                process.stdout.write(`\r⏰ Code expires in: ${m}:${s.toString().padStart(2, '0')} `);
                                remaining--;
                            }, 1000);
                            setTimeout(() => clearInterval(timer), 610000);
                        } catch (error) {
                            if (attempt < 3) { UltraCleanLogger.warning(`Pairing code attempt ${attempt} failed, retrying...`); await delay(3000); await requestPairingCode(attempt + 1); }
                            else { console.log(chalk.red('\n❌ Max retries reached. Restarting...')); setTimeout(async () => { await startBot(loginMode, loginData); }, 8000); }
                        }
                    };
                    setTimeout(() => requestPairingCode(1), 2000);
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);
        sock.ev.on('group-participants.update', async (update) => {
            try { if (memberDetector && memberDetector.enabled) { const newMembers = await memberDetector.detectNewMembers(sock, update); if (newMembers && newMembers.length > 0) UltraCleanLogger.info(`👥 Detected ${newMembers.length} new members`); } } catch (error) { UltraCleanLogger.warning(`Member detection error: ${error.message}`); }
            try { await handleGroupProtection(sock, update, OWNER_CLEAN_JID); } catch (error) { UltraCleanLogger.warning(`Group protection error: ${error.message}`); }
            try { await handleAntifake(sock, update); } catch (error) { UltraCleanLogger.warning(`Anti-fake error: ${error.message}`); }
        });
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            const msg = messages[0];
            if (!msg.message) return;
            
            // ✅ FIX: Skip bot's own messages
            // if (msg.key.fromMe) return;  // Disabled - was blocking all messages
            
            lastActivityTime = Date.now();
            if (msg.key?.remoteJid === 'status@broadcast') {
                // ✅ FIX: this used to `return` before auto-view-status ever ran,
                // so the feature could never fire no matter the setting.
                await handleAutoViewStatus(sock, msg);
                return;
            }
            if (store) store.addMessage(msg.key.remoteJid, msg.key.id, msg);
            
            // ✅ REMOVED AUTO-REACT: Commented out the react line
            // try { sock.sendMessage(msg.key.remoteJid, { react: { text: '☯️', key: msg.key } }).catch(() => {}); } catch(e) {}
            
            handleIncomingMessage(sock, msg).catch(() => {});
        });
        await commandLoadPromise;
        UltraCleanLogger.success(`✅ Loaded ${commands.size} commands`);
        return sock;
    } catch (error) { UltraCleanLogger.error('❌ Connection failed, retrying in 8 seconds...'); setTimeout(async () => { await startBot(loginMode, loginData); }, 8000); }
}

async function triggerRestartAutoFix(sock) {
    try {
        if (fs.existsSync(OWNER_FILE) && sock.user?.id) {
            const ownerJid = sock.user.id;
            const cleaned = jidManager.cleanJid(ownerJid);
            if (ultimateFixSystem.shouldRunRestartFix(ownerJid)) {
                ultimateFixSystem.markRestartFixAttempted();
                await delay(1500);
                await ultimateFixSystem.applyUltimateFix(sock, ownerJid, cleaned, false, true);
            }
        }
    } catch (error) { UltraCleanLogger.warning(`⚠️ Restart auto-fix error: ${error.message}`); }
}

async function handleSuccessfulConnection(sock, loginMode, loginData) {
    OWNER_JID = sock.user.id; OWNER_NUMBER = OWNER_JID.split('@')[0];
    const isFirstConnection = !fs.existsSync(OWNER_FILE);
    if (isFirstConnection) jidManager.setNewOwner(OWNER_JID, false); else jidManager.loadOwnerData();
    const ownerInfo = jidManager.getOwnerInfo();
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
    updateTerminalHeader();
    console.log(chalk.greenBright(`\n╔══════════════════════════════════════╗\n║    ☯️ ${BOT_NAME.toUpperCase()} ONLINE v${VERSION}\n╠══════════════════════════════════════╣\n║  ✅ Connected!\n║  👑 Owner  : +${ownerInfo.ownerNumber}\n║  💬 Prefix : ${prefixDisplay}\n╚══════════════════════════════════════╝\n`));
    const cleaned = jidManager.cleanJid(OWNER_JID);
    if (ultimateFixSystem.isFixNeeded(OWNER_JID)) {
        setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(sock, OWNER_JID, cleaned, isFirstConnection); }, 1200);
    }
    setTimeout(async () => {
        try {
            const rawId = sock.user.id;
            const sendJid = rawId.includes(':')
                ? rawId.split(':')[0] + '@s.whatsapp.net'
                : rawId;

            await sock.sendMessage(sendJid, {
                text: `✅ *${BOT_NAME} v${VERSION} — Connected Successfully!*\n\n` +
                      `🏗️ *Platform:* ${detectPlatform()}\n` +
                      `🎛️ *Mode:* ${BOT_MODE}\n` +
                      `💬 *Prefix:* ${prefixDisplay}\n` +
                      `👥 *Member Detection:* ✅ Active\n` +
                      `🔗 *Auth:* ${loginMode === 'session' ? 'Session ID' : 'Pairing Code'}`
            });
        } catch (e) {}
    }, 15000);
}

async function handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    connectionAttempts++;
    if (statusCode === 409) { setTimeout(async () => { await startBot(loginMode, phoneNumber); }, 25000); return; }
    if (statusCode === 401 || statusCode === 403 || statusCode === 419) cleanSession();
    const delayTime = Math.min(4000 * Math.pow(2, connectionAttempts - 1), 50000);
    setTimeout(async () => { if (connectionAttempts >= MAX_RETRY_ATTEMPTS) { connectionAttempts = 0; process.exit(1); } else { await startBot(loginMode, phoneNumber); } }, delayTime);
}

async function resolveJidForLog(sock, inputJid, groupChatJid = null) {
    if (!inputJid) return inputJid;
    if (inputJid.endsWith('@g.us') || inputJid.endsWith('@newsletter')) return inputJid;
    if (inputJid.endsWith('@lid')) {
        if (groupChatJid && groupChatJid.endsWith('@g.us')) {
            try {
                const meta = await sock.groupMetadata(groupChatJid);
                const p = meta?.participants?.find(x => x.id === inputJid);
                if (p?.phoneNumber) {
                    const num = String(p.phoneNumber).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (num.length >= 7) return `${num}@s.whatsapp.net`;
                }
            } catch {}
        }
        try {
            if (sock.signalRepository?.lidMapping?.getPNForLID) {
                const pn = await sock.signalRepository.lidMapping.getPNForLID(inputJid);
                if (pn) {
                    const num = String(pn).split('@')[0].split(':')[0].replace(/\D/g, '');
                    if (num.length >= 7) return `${num}@s.whatsapp.net`;
                }
            }
        } catch {}
        const lidNum = inputJid.split('@')[0];
        const cached = globalThis.lidPhoneCache?.get(lidNum);
        if (cached) return `${cached}@s.whatsapp.net`;
        try {
            if (sock.store?.contacts) {
                for (const [contactJid, contact] of Object.entries(sock.store.contacts)) {
                    if (contact.lid === inputJid || contact.lidJid === inputJid) {
                        const num = contactJid.split('@')[0].replace(/\D/g, '');
                        if (num.length >= 7) return `${num}@s.whatsapp.net`;
                    }
                }
            }
        } catch {}
        return inputJid;
    }
    const number = inputJid.split('@')[0].split(':')[0].replace(/\D/g, '');
    return `${number}@s.whatsapp.net`;
}

async function logIncomingMessage(sock, msg, textMsg) {
    try {
        messageLogCounter++;
        const logNum = messageLogCounter;
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const rawSenderJid = msg.key.participant || chatId;
        const timeStr = new Date().toLocaleTimeString('en-GB', { hour12: false });

        let resolvedSenderJid = rawSenderJid;
        try { resolvedSenderJid = await resolveJidForLog(sock, rawSenderJid, isGroup ? chatId : null); } catch {}

        const phoneNumber = '+' + resolvedSenderJid.split('@')[0].split(':')[0].replace(/\D/g, '');

        let displayName = '';
        try {
            const contacts = sock.store?.contacts || {};
            const contact = contacts[resolvedSenderJid] || contacts[rawSenderJid];
            displayName = contact?.name || contact?.notify || '';
        } catch {}
        if (!displayName) displayName = phoneNumber;

        if (isGroup) {
            let groupName = chatId;
            try {
                const meta = await sock.groupMetadata(chatId);
                groupName = meta?.subject || chatId;
            } catch {}

            const line = '─'.repeat(42);
            originalConsoleMethods.log(chalk.green(
                `\n╭${line}\n` +
                `│ ☯️ ${chalk.bold(`${BOT_NAME.toUpperCase()} LOG #${logNum}`)}\n` +
                `├${line}\n` +
                `│ 👥 ${chalk.bold('Group  :')} ${groupName}\n` +
                `│ 👤 ${chalk.bold('Sender :')} ${displayName}\n` +
                `│ ☎️  ${chalk.bold('Number :')} ${phoneNumber}\n` +
                `│ 🆔 ${chalk.bold('JID    :')} ${chatId}\n` +
                `│ 💬 ${chalk.bold('Msg    :')} ${textMsg.substring(0, 80)}${textMsg.length > 80 ? '…' : ''}\n` +
                `│ 🕒 ${chalk.bold('Time   :')} ${timeStr}\n` +
                `│ 📩 ${chalk.bold('Type   :')} GROUP\n` +
                `╰${line}`
            ));
        } else {
            const line = '─'.repeat(37);
            originalConsoleMethods.log(chalk.green(
                `\n╭${line}\n` +
                `│ ☯️ ${chalk.bold(`${BOT_NAME.toUpperCase()} LOG #${logNum}`)}\n` +
                `├${line}\n` +
                `│ 👤 ${chalk.bold('Name   :')} ${displayName}\n` +
                `│ ☎️  ${chalk.bold('Number :')} ${phoneNumber}\n` +
                `│ 🆔 ${chalk.bold('JID    :')} ${resolvedSenderJid}\n` +
                `│ 💬 ${chalk.bold('Msg    :')} ${textMsg.substring(0, 80)}${textMsg.length > 80 ? '…' : ''}\n` +
                `│ 🕒 ${chalk.bold('Time   :')} ${timeStr}\n` +
                `│ 📩 ${chalk.bold('Type   :')} DM\n` +
                `╰${line}`
            ));
        }
    } catch {}
}

const spamTracker = new Map(); // "groupJid:senderJid" -> recent message timestamps (antispam)

async function enforceGroupModeration(sock, msg, chatId, senderJid, textMsg) {
    try {
        const settings = getGroupSettings(chatId);
        if (!settings.antilink && !settings.antibadword && !settings.antitag) return false;
        if (senderJid === OWNER_CLEAN_JID) return false;
        if (await isSenderAdmin(sock, chatId, senderJid)) return false;

        let violation = null;
        if (settings.antilink) {
            const isInviteLink = /chat\.whatsapp\.com\//i.test(textMsg);
            const isAnyLink = /(https?:\/\/|www\.)\S+/i.test(textMsg);
            if (settings.antilinkMode === 'all' ? isAnyLink : isInviteLink) {
                violation = settings.antilinkMode === 'all' ? 'posting a link' : 'posting a group invite link';
            }
        }
        if (!violation && settings.antibadword && settings.badwords.length > 0) {
            const lower = textMsg.toLowerCase();
            if (settings.badwords.some((w) => w && lower.includes(w.toLowerCase()))) violation = 'using a banned word';
        }
        if (!violation) {
            const mentioned = getMentionedJids(msg);
            if (settings.antitag && mentioned.length >= 5) violation = 'mass-tagging the group';
        }
        if (!violation) return false;

        try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}
        const count = addWarning(chatId, senderJid);
        if (count >= 3 && await isBotAdmin(sock, chatId)) {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove');
                await sock.sendMessage(chatId, { text: `🚫 @${senderJid.split('@')[0]} removed for ${violation} (${count}/3 warnings).`, mentions: [senderJid] });
            } catch {}
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ @${senderJid.split('@')[0]} — message removed for ${violation}. Warning ${count}/3.`, mentions: [senderJid] });
        }
        return true;
    } catch { return false; }
}

async function handleAntiViewOnce(sock, msg, chatId, senderJid) {
    try {
        if (!OWNER_CLEAN_JID) return;
        const vo = extractViewOnceMedia(msg.message);
        if (!vo) return;
        const buffer = await downloadViewOnceMedia(vo);
        const origin = chatId.endsWith('@g.us') ? `group ${chatId.split('@')[0]}` : 'a DM';
        const caption = `👁️ *Anti-ViewOnce*\nFrom: @${senderJid.split('@')[0]} (${origin})${vo.media.caption ? `\n\n${vo.media.caption}` : ''}`;
        const payload = vo.type === 'image' ? { image: buffer, caption, mentions: [senderJid] } : { video: buffer, caption, mentions: [senderJid] };
        await sock.sendMessage(OWNER_CLEAN_JID, payload).catch(() => {});
    } catch (error) {}
}

async function handleChatbotReply(sock, msg, textMsg, chatId, senderJid) {
    try {
        if (!textMsg || !textMsg.trim()) return;
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedParticipant = contextInfo?.participant;
        const botNumber = sock.user?.id?.split(':')[0];
        const isReplyToBot = quotedParticipant && quotedParticipant.split('@')[0] === botNumber;
        const isGroup = chatId.endsWith('@g.us');
        const mentioned = getMentionedJids(msg);
        const isMentioned = mentioned.some((j) => j.split('@')[0] === botNumber);
        const shouldReply = isReplyToBot || isMentioned || !isGroup;
        if (!shouldReply) return;

        const reply = await getAiReply(textMsg);
        if (reply) await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    } catch (error) {}
}

async function handleIncomingMessage(sock, msg) {
    // ✅ FIX: Skip bot's own messages
    // if (msg.key.fromMe) return;  // Disabled - was blocking all messages
    
    const startTime = Date.now();
    try {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;

        // Anti-viewonce: recover and forward view-once media to the owner's
        // DM before it disappears. Runs before the textMsg/empty-caption
        // check below, since view-once media is very often caption-less.
        handleAntiViewOnce(sock, msg, chatId, senderJid).catch(() => {});
        
        const autoLinkPromise = autoLinkSystem.shouldAutoLink(sock, msg);
        if (isUserBlocked(senderJid)) return;
        const linked = await autoLinkPromise;
        if (linked) return;
        
        const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';

        // Anti-spam: flood detection for groups (owner is exempt)
        if (chatId.endsWith('@g.us') && senderJid !== OWNER_CLEAN_JID) {
            const spamSettings = getGroupSettings(chatId);
            if (spamSettings.antispam) {
                const spamKey = `${chatId}:${senderJid}`;
                const now = Date.now();
                const timestamps = (spamTracker.get(spamKey) || []).filter((t) => now - t < 10000);
                timestamps.push(now);
                spamTracker.set(spamKey, timestamps);
                if (timestamps.length > 6) {
                    spamTracker.set(spamKey, []);
                    const count = addActionWarning(chatId, senderJid, 'antispam');
                    try {
                        if (count >= 3 && await isBotAdmin(sock, chatId)) {
                            await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove');
                            await sock.sendMessage(chatId, { text: `🚫 @${senderJid.split('@')[0]} removed for spamming.`, mentions: [senderJid] });
                        } else {
                            await sock.sendMessage(chatId, { text: `⚠️ @${senderJid.split('@')[0]} slow down — flooding detected (${count}/3 warnings).`, mentions: [senderJid] });
                        }
                    } catch {}
                }
            }
        }

        // Anti-link / anti-badword / anti-tag enforcement
        if (chatId.endsWith('@g.us') && textMsg) {
            try {
                const moderated = await enforceGroupModeration(sock, msg, chatId, senderJid, textMsg);
                if (moderated) return;
            } catch {}
        }

        if (!textMsg) return;
        
        logIncomingMessage(sock, msg, textMsg).catch(() => {});
        
        // ✅ REMOVED AUTO-REACT: Commented out
        // try { sock.sendMessage(msg.key.remoteJid, { react: { text: '☯️', key: msg.key } }).catch(() => {}); } catch(e) {}
        
        const currentPrefix = getCurrentPrefix();

        // Chatbot auto-reply for plain (non-command) messages — DMs always,
        // groups only when the bot is @mentioned or replied to. Only
        // applies when the message doesn't even look like a command
        // attempt, so it never competes with real command parsing below.
        const looksLikeCommand = isPrefixless ? false : textMsg.startsWith(currentPrefix);
        if (!looksLikeCommand) {
            handleChatbotReply(sock, msg, textMsg, chatId, senderJid).catch(() => {});
            if (!isPrefixless) return;
        }

        let commandName = '', args = [];
        
        if (!isPrefixless && textMsg.startsWith(currentPrefix)) {
            const spaceIndex = textMsg.indexOf(' ', currentPrefix.length);
            commandName = spaceIndex === -1 ? textMsg.slice(currentPrefix.length).toLowerCase().trim() : textMsg.slice(currentPrefix.length, spaceIndex).toLowerCase().trim();
            args = spaceIndex === -1 ? [] : textMsg.slice(spaceIndex).trim().split(/\s+/);
        } else if (isPrefixless) {
            const words = textMsg.trim().split(/\s+/);            const firstWord = words[0].toLowerCase();
            if (commands.has(firstWord)) { commandName = firstWord; args = words.slice(1); }
            else {
                for (const [cmdName, command] of commands.entries()) { if (command.alias && command.alias.includes(firstWord)) { commandName = cmdName; args = words.slice(1); break; } }
                if (!commandName) { const defaultCommands = ['ping','help', 'menu','autojoin','uptime','statusstats','ultimatefix','prefixinfo','defib','defibrestart']; if (defaultCommands.includes(firstWord)) { commandName = firstWord; args = words.slice(1); } }
            }
        }
        if (!commandName) return;
        
        const rateLimitCheck = rateLimiter.canSendCommand(chatId, senderJid, commandName);
        if (!rateLimitCheck.allowed) { await sock.sendMessage(chatId, { text: `⚠️ ${rateLimitCheck.reason}` }); return; }
        
        const prefixDisplay = isPrefixless ? '' : currentPrefix;
        UltraCleanLogger.command(`${chatId.split('@')[0]} → ${prefixDisplay}${commandName}`);
        
        if (!checkBotMode(msg, commandName)) {
            if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) return;
            try { await sock.sendMessage(chatId, { text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.` }); } catch {}
            return;
        }
        
        if (commandName === 'connect' || commandName === 'link') { const cleaned = jidManager.cleanJid(senderJid); await handleConnectCommand(sock, msg, args, cleaned); return; }
        
        const command = commands.get(commandName);
        if (command) {
            try {
                if (command.ownerOnly && !jidManager.isOwner(msg) && !isSudo(senderJid)) { try { await sock.sendMessage(chatId, { text: '❌ *Owner Only Command*' }); } catch {} return; }
                if (commandName.includes('sticker')) await delay(1000);
                await command.execute(sock, msg, args, currentPrefix, { OWNER_NUMBER: OWNER_CLEAN_NUMBER, OWNER_JID: OWNER_CLEAN_JID, OWNER_LID, BOT_NAME, VERSION, isOwner: () => jidManager.isOwner(msg), jidManager, store, statusDetector, updatePrefix: updatePrefixImmediately, getCurrentPrefix, rateLimiter, memberDetector, isPrefixless });
            } catch (error) { UltraCleanLogger.error(`Command ${commandName} failed: ${error.message}`); }
        } else { await handleDefaultCommands(commandName, sock, msg, args, currentPrefix, isPrefixless); }
    } catch (error) { UltraCleanLogger.error(`Message handler error: ${error.message}`); }
}

async function handleDefaultCommands(commandName, sock, msg, args, currentPrefix, isPrefixless) {
    const chatId = msg.key.remoteJid;
    const isOwnerUser = jidManager.isOwner(msg);
    try {
        switch (commandName) {
            case 'prefix': {
                const current = getCurrentPrefix();
                const status = isPrefixless ? 'none (prefixless)' : `"${current}"`;
                await sock.sendMessage(chatId, {
                    text: `╭─⊷ *PREFIX*
│
│  Current: ${status}
│
╰─⊷`
                }, { quoted: msg });
                break;
            }
            case 'setprefix': {
                if (!isOwnerUser) { 
                    await sock.sendMessage(chatId, { text: '❌ Owner Only' }, { quoted: msg }); 
                    break; 
                }
                if (!args[0]) { 
                    const current = getCurrentPrefix(); 
                    const status = isPrefixless ? 'none (prefixless)' : `"${current}"`;
                    await sock.sendMessage(chatId, { 
                        text: `╭─⊷ *PREFIX*
│
│  Current: ${status}
│  Usage: ${currentPrefix}setprefix <new>
│  Example: ${currentPrefix}setprefix !
│  ${currentPrefix}setprefix none (prefixless mode)
│
╰─⊷` 
                    }, { quoted: msg }); 
                    break; 
                }
                
                const newPrefix = args[0];
                const isNone = newPrefix === 'none' || newPrefix === '""' || newPrefix === "''" || newPrefix === '';
                
                // Update the prefix
                if (isNone) {
                    isPrefixless = true;
                    prefixCache = '';
                } else {
                    if (!newPrefix || newPrefix.trim() === '') {
                        await sock.sendMessage(chatId, { text: '❌ Empty prefix' }, { quoted: msg });
                        break;
                    }
                    if (newPrefix.length > 5) {
                        await sock.sendMessage(chatId, { text: '❌ Prefix too long (max 5 characters)' }, { quoted: msg });
                        break;
                    }
                    prefixCache = newPrefix.trim();
                    isPrefixless = false;
                }
                
                // Update environment
                process.env.PREFIX = getCurrentPrefix();
                
                // Save to files
                try {
                    fs.writeFileSync(PREFIX_CONFIG_FILE, JSON.stringify({ 
                        prefix: isPrefixless ? '' : prefixCache, 
                        isPrefixless: isNone,
                        setAt: new Date().toISOString(),
                        version: VERSION 
                    }, null, 2));
                    
                    fs.writeFileSync(BOT_SETTINGS_FILE, JSON.stringify({ 
                        prefix: isPrefixless ? '' : prefixCache, 
                        isPrefixless: isNone,
                        prefixSetAt: new Date().toISOString(),
                        version: VERSION 
                    }, null, 2));
                } catch (e) {
                    console.log('Error saving prefix:', e.message);
                }
                
                // Update global
                if (typeof global !== 'undefined') { 
                    global.prefix = getCurrentPrefix(); 
                    global.CURRENT_PREFIX = getCurrentPrefix(); 
                    global.isPrefixless = isPrefixless; 
                }
                
                const newDisplay = isPrefixless ? 'none (prefixless)' : `"${prefixCache}"`;
                await sock.sendMessage(chatId, { 
                    text: `╭─⊷ *PREFIX UPDATED*
│
│  New Prefix: ${newDisplay}
│
╰─⊷` 
                }, { quoted: msg });
                break;
            }
            case 'ping': {
                const start = Date.now();
                
                // Send initial message
                const sentMsg = await sock.sendMessage(chatId, { 
                    text: `╭─⊷ *PING*
│
│  📡 Measuring latency...
│
╰─⊷` 
                }, { quoted: msg });
                
                const latency = Date.now() - start;
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                const memory = process.memoryUsage();
                
                let status, emoji;
                if (latency < 150) {
                    status = '🚀 Excellent';
                    emoji = '🟢';
                } else if (latency < 300) {
                    status = '📡 Good';
                    emoji = '🟡';
                } else if (latency < 500) {
                    status = '🌑 Slow';
                    emoji = '🟠';
                } else {
                    status = '💀 Very Slow';
                    emoji = '🔴';
                }
                
                // Edit the message with results
                await sock.sendMessage(chatId, { 
                    text: `╭─⊷ *PONG*
│
│  ${emoji} Ping: ${latency}ms
│  📊 Status: ${status}
│
│  ⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s
│  💾 Memory: ${(memory.rss / 1024 / 1024).toFixed(1)} MB
│  ⚡ Speed: ${(latency > 0 ? (1000 / latency).toFixed(0) : '∞')} req/s
│
╰─⊷` 
                }, { edit: sentMsg.key });
                break;
            }
            case 'uptime': { 
                const uptime = process.uptime(); 
                await sock.sendMessage(chatId, { 
                    text: `╭─⊷ *UPTIME*
│
│  ⏱️ ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s
│  💾 Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB
│
╰─⊷` 
                }, { quoted: msg }); 
                break; 
            }
            case 'help':
            case 'menu': {
                const uptimeSec = process.uptime();
                const uh = Math.floor(uptimeSec / 3600);
                const um = Math.floor((uptimeSec % 3600) / 60);
                const us = Math.floor(uptimeSec % 60);
                const mem = process.memoryUsage();
                const ramMb = (mem.rss / 1024 / 1024).toFixed(1);
                let ramTotalMb = '?';
                try { ramTotalMb = (os.totalmem() / 1024 / 1024).toFixed(0); } catch {}
                const ramPct = ramTotalMb !== '?' ? Math.min(100, Math.round((mem.rss / os.totalmem()) * 100)) : 0;
                const ramBar = '█'.repeat(Math.round(ramPct / 10)).padEnd(10, '░');

                let helpText = `⌈ \`${BOT_NAME.toLowerCase()}\`\n`;
                helpText += `┃ Owner: ${OWNER_CLEAN_NUMBER || 'Not set'}\n`;
                helpText += `┃ Mode: 🌍 ${BOT_MODE ? BOT_MODE.charAt(0).toUpperCase() + BOT_MODE.slice(1) : 'Public'}\n`;
                helpText += `┃ Prefix: [ ${isPrefixless ? 'none' : currentPrefix} ]\n`;
                helpText += `┃ Version: ${VERSION}\n`;
                helpText += `┃ Status: Active\n`;
                helpText += `┃ Uptime: ${uh}h ${um}m ${us}s\n`;
                helpText += `┃ RAM: ${ramBar} ${ramPct}%\n`;
                helpText += `┃ Memory: ${ramMb}MB / ${ramTotalMb}MB\n`;
                helpText += `╰─⊷\n\n`;

                // Same visible structure as requested — folder-based
                // categories get mapped to display labels, no invisible
                // zero-width padding (it does nothing functional, just
                // clutters the raw text).
                const CATEGORY_LABELS = {
                    tools: '🔍 INFO & SEARCH',
                    group: '👥 GROUP',
                    owner: '👑 OWNER TOOLS',
                    automation: '🔁 AUTOMATION',
                    fun: '🎉 FUN'
                };
                // Fixed display order (Fun, Group, Owner, Tools, Automation)
                // rather than whatever order folders happened to load in.
                const CATEGORY_ORDER = ['fun', 'group', 'owner', 'tools', 'automation'];
                const orderedCategories = [...commandCategories.keys()].sort(
                    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
                );
                for (const category of orderedCategories) {
                    const cmdList = commandCategories.get(category);
                    const label = CATEGORY_LABELS[category] || category.toUpperCase();
                    helpText += `╭─⊷ *${label}*\n│\n`;
                    cmdList.forEach(cmd => { helpText += `│  • ${cmd}\n`; });
                    helpText += `│\n╰─⊷\n\n`;
                }
                helpText += `Powered by Paxton Tech`;
                try {
                    const bannerPath = path.join(__dirname, 'assets', 'menu-banner.jpg');
                    if (fs.existsSync(bannerPath)) {
                        await sock.sendMessage(chatId, { image: fs.readFileSync(bannerPath), caption: helpText, mentions: [msg.key.participant || msg.key.remoteJid] }, { quoted: msg });
                    } else {
                        await sock.sendMessage(chatId, { text: helpText, mentions: [msg.key.participant || msg.key.remoteJid] }, { quoted: msg });
                    }
                } catch (error) {
                    // Fall back to plain text if the image ever fails to
                    // read/send, so a missing/corrupt banner file never
                    // means .menu just doesn't respond at all.
                    await sock.sendMessage(chatId, { text: helpText, mentions: [msg.key.participant || msg.key.remoteJid] }, { quoted: msg });
                }
                break;
            }
            case 'statusstats': { 
                if (!statusDetector) { 
                    await sock.sendMessage(chatId, { text: '❌ Status Detector not initialized' }, { quoted: msg }); 
                    break; 
                } 
                const stats = statusDetector.getStats(); 
                await sock.sendMessage(chatId, { 
                    text: `👁️ *STATUS DETECTOR STATS*\n\n📊 Total Detected: ${stats.totalDetected}\n🕒 Last Detection: ${stats.lastDetection}\n🔧 Detection Enabled: ${stats.detectionEnabled ? '✅' : '❌'}` 
                }, { quoted: msg }); 
                break; 
            }
            case 'prefixinfo': { 
                const currentP = getCurrentPrefix(); 
                await sock.sendMessage(chatId, { 
                    text: `💬 *PREFIX INFO*\n\nCurrent Prefix: ${isPrefixless ? 'none' : `"${currentP}"`}\nPrefixless Mode: ${isPrefixless ? '✅' : '❌'}` 
                }, { quoted: msg }); 
                break; 
            }
        }
    } catch (error) { 
        UltraCleanLogger.error(`Default command error: ${error.message}`); 
    }
}

async function main() {
    try {
        UltraCleanLogger.success(`🚀 Starting ${BOT_NAME} v${VERSION}`);
        const loginManager = new LoginManager();
        const loginInfo = await loginManager.selectMode();
        loginManager.close();
        const loginData = loginInfo.mode === 'session' ? loginInfo.sessionId : loginInfo.phone;
        await startBot(loginInfo.mode, loginData);
    } catch (error) { UltraCleanLogger.error(`Main error: ${error.message}`); setTimeout(async () => { await main(); }, 8000); }
}


process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
    if (statusDetector) statusDetector.saveStatusLogs();
    if (memberDetector) memberDetector.saveDetectionData();
    stopHeartbeat();
    if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
    process.exit(0);
});
process.on('uncaughtException', (error) => { UltraCleanLogger.error(`Uncaught exception: ${error.message}`); });
process.on('unhandledRejection', (error) => { UltraCleanLogger.error(`Unhandled rejection: ${error?.message}`); });
setInterval(() => { if (isConnected && (Date.now() - lastActivityTime) > 5 * 60 * 1000 && SOCKET_INSTANCE) { SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {}); } }, 60000);

main().catch(() => { process.exit(1); });

