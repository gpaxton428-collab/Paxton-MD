import test from 'node:test';
import assert from 'node:assert/strict';
import { SECRET, mockFetch, json } from './helpers.mjs';
import { getJson, isConfigured } from '../lib/api/wolvarex.js';
import { searchTracks, getTrackDownload, normalizeTrack, extractVideoId } from '../lib/api/music.js';
import { fetchFun, normalizeFun } from '../lib/api/fun.js';
import { askAi, translateText } from '../lib/api/ai.js';
import { uploadToCatbox } from '../lib/api/upload.js';
import { getInstagramMedia } from '../lib/api/social.js';
import { toUserMessage } from '../lib/utils/errors.js';
import { findUrl, summarizeShape } from '../lib/api/normalize.js';

const originalError = console.error; console.error = () => {}; // logger noise

test('client sends the key, never leaks it, and reports config errors', async () => {
  const m = mockFetch(() => json({ result: [] }));
  try {
    await getJson('/music/ytmp3-search', { q: 'x' });
    assert.match(m.calls[0], /key=/);
  } finally { m.restore(); }
  const saved = process.env.WOLVAREX_API_KEY; process.env.WOLVAREX_API_KEY = 'your_api_key_here';
  assert.equal(isConfigured(), false, 'placeholder counts as not configured');
  await assert.rejects(() => getJson('/x'), (e) => e.kind === 'config' && !JSON.stringify(toUserMessage(e)).includes(saved));
  process.env.WOLVAREX_API_KEY = saved;
});

test('HTTP errors map to friendly messages without secrets or paths', async () => {
  for (const [status, kind] of [[401, 'auth'], [429, 'rate_limit'], [500, 'http']]) {
    const m = mockFetch(() => new Response('boom', { status }));
    try {
      await assert.rejects(() => getJson('/x', {}, { retries: 0 }), (e) => {
        const msg = toUserMessage(e);
        assert.equal(e.kind, kind);
        assert.ok(!msg.includes(SECRET) && !/\/home|node_modules|at .*\.js/.test(msg));
        return true;
      });
    } finally { m.restore(); }
  }
  const m = mockFetch(() => new Response('<html>oops</html>', { status: 200, headers: { 'content-type': 'text/html' } }));
  try { await assert.rejects(() => getJson('/x'), (e) => e.kind === 'bad_response' && /temporarily unavailable/.test(toUserMessage(e))); } finally { m.restore(); }
});

test('application-level failure flags in a 200 response are treated as errors', async () => {
  const m = mockFetch(() => json({ status: false, message: 'quota exceeded' }));
  try { await assert.rejects(() => getJson('/x'), (e) => e.kind === 'api'); } finally { m.restore(); }
});

test('transient 503 is retried once', async () => {
  let n = 0;
  const m = mockFetch(() => (++n === 1 ? new Response('', { status: 503 }) : json({ result: 'ok' })));
  try { assert.deepEqual(await getJson('/x'), { result: 'ok' }); assert.equal(n, 2); } finally { m.restore(); }
});

test('search results are normalised across plausible shapes', async () => {
  const shapes = [
    { status: true, result: [{ id: 'dQw4w9WgXcQ', title: 'Song', author: { name: 'Artist' }, timestamp: '3:33', thumbnail: 'https://i.example/t.jpg' }] },
    { result: { results: [{ videoId: 'dQw4w9WgXcQ', title: 'Song', channel: 'Artist', duration: 213 }] } },
    { data: [{ url: 'https://youtu.be/dQw4w9WgXcQ', name: 'Song', uploader: 'Artist', seconds: 213 }] }
  ];
  for (const body of shapes) {
    const m = mockFetch(() => json(body));
    try {
      const [t] = await searchTracks('NF - The Search');
      assert.equal(t.id, 'dQw4w9WgXcQ'); assert.equal(t.title, 'Song'); assert.equal(t.artist, 'Artist'); assert.equal(t.duration, '3:33');
    } finally { m.restore(); }
  }
});

test('search handles empty, malformed and invalid input', async () => {
  let m = mockFetch(() => json({ result: [] }));
  try { await assert.rejects(() => searchTracks('nothing'), (e) => e.kind === 'no_results'); } finally { m.restore(); }
  m = mockFetch(() => json({ result: [{ nope: true }] }));
  try { await assert.rejects(() => searchTracks('x'), (e) => e.kind === 'no_results'); } finally { m.restore(); }
  await assert.rejects(() => searchTracks('   '), (e) => e.kind === 'invalid_input');
  await assert.rejects(() => searchTracks('a'.repeat(500)), (e) => e.kind === 'invalid_input');
});

test('download resolves a URL and fails cleanly without one', async () => {
  let m = mockFetch(() => json({ result: { download: 'https://cdn.example/a.mp3', title: 'Song' } }));
  try { assert.equal((await getTrackDownload('dQw4w9WgXcQ')).url, 'https://cdn.example/a.mp3'); } finally { m.restore(); }
  m = mockFetch(() => json({ result: { note: 'nothing here' } }));
  try { await assert.rejects(() => getTrackDownload('dQw4w9WgXcQ'), (e) => e.kind === 'bad_response'); } finally { m.restore(); }
  await assert.rejects(() => getTrackDownload('../../etc/passwd'), (e) => e.kind === 'invalid_input');
  assert.equal(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5'), 'dQw4w9WgXcQ');
});

test('fun endpoints normalise and unknown shapes are rejected', async () => {
  assert.deepEqual(normalizeFun({ result: { question: 'Q?', answer: 'A' } }), { text: 'Q?', answer: 'A', options: undefined, author: undefined, category: undefined });
  assert.equal(normalizeFun({ result: ['just a line'] }).text, 'just a line');
  assert.equal(normalizeFun({ result: { optionA: 'x', optionB: 'y' } }).options.length, 2);
  assert.equal(normalizeFun({ result: { weird: 1 } }), null);
  const m = mockFetch(() => json({ result: { joke: 'Why?' } }));
  try { assert.equal((await fetchFun('joke')).text, 'Why?'); assert.match(m.calls[0], /\/fun\/jokes/); } finally { m.restore(); }
});

test('AI chat + translate use the right endpoints and fall back for translate', async () => {
  let m = mockFetch(() => json({ result: 'Hello there' }));
  try { assert.equal(await askAi('groq', 'hi'), 'Hello there'); assert.match(m.calls[0], /\/ai\/groq/); await askAi('gpt', 'hi'); assert.match(m.calls[1], /\/ai\/gpt/); await askAi('llama', 'hi'); assert.match(m.calls[2], /\/ai\/llama/); } finally { m.restore(); }
  await assert.rejects(() => askAi('gpt', ''), (e) => e.kind === 'invalid_input');
  m = mockFetch((url) => (url.includes('/ai/translate') ? new Response('', { status: 500 }) : json({ responseData: { translatedText: 'Hola' } })));
  try { const r = await translateText('Hello', 'es'); assert.equal(r.text, 'Hola'); assert.equal(r.provider, 'mymemory'); } finally { m.restore(); }
  await assert.rejects(() => translateText('Hello', 'not a lang!'), (e) => e.kind === 'invalid_input');
});

test('upload + instagram helpers', async () => {
  let m = mockFetch((url, init) => { assert.ok(init.body instanceof FormData); return json({ result: { url: 'https://files.catbox.moe/x.png' } }); });
  try { assert.equal(await uploadToCatbox(Buffer.from('png'), 'image/png'), 'https://files.catbox.moe/x.png'); assert.match(m.calls[0], /\/url\/catbox/); } finally { m.restore(); }
  await assert.rejects(() => uploadToCatbox(Buffer.alloc(0)), (e) => e.kind === 'invalid_input');
  await assert.rejects(() => getInstagramMedia('https://evil.example/p/1'), (e) => e.kind === 'invalid_input');
  m = mockFetch(() => json({ result: [{ url: 'https://cdn.example/1.jpg' }, { url: 'https://cdn.example/2.mp4' }] }));
  try { const media = await getInstagramMedia('https://www.instagram.com/reel/abc/'); assert.deepEqual(media.map((x) => x.type), ['image', 'video']); } finally { m.restore(); }
});

test('shape summariser only reveals key names', () => {
  const s = summarizeShape({ result: { secret: 'value123', list: [1, 2] } });
  assert.ok(!s.includes('value123'));
  assert.equal(findUrl({ thumbnail: 'https://a/t.jpg', download: 'https://a/d.mp3' }), 'https://a/d.mp3');
});
test.after(() => { console.error = originalError; });
