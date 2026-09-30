import fs from 'fs';

const SUDO_FILE = './data/sudo.json';
let sudoSet = new Set();

function load() {
  try {
    if (fs.existsSync(SUDO_FILE)) {
      const data = JSON.parse(fs.readFileSync(SUDO_FILE, 'utf8'));
      if (Array.isArray(data)) sudoSet = new Set(data);
    }
  } catch {}
}
load();

function save() {
  try {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
    fs.writeFileSync(SUDO_FILE, JSON.stringify([...sudoSet], null, 2));
  } catch {}
}

export function isSudo(jid) {
  if (!jid) return false;
  const number = jid.split('@')[0].split(':')[0];
  return sudoSet.has(number);
}

export function addSudo(number) {
  const clean = number.replace(/[^0-9]/g, '');
  sudoSet.add(clean);
  save();
  return clean;
}

export function removeSudo(number) {
  const clean = number.replace(/[^0-9]/g, '');
  const existed = sudoSet.delete(clean);
  save();
  return existed;
}

export function clearAllSudo() {
  const count = sudoSet.size;
  sudoSet.clear();
  save();
  return count;
}

export function listSudo() {
  return [...sudoSet];
}
