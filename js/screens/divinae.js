// Special boss: The Nature Goddess Divinae (a request from Divine).
// Her battle music is "Divinae's Garden", an original R&B slow jam written for
// her. ("Only Wanna Give It To You" by Elle Varner is copyrighted, so it can't be
// included; import your own MusicXML/MIDI copy and she'll use that instead.)
// Beating her grants the exclusive "Divinae's Bloom" effect.

import { h, icon, modal, toast } from '../ui.js';
import { getState, saveState, library, progress } from '../store.js';
import { getSong } from '../data/catalog.js';
import { importFile } from '../music/importer.js';
import { playSong } from './songpage.js';
import { earn, owns, grantItem, SYMBOL } from '../economy.js';
import { bossRewardAvailable, markBossRewarded, track } from '../challenges.js';

export const DIVINAE = {
  id: 'boss-divinae',
  name: 'The Nature Goddess Divinae',
  song: '“Divinae’s Garden”',
  defaultSong: 'divinae-garden',
  bounty: 500,
  galaxy: 'u2',
};

const st = () => { const s = getState(); s.divinae ||= { songId: null, wins: 0 }; return s.divinae; };
export const divinaeDefeated = () => (st().wins || 0) > 0;

export function divinaeEl() {
  const won = divinaeDefeated();
  return h('div', { class: `divinae ${won ? 'done' : ''}` }, [
    h('button', { class: 'divinae-orb', 'aria-label': `Special boss: ${DIVINAE.name}`, onclick: openDivinae }, [
      h('i', { class: 'aura' }), h('i', { class: 'core' }),
      ...Array.from({ length: 8 }, (_, i) => h('i', { class: 'leaf', style: { '--a': `${i * 45}deg`, '--d': `${6 + (i % 3) * 2}s` } })),
      h('span', { class: 'g-icon' }, won ? '\u{1F33A}' : '\u{1F33F}'),
    ]),
    h('div', { class: 'body-label' }, [
      h('small', {}, won ? 'Special boss · defeated' : 'Special boss · challenge'),
      h('b', {}, DIVINAE.name),
      h('span', { class: 'g-sub' }, `Bounty ${DIVINAE.bounty} ${SYMBOL} weekly · exclusive reward`),
    ]),
  ]);
}

export async function openDivinae() {
  const linked = st().songId ? await library.get(st().songId) : null;
  const imports = await library.all();
  modal((close) => {
    const fileIn = h('input', { type: 'file', class: 'hidden', onchange: async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        const song = await importFile(f);
        const id = `imp-${Date.now().toString(36)}`;
        song.id = id;
        await library.put({ id, title: song.title, composer: song.composer, fileName: f.name, createdAt: Date.now(), song });
        st().songId = id;
        saveState();
        toast('Divinae accepts your music!', 'ok');
        close();
        openDivinae();
      } catch (err) {
        toast(err.message, 'bad');
      }
    } });
    const choose = (id) => { st().songId = id; saveState(); close(); openDivinae(); };
    return [h('div', { class: 'divinae-modal' }, [
      h('div', { class: 'divinae-emblem' }, [h('i'), h('span', {}, '\u{1F33F}')]),
      h('div', { class: 'eyebrow' }, 'Special boss'),
      h('h2', {}, `${DIVINAE.name} challenges you!`),
      h('p', {}, `She challenges you to her song, ${DIVINAE.song}. Score 75% with the beat to win her bounty (${DIVINAE.bounty} ${SYMBOL}, weekly) and the exclusive “Divinae’s Bloom” effect.`),
      h('div', { class: 'divinae-linked' }, [icon('note'), h('span', {}, ['Battle music: ', h('b', {}, linked ? linked.title : 'Divinae\u2019s Garden (original R&B slow jam)')])]),
      h('details', { class: 'divinae-need' }, [
        h('summary', {}, 'Want to battle with \u201cOnly Wanna Give It To You\u201d instead?'),
        h('p', {}, 'That song is copyrighted, so Ivory can\u2019t include it. If you have a piano arrangement as MusicXML or MIDI (a PDF needs converting first), import it here, free, and Divinae will use it. It stays on this device only.'),
        imports.length ? h('div', { class: 'divinae-pick' }, [h('small', {}, 'Use something you already imported:'), ...imports.slice(0, 6).map((r) => h('button', { class: 'chip-btn', onclick: () => choose(r.id) }, r.title))]) : null,
        h('div', { class: 'row' }, [
          h('button', { class: 'btn ghost sm', onclick: () => fileIn.click() }, [icon('upload'), 'Import my own copy']),
          linked ? h('button', { class: 'btn ghost sm', onclick: () => { st().songId = null; saveState(); close(); openDivinae(); } }, 'Use Divinae\u2019s Garden') : null,
        ]),
      ]),
      fileIn,
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: () => { close(); location.hash = `#/song/${linked ? linked.id : DIVINAE.defaultSong}`; } }, [icon('note'), 'Practise first']),
        h('button', { class: 'btn primary', onclick: () => { close(); battle(linked ? linked.id : DIVINAE.defaultSong); } }, ['\u2694 Battle Divinae']),
      ]),
    ])];
  });
}

async function battle(songId) {
  const song = await getSong(songId);
  if (!song) { toast('Couldn’t load the music. Try importing it again.', 'bad'); return; }
  const hands = song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L';
  playSong(song, {
    hands, mode: 'timed', tempo: 1, title: song.title, subtitle: `Special boss · ${DIVINAE.name}`,
    exam: { pass: 0.75, name: DIVINAE.name },
    onFinish: (r) => {
      if (!r.passed) return;
      st().wins = (st().wins || 0) + 1;
      saveState();
      track('bosses');
      if (bossRewardAvailable(DIVINAE.id)) { earn(DIVINAE.bounty, 'Divinae defeated'); markBossRewarded(DIVINAE.id); }
      if (!owns('fx-bloom')) { grantItem('fx-bloom'); toast('Exclusive unlocked: Divinae’s Bloom! Equip it in the Shop.', 'ok'); }
    },
  });
}
