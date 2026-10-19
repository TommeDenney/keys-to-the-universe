// The dock: your explorer, stars and Stardust, always next to the tab bar (the
// music bar sits on the other side). It sits in the same row as the tab bar when
// there's room, otherwise just above it.

import { h, icon } from '../ui.js';
import { progress, onSave } from '../store.js';
import { walletPill } from '../economy.js';
import { avatarBadge } from './avatar.js';

export function mountDock() {
  const stars = h('b', {}, String(progress.totalStars));
  const dock = h('div', { class: 'hud-dock' }, [
    avatarBadge(40),
    h('a', { class: 'pill stars-pill', href: '#/badges', title: 'Stars: earn them by playing' }, [icon('star'), stars]),
    walletPill(),
  ]);
  document.body.appendChild(dock);
  onSave(() => { const n = String(progress.totalStars); if (stars.textContent !== n) stars.textContent = n; });
  layoutDock();
  addEventListener('resize', layoutDock);
  const bar = document.querySelector('.tabbar');
  if (bar && 'ResizeObserver' in window) new ResizeObserver(layoutDock).observe(bar);
  const music = document.querySelector('.musicbar');
  if (music && 'ResizeObserver' in window) new ResizeObserver(layoutDock).observe(music);
  new MutationObserver(layoutDock).observe(document.body, { attributes: true, attributeFilter: ['data-tabpos'] });
}

/**
 * Line the dock and music bar up with the tab bar. Writes CSS variables:
 * --tab-left / --tab-right (px from the left edge), --tab-mid (the tab bar's
 * vertical centre, px from the bottom, or from the top when the bar is at the top),
 * and a mode: side (same row), above (one row above), stack (two rows above).
 */
export function layoutDock() {
  const bar = document.querySelector('.tabbar');
  const dock = document.querySelector('.hud-dock');
  const music = document.querySelector('.musicbar');
  if (!bar || !dock) return;
  const b = bar.getBoundingClientRect();
  const pos = document.body.dataset.tabpos || 'bottom';
  const s = document.body.style;
  s.setProperty('--tab-left', `${Math.round(b.left)}px`);
  s.setProperty('--tab-right', `${Math.round(b.right)}px`);
  s.setProperty('--tab-mid', `${Math.round(pos === 'top' ? b.top + b.height / 2 : innerHeight - b.bottom + b.height / 2)}px`);
  s.setProperty('--tab-h', `${Math.round(b.height)}px`);
  s.setProperty('--tab-top', `${Math.round(b.top)}px`);
  s.setProperty('--tab-bottom', `${Math.round(b.bottom)}px`);
  if (pos === 'left' || pos === 'right') { document.body.dataset.dock = 'vertical'; return; }
  const gap = 12;
  const dw = dock.offsetWidth;
  const roomRight = innerWidth - b.right - gap - 10;
  const roomLeft = b.left - gap - 10;
  // Beside the tab bar whenever it fits; the song name shortens to make room.
  const MUSIC_MIN = 150;
  let mode = 'side';
  if (dw > roomRight || roomLeft < MUSIC_MIN) mode = dw + MUSIC_MIN + gap + 24 <= innerWidth ? 'above' : 'stack';
  document.body.dataset.dock = mode;
  if (music) music.style.maxWidth = mode === 'side' ? `${Math.floor(Math.min(360, roomLeft))}px` : mode === 'above' ? `${Math.floor(Math.min(360, innerWidth - dw - gap - 32))}px` : '';
}
