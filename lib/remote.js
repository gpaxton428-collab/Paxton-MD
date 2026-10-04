// Client for the Paxton hosted API. Valuable command logic lives on the server,
// so copying this repo does not give anyone those features. Needs:
//   PAXTON_API_URL      e.g. https://your-api.example.com
//   PAXTON_LICENSE_KEY  key issued by the API owner
import { envString } from '../config/index.js';

export function remoteConfigured() {
  return /^https?:\/\//i.test(envString('PAXTON_API_URL')) && !!envString('PAXTON_LICENSE_KEY');
}

export async function callRemote(name, payload = {}, { timeoutMs = 20000 } = {}) {
  if (!remoteConfigured()) {
    const e = new Error('Premium features are not enabled on this bot. Ask the owner for a license key.');
    e.userSafe = true; throw e;
  }
  const base = envString('PAXTON_API_URL').replace(/\/+$/, '');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}/v1/run/${encodeURIComponent(name)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-license-key': envString('PAXTON_LICENSE_KEY') },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e = new Error(data.error || `Server replied ${res.status}`);
      e.userSafe = true; e.status = res.status; throw e;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') { const e = new Error('The premium server took too long. Try again.'); e.userSafe = true; throw e; }
    throw err;
  } finally { clearTimeout(timer); }
}
