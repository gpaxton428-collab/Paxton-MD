import test from 'node:test';
import assert from 'node:assert/strict';
import { mockFetch, json } from './helpers.mjs';
import { askAi, AI_PROVIDERS } from '../lib/api/ai.js';
import { searchShazam, getShazamTrack, recognizeAudio } from '../lib/api/shazam.js';
import { getSpotifyTrack, extractSpotifyTrackId, downloadSpotifyTrack } from '../lib/api/spotify.js';
import { lookup, wikiSummary, countryInfo } from '../lib/api/lookup.js';

const quiet = console.error; console.error = () => {}; test.after(() => { console.error = quiet; });

test('wormgpt is never wired up as a provider', () => {
  assert.equal(AI_PROVIDERS.includes('wormgpt'), false);
});

test('every listed AI provider hits its own /ai/<provider> path', async () => {
  for (const provider of AI_PROVIDERS) {
    const m = mockFetch((url) => { assert.match(url, new RegExp(`/ai/${provider}\\?`)); return json({ result: 'ok' }); });
    try { assert.equal(await askAi(provider, 'hi'), 'ok'); } finally { m.restore(); }
  }
});

test('spotify track ID/URL extraction', () => {
  assert.equal(extractSpotifyTrackId('0VjIjW4GlUZAMYd2vXMi3b'), '0VjIjW4GlUZAMYd2vXMi3b');
  assert.equal(extractSpotifyTrackId('https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b?si=x'), '0VjIjW4GlUZAMYd2vXMi3b');
  assert.equal(extractSpotifyTrackId('not a link'), null);
});

test('spotify track lookup normalises metadata', async () => {
  const m = mockFetch(() => json({ result: { title: 'Blinding Lights', artists: [{ name: 'The Weeknd' }], duration_ms: 200040 } }));
  try { const t = await getSpotifyTrack('0VjIjW4GlUZAMYd2vXMi3b'); assert.equal(t.title, 'Blinding Lights'); assert.equal(t.artist, 'The Weeknd'); } finally { m.restore(); }
});

test('spotify download rejects non-Spotify URLs before calling the API', async () => {
  const m = mockFetch(() => { throw new Error('should not be called'); });
  try { await assert.rejects(() => downloadSpotifyTrack('https://evil.example/x', 'q'), (e) => e.kind === 'invalid_input'); } finally { m.restore(); }
});

test('shazam search/track normalise results and handle no-match', async () => {
  let m = mockFetch(() => json({ result: [{ title: 'Home', artist: 'NF' }] }));
  try { const [s] = await searchShazam('Home NF'); assert.equal(s.title, 'Home'); } finally { m.restore(); }
  m = mockFetch(() => json({ result: [] }));
  try { await assert.rejects(() => searchShazam('zzz'), (e) => e.kind === 'no_results'); } finally { m.restore(); }
  m = mockFetch(() => json({ result: { title: 'Home', artist: 'NF' } }));
  try { assert.equal((await getShazamTrack('1217912247')).title, 'Home'); } finally { m.restore(); }
  await assert.rejects(() => getShazamTrack('../../etc'), (e) => e.kind === 'invalid_input');
});

test('shazam recognize posts multipart audio and handles no match', async () => {
  const m = mockFetch((url, init) => { assert.match(url, /\/shazam\/recognize/); assert.equal(init.method, 'POST'); assert.ok(init.body instanceof FormData); return json({ result: null }); });
  try { await assert.rejects(() => recognizeAudio(Buffer.from('fake-audio')), (e) => e.kind === 'no_results'); } finally { m.restore(); }
  await assert.rejects(() => recognizeAudio(Buffer.alloc(0)), (e) => e.kind === 'invalid_input');
});

test('generic lookup + wiki + country', async () => {
  let m = mockFetch(() => json({ result: { title: 'Black hole', extract: 'A region of spacetime...' } }));
  try { const w = await wikiSummary('black holes'); assert.equal(w.title, 'Black hole'); assert.match(w.text, /region of spacetime/); } finally { m.restore(); }
  m = mockFetch(() => json({ result: [{ name: 'Japan', capital: 'Tokyo', population: 125000000 }] }));
  try { const c = await countryInfo('Japan'); assert.equal(c.capital, 'Tokyo'); } finally { m.restore(); }
  m = mockFetch(() => json({ result: [] }));
  try { await assert.rejects(() => lookup('npm', 'zzz'), (e) => e.kind === 'no_results'); } finally { m.restore(); }
  await assert.rejects(() => lookup('npm', ''), (e) => e.kind === 'invalid_input');
});
