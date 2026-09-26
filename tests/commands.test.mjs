import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { ROOT, SECRET, fakeSock, fakeMsg, realCtx, mockFetch, json } from './helpers.mjs';
import { scanCommands } from '../lib/plugins/loader.js';
import play from '../commands/download/play.js';
import ping from '../commands/tools/ping.js';
import runtime from '../commands/tools/runtime.js';
import setbotpp from '../commands/owner/setbotpp.js';
import { prepareProfilePicture, setProfilePicture } from '../lib/helpers/imageProcessor.js';

const originalError = console.error, originalWarn = console.warn; console.error = () => {}; console.warn = () => {};
test.after(() => { console.error = originalError; console.warn = originalWarn; });
const text = (sock) => sock.sent.map((s) => s.content.text || s.content.caption || '').join('\n---\n');

// 0x49 0x44 0x33 = "ID3" — a valid MP3 magic header followed by padding
const MP3 = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(2048, 1)]);

function playFetch({ search, download, file }) {
  return mockFetch((url) => {
    if (url.includes('/music/ytmp3-search')) return search ?? json({ result: [{ id: 'dQw4w9WgXcQ', title: 'The Search', author: 'NF', timestamp: '4:59', thumbnail: 'https://93.184.216.34/t.jpg' }] });
    if (url.includes('/music/ytmp3-download')) return download ?? json({ result: { download: 'https://93.184.216.34/a.mp3' } });
    if (url.includes('t.jpg')) return new Response(Buffer.alloc(100, 7), { headers: { 'content-type': 'image/jpeg' } });
    if (url.includes('a.mp3')) return file ?? new Response(MP3, { headers: { 'content-type': 'audio/mpeg' } });
    throw new Error(`unexpected ${url}`);
  });
}

test('.play: search -> download -> audio, using both endpoints', async () => {
  const m = playFetch({}); const sock = fakeSock();
  try {
    await play.execute(sock, fakeMsg('.play NF - The Search'), ['NF', '-', 'The', 'Search'], '.', {});
    assert.ok(m.calls.some((u) => u.includes('/music/ytmp3-search')));
    assert.ok(m.calls.some((u) => u.includes('/music/ytmp3-download')));
    const audio = sock.sent.find((s) => s.content.audio);
    assert.ok(audio, 'audio message sent');
    assert.equal(audio.content.mimetype, 'audio/mpeg');
    const card = sock.sent.find((s) => s.content.image);
    assert.match(card.content.caption, /The Search/); assert.match(card.content.caption, /NF/); assert.match(card.content.caption, /4:59/);
    assert.ok(!JSON.stringify(sock.sent.map((s) => s.content.text || s.content.caption)).includes(SECRET));
  } finally { m.restore(); }
});

test('.play: no results, no args, bad download and API outage are all handled', async () => {
  let sock = fakeSock();
  await play.execute(sock, fakeMsg('.play'), [], '.', {});
  assert.match(text(sock), /Usage/);

  let m = playFetch({ search: json({ result: [] }) }); sock = fakeSock();
  try { await play.execute(sock, fakeMsg(), ['zzzz'], '.', {}); assert.match(text(sock), /No results/); } finally { m.restore(); }

  m = playFetch({ file: new Response('<html>blocked</html>', { headers: { 'content-type': 'text/html' } }) }); sock = fakeSock();
  try { await play.execute(sock, fakeMsg(), ['a'], '.', {}); assert.ok(!sock.sent.some((s) => s.content.audio)); assert.match(text(sock), /Request failed|temporarily unavailable/); } finally { m.restore(); }

  m = playFetch({ search: new Response('', { status: 500 }) }); sock = fakeSock();
  try { await play.execute(sock, fakeMsg(), ['a'], '.', {}); assert.match(text(sock), /Request failed/); assert.ok(!/stack|\.js:/.test(text(sock))); } finally { m.restore(); }

  m = playFetch({ download: json({ result: { nothing: 1 } }) }); sock = fakeSock();
  try { await play.execute(sock, fakeMsg(), ['a'], '.', {}); assert.ok(!sock.sent.some((s) => s.content.audio)); } finally { m.restore(); }
});

test('.play: a file that is not audio (JSON error body) is never sent as audio', async () => {
  const m = playFetch({ file: new Response(Buffer.alloc(4000, 65), { headers: { 'content-type': 'application/octet-stream' } }) }); const sock = fakeSock();
  try { await play.execute(sock, fakeMsg(), ['a'], '.', {}); assert.ok(!sock.sent.some((s) => s.content.audio)); } finally { m.restore(); }
});

test('.ping and .runtime use the professional live-status layout (no spoofed metadata)', async () => {
  const { ctx } = await realCtx();
  const sock = fakeSock();
  await ping.execute(sock, fakeMsg('.ping'), [], '.', ctx);
  const out = sock.sent.map((s) => s.content.text).join('\n');
  for (const needle of [/🏓 \*PONG\*/, /⚡ Speed: \*\d+ms\*/, /⏱️ Runtime: \d+h \d+m \d+s/, /📦 Plugins: \d+/, /🟢 Status: \*ONLINE\*/]) assert.match(out, needle);
  const rt = fakeSock(); await runtime.execute(rt, fakeMsg('.runtime'), [], '.', ctx);
  assert.match(rt.sent[0].content.text, /Runtime|Uptime: \d+h \d+m \d+s/);
  for (const s of [...sock.sent, ...rt.sent]) {
    const c = JSON.stringify(s.content);
    assert.ok(!/isForwarded|forwardingScore|forwardedNewsletter|contextInfo/.test(c), 'must not spoof forwarded metadata');
  }
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
  assert.ok(reg.commands.size > 300);
  for (const c of reg.commands.values()) assert.equal(typeof c.description === 'string' || c.description === undefined, true, c.name);
});

test('required commands exist and privileged ones are protected', async () => {
  const { reg } = await realCtx();
  const need = ['play', 'songs', 'ytmp3dl', 'flux', 'translate', 'groqai', 'gpt4', 'gptdirect', 'llamachat', 'imagine', 'claude', 'mistral', 'gemini', 'deepseek', 'shazam', 'shazamsearch', 'shazamtrack', 'spotifytrack', 'spotifyalbum', 'spotifydl', 'wiki', 'countryinfo', 'imagesearch', 'newssearch', 'githubsearch', 'urltosticker', 'riddle', 'pickupline', 'quote', 'flirtline', 'joke', 'wouldrather', 'roast', 'fact', 'dare', 'truth', 'trivia', 'imgbb', 'catbox', 'videosearch', 'ssweb', 'weather', 'instadl', 'tiktokdl', 'menu', 'menustyle', 'setmenustyle', 'stylemenu', 'resetmenustyle', 'setbotpp', 'ping', 'runtime', 'plugins', 'devcheck', 'reloadconfig', 'userinfo', 'profile', 'avatar', 'afk', 'reminder', 'time', 'define', 'search', 'usermenu'];
  const has = (n) => reg.commands.has(n) || reg.aliases.has(n);
  assert.deepEqual(need.filter((n) => !has(n)), []);
  assert.equal(has('wormgpt'), false, 'wormgpt must never be wired up');
  for (const n of ['buttonmenu', 'buttontest']) assert.equal(has(n), false, `${n} must be gone`);
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
