import { dbBackup } from '../../lib/database/index.js';
export default { name: 'dbbackup', ownerOnly: true, description: 'Create a database backup. Usage: .dbbackup', async execute(sock, msg) { const out = dbBackup(); await sock.sendMessage(msg.key.remoteJid, { text: out ? `✅ Database backup created.\n📁 ${out}` : '❌ Database backup failed.' }, { quoted: msg }); } };
