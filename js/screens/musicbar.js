// "Now playing" bar for background music + the playlist picker.

import { h, icon, modal, toast } from '../ui.js';
import { onBg, state, toggle, skip, playlist, setPlaylist, shuffleOn, setShuffle, play } from '../audio/bgmusic.js';
import { builtinSongs } from '../data/songs.js';
import { catalogPieces } from '../data/catalog.js';
import { songUnlocked } from '../unlocks.js';
import { library, settings } from '../store.js';
import { SHOP } from '../data/shop.js';
import { owns } from '../economy.js';

async function unlockedSongs() {
  const built = builtinSongs().filter((s) => !s.id.startsWith('boss-') && songUnlocked(s.id)).map((s) => ({ id: s.id, title: s.title, by: s.composer }));
  const pieces = catalogPieces().filter((p) => songUnlocked(p.id)).map((p) => ({ id: p.id, title: p.title, by: p.composer }));
  const imports = (await library.all()).map((r) => ({ id: r.id, title: r.title, by: 'My music' }));
  // Ambiences you own in the Shop can be playlist tracks too.
  const ambs = SHOP.filter((it) => it.cat === 'amb' && it.id !== 'amb-none' && owns(it.id)).map((it) => ({ id: it.id, title: it.name, by: 'Ambience \u00b7 3 min', amb: true }));
  return [...ambs, ...built, ...pieces, ...imports];
}

export async function openPlaylist() {
  const songs = await unlockedSongs();
  let sel = new Set(playlist());
  modal((close) => {
    const list = h('div', { class: 'pl-list' });
    const draw = () => list.replaceChildren(...songs.map((s) => h('label', { class: `pl-song ${sel.has(s.id) ? 'on' : ''}` }, [
      h('input', { type: 'checkbox', checked: sel.has(s.id), onchange: (e) => { if (e.target.checked) sel.add(s.id); else sel.delete(s.id); draw(); } }),
      h('span', { class: 'grow' }, [h('b', {}, [s.amb ? '\u{1F30C} ' : '', s.title]), h('small', {}, s.by || '')]),
    ])));
    draw();
    const vol = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: settings.get('bgVolume') ?? 0.3, oninput: (e) => settings.set('bgVolume', +e.target.value) });
    return [h('div', { class: 'playlist-modal' }, [
      h('h2', {}, 'Background music'),
      h('p', { class: 'muted' }, 'Pick unlocked songs and Shop ambiences to play softly while you browse. They pause automatically while you practise. Unlock more songs in the Learn path or Songs tab, and more ambiences in the Shop.'),
      h('div', { class: 'row', style: { justifyContent: 'flex-start', marginTop: '8px' } }, [
        h('button', { class: 'chip-btn', onclick: () => { songs.forEach((s) => sel.add(s.id)); draw(); } }, 'Add all unlocked'),
        h('button', { class: 'chip-btn', onclick: () => { sel = new Set(); draw(); } }, 'Clear'),
        h('label', { class: 'chip-btn' }, [h('input', { type: 'checkbox', checked: shuffleOn(), onchange: (e) => setShuffle(e.target.checked) }), ' Shuffle']),
      ]),
      list,
      h('label', { class: 'field' }, [h('span', {}, 'Music volume'), vol]),
      h('p', { class: 'muted small' }, 'While music plays, microphone piano-key navigation pauses (MIDI keeps working).'),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: close }, 'Close'),
        h('button', { class: 'btn primary', onclick: () => { setPlaylist([...sel]); close(); if (sel.size) { play(); toast(`Playing ${sel.size} song${sel.size === 1 ? '' : 's'}${shuffleOn() ? ' on shuffle' : ''} ♪`, 'ok'); } } }, [icon('play'), 'Save & play']),
      ]),
    ])];
  });
}

export function mountMusicBar() {
  const title = h('span', { class: 'mb-title' }, 'Background music');
  const playBtn = h('button', { class: 'mb-btn', 'aria-label': 'Play or pause', onclick: () => { if (!playlist().length) openPlaylist(); else toggle(); } }, icon('play'));
  const nextBtn = h('button', { class: 'mb-btn', 'aria-label': 'Next song', onclick: () => skip() }, icon('chevron'));
  const shufBtn = h('button', { class: 'mb-btn shuf', 'aria-label': 'Shuffle', onclick: () => setShuffle(!shuffleOn()) }, h('span', {}, '⇄'));
  const listBtn = h('button', { class: 'mb-btn', 'aria-label': 'Playlist', onclick: openPlaylist }, icon('library'));
  const bar = h('div', { class: 'musicbar' }, [h('span', { class: 'mb-eq' }, [h('i'), h('i'), h('i')]), title, playBtn, nextBtn, shufBtn, listBtn]);
  document.body.appendChild(bar);
  const render = (s) => {
    bar.classList.toggle('playing', s.playing);
    title.textContent = s.title && s.playing ? s.title : s.hasList ? (s.title || 'Background music') : 'Add background music';
    playBtn.replaceChildren(icon(s.playing ? 'pause' : 'play'));
    shufBtn.classList.toggle('on', s.shuffle);
    nextBtn.style.display = s.hasList ? '' : 'none';
    shufBtn.style.display = s.hasList ? '' : 'none';
  };
  onBg(render);
  render(state());
}
