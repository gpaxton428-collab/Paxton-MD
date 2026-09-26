export async function getBaileysVersion() {
  const baileys = await import('@whiskeysockets/baileys');
  return baileys.fetchLatestBaileysVersion();
}

export function getBaileysMajor(version) {
  return Number(Array.isArray(version) ? version[0] : String(version || '').split('.')[0]) || 0;
}
