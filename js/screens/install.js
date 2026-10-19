// Home Screen install guide + full-screen toggle.

import { h, icon } from '../ui.js';

export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const DISMISS = 'ivory.installDismissed';

/** Card shown in Safari on iPad/iPhone suggesting "Add to Home Screen". */
export function installCard() {
  let dismissed = false;
  try { dismissed = localStorage.getItem(DISMISS) === '1'; } catch { /* ignore */ }
  if (isStandalone() || !isIOS() || dismissed) return null;
  const card = h('section', { class: 'install-card' }, [
    h('div', { class: 'install-ic' }, h('img', { src: 'icons/icon-180.png', alt: '' })),
    h('div', { class: 'grow' }, [
      h('b', {}, 'Install Keys to the Universe on your Home Screen'),
      h('span', {}, ['Tap the ', h('span', { class: 'share-glyph', 'aria-label': 'Share' }, icon('upload')), ' Share button in Safari, then ', h('b', {}, 'Add to Home Screen'), '. It then opens full screen like a real app, and works offline.']),
    ]),
    h('button', { class: 'icon-btn sm', 'aria-label': 'Dismiss', onclick: () => { try { localStorage.setItem(DISMISS, '1'); } catch { /* ignore */ } card.remove(); } }, icon('close')),
  ]);
  return card;
}

const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;

export function toggleFullscreen() {
  const root = document.documentElement;
  if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  else (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
}

/** Full-screen button (hidden when already a Home Screen app or unsupported). */
export function fullscreenButton() {
  const root = document.documentElement;
  if (isStandalone() || !(root.requestFullscreen || root.webkitRequestFullscreen)) return null;
  return h('button', { class: 'pill fs-pill', title: 'Full screen', 'aria-label': 'Toggle full screen', onclick: toggleFullscreen }, icon('expand'));
}
