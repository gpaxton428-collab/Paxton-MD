import test from 'node:test';
import assert from 'node:assert/strict';
import { realCtx, fakeSock, fakeMsg, mockFetch, json } from './helpers.mjs';
import { buildMainMenu, buildIndex, buildCategory, planMenu } from '../lib/menu/index.js';
import { renderMenu, STYLE_COUNT } from '../lib/menu/styles.js';
import { SCOPE_NAMES } from '../lib/menu/scopes.js';
import { getAds } from '../lib/menu/ads.js';
import { collectSections } from '../lib/menu/visibility.js';
import { setGlobalSetting } from '../lib/settingsStore.js';
import menu from '../commands/menustyle/menu.js';
import ssweb from '../commands/tools/ssweb.js';
import roast from '../commands/fun/joke.js';

const quiet = console.warn; console.warn = () => {}; test.after(() => { console.warn = quiet; });

test('all six views render in all eight styles, compactly and without buttons', async () => {
  const { ctx } = await realCtx();
  for (const scope of SCOPE_NAMES) {
    for (let style = 1; style <= STYLE_COUNT; style++) {
      const model = { brand: 'PAXTON MD V2', scope: { title: `${scope} menu`, icon: '•' }, info: [['🌍', 'Mode', 'Public'], ['💬', 'Prefix', '.'], ['⏱️', 'Runtime', '0h 0m 1s'], ['📦', 'Plugins', '1'], ['👑', 'Owner', 'x'], ['👤', 'User', '@1'], ['🕐', 'Time', '1'], ['📅', 'Date', '1']], sections: collectSections(ctx, scope, { isOwner: scope === 'owner' }), prefix: '.', footer: '> f', ads: '📢 ADVERTISEMENT\nPowered by Paxton-Tech' };
      const text = renderMenu(style, model);
      assert.ok(text.length > 200 && text.length < 16000, `${scope}/${style}: ${text.length} chars`);
      assert.ok(!/button|undefined|NaN|\[object/i.test(text), `${scope}/${style}`);
    }
  }
});

test('every style lists commands one per line, straight under the category heading', async () => {
  const { ctx } = await realCtx();
  const sections = collectSections(ctx, 'user', { isOwner: false });
  const tools = sections.find((x) => x.key === 'tools');
  assert.ok(tools.items.some((i) => i.name === 'ping') && tools.items.some((i) => i.name === 'runtime'));
  const model = { brand: 'PAXTON MD V2', scope: { title: 'USER MENU', icon: '👤' }, info: [['🌍', 'Mode', 'Public'], ['💬', 'Prefix', '.'], ['⏱️', 'Runtime', '0h'], ['📦', 'Plugins', '1']], sections, prefix: '.', footer: '> f', ads: null };
  for (let style = 1; style <= STYLE_COUNT; style++) {
    const lines = renderMenu(style, model).split('\n');
    for (const name of ['ping', 'runtime']) {
      const hits = lines.filter((l) => new RegExp(`(^|[^\\w.])\\.${name}$`).test(l.trim()) || l.trim().endsWith(` .${name}`) || l.trim() === `.${name}`);
      assert.equal(hits.length, 1, `style ${style}: .${name} should sit on its own line`);
    }
    assert.ok(!lines.some((l) => (l.match(/(^|\s)\d*\.?\s?\.[a-z]+/g) || []).length > 1), `style ${style}: two commands share a line`);
  }
});

test('main menu shows the identity, all info rows and the ads block', async () => {
  const { ctx } = await realCtx();
  const { text } = buildMainMenu(ctx, { scope: 'user', senderJid: '27111@s.whatsapp.net', isOwner: false });
  for (const needle of ['🌑 PAXTON MD V2', 'Mode:', 'Prefix:', 'Owner:', 'Plugins:', 'Status:', 'Runtime:', 'User:', 'Time:', 'Date:', '📢 ADVERTISEMENT', 'Powered by Paxton-Tech']) assert.ok(text.includes(needle), needle);
  assert.ok(text.length < 9000, `user menu should stay reasonable (${text.length})`);
});

test('ads block is configurable and can be disabled', () => {
  assert.equal(getAds({ menuAdsEnabled: false }), null);
  assert.equal(getAds({ menuAdsEnabled: true, menuAdsText: 'Hello   shop' }), '📢 ADVERTISEMENT\nHello shop');
  assert.equal(getAds({ menuAdsEnabled: true, menuAdsText: '' }).includes('Powered by Paxton-Tech'), true);
});

test('ads tag is configurable and shows above the ad text', async () => {
  assert.equal(getAds({ menuAdsEnabled: true, menuAdsText: 'Hi', menuAdsTag: '  🛒  SPONSORED ' }), '🛒 SPONSORED\nHi');
  assert.equal(getAds({ menuAdsEnabled: true, menuAdsText: 'Hi', menuAdsTag: '' }), '📢 ADVERTISEMENT\nHi');
  const { ctx } = await realCtx();
  const settings = { ...ctx.getGlobalSettings() }; const saved = []; 
  const set = (k, v) => { settings[k] = v; saved.push(k); };
  const adstag = (await import('../commands/bot-settings/adstag.js')).default;
  const sock = fakeSock();
  await adstag.execute(sock, fakeMsg('.adstag'), ['🛒', 'SPONSORED'], '.', { getGlobalSettings: () => settings, setGlobalSetting: set });
  assert.equal(settings.menuAdsTag, '🛒 SPONSORED');
  await adstag.execute(sock, fakeMsg('.adstag'), ['x'.repeat(60)], '.', { getGlobalSettings: () => settings, setGlobalSetting: set });
  assert.match(sock.sent.at(-1).content.text, /under 32/);
  await adstag.execute(sock, fakeMsg('.adstag'), ['reset'], '.', { getGlobalSettings: () => settings, setGlobalSetting: set });
  assert.equal(settings.menuAdsTag, '');
});

test('regular users never see owner/dev/sudo/admin commands or strict-owner commands', async () => {
  const { ctx } = await realCtx();
  const names = (scope, isOwner) => collectSections(ctx, scope, { isOwner }).flatMap((s) => s.items.map((i) => `${s.key}:${i.name}`));
  const user = names('user', false);
  for (const banned of ['owner:', 'dev:', 'sudo:', 'admin:', 'automation:', 'bot-settings:']) assert.ok(!user.some((n) => n.startsWith(banned)), banned);
  assert.ok(!user.includes('user:eval'));
  const owner = names('owner', true);
  for (const wanted of ['owner:eval', 'dev:plugins', 'sudo:addwhitelist', 'admin:kick']) assert.ok(owner.includes(wanted), wanted);
  // a scope request can narrow but never widen
  assert.equal(planMenu(ctx, { requested: 'owner', isOwner: false, isAdmin: false, inGroup: false }).scope, 'user');
  assert.equal(planMenu(ctx, { requested: 'user', isOwner: true, isAdmin: false, inGroup: false }).scope, 'user');
  assert.equal(planMenu(ctx, { requested: null, isOwner: false, isAdmin: true, inGroup: true }).scope, 'admin');
});

test('commands that need an API key are hidden for users and flagged for the owner when the key is missing', async () => {
  const { ctx } = await realCtx();
  const saved = process.env.WOLVAREX_API_KEY; process.env.WOLVAREX_API_KEY = '';
  try {
    const user = collectSections(ctx, 'user', { isOwner: false }).flatMap((s) => s.items.map((i) => i.name));
    assert.ok(!user.includes('play') && !user.includes('flux'));
    assert.ok(user.includes('joke'), 'fun commands keep working offline');
    const owner = collectSections(ctx, 'owner', { isOwner: true }).flatMap((s) => s.items);
    assert.equal(owner.find((i) => i.name === 'play').flagged, true);
  } finally { process.env.WOLVAREX_API_KEY = saved; }
});

test('.menu command sends a plain text message (no buttons/interactive payloads)', async () => {
  const { ctx } = await realCtx();
  const sock = fakeSock();
  await menu.execute(sock, fakeMsg('.menu', '5511@s.whatsapp.net'), [], '.', ctx);
  const payload = sock.sent.at(-1).content;
  assert.equal(typeof payload.text, 'string');
  assert.deepEqual(Object.keys(payload).sort(), ['contextInfo', 'mentions', 'text']);
  assert.equal(payload.contextInfo.externalAdReply.showAdAttribution, true);
  const drill = fakeSock(); await menu.execute(drill, fakeMsg('.menu ai'), ['ai'], '.', ctx);
  assert.match(drill.sent[0].content.text, /AI/);
  const unk = fakeSock(); await menu.execute(unk, fakeMsg('.menu zzz'), ['zzz'], '.', ctx);
  assert.match(unk.sent[0].content.text, /Unknown menu/);
});

test('category drill-down paginates and index lists categories', async () => {
  const { ctx } = await realCtx();
  const page = buildCategory(ctx, { category: 'fun', page: 2, scope: 'user' });
  assert.match(page, /page 2\//);
  assert.match(buildIndex(ctx, { scope: 'user', senderJid: '1@s.whatsapp.net' }), /FUN/);
  assert.equal(buildCategory(ctx, { category: 'owner', scope: 'user' }), null);
});

test('.ssweb refuses internal/unsafe URLs before any request is made', async () => {
  const m = mockFetch(() => json({}));
  const sock = fakeSock();
  try {
    for (const bad of ['http://127.0.0.1:8080', 'http://169.254.169.254/latest/meta-data', 'file:///etc/passwd', 'http://localhost']) {
      await ssweb.execute(sock, fakeMsg(), [bad], '.', {});
    }
    assert.equal(m.calls.length, 0);
    const texts = sock.sent.filter((s) => s.content.text).map((s) => s.content.text);
    assert.equal(texts.length, 4);
    assert.ok(texts.every((t) => /Link not allowed/.test(t)));
  } finally { m.restore(); }
});

test('fun commands fall back to the offline list when the API is down', async () => {
  const { ctx } = await realCtx();
  const m = mockFetch(() => new Response('', { status: 500 })); const sock = fakeSock();
  const err = console.error; console.error = () => {};
  try { await roast.execute(sock, fakeMsg('.joke'), [], '.', ctx); assert.ok(sock.sent[0].content.text.length > 10); } finally { m.restore(); console.error = err; }
});

test('menu image: bundled pictures are found and picked as buffers', async () => {
  const { listMenuImages, pickMenuImage } = await import('../lib/menu/image.js');
  assert.ok(listMenuImages().length >= 3);
  const prev = process.env.MENU_IMAGE_URL; delete process.env.MENU_IMAGE_URL;
  assert.ok(Buffer.isBuffer(pickMenuImage()));
  process.env.MENU_IMAGE_URL = 'https://example.com/a.jpg';
  assert.deepEqual(pickMenuImage(), { url: 'https://example.com/a.jpg' });
  if (prev === undefined) delete process.env.MENU_IMAGE_URL; else process.env.MENU_IMAGE_URL = prev;
});
