// Personal packs: private content that lives only on your device, never in the
// app's code. A pack (.ivorypack.json, type "ivory-personal") can rename
// galaxies, add your own songs, and add special bosses with their own art and
// exclusive Shop rewards. It's saved with your progress (and in backups).

import { getState, saveState } from './store.js';

const pack = () => getState().personal || null;

export const hasPersonalPack = () => !!pack();
export const personalName = () => (pack() ? pack().name || 'Personal' : null);

/** Galaxy display name override, e.g. { u2: 'My Galaxy' }. */
export const personalGalaxyName = (unitId) => (pack() && pack().galaxyNames && pack().galaxyNames[unitId]) || null;
/** Song title override for built-in songs. */
export const personalSongTitle = (songId) => (pack() && pack().songTitles && pack().songTitles[songId]) || null;
/** Extra song definitions (same format as js/data/songs.js). */
export const personalSongDefs = () => (pack() && Array.isArray(pack().songs) ? pack().songs : []);
/** Special bosses defined by the pack. */
export const personalBosses = () => (pack() && Array.isArray(pack().bosses) ? pack().bosses : []);
/** Boss portrait art (an SVG string) by key. */
export const personalArt = (key) => (pack() && pack().art && pack().art[key]) || '';
/** Name overrides for exclusive Shop items. */
export const personalItemName = (id) => (pack() && pack().items && pack().items[id] && pack().items[id].name) || null;

export function validPersonalPack(data) {
  return !!data && data.type === 'ivory-personal' && typeof data === 'object';
}

/** Save a personal pack (replaces any previous one). The page reloads to apply it everywhere. */
export function installPersonalPack(data) {
  const { type, version, ...rest } = data;
  getState().personal = rest;
  saveState();
}

export function removePersonalPack() {
  delete getState().personal;
  saveState();
}
