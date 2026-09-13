// ============================================================
//  Paxton MD — OPEN SOURCE EDITION
//  ⚡ Paxton MD — WhatsApp Bot Framework
// ============================================================

// Baileys 6.7.x needs Node 20+. Running on an older Node (common default
// on some free panels, e.g. bot-hosting.net) fails deep inside the Baileys
// import with a cryptic low-level error that looks like a "lib baileys"
// bug rather than a version mismatch. Fail loudly and clearly instead.
{
    const [major] = process.versions.node.split('.').map(Number);
    if (major < 20) {
        console.error(`\n❌ Paxton MD needs Node.js 20 or newer — this host is running Node ${process.versions.node}.\n   If you're on a hosting panel, look for a "Node version" setting and set it to 20 (or the highest 20+/22 option available), then restart.\n`);
        process.exit(1);
    }
}

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
import { getGlobalSettings, setGlobalSetting, getGroupSettings, addActionWarning, addWarning } from './lib/settingsStore.js';
import { handleGroupProtection, handleAntifake, handleWelcomeGoodbye } from './lib/groupProtection.js';
import { isBotAdmin, isSenderAdmin, getMentionedJids } from './lib/groupHelper.js';
import { extractViewOnceMedia, downloadViewOnceMedia } from './lib/viewOnce.js';
import { getAiReply } from './lib/aiApi.js';
import readline from 'readline';

dotenv.config({ path: './.env' });

let messageLogCounter = 0;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SESSION_DIR = './session';
// let (not const) — .setbotname needs to update this in the *running*
// process immediately, not just on next restart. Previously it only set
// process.env.BOT_NAME, which this const had already captured at boot,
// so the name never actually changed until a restart (including in the
// menu header, which is exactly where it needs to show up live).
let BOT_NAME = (() => {
    try {
        const saved = JSON.parse(fs.readFileSync('./data/botname.json', 'utf8'));
        if (saved?.name) return saved.name;
    } catch {}
    return process.env.BOT_NAME || 'Paxton MD';
})();
function setBotName(name) { BOT_NAME = name; }
const VERSION = '1.0.0';
const DEFAULT_PREFIX = process.env.PREFIX || '.';
const OWNER_FILE = './owner.json';
// Number that always gets the dev react (👑) — and ONLY this number,
// independent of who the session/bot owner is set to. Hardcoded on
// purpose — not exposed as a setting, not tied to jidManager.isOwner()
// so a different session/owner never triggers it.
const HARDCODED_DEV_NUMBERS = ['27697344852'];
const UPDATE_CHANNEL_JID = '120363427360133880@newsletter';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_SETTINGS_FILE = './bot_settings.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';

function addToWhitelist(jid) {
    WHITELIST.add(jid);
    let data = { whitelist: [] };
    try { if (fs.existsSync(WHITELIST_FILE)) data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8')); } catch {}
    if (!data.whitelist) data.whitelist = [];
    if (!data.whitelist.includes(jid)) data.whitelist.push(jid);
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
}
function removeFromWhitelist(jid) {
    WHITELIST.delete(jid);
    let data = { whitelist: [] };
    try { if (fs.existsSync(WHITELIST_FILE)) data = JSON.parse(fs.readFileSync(WHITELIST_FILE, 'utf8')); } catch {}
    data.whitelist = (data.whitelist || []).filter((j) => j !== jid);
    fs.writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
}
const BLOCKED_USERS_FILE = './blocked_users.json';
const WELCOME_DATA_FILE = './data/welcome_data.json';
const AUTO_CONNECT_ON_LINK = true;
const AUTO_CONNECT_ON_START = true;
const RATE_LIMIT_ENABLED = true;
const MIN_COMMAND_DELAY = 1000;
const STICKER_DELAY = 2000;
const AUTO_JOIN_ENABLED = true;
const AUTO_JOIN_DELAY = 2000;
const SEND_WELCOME_MESSAGE = true;
const GROUP_LINK = 'https://chat.whatsapp.com/DIDhRW19119EICPJpxdpTc';
const GROUP_INVITE_CODE = GROUP_LINK.split('/').pop();
const GROUP_NAME = 'PAXTON MD SQUAD ⚡';
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
        global.__paxtonLastError = { time: new Date().toLocaleString(), message: message.slice(0, 1500) };
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
║   ⚡ ${chalk.bold(`${BOT_NAME.toUpperCase()} v${VERSION}`)}
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
let reconnectScheduled = false;
const MAX_RETRY_ATTEMPTS = 10;
let BOT_MODE = 'public', WHITELIST = new Set(), AUTO_LINK_ENABLED = true;
// Same live-update fix as setBotName — .mode used to only write to disk
// and needed a restart to actually take effect, since BOT_MODE was only
// re-read from that file at boot.
function setBotMode(mode) { BOT_MODE = mode; }
let AUTO_CONNECT_COMMAND_ENABLED = true, AUTO_ULTIMATE_FIX_ENABLED = true;

// ====== LIGHTWEIGHT WEB SERVER (status page + health check) ======
// Independent of the WhatsApp connection/pairing logic — gives hosting
// platforms (Render, etc.) an open HTTP port, and lets you check the
// bot is alive from a browser at / and /health.
async function startWebServer() {
    try {
        const { default: express } = await import('express');
        const app = express();
        const port = process.env.PORT || 3000;
        app.get('/', (req, res) => {
            res.type('html').send(`<!DOCTYPE html>
<html><head><title>${BOT_NAME}</title>
<style>body{font-family:sans-serif;background:#0b0b12;color:#eee;display:flex;height:100vh;align-items:center;justify-content:center;margin:0}
.card{background:#151522;padding:2rem 3rem;border-radius:12px;text-align:center;box-shadow:0 0 20px rgba(0,0,0,.4)}
.dot{display:inline-block;width:10px;height:10px;border-radius:50%;background:${isConnected ? '#3ddc84' : '#e6553a'};margin-right:8px}
</style></head>
<body><div class="card">
<h1>⚡ ${BOT_NAME}</h1>
<p><span class="dot"></span>${isConnected ? 'Connected to WhatsApp' : 'Not connected'}</p>
<p>Version ${VERSION} · Uptime ${Math.floor(process.uptime())}s</p>
<p><a href="/health" style="color:#8ab4f8">/health</a> — JSON status endpoint</p>
</div></body></html>`);
        });
        app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                bot: BOT_NAME,
                version: VERSION,
                connected: isConnected,
                uptimeSeconds: Math.floor(process.uptime()),
                mode: BOT_MODE,
                prefix: getCurrentPrefix() || null
            });
        });
        app.listen(port, () => {
            UltraCleanLogger.success(`🌐 Web server listening on port ${port}`);
        });
    } catch (error) {
        UltraCleanLogger.warning(`Web server not started: ${error.message}`);
    }
}
startWebServer();
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
        if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) return true;
        if (cleaned.isLid) {
            const lidNumber = cleaned.cleanNumber;
            if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) return true;
            if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) return true;
        }
        return false;
    }
    // Sudo/whitelisted users: elevated access via .addsudo, without being
    // the actual bot owner. This previously did nothing — WHITELIST was
    // populated on add but never checked anywhere.
    isSudo(msg) {
        if (!msg || !msg.key) return false;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        if (WHITELIST.has(senderJid)) return true;
        const cleaned = this.cleanJid(senderJid);
        return WHITELIST.has(cleaned.cleanJid) || WHITELIST.has(cleaned.cleanNumber);
    }
    isOwnerOrSudo(msg) { return this.isOwner(msg) || this.isSudo(msg); }
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
        try { await sock.sendMessage(userJid, { text: `🎉 *WELCOME TO Paxton MD!*\n\n⚡ *PAXTON TECH* 🖤
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

// ============================================================
//  ANTI-VIEWONCE (always on)
// ============================================================
async function handleAntiViewOnce(sock, msg, chatId, senderJid) {
    try {
        if (!OWNER_JID) return;
        const vo = extractViewOnceMedia(msg.message);
        if (!vo) return;
        const buffer = await downloadViewOnceMedia(vo);
        const origin = chatId.endsWith('@g.us') ? `group ${chatId.split('@')[0]}` : 'a DM';
        const caption = `👁️ *Anti-ViewOnce*\nFrom: @${senderJid.split('@')[0]} (${origin})${vo.media.caption ? `\n\n${vo.media.caption}` : ''}`;
        const payload = vo.type === 'image' ? { image: buffer, caption, mentions: [senderJid] } : { video: buffer, caption, mentions: [senderJid] };
        await sock.sendMessage(OWNER_JID, payload).catch(() => {});
    } catch (error) {}
}

async function handleConnectCommand(sock, msg, args, cleaned) {
    try {
        const chatJid = msg.key.remoteJid || cleaned.cleanJid;
        const start = Date.now();
        const currentPrefix = getCurrentPrefix();
        const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
        const platform = detectPlatform();
        const loadingMessage = await sock.sendMessage(chatJid, { text: `⚡ *${BOT_NAME}* is checking connection... █▒▒▒▒▒▒▒▒▒` }, { quoted: msg });
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
        const text = `╭─⌈ ✅ *CONNECTED* ⌋\n│\n│ ✧ *Status:* Online\n│ ✧ *Owner:* Paxton\n│ ✧ *Repo:* Paxton-MD\n│ ✧ *Uptime:* ${h}h ${m}m\n│ ✧ *Ping:* ${latency}ms\n│\n╰⊷ *Powered by ${BOT_NAME}*`;
        await sock.sendMessage(chatJid, { text, edit: loadingMessage.key });
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

let autobioInterval = null;
let lastAutobioText = null;
function startAutobio(sock) {
    if (autobioInterval) clearInterval(autobioInterval);
    autobioInterval = setInterval(async () => {
        try {
            if (!isConnected || !sock) return;
            const settings = getGlobalSettings();
            if (!settings.autobio) return;
            const uptimeSec = process.uptime();
            const h = Math.floor(uptimeSec / 3600);
            const m = Math.floor((uptimeSec % 3600) / 60);
            const text = `⚡ ${BOT_NAME} | Up ${h}h ${m}m | ${getTotalCommandCount()} cmds | ${new Date().toLocaleTimeString()}`;
            if (text === lastAutobioText) return;
            lastAutobioText = text;
            await sock.updateProfileStatus(text);
        } catch (error) { UltraCleanLogger.warning(`Auto-bio update failed: ${error.message}`); }
    }, 5 * 60 * 1000);
}
function stopAutobio() { if (autobioInterval) { clearInterval(autobioInterval); autobioInterval = null; } }

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
const commandAliases = new Map(); // alias (lowercase) -> primary command name (lowercase)
const spamTracker = new Map(); // "groupJid:senderJid" -> array of recent message timestamps (antispam)
const commandCategories = new Map();

// commands.size counts every alias as its own Map entry (aliases share the
// same command object but get a separate key), so it's inflated relative
// to the actual number of command files/features. commandCategories only
// ever pushes each file's primary name once, so summing those lengths is
// the real, accurate "total commands" figure to display anywhere.
function getTotalCommandCount() {
    let total = 0;
    for (const list of commandCategories.values()) total += list.length;
    return total;
}

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
                        if (Array.isArray(command.alias)) command.alias.forEach(alias => commandAliases.set(alias.toLowerCase(), command.name.toLowerCase()));
                    }
                } catch {}
            }
        }
        if (categoryCount > 0) UltraCleanLogger.info(`${categoryCount} commands loaded from ${category}`);
    } catch {}
}

function parsePaxtonMDSession(sessionString) {
    try {
        let cleaned = sessionString.trim().replace(/^["']|["']$/g, '');
        if (cleaned.startsWith('PAXTON-MD:')) {
            // FIX: was `substring(9)`, which is one character short of the
            // "PAXTON-MD:" prefix's actual length (10) and left a stray
            // leading ":" glued onto the base64 payload. Node's base64
            // decoder is lenient enough to usually ignore it, which is why
            // this went unnoticed, but it's not something to rely on.
            const base64Part = cleaned.slice('PAXTON-MD:'.length).trim();
            if (!base64Part) throw new Error('No data after PAXTON-MD:');
            try { return JSON.parse(Buffer.from(base64Part, 'base64').toString('utf8')); } catch { return JSON.parse(base64Part); }
        }
        try { return JSON.parse(Buffer.from(cleaned, 'base64').toString('utf8')); } catch { return JSON.parse(cleaned); }
    } catch (error) { UltraCleanLogger.error('❌ Failed to parse session:', error.message); return null; }
}

async function authenticateWithSessionId(sessionId) {
    try {
        const sessionData = parsePaxtonMDSession(sessionId);
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
        // Some free panel hosts (Katabump, bot-hosting.net, and similar
        // Pterodactyl-style panels) don't let you add custom environment
        // variables at all on their free tiers — only whatever fields the
        // egg predefines. Since they always give you a file manager though,
        // fall back to a plain text file the user can paste their session
        // string into directly, no env var needed.
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
        console.log(chalk.yellow('\n⚡ Paxton MD v' + VERSION + ' - LOGIN SYSTEM'));
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
            if (input.trim() === '1') { sessionId = await this.ask('Paste your Session ID (PAXTON-MD:... or base64): '); if (!sessionId || sessionId.trim() === '') return await this.selectMode(); }
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
    reconnectScheduled = false;
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
        // NOTE: autoConnectOnStart is intentionally NOT reset here. This
        // function runs again on every reconnect (unstable host, 409 kick,
        // etc), not just on first process start — resetting hasRun here
        // meant the auto ".connect" status message fired again on every
        // single reconnect, which is what was spamming the owner's chat
        // with repeated "Connected" messages on hosts with flaky uptime.
        // It's reset exactly once, at true process start, in main().
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
                isConnected = true; startHeartbeat(sock); startAutobio(sock);
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
            try { await handleGroupProtection(sock, update, OWNER_JID); } catch (error) { UltraCleanLogger.warning(`Group protection error: ${error.message}`); }
            try { await handleAntifake(sock, update); } catch (error) { UltraCleanLogger.warning(`Anti-fake error: ${error.message}`); }
            try {
                if (update.action === 'add') {
                    const blacklist = getGlobalSettings().globalBlacklist || [];
                    const blacklisted = update.participants.filter((p) => blacklist.includes(p));
                    if (blacklisted.length) {
                        try { await sock.groupParticipantsUpdate(update.id, blacklisted, 'remove'); } catch {}
                    }
                }
            } catch (error) { UltraCleanLogger.warning(`Blacklist enforcement error: ${error.message}`); }
            try { await handleWelcomeGoodbye(sock, update, getGlobalSettings); } catch (error) { UltraCleanLogger.warning(`Welcome/goodbye error: ${error.message}`); }
        });
        sock.ev.on('call', async (calls) => {
            try {
                if (!getGlobalSettings().anticall) return;
                for (const call of calls) {
                    if (call.status === 'offer') {
                        await sock.rejectCall(call.id, call.from).catch(() => {});
                        await sock.sendMessage(call.from, { text: '📵 This bot does not accept calls.' }).catch(() => {});
                    }
                }
            } catch (error) { UltraCleanLogger.warning(`Anti-call error: ${error.message}`); }
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

            // Track the bot's own recently-sent message keys per chat, so
            // .nuke can bulk-delete them later. Capped at 200 per chat.
            if (msg.key.fromMe) {
                if (!global.__paxtonSentMessages) global.__paxtonSentMessages = new Map();
                const chatId = msg.key.remoteJid;
                const list = global.__paxtonSentMessages.get(chatId) || [];
                list.push(msg.key);
                global.__paxtonSentMessages.set(chatId, list.slice(-200));
            }
            
            // ✅ REMOVED AUTO-REACT: Commented out the react line
            // try { sock.sendMessage(msg.key.remoteJid, { react: { text: '⚡', key: msg.key } }).catch(() => {}); } catch(e) {}
            
            handleIncomingMessage(sock, msg).catch(() => {});
        });
        await commandLoadPromise;
        UltraCleanLogger.success(`✅ Loaded ${getTotalCommandCount()} commands`);
        return sock;
    } catch (error) {
        UltraCleanLogger.error('❌ Connection failed, retrying in 8 seconds...');
        if (!reconnectScheduled) { reconnectScheduled = true; setTimeout(async () => { await startBot(loginMode, loginData); }, 8000); }
    }
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
    // Push BOT_NAME to WhatsApp's own profile/display name so the
    // account itself shows "Paxton MD", not just the in-chat menu text.
    try {
        const currentPushName = sock.user?.name || sock.user?.verifiedName || '';
        if (currentPushName !== BOT_NAME) await sock.updateProfileName(BOT_NAME);
    } catch (error) { UltraCleanLogger.warning(`Could not set WhatsApp profile name: ${error.message}`); }
    const ownerInfo = jidManager.getOwnerInfo();
    const currentPrefix = getCurrentPrefix();
    const prefixDisplay = isPrefixless ? 'none (prefixless)' : `"${currentPrefix}"`;
    updateTerminalHeader();
    console.log(chalk.greenBright(`\n╔══════════════════════════════════════╗\n║    ⚡ PAXTON MD ONLINE v${VERSION}           ║\n╠══════════════════════════════════════╣\n║  ✅ Connected!\n║  👑 Owner  : +${ownerInfo.ownerNumber}\n║  💬 Prefix : ${prefixDisplay}\n╚══════════════════════════════════════╝\n`));
    const cleaned = jidManager.cleanJid(OWNER_JID);
    if (ultimateFixSystem.isFixNeeded(OWNER_JID)) {
        setTimeout(async () => { await ultimateFixSystem.applyUltimateFix(sock, OWNER_JID, cleaned, isFirstConnection); }, 1200);
    }
    // (Removed the old second "Connected Successfully!" message that fired
    // 15s later — it duplicated the connection status box that
    // applyUltimateFix already sends above, so every fresh login/session
    // was sending two separate "we're online" messages back to back.)
}

async function handleConnectionCloseSilently(lastDisconnect, loginMode, phoneNumber) {
    if (reconnectScheduled) return;
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    connectionAttempts++;
    if (statusCode === 409) { reconnectScheduled = true; setTimeout(async () => { await startBot(loginMode, phoneNumber); }, 25000); return; }
    if (statusCode === 401 || statusCode === 403 || statusCode === 419) cleanSession();
    if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
        // Don't process.exit here — on auto-restart panels a crash just
        // triggers a brand new process boot (re-running the whole
        // connect/owner-fix flow again), which is what turned "connection
        // is flaky" into "spamming connection status, then going silent".
        // Cool down for 5 minutes and keep trying instead of crashing.
        UltraCleanLogger.warning('⚠️ Repeated connection failures — cooling down for 5 minutes before retrying.');
        connectionAttempts = 0;
        reconnectScheduled = true;
        setTimeout(async () => { await startBot(loginMode, phoneNumber); }, 5 * 60 * 1000);
        return;
    }
    const delayTime = Math.min(4000 * Math.pow(2, connectionAttempts - 1), 50000);
    reconnectScheduled = true;
    setTimeout(async () => { await startBot(loginMode, phoneNumber); }, delayTime);
}

// Reference the update channel as a native "View Channel" chip instead of
// printing the raw invite URL as visible text in menus/ping/uptime output.
function channelContextInfo() {
    return { forwardedNewsletterMessageInfo: { newsletterJid: UPDATE_CHANNEL_JID, newsletterName: 'Paxton MD Updates', serverMessageId: 1 } };
}
const CHANNEL_LINE = '📢 *Channel:* view channel below ⬇️';

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
                `│ ⚡ ${chalk.bold(`PAXTON MD LOG #${logNum}`)}\n` +
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
                `│ ⚡ ${chalk.bold(`PAXTON MD LOG #${logNum}`)}\n` +
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

async function enforceGroupModeration(sock, msg, chatId, senderJid, textMsg) {
    try {
        const settings = getGroupSettings(chatId);
        if (!settings.antilink && !settings.antibadword && !settings.antitag) return false;
        if (await isSenderAdmin(sock, chatId, senderJid)) return false;
        if (jidManager.isOwner(msg)) return false;

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

        try {
            await sock.sendMessage(chatId, { delete: { remoteJid: chatId, fromMe: false, id: msg.key.id, participant: senderJid } });
        } catch {}
        const count = addWarning(chatId, senderJid);
        if (count >= 3 && (await isBotAdmin(sock, chatId))) {
            try {
                await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove');
                await sock.sendMessage(chatId, { text: `🚫 @${senderJid.split('@')[0]} removed after repeated warnings (${violation}).`, mentions: [senderJid] });
            } catch {}
        } else {
            await sock.sendMessage(chatId, { text: `⚠️ @${senderJid.split('@')[0]}, your message was removed for ${violation}. Warning ${count}/3.`, mentions: [senderJid] });
        }
        return true;
    } catch {
        return false;
    }
}

// Chatbot auto-reply: if someone replies to one of the BOT's own messages
// without using the prefix, respond conversationally using whichever AI
// key is configured in api/keys.js. Silently does nothing if no key is
// set (no spammy "missing API key" replies in every chat).
async function handleChatbotReply(sock, msg, textMsg, chatId, senderJid) {
    try {
        if (!textMsg || !textMsg.trim()) return;
        if (!getGlobalSettings().chatbotEnabled) return;
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        const quotedParticipant = contextInfo?.participant;
        const botNumber = sock.user?.id?.split(':')[0];
        const isReplyToBot = quotedParticipant && quotedParticipant.split('@')[0] === botNumber;
        const isGroup = chatId.endsWith('@g.us');
        const mentioned = getMentionedJids(msg);
        const isMentioned = mentioned.some((j) => j.split('@')[0] === botNumber);
        const groupFullReply = isGroup && getGroupSettings(chatId).chatbotFullReply;
        // DM: every message is implicitly directed at the bot. Group: only
        // when actually mentioned/replied to, UNLESS this group has full
        // chatbot mode turned on via .chatbot on (run inside the group).
        const shouldReply = isReplyToBot || isMentioned || !isGroup || groupFullReply;
        if (!shouldReply) return;

        await sock.sendPresenceUpdate('composing', chatId).catch(() => {});
        const reply = await getAiReply(textMsg);
        if (reply) await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    } catch (error) {
        UltraCleanLogger.warning(`Chatbot reply error: ${error.message}`);
    }
}

async function handleIncomingMessage(sock, msg) {
    // ✅ FIX: Skip bot's own messages
    // if (msg.key.fromMe) return;  // Disabled - was blocking all messages
    // (Auto-view-status is handled directly in the messages.upsert listener
    // for status@broadcast messages, which never reach this function.)
    
    const startTime = Date.now();
    try {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;

        // Anti-viewonce: recover and forward view-once media to the owner's
        // DM before it disappears. Runs before the textMsg/empty-caption
        // check below, since view-once media is very often caption-less.
        handleAntiViewOnce(sock, msg, chatId, senderJid).catch(() => {});

        // Anti-spam: flood detection for groups (owner is exempt)
        if (chatId.endsWith('@g.us') && senderJid !== OWNER_JID) {
            try {
                const spamSettings = getGroupSettings(chatId);
                if (spamSettings.antispam) {
                    const key = `${chatId}:${senderJid}`;
                    const now = Date.now();
                    const recent = (spamTracker.get(key) || []).filter((t) => now - t < 10000);
                    recent.push(now);
                    spamTracker.set(key, recent);
                    if (recent.length > 6) {
                        spamTracker.set(key, []);
                        const count = addActionWarning(chatId, senderJid, 'antispam');
                        if (count >= 3 && (await isBotAdmin(sock, chatId))) {
                            await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove').catch(() => {});
                            await sock.sendMessage(chatId, { text: `🛡️ @${senderJid.split('@')[0]} removed for spamming.`, mentions: [senderJid] }).catch(() => {});
                        } else {
                            await sock.sendMessage(chatId, { text: `🛡️ @${senderJid.split('@')[0]} please slow down — spam warning ${count}/3.`, mentions: [senderJid] }).catch(() => {});
                        }
                        return;
                    }
                }
            } catch {}
        }
        
        const autoLinkPromise = autoLinkSystem.shouldAutoLink(sock, msg);
        if (isUserBlocked(senderJid)) return;
        const linked = await autoLinkPromise;
        if (linked) return;
        
        // Dev react — reacts ONLY to the hardcoded dev number below,
        // regardless of any setting and regardless of who the current
        // session/bot owner is. Deliberately NOT using jidManager.isOwner()
        // here, since that changes per session/deployment and would make
        // this fire for whoever's number the bot is logged in as.
        // Runs on EVERY message type (text, sticker, image/video/voice with
        // no caption, etc) — it used to sit after the empty-textMsg check
        // below, so anything without a caption never got reacted to.
        try {
            // Strip the device suffix (":16" etc) BEFORE anything else — the
            // previous regex-based digit strip mangled multi-device JIDs like
            // "27697344852:16@s.whatsapp.net" into "2769734485216", which
            // never matched the clean number below. That's why this looked
            // unreliable across different linked-device sessions.
            const rawSenderJid = msg.key.participant || msg.key.remoteJid;
            let senderNumber = rawSenderJid.split('@')[0].split(':')[0];
            // In groups (and sometimes 1:1), WhatsApp can hand us the sender
            // as a @lid identity instead of a phone-number JID — the plain
            // split above then compares a LID string against a phone number
            // and never matches, which is why this looked broken specifically
            // for messages sent inside a group. Resolve it first.
            if (rawSenderJid.endsWith('@lid')) {
                if (!globalThis.devLidCache) globalThis.devLidCache = new Map();
                if (globalThis.devLidCache.has(rawSenderJid)) {
                    senderNumber = globalThis.devLidCache.get(rawSenderJid);
                } else {
                    const resolved = await resolveJidForLog(sock, rawSenderJid, chatId);
                    senderNumber = (resolved || rawSenderJid).split('@')[0].split(':')[0];
                    if (HARDCODED_DEV_NUMBERS.includes(senderNumber)) globalThis.devLidCache.set(rawSenderJid, senderNumber);
                }
            }
            if (HARDCODED_DEV_NUMBERS.includes(senderNumber)) {
                sock.sendMessage(msg.key.remoteJid, { react: { text: '👑', key: msg.key } }).catch(() => {});
            }
        } catch (e) {}

        // Blacklist enforcement for members already in a group (caught on
        // join in group-participants.update too, but this catches someone
        // blacklisted after they already joined).
        try {
            if (chatId.endsWith('@g.us')) {
                const blacklist = getGlobalSettings().globalBlacklist || [];
                if (blacklist.includes(senderJid)) {
                    try { await sock.sendMessage(chatId, { delete: msg.key }); } catch {}
                    try { await sock.groupParticipantsUpdate(chatId, [senderJid], 'remove'); } catch {}
                    return;
                }
            }
        } catch (e) {}

        // Auto-save shared vCards in groups that have .autosavevcf on. Runs
        // before the textMsg check below since contact messages carry no
        // text/caption and would otherwise never be seen.
        try {
            const contactMsg = msg.message?.contactMessage;
            const contactsArray = msg.message?.contactsArrayMessage?.contacts;
            if ((contactMsg || contactsArray) && chatId.endsWith('@g.us')) {
                const settings = getGroupSettings(chatId);
                if (settings.autosavevcf) {
                    const toSave = contactsArray || [contactMsg];
                    const fs = (await import('fs')).default;
                    const path = (await import('path')).default;
                    const file = path.join(process.cwd(), 'data', 'saved_contacts.json');
                    let saved = [];
                    try { if (fs.existsSync(file)) saved = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
                    let groupName = '';
                    try { groupName = (await sock.groupMetadata(chatId)).subject; } catch {}
                    for (const c of toSave) {
                        if (!c) continue;
                        const numberMatch = /waid=(\d+)/.exec(c.vcard || '');
                        saved.push({ name: c.displayName || 'Unknown', number: numberMatch ? numberMatch[1] : 'unknown', groupName, savedAt: new Date().toISOString() });
                    }
                    fs.writeFileSync(file, JSON.stringify(saved.slice(-500), null, 2));
                }
            }
        } catch (e) {}

        const textMsg = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
        if (!textMsg) return;
        
        if (chatId.endsWith('@g.us')) {
            const moderated = await enforceGroupModeration(sock, msg, chatId, senderJid, textMsg);
            if (moderated) return;
        }
        
        logIncomingMessage(sock, msg, textMsg).catch(() => {});
        
        // Auto-typing / auto-recording presence indicators (toggle with
        // .autotyping on|off and .autorecording on|off — owner only)
        try {
            const liveSettings = getGlobalSettings();
            if (liveSettings.autoTyping) sock.sendPresenceUpdate('composing', msg.key.remoteJid).catch(() => {});
            else if (liveSettings.autoRecording) sock.sendPresenceUpdate('recording', msg.key.remoteJid).catch(() => {});
            if (liveSettings.autoRead) sock.readMessages([msg.key]).catch(() => {});
        } catch (e) {}
        
        const currentPrefix = getCurrentPrefix();

        // .mutebot enforcement — only bothers with the admin lookup when
        // the chat is actually in the muted list, to avoid extra work on
        // every single message in every group.
        if (chatId.endsWith('@g.us') && !jidManager.isOwner(msg)) {
            const mutedGroups = getGlobalSettings().mutedGroups || [];
            if (mutedGroups.includes(chatId)) {
                try {
                    const { isSenderAdmin } = await import('./lib/groupHelper.js');
                    if (!(await isSenderAdmin(sock, chatId, senderJid))) return;
                } catch {}
            }
        }

        // No-prefix owner shortcuts. Deliberately restricted to the owner's
        // own messages and an exact (trimmed, case-insensitive) match —
        // "silent" and "wow" are real words people type in normal
        // conversation, so this only fires for the owner saying *just* that
        // word, never as a substring of a longer message from anyone else.
        const bareWord = textMsg.trim().toLowerCase();
        if (jidManager.isOwner(msg)) {
            if (bareWord === 'silent') {
                const nextMode = BOT_MODE === 'private' ? 'public' : 'private';
                try {
                    fs.writeFileSync(BOT_MODE_FILE, JSON.stringify({ mode: nextMode, setAt: new Date().toISOString() }, null, 2));
                } catch {}
                setBotMode(nextMode);
                await sock.sendMessage(chatId, { text: `🤫 Bot mode toggled to *${nextMode}*.` }, { quoted: msg }).catch(() => {});
                return;
            }
            if (bareWord === 'wow') {
                const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
                const vo = extractViewOnceMedia(quoted);
                if (vo) {
                    try {
                        const buffer = await downloadViewOnceMedia(vo);
                        const caption = vo.media.caption || '(view-once, recovered)';
                        const payload = vo.type === 'image' ? { image: buffer, caption } : { video: buffer, caption };
                        await sock.sendMessage(OWNER_JID, payload);
                        if (chatId !== OWNER_JID) await sock.sendMessage(chatId, { text: '✅ Sent to your DM.' }, { quoted: msg });
                    } catch {}
                }
                return;
            }
        }

        let commandName = '', args = [];

        if (!isPrefixless && textMsg.trim() === currentPrefix) {
            if (!checkBotMode(msg, 'prefix') && !jidManager.isOwner(msg)) return;
            await sock.sendMessage(chatId, { text: `ℹ️ My current prefix is: *${currentPrefix}*` }, { quoted: msg });
            return;
        }

        if (!isPrefixless && textMsg.startsWith(currentPrefix)) {
            // Strip the prefix, then trim any extra spaces the user typed
            // (e.g. ". ping" or ".   ping args") before splitting command/args.
            const withoutPrefix = textMsg.slice(currentPrefix.length).trimStart();
            const spaceIndex = withoutPrefix.indexOf(' ');
            commandName = (spaceIndex === -1 ? withoutPrefix : withoutPrefix.slice(0, spaceIndex)).toLowerCase().trim();
            args = spaceIndex === -1 ? [] : withoutPrefix.slice(spaceIndex).trim().split(/\s+/).filter(Boolean);
        } else if (isPrefixless) {
            const words = textMsg.trim().split(/\s+/);
            const firstWord = words[0].toLowerCase();
            if (commands.has(firstWord)) { commandName = firstWord; args = words.slice(1); }
            else {
                for (const [cmdName, command] of commands.entries()) { if (command.alias && command.alias.includes(firstWord)) { commandName = cmdName; args = words.slice(1); break; } }
                if (!commandName) { const defaultCommands = ['ping','help', 'menu','menustyle','setprefix','prefix','autojoin','uptime','statusstats','ultimatefix','prefixinfo','defib','defibrestart']; if (defaultCommands.includes(firstWord)) { commandName = firstWord; args = words.slice(1); } }
            }
        }
        if (!commandName) {
            await handleChatbotReply(sock, msg, textMsg, chatId, senderJid);
            return;
        }
        
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
        
        if (commandAliases.has(commandName)) commandName = commandAliases.get(commandName);
        const command = commands.get(commandName);
        if (command) {
            try {
                if (command.ownerOnly && !jidManager.isOwnerOrSudo(msg)) { try { await sock.sendMessage(chatId, { text: '❌ *Owner Only Command*' }); } catch {} return; }
                if (commandName.includes('sticker')) await delay(1000);
                await command.execute(sock, msg, args, currentPrefix, { OWNER_NUMBER: OWNER_CLEAN_NUMBER, OWNER_JID: OWNER_CLEAN_JID, OWNER_LID, BOT_NAME, BOT_MODE, setBotName, setBotMode, VERSION, isOwner: () => jidManager.isOwner(msg), isOwnerOrSudo: () => jidManager.isOwnerOrSudo(msg), jidManager, store, statusDetector, updatePrefix: updatePrefixImmediately, getCurrentPrefix, rateLimiter, memberDetector, isPrefixless, commands, commandCategories, getTotalCommandCount, os, getGlobalSettings, setGlobalSetting, channelContextInfo, CHANNEL_LINE, addToWhitelist, removeFromWhitelist });
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
                    text: `╭━━━〔 🔤 PREFIX 〕━━━┈⊷
┃ Current: ${status}
┃ 
┃ ⚡ "The summoning word."
╰━━━━━━━━━━━━━━━┈⊷`
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
                        text: `╭━━━〔 ⚙️ PREFIX 〕━━━┈⊷
┃ Current: ${status}
┃ 
┃ Usage: ${currentPrefix}setprefix <new>
┃ Example: ${currentPrefix}setprefix !
┃ ${currentPrefix}setprefix none (prefixless mode)
┃ 
┃ ⚡ "Change the summoning word."
╰━━━━━━━━━━━━━━━┈⊷`
                    }, { quoted: msg });
                    break;
                }

                // Delegate to the single shared implementation so this never
                // drifts out of sync with the module-level prefix state
                // (a local parameter here used to shadow it, which is why
                // setprefix silently failed to take effect before).
                const result = updatePrefixImmediately(args[0]);
                if (!result.success) {
                    await sock.sendMessage(chatId, { text: `❌ ${result.error}` }, { quoted: msg });
                    break;
                }

                const newDisplay = result.isPrefixless ? 'none (prefixless)' : `"${result.newPrefix}"`;
                await sock.sendMessage(chatId, {
                    text: `╭━━━〔 ✅ PREFIX UPDATED 〕━━━┈⊷
┃ New Prefix: ${newDisplay}
┃ 
┃ ⚡ "The summoning word has changed."
╰━━━━━━━━━━━━━━━┈⊷`
                }, { quoted: msg });
                break;
            }
            case 'ping': {
                try { await sock.sendPresenceUpdate('composing', chatId); } catch {}
                const start = Date.now();
                
                // Send initial message
                const sentMsg = await sock.sendMessage(chatId, { 
                    text: `╭━━━〔 🏓 PING 〕━━━┈⊷
┃
┃ 📡 Measuring latency...
┃ ⚡ "The darkness calculates..."
╰━━━━━━━━━━━━━━━┈⊷` 
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
                    text: `╭━━━〔 🏓 PONG 〕━━━┈⊷
┃
┃ ${emoji} *Ping:* ${latency}ms
┃ 📊 *Status:* ${status}
┃
┃ ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s
┃ 💾 *Memory:* ${(memory.rss / 1024 / 1024).toFixed(1)} MB
┃ ⚡ *Speed:* ${(latency > 0 ? (1000 / latency).toFixed(0) : '∞')} req/s
┃
┃ ⚡ "The darkness responds."
╰━━━━━━━━━━━━━━━┈⊷
${CHANNEL_LINE}` ,
                    edit: sentMsg.key, contextInfo: channelContextInfo()
                });
                break;
            }
            case 'ping2': {
                const start2 = Date.now();
                const sentMsg2 = await sock.sendMessage(chatId, { text: '⚡ measuring...' }, { quoted: msg });
                const latency2 = Date.now() - start2;
                const uptime2 = process.uptime();
                const h2 = Math.floor(uptime2 / 3600), m2 = Math.floor((uptime2 % 3600) / 60);
                const text2 = `╭─⌈ ⚡ *PING RESPONSE* ⌋\n│\n│ ✧ *Speed:* ${latency2.toFixed(1)} ms\n│ ✧ *Uptime:* ${h2}h ${m2}m\n│ ✧ *Status:* Stable\n│\n╰⊷ *Powered by ${BOT_NAME}*`;
                await sock.sendMessage(chatId, { text: text2, edit: sentMsg2.key });
                break;
            }
            case 'runtime':
            case 'uptime': { 
                const uptime = process.uptime(); 
                await sock.sendMessage(chatId, { 
                    text: `╭━━━〔 ⏰ UPTIME 〕━━━┈⊷
┃ 
┃ ⏱️ ${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s
┃ 💾 Memory: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB
┃ 
┃ ⚡ "The darkness never sleeps."
╰━━━━━━━━━━━━━━━┈⊷
${CHANNEL_LINE}`,
                    contextInfo: channelContextInfo()
                }, { quoted: msg }); 
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
        autoConnectOnStart.reset();
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

