// Apply purchased cosmetics (keyboard theme, key-press effect) app-wide.

import { equipped } from './economy.js';
import { applySheetTheme } from './render/sheet.js';

export function applyCosmetics() {
  document.body.dataset.kbtheme = (equipped('kb') || 'kb-classic').slice(3);
  document.body.dataset.press = (equipped('press') || 'press-glow').slice(6);
  const sheet = (equipped('sheet') || 'sheet-classic').slice(6);
  document.body.dataset.sheet = sheet;
  document.body.dataset.starc = (equipped('starc') || 'star-gold').slice(5);
  applySheetTheme(sheet);
  document.querySelectorAll('.kb').forEach((k) => {
    if (k.dataset.fixedLook) return;
    k.className = k.className.replace(/\bkbt-\S+|\bpress-\S+/g, '').trim();
    k.classList.add(`kbt-${document.body.dataset.kbtheme}`, `press-${document.body.dataset.press}`);
  });
}
