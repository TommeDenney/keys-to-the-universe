// Special bosses: The Nature Goddess Divinae (a request from Divine), in two forms.
//  - Divinae (Easy) in the Divine galaxy: uses your imported "(Easy)" arrangement,
//    or the original "Divinae's Garden" if none is imported.
//  - Divinae, Ascended (Advanced): a rogue-planet boss after the Syncopa galaxy: uses your "(Advanced)" import.
// "Only Wanna Give It To You" by Elle Varner is copyrighted, so it's never bundled
// with the app; imports stay on the device. Each form has an exclusive reward.

import { h, icon, modal, toast } from '../ui.js';
import { getState, saveState, library } from '../store.js';
import { getSong } from '../data/catalog.js';
import { importFile } from '../music/importer.js';
import { playSong } from './songpage.js';
import { earn, owns, grantItem, SYMBOL } from '../economy.js';
import { bossRewardAvailable, markBossRewarded, track } from '../challenges.js';
import { divinaeArt } from '../render/divinae-art.js';

export const FORMS = [
  {
    key: 'easy', id: 'boss-divinae', name: 'The Nature Goddess Divinae', short: 'Divinae', level: 'Easy', galaxy: 'u2', bounty: 300,
    match: /\(\s*easy\s*\)/i, fallback: 'divinae-garden', fallbackName: 'Divinae’s Garden (original R&B slow jam)',
    reward: 'fx-bloom', rewardName: 'Divinae’s Bloom', rewardHint: 'Equip it in the Shop › Completion effects.',
  },
  {
    key: 'adv', id: 'boss-divinae-ascended', name: 'Divinae, Ascended', short: 'Divinae, Ascended', level: 'Advanced', galaxy: null, rogueAfter: 'g7', bounty: 800, ascended: true,
    match: /\(\s*advanced\s*\)/i, fallback: null,
    reward: 'ship-divine', rewardName: 'the Divine Seedship', rewardHint: 'Equip it in the Shop › Spaceships.',
  },
];
// Kept for older imports of this module.
export const DIVINAE = FORMS[0];

const st = () => {
  const s = getState();
  s.divinae ||= {};
  s.divinae.forms ||= {};
  for (const f of FORMS) s.divinae.forms[f.key] ||= { songId: null, wins: 0 };
  // Carry over a win from the single-boss version.
  if (s.divinae.wins && !s.divinae.forms.easy.wins) s.divinae.forms.easy.wins = s.divinae.wins;
  return s.divinae.forms;
};
export const formDefeated = (f) => (st()[f.key].wins || 0) > 0;

/** The battle song for a form: your explicit choice, else an import matching "(Easy)"/"(Advanced)", else the fallback. */
async function resolveSong(f) {
  const state = st()[f.key];
  if (state.songId) {
    const rec = await library.get(state.songId);
    if (rec) return { id: rec.id, title: rec.title, imported: true };
  }
  const imports = await library.all();
  const auto = imports.find((r) => f.match.test(r.title || '') || f.match.test(r.fileName || ''));
  if (auto) return { id: auto.id, title: auto.title, imported: true, auto: true };
  return f.fallback ? { id: f.fallback, title: f.fallbackName, imported: false } : null;
}

export function divinaeEl(f = FORMS[0]) {
  const won = formDefeated(f);
  return h('div', { class: `divinae ${f.ascended ? 'ascended' : ''} ${won ? 'done' : ''}` }, [
    h('button', { class: 'divinae-orb', 'aria-label': `Special boss: ${f.name}`, onclick: () => openDivinae(f) }, [
      h('i', { class: 'aura' }), h('i', { class: 'core', html: divinaeArt(!!f.ascended) }),
      ...Array.from({ length: f.ascended ? 12 : 8 }, (_, i) => h('i', { class: 'leaf', style: { '--a': `${i * (f.ascended ? 30 : 45)}deg`, '--d': `${(f.ascended ? 4 : 6) + (i % 3) * 2}s` } })),
      won ? h('span', { class: 'won-badge' }, '\u{1F33A}') : null,
    ]),
    h('div', { class: 'body-label' }, [
      h('small', {}, `Special boss · ${f.level}${won ? ' · defeated' : ''}`),
      h('b', {}, f.name),
      h('span', { class: 'g-sub' }, `Bounty ${f.bounty} ${SYMBOL} weekly · exclusive reward`),
    ]),
  ]);
}

export async function openDivinae(f = FORMS[0]) {
  const song = await resolveSong(f);
  const imports = await library.all();
  modal((close) => {
    const reopen = () => { close(); openDivinae(f); };
    const fileIn = h('input', { type: 'file', class: 'hidden', onchange: async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const s = await importFile(file);
        const id = `imp-${Date.now().toString(36)}`;
        s.id = id;
        await library.put({ id, title: s.title, composer: s.composer, fileName: file.name, createdAt: Date.now(), song: s });
        st()[f.key].songId = id;
        saveState();
        toast(`${f.short} accepts your music!`, 'ok');
        reopen();
      } catch (err) {
        toast(err.message, 'bad');
      }
    } });
    const choose = (id) => { st()[f.key].songId = id; saveState(); reopen(); };
    return [h('div', { class: `divinae-modal ${f.ascended ? 'ascended' : ''}` }, [
      h('div', { class: 'divinae-emblem' }, [h('i'), h('span', { class: 'emblem-art', html: divinaeArt(!!f.ascended) })]),
      h('div', { class: 'eyebrow' }, `Special boss · ${f.level}`),
      h('h2', {}, `${f.name} challenges you!`),
      h('p', {}, `Score 75% with the beat at full speed to win her bounty (${f.bounty} ${SYMBOL}, weekly) and the exclusive ${f.rewardName}.`),
      song
        ? h('div', { class: 'divinae-linked' }, [icon('note'), h('span', {}, ['Battle music: ', h('b', {}, song.title), song.auto ? ' (found in your imports)' : ''])])
        : h('div', { class: 'divinae-need' }, [h('p', {}, `Import your “(${f.level})” arrangement of “Only Wanna Give It To You” to unlock this battle. It stays on this device only.`)]),
      h('details', { class: 'divinae-need' }, [
        h('summary', {}, 'Choose different music'),
        imports.length ? h('div', { class: 'divinae-pick' }, [h('small', {}, 'Use something you imported:'), ...imports.slice(0, 8).map((r) => h('button', { class: 'chip-btn', onclick: () => choose(r.id) }, r.title))]) : null,
        h('div', { class: 'row' }, [
          h('button', { class: 'btn ghost sm', onclick: () => fileIn.click() }, [icon('upload'), 'Import a file (free)']),
          st()[f.key].songId ? h('button', { class: 'btn ghost sm', onclick: () => { st()[f.key].songId = null; saveState(); reopen(); } }, 'Reset to default') : null,
        ]),
      ]),
      fileIn,
      h('div', { class: 'row' }, song ? [
        h('button', { class: 'btn ghost', onclick: () => { close(); location.hash = `#/song/${song.id}`; } }, [icon('note'), 'Practise first']),
        h('button', { class: 'btn primary', onclick: () => { close(); battle(f, song.id); } }, [`⚔ Battle ${f.short}`]),
      ] : [
        h('button', { class: 'btn ghost', onclick: close }, 'Not now'),
        h('button', { class: 'btn primary', onclick: () => fileIn.click() }, [icon('upload'), 'Import the music']),
      ]),
    ])];
  });
}

async function battle(f, songId) {
  const song = await getSong(songId);
  if (!song) { toast('Couldn’t load the music. Try importing it again.', 'bad'); return; }
  const hands = song.hands.R && song.hands.L ? 'both' : song.hands.R ? 'R' : 'L';
  playSong(song, {
    hands, mode: 'timed', tempo: 1, title: song.title, subtitle: `Special boss · ${f.name}`,
    exam: { pass: 0.75, name: f.name },
    onFinish: (r) => {
      if (!r.passed) return;
      st()[f.key].wins = (st()[f.key].wins || 0) + 1;
      saveState();
      track('bosses');
      if (bossRewardAvailable(f.id)) { earn(f.bounty, `${f.short} defeated`); markBossRewarded(f.id); }
      if (!owns(f.reward)) { grantItem(f.reward); toast(`Exclusive unlocked: ${f.rewardName}! ${f.rewardHint}`, 'ok'); }
    },
  });
}
