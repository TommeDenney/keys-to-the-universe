// Keyboard sound modes: what the user's keyboard is set to (tunes the mic
// listener) and which voice the app plays with.

import { settings } from './store.js';
import { audio } from './audio/engine.js';
import { mic } from './input/mic.js';

export const SOUNDS = [
  { id: 'piano', name: 'Piano' },
  { id: 'epiano', name: 'Electric piano' },
  { id: 'organ', name: 'Organ' },
  { id: 'pad', name: 'Pad' },
  { id: 'bass', name: 'Bass' },
  { id: 'split', name: 'Split (bass + piano)' },
];

/** The voice the app plays with right now (a song may ask for its own, e.g. organ for gospel). */
export function appVoice(songInstrument) {
  const pref = settings.get('appSound');
  if (pref !== 'match') return pref;
  if (songInstrument) return songInstrument;
  return settings.get('keyboardSound');
}

export function applySound(songInstrument) {
  audio.voice = appVoice(songInstrument);
  // The listener cares about the user's keyboard; a split keyboard sounds like piano + bass.
  const kb = settings.get('keyboardSound');
  mic.setInstrument(kb === 'split' ? 'piano' : kb);
}
