import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import './helpers.mjs';
import { ROOT, SECRET } from './helpers.mjs';
import { assertPublicHttpUrl, isPrivateIp } from '../lib/utils/urlSafety.js';
import { redact } from '../lib/utils/redact.js';
import { resolveInProject } from '../lib/utils/safePath.js';

test('isPrivateIp blocks loopback, RFC1918, link-local, metadata and mapped v6', () => {
  for (const ip of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fe80::1', 'fc00::1', '::ffff:127.0.0.1', '::ffff:7f00:1']) {
    assert.equal(isPrivateIp(ip), true, ip);
  }
  for (const ip of ['8.8.8.8', '93.184.216.34', '172.32.0.1', '2606:4700:4700::1111']) assert.equal(isPrivateIp(ip), false, ip);
});

test('assertPublicHttpUrl rejects unsafe URLs', async () => {
  for (const bad of ['file:///etc/passwd', 'ftp://example.com/x', 'http://127.0.0.1/', 'http://localhost/', 'http://169.254.169.254/latest', 'http://user:pw@example.com/', 'https://example.com:8443/', 'http://[::1]/', 'http://foo.internal/', 'not a url']) {
    await assert.rejects(() => assertPublicHttpUrl(bad), (e) => e.kind === 'unsafe_url', bad);
  }
  assert.equal(await assertPublicHttpUrl('https://93.184.216.34/a.png'), 'https://93.184.216.34/a.png');
});

test('allow-list enforced for social links', async () => {
  await assert.rejects(() => assertPublicHttpUrl('https://evil.com/instagram.com', { allowedHosts: ['instagram.com'], resolveDns: false }));
  await assert.rejects(() => assertPublicHttpUrl('https://instagram.com.evil.com/p/1', { allowedHosts: ['instagram.com'], resolveDns: false }));
  await assertPublicHttpUrl('https://www.instagram.com/p/abc/', { allowedHosts: ['instagram.com'], resolveDns: false });
});

test('redact removes secrets, key= params, bearer tokens and server paths', () => {
  const out = redact(`failed https://x.test/api?q=1&key=${SECRET} using ${SECRET} Bearer abcdefghijklmnop at ${ROOT}/lib/x.js`);
  assert.ok(!out.includes(SECRET));
  assert.ok(!out.includes('abcdefghijklmnop'));
  assert.ok(!out.includes(ROOT));
  assert.match(out, /\[REDACTED\]/);
});

test('safePath blocks traversal and credential files', () => {
  assert.equal(resolveInProject('../etc/passwd').ok, false);
  assert.equal(resolveInProject('/etc/passwd').ok, false);
  assert.equal(resolveInProject('.env').ok, false);
  assert.equal(resolveInProject('session/creds.json').ok, false);
  assert.equal(resolveInProject('node_modules/x').ok, false);
  assert.equal(resolveInProject('package.json').ok, true);
});

test('repository contains no committed .env and no hard-coded API key', () => {
  assert.equal(fs.existsSync(path.join(ROOT, '.env')), false, '.env must not ship');
  const gi = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  assert.match(gi, /^\.env$/m);
  const offenders = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', '.git', 'tests', 'data', 'session'].includes(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(m?js|json|md|ya?ml|toml|env\.example|Dockerfile)$/.test(e.name) && e.name !== 'Dockerfile') continue;
      const s = fs.readFileSync(p, 'utf8');
      if (/(api_?key|token|secret)["']?\s*[:=]\s*["'][A-Za-z0-9_\-]{20,}["']/i.test(s)) offenders.push(path.relative(ROOT, p));
    }
  })(ROOT);
  assert.deepEqual(offenders, []);
});
