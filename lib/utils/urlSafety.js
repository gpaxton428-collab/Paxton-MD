// SSRF protection for every URL that comes from a user or from a
// third-party API response before the bot (or a screenshot/download
// service) is asked to fetch it.
import dns from 'dns/promises';
import net from 'net';
import { AppError } from './errors.js';

function ipv4ToInt(ip) { return ip.split('.').reduce((a, o) => (a << 8) + Number(o), 0) >>> 0; }
const V4_BLOCKS = [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15],
  ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4]
].map(([base, bits]) => ({ base: ipv4ToInt(base), mask: bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0 }));

export function isPrivateIp(ip) {
  const v = net.isIP(ip);
  if (v === 4) {
    const n = ipv4ToInt(ip);
    return V4_BLOCKS.some((b) => ((n & b.mask) >>> 0) === (b.base & b.mask) >>> 0);
  }
  if (v === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/) || lower.match(/^64:ff9b::(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIp(mapped[1]);
    const hexMapped = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMapped) {
      const hi = parseInt(hexMapped[1], 16), lo = parseInt(hexMapped[2], 16);
      return isPrivateIp(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
    }
    const first = parseInt(lower.split(':')[0] || '0', 16);
    if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
    if ((first & 0xff00) === 0xff00) return true; // multicast
    return false;
  }
  return true; // not an IP -> treat as unsafe
}

const BLOCKED_HOSTS = /^(localhost|.*\.localhost|.*\.local|.*\.internal|.*\.lan|metadata\.google\.internal)$/i;

// Returns a normalised URL string, or throws AppError(kind: 'unsafe_url').
export async function assertPublicHttpUrl(input, { allowedHosts, resolveDns = true } = {}) {
  let url;
  try { url = new URL(String(input).trim()); } catch { throw new AppError('Invalid URL', { kind: 'unsafe_url' }); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new AppError('Unsupported protocol', { kind: 'unsafe_url' });
  if (url.username || url.password) throw new AppError('Credentials in URL', { kind: 'unsafe_url' });
  if (url.port && !['80', '443'].includes(url.port)) throw new AppError('Port not allowed', { kind: 'unsafe_url' });
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!host || BLOCKED_HOSTS.test(host)) throw new AppError('Host not allowed', { kind: 'unsafe_url' });
  if (allowedHosts && !allowedHosts.some((h) => host === h || host.endsWith(`.${h}`))) {
    throw new AppError('Host not in allow-list', { kind: 'unsafe_url' });
  }
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new AppError('Private address', { kind: 'unsafe_url' });
  } else if (resolveDns) {
    let addrs;
    try { addrs = await dns.lookup(host, { all: true }); } catch { throw new AppError('Host does not resolve', { kind: 'unsafe_url' }); }
    if (!addrs.length || addrs.some((a) => isPrivateIp(a.address))) throw new AppError('Resolves to a private address', { kind: 'unsafe_url' });
  }
  return url.toString();
}
