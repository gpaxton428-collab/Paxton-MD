import dns from 'dns/promises';

export default {
  name: 'domainlookup',
  alias: ['dnslookup'],
  description: 'Resolve the IP address(es) behind a domain. Usage: .domainlookup example.com',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const domain = args[0];
    if (!domain) return sock.sendMessage(chatId, { text: '❌ Usage: .domainlookup <domain>' }, { quoted: msg });
    try {
      const addresses = await dns.resolve4(domain);
      await sock.sendMessage(chatId, { text: `🌐 *${domain}*\n${addresses.join('\n')}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(chatId, { text: `❌ Could not resolve ${domain}: ${error.message}` }, { quoted: msg });
    }
  }
};
