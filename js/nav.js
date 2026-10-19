// Piano-key navigation: drive the app from the piano around Middle C so your
// hands never leave the keys.
//
//   G3 Back · A3 Up · B3 Left · C4 Select · D4 Right · E4 Down · F4 Next tab
//
// Active whenever you're not in the middle of playing a song (it also works
// on a song's Start / Results cards). Arrow keys, Enter and Esc work too.

import { h } from './ui.js';
import { input } from './input/hub.js';
import { settings } from './store.js';
import { Player } from './screens/player.js';

const MAP = { 55: 'back', 57: 'up', 59: 'left', 60: 'select', 62: 'right', 64: 'down', 65: 'tab' };
const LEGEND = [[55, 'G3', 'Back'], [57, 'A3', 'Up'], [59, 'B3', 'Left'], [60, 'C4', 'Select'], [62, 'D4', 'Right'], [64, 'E4', 'Down'], [65, 'F4', 'Tab']];
const FOCUSABLE = 'a[href], button:not([disabled]), input[type=range], .switch, summary, input[type=search]';

let focused = null;
let legend = null;
let legendT = 0;
let lastAct = 0;

function songActive() {
  const p = Player.current;
  return !!(p && !p.destroyed && !p.overlayOpen);
}

function scope() {
  const modals = [...document.querySelectorAll('.modal-back.open')];
  if (modals.length) return modals[modals.length - 1];
  const p = Player.current;
  if (p && !p.destroyed && p.overlayOpen) return p.el.querySelector('.pl-overlay');
  const fulls = [...document.querySelectorAll('.fullscreen')];
  if (fulls.length) return fulls[fulls.length - 1];
  return document.getElementById('app');
}

function candidates(root) {
  return [...root.querySelectorAll(FOCUSABLE)].filter((el) => {
    if (el.closest('.kb') || el.closest('.hidden') || el.dataset.navSkip) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
  });
}

function defaultFocus(root, list) {
  return root.querySelector('.btn.primary:not([disabled])')
    || root.querySelector('.node.current')
    || root.querySelector('.planet.current .orb, .moon-chip.current')
    || root.querySelector('.btn.white')
    || list.find((el) => !el.closest('.tabbar'))
    || list[0];
}

function setFocus(el) {
  if (focused) focused.classList.remove('nav-focus');
  focused = el;
  if (!el) return;
  el.classList.add('nav-focus');
  el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

function move(dir) {
  const root = scope();
  const list = candidates(root);
  if (!list.length) return;
  if (!focused || !root.contains(focused) || !list.includes(focused)) {
    setFocus(defaultFocus(root, list));
    return;
  }
  const a = focused.getBoundingClientRect();
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  let best = null;
  let bestScore = Infinity;
  for (const el of list) {
    if (el === focused) continue;
    const b = el.getBoundingClientRect();
    const bx = b.left + b.width / 2;
    const by = b.top + b.height / 2;
    const dx = bx - ax;
    const dy = by - ay;
    let primary;
    let ortho;
    if (dir === 'right') { primary = dx; ortho = Math.abs(dy); }
    else if (dir === 'left') { primary = -dx; ortho = Math.abs(dy); }
    else if (dir === 'down') { primary = dy; ortho = Math.abs(dx); }
    else { primary = -dy; ortho = Math.abs(dx); }
    if (primary <= 4) continue;
    const score = primary + ortho * 2.2;
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (!best && (dir === 'right' || dir === 'left')) {
    const i = list.indexOf(focused);
    best = list[i + (dir === 'right' ? 1 : -1)] || null;
  }
  if (best) setFocus(best);
}

function select() {
  const root = scope();
  if (!focused || !root.contains(focused) || !document.contains(focused)) {
    const list = candidates(root);
    setFocus(defaultFocus(root, list));
    if (!focused) return;
  }
  const el = focused;
  el.animate([{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'cubic-bezier(.34,1.56,.64,1)' });
  if (el.matches('.switch')) el.querySelector('input').click();
  else if (el.matches('input[type=search]')) el.focus();
  else el.click();
  // The click usually re-renders; pick a sensible focus in the new view.
  setTimeout(() => {
    if (!focused || !document.contains(focused)) {
      const r = scope();
      setFocus(defaultFocus(r, candidates(r)));
    }
  }, 380);
}

function adjustRange(dir) {
  const el = focused;
  if (!el || !el.matches('input[type=range]')) return false;
  if (dir === 'right') el.stepUp(); else el.stepDown();
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return true;
}

function back() {
  const modals = [...document.querySelectorAll('.modal-back.open')];
  if (modals.length) { modals[modals.length - 1].click(); return; }
  const p = Player.current;
  if (p && !p.destroyed) {
    // Inside a lesson, close the lesson; otherwise close the player.
    const lessonClose = p.el.closest('.lesson') && p.el.closest('.lesson').querySelector('.ls-top .icon-btn');
    if (lessonClose) lessonClose.click(); else p.exit();
    return;
  }
  const fulls = [...document.querySelectorAll('.fullscreen')];
  if (fulls.length) {
    const btn = fulls[fulls.length - 1].querySelector('.ls-top .icon-btn, .pl-top .icon-btn');
    if (btn) btn.click();
    return;
  }
  if (location.hash.startsWith('#/song/')) location.hash = '#/library';
  else if (location.hash && !location.hash.startsWith('#/learn')) location.hash = '#/learn';
}

function nextTab() {
  if (document.querySelector('.fullscreen, .modal-back.open')) return;
  const tabs = [...document.querySelectorAll('.tabbar .tab')];
  const i = tabs.findIndex((t) => t.classList.contains('active'));
  tabs[(i + 1) % tabs.length].click();
  setTimeout(() => {
    const r = scope();
    setFocus(defaultFocus(r, candidates(r)));
  }, 300);
}

function act(action, midi) {
  // One key press = one action (the mic can re-detect a ringing key).
  const now = performance.now();
  if (midi != null && now - lastAct < 550) return;
  lastAct = now;
  if (action === 'select') select();
  else if (action === 'back') back();
  else if (action === 'tab') nextTab();
  else if ((action === 'left' || action === 'right') && adjustRange(action)) { /* slider moved */ }
  else move(action);
  if (midi != null) showLegend(midi);
}

function ensureLegend() {
  if (!legend) {
    legend = h('div', { class: 'nav-legend', 'aria-hidden': 'true' }, [
      h('span', { class: 'nav-legend-title' }, 'Piano keys'),
      h('div', { class: 'nav-legend-keys' }, LEGEND.map(([m, n, l]) => h('div', { 'data-m': m, class: m === 60 ? 'c4' : '' }, [h('small', {}, n), l]))),
    ]);
    document.body.appendChild(legend);
  }
  return legend;
}

/** The legend stays on screen whenever piano navigation is usable (hidden only while playing a song). */
function updateLegend() {
  const show = settings.get('pianoNav') && settings.get('input') !== 'touch' && !songActive() && !document.querySelector('.calib');
  ensureLegend().classList.toggle('show', show);
  // Sit above the tab bar when it's visible, lower inside full-screen flows.
  legend.classList.toggle('low', !!document.querySelector('.fullscreen'));
}

function showLegend(midi) {
  ensureLegend().querySelectorAll('.nav-legend-keys div').forEach((d) => d.classList.toggle('hit', +d.dataset.m === midi));
  clearTimeout(legendT);
  legendT = setTimeout(() => legend.querySelectorAll('.hit').forEach((d) => d.classList.remove('hit')), 450);
}

export function initPianoNav() {
  input.on((type, e) => {
    if (type !== 'noteon' || !settings.get('pianoNav')) return;
    if (e.source === 'touch') return;
    if (songActive()) return;
    if (document.querySelector('.calib')) return;
    if (e.source === 'mic' && e.strength < 14) return; // be conservative with the microphone
    const action = MAP[e.midi];
    if (action) act(action, e.midi);
  });
  window.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' && e.target.type === 'search') {
      if (e.key === 'Escape' || e.key === 'ArrowDown') { e.target.blur(); act('down'); e.preventDefault(); }
      return;
    }
    if (songActive()) return;
    const k = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'select', Escape: 'back' }[e.key];
    if (!k) return;
    e.preventDefault();
    act(k);
  });
  // Touching the screen hides the focus ring until the next key press.
  window.addEventListener('pointerdown', () => setFocus(null), true);
  setInterval(updateLegend, 300);
  updateLegend();
}

export { LEGEND as NAV_KEYS };
