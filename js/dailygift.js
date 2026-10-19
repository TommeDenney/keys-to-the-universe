// Daily gift: once a day, a gift box with a random 50–1,000 Stardust. Smaller
// amounts are common and the big ones rare, so every day is worth a look.
// A gift streak counts the days in a row you've opened one.

import { h, modal } from './ui.js';
import { getState, saveState } from './store.js';
import { earn, SYMBOL } from './economy.js';

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const state = () => { const s = getState(); s.dailyGift ||= { last: null, streak: 0 }; return s.dailyGift; };
export const giftReady = () => state().last !== dayKey();

/** 50–1,000, rounded to 10s, weighted towards the low end (average about 330; about 1 day in 5 is 600+). */
export function rollGift(r = Math.random()) {
  return Math.round((50 + 950 * r ** 2.4) / 10) * 10;
}

function claim() {
  const g = state();
  const y = new Date(); y.setDate(y.getDate() - 1);
  g.streak = g.last === dayKey(y) ? g.streak + 1 : 1;
  g.last = dayKey();
  const amount = rollGift();
  g.lastAmount = amount;
  saveState();
  earn(amount, 'Daily gift', { quiet: true }); // the gift box shows its own count-up
  return { amount, streak: g.streak };
}

/** The gift box: tap to open, the amount counts up. */
export function openDailyGift(onDone) {
  if (!giftReady()) return;
  modal((close) => {
    const amountEl = h('b', { class: 'gift-amount' }, '');
    const streakEl = h('p', { class: 'gift-streak' }, '');
    const box = h('button', { class: 'gift-box', 'aria-label': 'Open your daily gift' }, [h('i', { class: 'gift-lid' }), h('i', { class: 'gift-body' }), h('i', { class: 'gift-ribbon' }), h('i', { class: 'gift-glow' })]);
    const done = h('button', { class: 'btn primary hidden', onclick: () => { close(); if (onDone) onDone(); } }, 'Awesome!');
    box.onclick = () => {
      if (box.classList.contains('open')) return;
      box.classList.add('open');
      const { amount, streak } = claim();
      let shown = 0;
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 900);
        shown = Math.round(amount * (1 - (1 - k) ** 3));
        amountEl.textContent = `+${shown.toLocaleString('en-US')} ${SYMBOL}`;
        if (k < 1) requestAnimationFrame(step);
      };
      setTimeout(() => requestAnimationFrame(step), 350);
      streakEl.textContent = streak > 1 ? `\u{1F525} ${streak}-day gift streak! Come back tomorrow for another.` : 'Come back tomorrow for another gift!';
      done.classList.remove('hidden');
      document.querySelector('.gift-modal h2').textContent = amount >= 600 ? 'A huge gift!' : amount >= 300 ? 'A great gift!' : 'Your daily gift';
    };
    return [h('div', { class: 'gift-modal' }, [
      h('div', { class: 'eyebrow' }, 'Daily gift'),
      h('h2', {}, 'A gift from the universe'),
      h('p', { class: 'muted' }, 'Tap the box to open it. A new one arrives every day.'),
      box, amountEl, streakEl, done,
    ])];
  });
}
