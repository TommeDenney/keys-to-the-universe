import { h, icon, toast } from './ui.js';
import { renderLearn } from './screens/learn.js';
import { renderUniverse } from './screens/universe.js';
import { renderHandbook } from './screens/handbook.js';
import { renderLibrary } from './screens/library.js';
import { renderSongPage } from './screens/songpage.js';
import { renderChords } from './screens/chords.js';
import { renderSettings, showOnboarding } from './screens/settings.js';
import { openLesson } from './screens/lesson.js';
import { settings, onChange, protectStorage } from './store.js';
import { audio } from './audio/engine.js';
import { input } from './input/hub.js';
import { mic } from './input/mic.js';
import { initPianoNav } from './nav.js';
import { applyTheme } from './theme.js';
import { applySound } from './sound.js';
import { loadCatalog } from './data/catalog.js';
import { applyCosmetics } from './cosmetics.js';
import { renderShop, renderInventory } from './screens/shop.js';
import { startAmbient, stopAmbient } from './audio/ambient.js';
import { equipped, onWallet } from './economy.js';
import { initAchievements, checkAchievements } from './achievements.js';
import { SHOP } from './data/shop.js';
import { renderBadges } from './screens/badges.js';
import { renderAbout } from './screens/about.js';
import { renderAvatar } from './screens/avatar.js';
import { renderArcade } from './screens/arcade.js';
import { startAccount, startAutoSave, syncNow, account } from './cloud.js';
import { maybeOfferSignIn, openProfile, chooseSave, celebrateBirthday } from './screens/account.js';
import { profile, claimBirthday } from './profile.js';
import { giftReady, openDailyGift } from './dailygift.js';
import { renderChallenges } from './screens/challenges.js';
import { touch as touchChallenges } from './challenges.js';
import { loadConstellations } from './constellations.js';
import { mountMusicBar } from './screens/musicbar.js';
import { registerPackPets } from './packpets.js';
import { mountDock } from './screens/dock.js';
import { watchFocus } from './focus.js';
import { state as bgState, stopTabAmbient, autoStart as autoStartMusic } from './audio/bgmusic.js';

applyTheme();
document.body.dataset.tabpos = settings.get('tabBar') || 'bottom';
registerPackPets();
watchFocus();
applyCosmetics();
touchChallenges();

const TABS = [
  { id: 'learn', label: 'Learn', icon: 'learn' },
  { id: 'library', label: 'Songs', icon: 'library' },
  { id: 'arcade', label: 'Arcade', icon: 'arcade' },
  { id: 'handbook', label: 'Handbook', icon: 'book' },
  { id: 'shop', label: 'Shop', icon: 'shop' },
  { id: 'inventory', label: 'Inventory', icon: 'backpack' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

const app = document.getElementById('app');
const main = h('main', { class: 'screen' });
const tabbar = h('nav', { class: 'tabbar' }, TABS.map((t) =>
  h('a', { href: `#/${t.id}`, class: 'tab', 'data-tab': t.id }, [icon(t.icon), h('span', {}, t.label)])));
app.append(main, tabbar);

audio.setVolume(settings.get('volume'));
audio.setMusicVolume(settings.get('musicVolume'));
mic.setSensitivity(settings.get('micSensitivity'));
mic.setPitchOffset(settings.get('micPitchOffset'));
mic.setGhosts(settings.get('micGhosts'));
applySound();
onChange(() => { audio.setVolume(settings.get('volume')); audio.setMusicVolume(settings.get('musicVolume')); });

let cleanup = null;

async function route() {
  const hash = location.hash.replace(/^#\/?/, '') || 'learn';
  const [name, arg] = hash.split('/');
  if (name !== 'learn' && name !== 'shop') stopTabAmbient();
  if (cleanup) { cleanup(); cleanup = null; }
  // Full-screen flows sit on top of the current tab.
  if (name === 'lesson') {
    openLesson(decodeURIComponent(arg), () => history.length > 1 ? history.back() : (location.hash = '#/learn'));
    if (!main.childElementCount) renderTab('learn');
    return;
  }
  document.querySelectorAll('.fullscreen').forEach((el) => el._close && el._close());
  if (name === 'challenges') {
    setActiveTab('learn');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = renderChallenges(main);
    return;
  }
  if (name === 'inventory') {
    setActiveTab('inventory');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = renderInventory(main);
    return;
  }
  if (name === 'arcade') {
    setActiveTab('arcade');
    main.replaceChildren();
    main.scrollTop = 0;
    stopTabAmbient();
    cleanup = renderArcade(main) || null;
    return;
  }
  if (name === 'avatar') {
    setActiveTab('learn');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = renderAvatar(main) || null;
    return;
  }
  if (name === 'about') {
    setActiveTab('settings');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = renderAbout(main) || null;
    return;
  }
  if (name === 'badges') {
    setActiveTab('shop');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = renderBadges(main);
    return;
  }
  if (name === 'chords') { // opened from the Handbook
    setActiveTab('handbook');
    main.replaceChildren();
    main.scrollTop = 0;
    main.append(h('a', { class: 'back-link page-back', href: '#/handbook' }, [icon('back'), 'Handbook']));
    cleanup = renderChords(main) || null;
    return;
  }
  if (name === 'handbook') {
    setActiveTab('handbook');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = renderHandbook(main);
    return;
  }
  if (name === 'song') {
    setActiveTab('library');
    main.replaceChildren();
    main.scrollTop = 0;
    cleanup = await renderSongPage(main, decodeURIComponent(arg));
    return;
  }
  renderTab(TABS.some((t) => t.id === name) ? name : 'learn');
}

async function renderTab(name) {
  setActiveTab(name);
  main.replaceChildren();
  main.scrollTop = 0;
  const learn = settings.get('learnLayout') === 'classic' ? renderLearn : renderUniverse;
  const r = { learn, library: renderLibrary, chords: renderChords, shop: renderShop, settings: renderSettings }[name];
  cleanup = (await r(main)) || null;
  // Learn-tab ambience (bought in the Shop).
  if (name === 'learn' && equipped('amb') !== 'amb-none' && !bgState().playing) startAmbient(equipped('amb'));
  else if (name !== 'shop') stopTabAmbient();
}

/**
 * Switch the highlighted tab. The highlight glides to the new tab like a drop of
 * liquid: it stretches to cover both tabs, then lets go of the old one, and the
 * new tab's icon pops.
 */
const tabInk = h('i', { class: 'tab-ink', 'aria-hidden': 'true' });
tabbar.prepend(tabInk);
let inkFrom = null;
function placeInk(el, animate) {
  if (!el) { tabInk.style.opacity = '0'; return; }
  const vertical = getComputedStyle(tabbar).flexDirection === 'column';
  const box = (t) => ({ x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight });
  const to = box(el);
  const set = (b) => Object.assign(tabInk.style, { opacity: '1', transform: `translate(${b.x}px, ${b.y}px)`, width: `${b.w}px`, height: `${b.h}px` });
  tabInk.classList.toggle('instant', !animate);
  if (animate && inkFrom && inkFrom !== el && document.contains(inkFrom)) {
    const from = box(inkFrom);
    // Stretch over both tabs first…
    const x = Math.min(from.x, to.x), y = Math.min(from.y, to.y);
    const span = vertical
      ? { x: to.x, y, w: to.w, h: Math.max(from.y + from.h, to.y + to.h) - y }
      : { x, y: to.y, w: Math.max(from.x + from.w, to.x + to.w) - x, h: to.h };
    tabInk.classList.add('stretch');
    set(span);
    // …then settle on the new one.
    clearTimeout(placeInk.t);
    placeInk.t = setTimeout(() => { tabInk.classList.remove('stretch'); set(to); }, 170);
  } else set(to);
  inkFrom = el;
}
function setActiveTab(name) {
  let active = null;
  tabbar.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.tab === name;
    if (on && !t.classList.contains('active')) { t.classList.remove('pop'); void t.offsetWidth; t.classList.add('pop'); }
    t.classList.toggle('active', on);
    if (on) active = t;
  });
  placeInk(active, !!inkFrom);
}
addEventListener('resize', () => placeInk(inkFrom, false));
new MutationObserver(() => requestAnimationFrame(() => placeInk(inkFrom, false))).observe(document.body, { attributes: true, attributeFilter: ['data-tabpos'] });

window.addEventListener('hashchange', route);
// The graded repertoire galaxies come from a manifest; load it before the first render.
// Accounts first: a sign-in that just came back from Google carries its result in the
// URL, which has to be read (and cleaned up) before the router looks at it.
const accountReady = startAccount().catch(() => ({ status: 'error' }));
Promise.all([loadCatalog(), loadConstellations(), accountReady]).then(async ([, , acct]) => {
  if (acct && acct.status === 'renewing') return; // off to Google for a moment; we'll be right back
  route();
  mountMusicBar();
  mountDock();
  autoStartMusic();
  initAchievements({ toast, items: () => SHOP });
  onWallet(() => checkAchievements());
  checkAchievements();
  // The daily gift comes first, then anything account-related.
  if (giftReady() && settings.get('onboarded')) openDailyGift(() => afterAccount(acct || {}));
  else await afterAccount(acct || {});
});

async function afterAccount(acct) {
  if (acct.status === 'signed-in') {
    startAutoSave();
    // Load or save first, so a second device picks up the profile already in Drive.
    const r = await syncNow({ choose: chooseSave });
    if (r.status === 'download') { toast('Loaded your progress from Google Drive \u2601\uFE0F', 'ok'); route(); }
    else if (r.status === 'error' && acct.fresh) toast(r.error, 'bad');
    if (acct.fresh && !profile()) openProfile({ first: true, done: () => syncNow() });
    if (claimBirthday()) celebrateBirthday();
  } else if (acct.status === 'reconnect' && account()) {
    toast('Tap Settings \u203a Account to reconnect Google Drive.', '');
  } else if (acct.status === 'expired') {
    toast('It\u2019s been 30 days: sign in with Google again to keep saving to Drive.', '');
  } else if (settings.get('onboarded')) {
    maybeOfferSignIn();
  }
}

if (!settings.get('onboarded')) setTimeout(() => showOnboarding(), 350);

// Pre-arm MIDI on browsers that support it (shows devices in Settings).
if (navigator.requestMIDIAccess && settings.get('input') !== 'touch') input.initMidi();

// Piano-key navigation. With a microphone setup we start listening on the
// first tap (browsers require a user gesture before audio input).
initPianoNav();
// Ask the browser to keep our data (progress, imports) safe from automatic cleanup.
protectStorage();
window.addEventListener('pointerdown', () => protectStorage(), { once: true });
window.addEventListener('pointerdown', () => {
  if (settings.get('onboarded') && settings.get('pianoNav') && settings.get('input') !== 'touch' && !input.midiInputs.length) mic.start();
}, { once: true, capture: true });

// Offline support.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
