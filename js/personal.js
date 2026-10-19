// Personal packs: private content that lives only on your device, never in the
// app's code. A pack (.ivorypack.json, type "ivory-personal") can rename
// galaxies, add your own songs, add special bosses with their own art and
// exclusive Shop rewards, and add your own pets (drawn from a look, see critters.js). It's saved with your progress (and in backups).

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
/** Pets from the pack: [{ id, name, desc, look }] (look uses the critter recipes, e.g. base 'chibi'). */
export const personalPets = () => (pack() && Array.isArray(pack().pets) ? pack().pets.filter((p) => p && /^pet-[\w-]+$/.test(p.id) && p.look) : []);
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
