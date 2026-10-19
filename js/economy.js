// Stardust ✦: the in-game currency. Earned only by playing (lessons, bosses,
// songs, streaks, side quests); spent in the Shop. No real money anywhere.

import { h } from './ui.js';
import { getState, saveState } from './store.js';

export const CURRENCY = 'Stardust';
export const SYMBOL = '✦';

// Rewards
export const REWARD = {
  lessonBase: 10,
  lessonPerStar: 5,
  starImproved: 5,
  bossBase: 100,
  bossPerStar: 25,
  songStepPerStar: 3,
  songMastered: 20, // full song, with the beat, 3 stars
  dailyPerStreakDay: 10, // capped at 7 days
};

function wallet() {
  const st = getState();
  if (!st.wallet) {
    st.wallet = { balance: 0, earned: 0, owned: ['ship-classic', 'fx-check', 'kb-classic', 'press-glow', 'amb-none', 'trail-dots', 'sheet-classic'], equipped: { ship: 'ship-classic', fx: 'fx-check', kb: 'kb-classic', press: 'press-glow', amb: 'amb-choir', trail: 'trail-dots', sheet: 'sheet-classic' }, songs: [], daily: null, quests: {}, migrations: ['choir-free'] };
    // Credit progress made before Stardust existed.
    let back = 0;
    for (const rec of Object.values(st.lessons || {})) back += REWARD.lessonBase + REWARD.lessonPerStar * (rec.stars || 0);
    for (const steps of Object.values(st.songs || {})) for (const s of Object.values(steps)) back += REWARD.songStepPerStar * s;
    st.wallet.balance = back;
    st.wallet.earned = back;
    st.wallet.backpay = back;
    saveState();
  }
  // Renamed item ids.
  const w = st.wallet;
  if (w.owned.includes('ship-divine')) w.owned = w.owned.map((x) => (x === 'ship-divine' ? 'ship-seed' : x));
  if (w.equipped.ship === 'ship-divine') w.equipped.ship = 'ship-seed';
  applyMigrations(w);
  return w;
}

/**
 * One-time changes to existing wallets. Each runs once, ever.
 * 'choir-free': Cosmic Choir became free and the default ambience; anyone who
 * bought it gets a refund (1,500 ✦, its price after the October 2026 price change).
 */
function applyMigrations(w) {
  w.migrations ||= [];
  if (!w.migrations.includes('choir-free')) {
    w.migrations.push('choir-free');
    if (w.owned.includes('amb-choir')) {
      w.owned = w.owned.filter((x) => x !== 'amb-choir');
      w.balance += REFUNDS['amb-choir'];
      setTimeout(() => burst(REFUNDS['amb-choir'], 'Refund: Cosmic Choir is now free'), 1500);
    }
    if (!w.equipped.amb || w.equipped.amb === 'amb-none') w.equipped.amb = 'amb-choir';
    saveState();
  }
}
const REFUNDS = { 'amb-choir': 1500 };

const subs = new Set();
export function onWallet(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
function changed() {
  saveState();
  subs.forEach((f) => f(wallet().balance));
}

export const balance = () => wallet().balance;
const DEFAULTS = { ship: 'ship-classic', fx: 'fx-check', kb: 'kb-classic', press: 'press-glow', amb: 'amb-choir', trail: 'trail-dots', sheet: 'sheet-classic', starc: 'star-gold', pet: 'pet-none' };
export const earnedTotal = () => wallet().earned || 0;
export const ownedItems = () => wallet().owned.filter((id) => !FREE().includes(id));
export const ownedSongs = () => wallet().songs || [];
/** Pet nicknames (empty = use the species name). */
export const petName = (id) => ((wallet().petNames || {})[id]) || '';
export function setPetName(id, name) {
  const w = wallet();
  w.petNames ||= {};
  const clean = String(name || '').trim().slice(0, 24);
  if (clean) w.petNames[id] = clean; else delete w.petNames[id];
  changed();
}
export const equipped = (cat) => wallet().equipped[cat] || DEFAULTS[cat];
// Always yours: each category's default, plus Silence.
const FREE = () => [...Object.values(DEFAULTS), 'amb-none'];
export const owns = (id) => wallet().owned.includes(id) || FREE().includes(id);
export const backpay = () => {
  const w = wallet();
  const b = w.backpay || 0;
  if (b) { delete w.backpay; saveState(); }
  return b;
};

export function earn(amount, reason, { quiet = false } = {}) {
  if (!amount) return;
  const w = wallet();
  w.balance += amount;
  w.earned += amount;
  changed();
  if (!quiet) burst(amount, reason);
}

export function spend(amount) {
  const w = wallet();
  if (w.balance < amount) return false;
  w.balance -= amount;
  changed();
  return true;
}

export function buy(item) {
  if (owns(item.id)) return true;
  if (!spend(item.price)) return false;
  wallet().owned.push(item.id);
  (wallet().paid ||= {})[item.id] = item.price; // remembered so a refund can be exact
  changed();
  return true;
}

/** Give an item without paying (exclusive rewards). */
export function grantItem(id) {
  const w = wallet();
  if (!w.owned.includes(id)) w.owned.push(id);
  changed();
}

export function equip(cat, id) {
  wallet().equipped[cat] = id;
  changed();
  document.dispatchEvent(new CustomEvent('ivory:equip', { detail: { cat, id } }));
}

// ---- Songs: unlocked by the Learn path, or bought ---------------------------
export const songOwned = (id) => wallet().songs.includes(id);
export function buySong(id, price) {
  if (songOwned(id)) return true;
  if (!spend(price)) return false;
  wallet().songs.push(id);
  changed();
  return true;
}

// ---- Earning hooks ------------------------------------------------------------
export function rewardLesson(prevStars, stars, isBoss) {
  if (!prevStars) {
    const amt = isBoss ? REWARD.bossBase + REWARD.bossPerStar * stars : REWARD.lessonBase + REWARD.lessonPerStar * stars;
    earn(amt, isBoss ? 'Guardian defeated' : 'World complete');
  } else if (stars > prevStars) {
    earn(REWARD.starImproved * (stars - prevStars), 'More stars');
  }
}

export function rewardSongStep(prevStars, stars, mastered) {
  if (stars > prevStars) earn(REWARD.songStepPerStar * (stars - prevStars) + (mastered && prevStars < 3 && stars === 3 ? REWARD.songMastered : 0), mastered && stars === 3 ? 'Song mastered' : 'Song progress');
}

export function rewardDaily(streak) {
  const w = wallet();
  const today = new Date().toDateString();
  if (w.daily === today) return;
  w.daily = today;
  earn(REWARD.dailyPerStreakDay * Math.max(1, Math.min(7, streak)), `Day ${streak} streak`);
}

// ---- Side quests -------------------------------------------------------------
export const questDone = (id) => !!wallet().quests[id];
export function completeQuest(id, reward) {
  const w = wallet();
  const first = !w.quests[id];
  w.quests[id] = Date.now();
  saveState();
  if (first) earn(reward, 'Side quest complete');
  return first;
}

// ---- "+25 ✦" floating reward --------------------------------------------------
function burst(amount, reason) {
  const el = h('div', { class: 'stardust-burst' }, [h('b', {}, `+${amount} ${SYMBOL}`), reason ? h('span', {}, reason) : null]);
  document.body.appendChild(el);
  for (let i = 0; i < 14; i++) {
    const p = h('i', { class: 'dust' });
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 240}px`);
    p.style.setProperty('--dy', `${-60 - Math.random() * 160}px`);
    p.style.animationDelay = `${Math.random() * 0.15}s`;
    el.appendChild(p);
  }
  setTimeout(() => el.remove(), 2300);
}

/** Small wallet pill (updates live). */
export function walletPill(extraClass = '') {
  const b = h('b', {}, String(balance()));
  const pill = h('a', { class: `pill wallet-pill ${extraClass}`, href: '#/shop', title: `${CURRENCY}: spend it in the Shop` }, [h('span', { class: 'sd' }, SYMBOL), b]);
  const off = onWallet((v) => {
    if (!document.contains(pill)) { off(); return; }
    b.textContent = String(v);
    pill.classList.remove('bump');
    void pill.offsetWidth;
    pill.classList.add('bump');
  });
  return pill;
}
