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
import { renderShop } from './screens/shop.js';
import { startAmbient, stopAmbient } from './audio/ambient.js';
import { equipped, onWallet } from './economy.js';
import { initAchievements, checkAchievements } from './achievements.js';
import { SHOP } from './data/shop.js';
import { renderBadges } from './screens/badges.js';
import { renderChallenges } from './screens/challenges.js';
import { touch as touchChallenges } from './challenges.js';
import { loadConstellations } from './constellations.js';
import { mountMusicBar } from './screens/musicbar.js';
import { state as bgState } from './audio/bgmusic.js';

applyTheme();
applyCosmetics();
touchChallenges();

const TABS = [
  { id: 'learn', label: 'Learn', icon: 'learn' },
  { id: 'library', label: 'Songs', icon: 'library' },
  { id: 'handbook', label: 'Handbook', icon: 'book' },
  { id: 'shop', label: 'Shop', icon: 'shop' },
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
  if (name !== 'learn' && name !== 'shop') stopAmbient();
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
  else if (name !== 'shop') stopAmbient();
}

function setActiveTab(name) {
  tabbar.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
}

window.addEventListener('hashchange', route);
// The graded repertoire galaxies come from a manifest; load it before the first render.
Promise.all([loadCatalog(), loadConstellations()]).finally(() => {
  route();
  mountMusicBar();
  initAchievements({ toast, items: () => SHOP });
  onWallet(() => checkAchievements());
  checkAchievements();
});

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
