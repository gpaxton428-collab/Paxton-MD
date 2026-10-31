import test from 'node:test';
import assert from 'node:assert/strict';
import { SECRET, mockFetch, json } from './helpers.mjs';
import { getJson, isConfigured } from '../lib/api/wolvarex.js';
import { extractVideoId } from '../lib/api/youtubeFree.js';
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

test('extractVideoId recognises every common YouTube URL shape', () => {
  assert.equal(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5'), 'dQw4w9WgXcQ');
  assert.equal(extractVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractVideoId('../../etc/passwd'), null);
  assert.equal(extractVideoId(''), null);
});

test('shape summariser only reveals key names', () => {
  const s = summarizeShape({ result: { secret: 'value123', list: [1, 2] } });
  assert.ok(!s.includes('value123'));
  assert.equal(findUrl({ thumbnail: 'https://a/t.jpg', download: 'https://a/d.mp3' }), 'https://a/d.mp3');
});
test.after(() => { console.error = originalError; });
