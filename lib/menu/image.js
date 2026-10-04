// Menu header image.
//  - Default: the bundled Paxton-Tech pictures in assets/menu/ (picked at random,
//    so the menu rotates between them).
//  - MENU_IMAGE_URL (env) pins one remote image instead.
//  - MENU_IMAGE_MODE=first keeps the first bundled picture instead of rotating.
import fs from 'fs';
import path from 'path';
import { config, ROOT_DIR, envString } from '../../config/index.js';

export const MENU_IMAGE_DIR = path.join(ROOT_DIR, 'assets', 'menu');
const EXT = /\.(jpe?g|png|webp)$/i;
const cache = new Map();

export function listMenuImages() {
  try {
    return fs.readdirSync(MENU_IMAGE_DIR).filter((f) => EXT.test(f)).sort().map((f) => path.join(MENU_IMAGE_DIR, f));
  } catch { return []; }
}

// Returns a Baileys-ready `image` value: { url } for a remote image or { buffer } for a bundled one.
export function pickMenuImage() {
  const remote = envString('MENU_IMAGE_URL');
  if (/^https?:\/\//i.test(remote)) return { url: remote };
  const files = listMenuImages();
  if (files.length) {
    const file = envString('MENU_IMAGE_MODE', 'random') === 'first' ? files[0] : files[Math.floor(Math.random() * files.length)];
    try {
      if (!cache.has(file)) cache.set(file, fs.readFileSync(file));
      return cache.get(file);
    } catch { /* fall through to the remote default */ }
  }
  return { url: config.menu.imageUrl };
}
