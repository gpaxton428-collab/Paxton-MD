import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { ROOT, fakeSock, fakeMsg, realCtx } from './helpers.mjs';
import { scanCommands } from '../lib/plugins/loader.js';
import play from '../commands/download/play.js';
import ping from '../commands/tools/ping.js';
import runtime from '../commands/tools/runtime.js';
import setbotpp from '../commands/owner/setbotpp.js';
import { prepareProfilePicture, setProfilePicture } from '../lib/helpers/imageProcessor.js';

const originalError = console.error, originalWarn = console.warn; console.error = () => {}; console.warn = () => {};
test.after(() => { console.error = originalError; console.warn = originalWarn; });
const text = (sock) => sock.sent.map((s) => s.content.text || s.content.caption || '').join('\n---\n');

// .play's search/download now go through youtube-sr + @distube/ytdl-core
// (lib/api/youtubeFree.js) instead of a mockable HTTP API, so the old
// fetch-mocked search->download->audio tests no longer apply — those
// packages aren't installed in this sandbox either. What's still
// testable without network is the pure validation path (no args).
// The actual download path should be smoke-tested against a real
// chat once dependencies are installed.
test('.play: no args shows usage', async () => {
  const sock = fakeSock();
  await play.execute(sock, fakeMsg('.play'), [], '.', {});
  assert.match(text(sock), /Usage/);
});

test('.ping and .runtime use the requested layout and carry the forwarded label', async () => {
  const { ctx } = await realCtx();
  const sock = fakeSock();
  await ping.execute(sock, fakeMsg('.ping'), [], '.', ctx);
  const result = sock.sent.find((s) => /PONG/.test(s.content.text || ''));
  assert.ok(result, 'result message sent');
  for (const needle of [/🏓 \*PONG\*/, /⚡ Response: \d+ ms/, /⏱️ Runtime: \d+h \d+m \d+s/, /📦 Plugins: \d+/, /🟢 Status: ONLINE/]) assert.match(result.content.text, needle);
  assert.equal(result.content.contextInfo.isForwarded, true);
  assert.ok(result.content.contextInfo.forwardingScore >= 5, 'shown as "Forwarded many times"');
  assert.ok(sock.sent.some((s) => s.content.delete), 'the "Pinging…" placeholder is removed');
  const rt = fakeSock(); await runtime.execute(rt, fakeMsg('.runtime'), [], '.', ctx);
  assert.match(rt.sent[0].content.text, /Uptime: \d+h \d+m \d+s/);
  assert.equal(rt.sent[0].content.contextInfo.isForwarded, true);
});

test('BOT_FORWARDED_TAG=off removes the forwarded label', async () => {
  const { ctx } = await realCtx();
  process.env.BOT_FORWARDED_TAG = 'off';
  try {
    const rt = fakeSock(); await runtime.execute(rt, fakeMsg('.runtime'), [], '.', ctx);
    assert.equal(rt.sent[0].content.contextInfo, undefined);
  } finally { delete process.env.BOT_FORWARDED_TAG; }
});

test('image processing: ffmpeg/ImageMagick backend produces a square JPEG', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-'));
  const png = path.join(dir, 'in.png');
  try { execFileSync('convert', ['-size', '400x200', 'xc:red', png]); } catch { t.skip('ImageMagick not available'); return; }
  const { buffer } = await prepareProfilePicture(fs.readFileSync(png));
  assert.equal(buffer.slice(0, 2).toString('hex'), 'ffd8');
  const out = execFileSync('identify', ['-format', '%wx%h', 'jpg:-'], { input: buffer }).toString();
  assert.equal(out, '640x640');
});

test('.setbotpp: sends the WhatsApp picture IQ itself (no Baileys image library needed)', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pp-')); const png = path.join(dir, 'in.png');
  try { execFileSync('convert', ['-size', '300x300', 'xc:blue', png]); } catch { t.skip('ImageMagick not available'); return; }
  const sock = fakeSock();
  let baileysAvailable = true; try { await import('@whiskeysockets/baileys'); } catch { baileysAvailable = false; }
  if (!baileysAvailable) { t.skip('@whiskeysockets/baileys not installed in this environment (offline sandbox)'); return; }
  await setProfilePicture(sock, sock.user.id, fs.readFileSync(png));
  const q = sock.queries[0];
  assert.equal(q.attrs.xmlns, 'w:profile:picture'); assert.equal(q.attrs.type, 'set'); assert.equal(q.attrs.target, undefined);
});

test('.setbotpp: requires an image and reports a friendly error when none is attached', async () => {
  const sock = fakeSock();
  await setbotpp.execute(sock, fakeMsg('.setbotpp'), []);
  assert.match(text(sock), /Reply to an image/);
});

test('plugin loader survives broken, duplicate and conflicting plugins', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'plugins-'));
  fs.mkdirSync(path.join(dir, 'fun')); fs.mkdirSync(path.join(dir, 'tools'));
  const w = (f, s) => fs.writeFileSync(path.join(dir, f), s);
  w('fun/ok.js', "export default { name: 'ok', alias: ['o', 'dup'], execute() {} };");
  w('fun/broken.js', 'export default {{{{');
  w('fun/noexec.js', "export default { name: 'noexec' };");
  w('tools/ok2.js', "export default { name: 'OK', execute() {} };");           // duplicate name
  w('tools/other.js', "export default { name: 'other', alias: ['dup', 'ok'], execute() {} };"); // alias conflicts
  const r = await scanCommands(dir);
  assert.equal(r.report.loaded, 2);
  assert.equal(r.report.failed.length, 2);
  assert.equal(r.report.duplicates.length, 1);
  assert.equal(r.report.aliasConflicts.length, 2);
  assert.equal(r.aliases.get('o'), 'ok');
});

test('every real command loads, is unique and is well-formed', async () => {
  const { reg } = await realCtx();
  assert.deepEqual(reg.report.failed, []); assert.deepEqual(reg.report.duplicates, []); assert.deepEqual(reg.report.aliasConflicts, []);
  assert.ok(reg.commands.size > 250);
  for (const c of reg.commands.values()) assert.equal(typeof c.description === 'string' || c.description === undefined, true, c.name);
});

test('required commands exist and privileged ones are protected', async () => {
  const { reg } = await realCtx();
  const need = ['play', 'songs', 'ytmp3dl', 'videosearch', 'instadl', 'fbdl', 'tiktokdl', 'qrcode', 'menu', 'menustyle', 'setmenustyle', 'stylemenu', 'resetmenustyle', 'setbotpp', 'ping', 'runtime', 'plugins', 'devcheck', 'reloadconfig', 'userinfo', 'profile', 'avatar', 'afk', 'reminder', 'time', 'define', 'search', 'usermenu'];
  const has = (n) => reg.commands.has(n) || reg.aliases.has(n);
  assert.deepEqual(need.filter((n) => !has(n)), []);
  for (const n of ['buttonmenu', 'buttontest', 'flux', 'gpt4', 'gptdirect', 'groqai', 'imagine', 'llamachat', 'chatbot', 'aiprovider', 'catbox', 'imgbb', 'ssweb', 'envcheck', ...['translate', 'riddle', 'pickupline', 'quote', 'flirtline', 'joke', 'wouldrather', 'roast', 'fact', 'dare', 'truth', 'trivia', 'weather', 'wordle']]) assert.equal(has(n), false, `${n} must be gone`);
  for (const n of ['eval', 'gitclone', 'join', 'leaveall', 'restart', 'shutdown', 'update', 'forwardmsg']) {
    const c = reg.commands.get(n); assert.ok(c.ownerOnly && c.strictOwner, `${n} must be strict-owner`);
  }
  for (const c of reg.commands.values()) if (c.category === 'dev') assert.ok(c.ownerOnly, `dev command ${c.name} must be owner-only`);
});

test('no source file still depends on button libraries', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  for (const d of ['gifted-btns', 'my-md-btns']) assert.equal(pkg.dependencies[d], undefined);
  assert.equal(fs.existsSync(path.join(ROOT, 'lib/buttons.js')), false);
  assert.equal(fs.existsSync(path.join(ROOT, 'lib/quickButtons.js')), false);
});
