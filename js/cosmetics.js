// Apply purchased cosmetics (keyboard theme, key-press effect) app-wide.

import { equipped } from './economy.js';

export function applyCosmetics() {
  document.body.dataset.kbtheme = (equipped('kb') || 'kb-classic').slice(3);
  document.body.dataset.press = (equipped('press') || 'press-glow').slice(6);
  document.querySelectorAll('.kb').forEach((k) => {
    if (k.dataset.fixedLook) return;
    k.className = k.className.replace(/\bkbt-\S+|\bpress-\S+/g, '').trim();
    k.classList.add(`kbt-${document.body.dataset.kbtheme}`, `press-${document.body.dataset.press}`);
  });
}
