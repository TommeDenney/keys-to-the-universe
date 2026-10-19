// Apply purchased cosmetics (keyboard theme, key-press effect) app-wide.

import { equipped } from './economy.js';
import { applySheetTheme } from './render/sheet.js';

export function applyCosmetics() {
  injectRewardStyles();
  document.body.dataset.pet = equipped('pet') || 'pet-none';
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

// ---- Achievement rewards: their styles are generated from js/data/rewards.js ----------
import { REWARD_ITEMS } from './data/rewards.js';
import { registerSheetThemes } from './render/sheet.js';

let injected = false;
export function injectRewardStyles() {
  if (injected) return;
  injected = true;
  const css = [];
  const sheets = {};
  for (const it of REWARD_ITEMS) {
    const L = it.look;
    const x = it.id.slice(it.id.indexOf('-') + 1);
    if (it.cat === 'kb') {
      const stars = L.stars ? 'radial-gradient(1px 1px at 30% 20%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 80%, #fff, transparent), ' : '';
      const veins = L.veins ? 'linear-gradient(115deg, transparent 40%, rgba(120,113,108,.25) 42%, transparent 46%), linear-gradient(70deg, transparent 60%, rgba(120,113,108,.18) 61%, transparent 64%), ' : '';
      css.push(`.kbt-${x} .kb-white { background: ${stars}${veins}linear-gradient(180deg, ${L.w[0]}, ${L.w[1]}); border-color: ${L.border}; box-shadow: inset 0 -5px 0 ${L.lip}; }`);
      css.push(`.kbt-${x} .kb-black { background: linear-gradient(180deg, ${L.b[0]}, ${L.b[1]}); box-shadow: 0 0 0 1px ${L.bglow}, 0 0 8px ${L.bglow}66; }`);
      css.push(`.kbt-${x} .kb-label { color: ${L.label}; }`);
    } else if (it.cat === 'starc') {
      const sel = `body[data-starc="${x}"], .starc-${x}`;
      css.push(`${sel} { --star-on: ${L.color}; }`);
      if (L.glow) css.push(`body[data-starc="${x}"] .star.on svg, .starc-${x} .star.on svg { filter: ${L.glow.map((g, i) => `drop-shadow(0 0 ${3 + i * 3}px ${g})`).join(' ')}; }`);
      if (L.shift) {
        css.push(`body[data-starc="${x}"] .star.on, .starc-${x} .star.on { animation: starshift-${x} 4.5s ease-in-out infinite; }`);
        css.push(`@keyframes starshift-${x} { 0%, 100% { --star-on: ${L.color}; color: ${L.color}; } 50% { --star-on: ${L.shift}; color: ${L.shift}; } }`);
      }
      if (L.pulse) css.push(`body[data-starc="${x}"] .star.on svg, .starc-${x} .star.on svg { animation: star-pulse 2.4s ease-in-out infinite; }`);
    } else if (it.cat === 'trail') {
      const w = L.width || 3;
      css.push(`.route.${it.id} .route-dash { stroke-dasharray: ${L.dash || 'none'}; stroke: ${L.stroke}; stroke-width: ${w}; filter: drop-shadow(0 0 5px ${L.glow}); animation: ${L.shift ? `trailshift-${x} 6s ease-in-out infinite` : 'none'}; opacity: .9; }`);
      css.push(`.route.${it.id} .route-glow { stroke: ${L.glow}40; stroke-width: ${w * 4}; }`);
      if (L.glyphColor) css.push(`.route.${it.id} .route-text { fill: ${L.glyphColor}; filter: drop-shadow(0 0 4px ${L.glow}); }`);
      if (L.shift) css.push(`@keyframes trailshift-${x} { 0%, 100% { stroke: ${L.stroke}; } 50% { stroke: ${L.shift}; } }`);
    } else if (it.cat === 'fx') {
      css.push(`.planet.${it.id}.done .orb { box-shadow: 0 0 24px ${L.aura}, 0 0 64px ${L.aura}55; }`);
      if (L.eclipse) css.push(`.planet.${it.id}.done .orb { filter: brightness(.35) saturate(.6); box-shadow: 0 0 0 2px #fff, 0 0 26px 6px #fff, 0 0 80px 18px rgba(255,255,255,.4); }`);
    } else if (it.cat === 'sheet') {
      sheets[x] = L;
    }
  }
  registerSheetThemes(sheets);
  document.head.append(Object.assign(document.createElement('style'), { textContent: css.join('\n') }));
}
