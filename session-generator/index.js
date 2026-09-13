// ============================================================
//  Paxton MD — Session ID Generator
//  Standalone web tool. Completely separate from the main bot's
//  pairing code logic in index.js — this only produces a
//  PAXTON-MD: session string you can paste into SESSION_ID.
// ============================================================
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_ROOT = path.join(__dirname, 'temp_sessions');
if (!fs.existsSync(TEMP_ROOT)) fs.mkdirSync(TEMP_ROOT, { recursive: true });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory job store: sessionKey -> job object (see createJob)
const jobs = new Map();

// WhatsApp closes the socket with "restart required" (515) right after
// the pairing code is accepted on the phone — that's expected, not a
// failure. The client is supposed to reconnect using the SAME auth
// state to finish the handshake. Without this, the generator looked
// like it "sends the code but never connects" even though the phone
// side worked fine.
const RESTART_REQUIRED = 515;
const LOGGED_OUT = 401;
const MAX_RECONNECT_ATTEMPTS = 6;
const MAX_PAIRING_CODE_ATTEMPTS = 3;
const REPO_URL = 'https://github.com/gpaxton428-collab/Paxton-MD.git';
const UPDATE_CHANNEL_JID = '120363427360133880@newsletter';

function cleanupJob(job) {
    if (job.timer) { clearTimeout(job.timer); job.timer = null; }
    try { job.sock?.ev?.removeAllListeners(); } catch {}
    try { job.sock?.ws?.close(); } catch {}
    try { job.sock?.end?.(); } catch {}
    try { if (job.dir && fs.existsSync(job.dir)) fs.rmSync(job.dir, { recursive: true, force: true }); } catch {}
}

// Auto-expire jobs after 10 minutes to avoid leaking sockets/files
setInterval(() => {
    const now = Date.now();
    for (const [key, job] of jobs.entries()) {
        if (now - job.createdAt > 10 * 60 * 1000) {
            cleanupJob(job);
            jobs.delete(key);
        }
    }
}, 60 * 1000);

// Persistent counter of how many sessions have ever been successfully
// generated — shown on the website as a "total users" figure. Survives
// restarts since it's just a small JSON file on disk.
const STATS_FILE = path.join(__dirname, 'stats.json');
function readStats() {
    try { return JSON.parse(fs.readFileSync(STATS_FILE, 'utf8')); } catch { return { totalSessions: 0 }; }
}
function incrementStats() {
    const stats = readStats();
    stats.totalSessions = (stats.totalSessions || 0) + 1;
    try { fs.writeFileSync(STATS_FILE, JSON.stringify(stats)); } catch {}
    return stats;
}

async function requestPairingCodeWithRetry(job, sock, phone, attempt = 1) {
    if (job.codeRequested) return; // already have/had a code for this job
    try {
        const code = await sock.requestPairingCode(phone);
        job.codeRequested = true;
        job.code = code.match(/.{1,4}/g)?.join('-') || code;
        job.status = 'code';
    } catch (error) {
        if (attempt < MAX_PAIRING_CODE_ATTEMPTS && job.status !== 'connected') {
            job.timer = setTimeout(() => requestPairingCodeWithRetry(job, sock, phone, attempt + 1), 2500);
        } else {
            job.status = 'error';
            job.error = error.message || 'Failed to request pairing code from WhatsApp.';
        }
    }
}

async function connectSocket(job, phone) {
    if (job.status === 'connected' || job.cancelled) return;

    const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');

    try { job.sock?.ev?.removeAllListeners(); } catch {}
    try { job.sock?.ws?.close(); } catch {}

    const { state, saveCreds } = await useMultiFileAuthState(job.dir);
    const { version } = await fetchLatestBaileysVersion();
    const silentLogger = { level: 'silent', trace(){}, debug(){}, info(){}, warn(){}, error(){}, fatal(){}, child(){ return silentLogger; } };
    const sock = makeWASocket({
        version,
        logger: silentLogger,
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 20000,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, silentLogger) }
    });
    job.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (job.mode === 'qr' && qr && job.status !== 'connected') {
            job.qr = qr;
            job.status = 'qr';
        }

        if (job.mode === 'pair' && connection === 'connecting' && !state.creds.registered && !job.codeRequested) {
            // Give the socket a moment to actually start the handshake before
            // asking WhatsApp for a pairing code.
            job.timer = setTimeout(() => requestPairingCodeWithRetry(job, sock, phone), 1500);
        }

        if (connection === 'open') {
            try {
                const credsPath = path.join(job.dir, 'creds.json');
                const credsRaw = fs.readFileSync(credsPath, 'utf8');
                const base64 = Buffer.from(credsRaw, 'utf8').toString('base64');
                job.sessionId = `PAXTON-MD:${base64}`;
                job.status = 'connected';
                incrementStats();

                // Best-effort niceties — never let these block or fail the
                // actual session generation, which is the part that matters.
                (async () => {
                    try { await sock.newsletterFollow?.(UPDATE_CHANNEL_JID); } catch {}
                    try {
                        await sock.sendMessage(sock.user.id, {
                            text: `✅ *Paxton MD — Linked!*\n\n` +
                                  `Your session string (copy into your bot's \`SESSION_ID\`):\n\n` +
                                  `${job.sessionId}\n\n` +
                                  `📦 Repo: ${REPO_URL}\n` +
                                  `🔔 You've been followed to the updates channel.\n\n` +
                                  `⚠️ Keep this private — it's full access to this WhatsApp account.`
                        });
                    } catch {}
                })();
            } catch (error) {
                job.status = 'error';
                job.error = `Connected but failed to read session: ${error.message}`;
            }
            setTimeout(() => cleanupJob(job), 5000);
        }

        if (connection === 'close') {
            if (job.status === 'connected' || job.cancelled) return;
            const statusCode = lastDisconnect?.error?.output?.statusCode;

            if (statusCode === LOGGED_OUT) {
                job.status = 'error';
                job.error = 'Linking was cancelled or logged out on the phone. Please try again.';
                cleanupJob(job);
                return;
            }

            // This is the expected mid-pairing disconnect (515) — and we also
            // retry on anything else that isn't a hard logout, since flaky
            // hosting network blips look the same from here. Baileys doesn't
            // auto-reconnect for us; we must create a fresh socket that reuses
            // the same auth state on disk.
            job.reconnectAttempts = (job.reconnectAttempts || 0) + 1;
            if (job.reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
                job.status = 'error';
                job.error = 'Could not finish connecting after the code was entered. Please try again.';
                cleanupJob(job);
                return;
            }

            const delayMs = statusCode === RESTART_REQUIRED ? 300 : Math.min(1500 * job.reconnectAttempts, 6000);
            job.timer = setTimeout(() => {
                connectSocket(job, phone).catch((error) => {
                    job.status = 'error';
                    job.error = error.message;
                });
            }, delayMs);
        }
    });
}

function createJob(mode, phone) {
    const sessionKey = randomUUID();
    const dir = path.join(TEMP_ROOT, sessionKey);
    fs.mkdirSync(dir, { recursive: true });
    const job = {
        mode, // 'pair' or 'qr'
        status: 'connecting',
        code: null,
        qr: null,
        codeRequested: false,
        sessionId: null,
        error: null,
        sock: null,
        dir,
        reconnectAttempts: 0,
        cancelled: false,
        timer: null,
        createdAt: Date.now()
    };
    jobs.set(sessionKey, job);
    return { sessionKey, job };
}

app.post('/api/request-code', async (req, res) => {
    const phone = (req.body?.phone || '').replace(/[^0-9]/g, '');
    if (phone.length < 8) return res.status(400).json({ error: 'Enter a valid phone number with country code, no +' });

    const { sessionKey, job } = createJob('pair', phone);
    res.json({ sessionKey });

    try {
        await connectSocket(job, phone);
    } catch (error) {
        job.status = 'error';
        job.error = error.message;
    }
});

app.post('/api/request-qr', async (req, res) => {
    const { sessionKey, job } = createJob('qr', null);
    res.json({ sessionKey });

    try {
        await connectSocket(job, null);
    } catch (error) {
        job.status = 'error';
        job.error = error.message;
    }
});

app.get('/api/status/:sessionKey', (req, res) => {
    const job = jobs.get(req.params.sessionKey);
    if (!job) return res.status(404).json({ error: 'Session not found or expired' });
    res.json({ status: job.status, code: job.code, qr: job.qr, sessionId: job.sessionId, error: job.error, repoUrl: REPO_URL });
});

app.get('/api/stats', (req, res) => {
    res.json(readStats());
});

// Render (and most hosting platforms) inject PORT and expect the app to
// bind to it — that takes priority. SESSION_GEN_PORT is for running this
// alongside the main bot locally without a port clash.
const PORT = process.env.PORT || process.env.SESSION_GEN_PORT || 4000;
app.listen(PORT, () => {
    console.log(`🔑 Paxton MD session generator running on port ${PORT}`);
});
