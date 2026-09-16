import fs from 'fs';
import path from 'path';
import { replyText } from '../../lib/groupHelper.js';

const SAVED_CONTACTS_FILE = path.join(process.cwd(), 'data', 'saved_contacts.json');

export default {
  name: 'savedcontacts',
  ownerOnly: true,
  description: 'List contacts auto-saved from groups with .autosavevcf on (owner only). Usage: .savedcontacts',
  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    let saved = [];
    try { if (fs.existsSync(SAVED_CONTACTS_FILE)) saved = JSON.parse(fs.readFileSync(SAVED_CONTACTS_FILE, 'utf8')); } catch {}
    if (!saved.length) return replyText(sock, msg, 'ℹ️ No auto-saved contacts yet.');
    const lines = saved.slice(-30).map((c) => `• ${c.name || 'Unknown'} — ${c.number} (from ${c.groupName || 'a group'})`);
    await replyText(sock, msg, `📇 *Auto-saved Contacts* (last ${lines.length})\n${lines.join('\n')}`);
  }
};
