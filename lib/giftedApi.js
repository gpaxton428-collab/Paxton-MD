// Thin wrapper around api.gifted.co.ke — a public API aggregator whose
// own documentation uses "gifted" as a shared demo key (not a private
// secret), so it's hardcoded directly here rather than kept in .env.
const BASE = 'https://api.gifted.co.ke/api';
const API_KEY = 'gifted';

function buildUrl(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('apikey', API_KEY);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  return url.toString();
}

export async function giftedJson(path, params = {}) {
  const res = await fetch(buildUrl(path, params));
  const data = await res.json();
  if (!res.ok || data?.status === false) throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  return data;
}
