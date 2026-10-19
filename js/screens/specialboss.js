// Special bosses: bonus battles that come from a personal pack (see js/personal.js).
// Each boss can live in a galaxy or roam as a rogue planet, uses a fallback song or
// music you import yourself (imports stay on the device), pays a weekly bounty and
// grants an exclusive Shop reward the first time you win.

import { h, icon, modal, toast } from '../ui.js';
import { getState, saveState, library } from '../store.js';
import { getSong } from '../data/catalog.js';
import { importFile } from '../music/importer.js';
import { playSong } from './songpage.js';
import { earn, owns, grantItem, SYMBOL } from '../economy.js';
import { bossRewardAvailable, markBossRewarded, track } from '../challenges.js';
import { personalBosses, personalArt } from '../personal.js';

/** The special bosses from your personal pack (none in the public app). */
export function specialBosses() {
  return personalBosses().map((b) => ({ ...b, match: b.match ? new RegExp(b.match, 'i') : null }));
}
const art = (f) => personalArt(f.art) || '<span class="sboss-glyph">\u2726</span>';

const st = () => {
  const s = getState();
  if (s.divinae && !s.sboss) { s.sboss = s.divinae; delete s.divinae; } // carry over wins saved before the rename
  s.sboss ||= {};
  s.sboss.forms ||= {};
  for (const f of personalBosses()) s.sboss.forms[f.key] ||= { songId: null, wins: 0 };
  return s.sboss.forms;
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
  const auto = f.match && imports.find((r) => f.match.test(r.title || '') || f.match.test(r.fileName || ''));
  if (auto) return { id: auto.id, title: auto.title, imported: true, auto: true };
  return f.fallback ? { id: f.fallback, title: f.fallbackName, imported: false } : null;
}

export function specialBossEl(f) {
  const won = formDefeated(f);
  return h('div', { class: `sboss ${f.ascended ? 'ascended' : ''} ${won ? 'done' : ''}` }, [
    h('button', { class: 'sboss-orb', 'aria-label': `Special boss: ${f.name}`, onclick: () => openSpecialBoss(f) }, [
      h('i', { class: 'aura' }), h('i', { class: 'core', html: art(f) }),
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

export async function openSpecialBoss(f) {
  const song = await resolveSong(f);
  const imports = await library.all();
  modal((close) => {
    const reopen = () => { close(); openSpecialBoss(f); };
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
    return [h('div', { class: `sboss-modal ${f.ascended ? 'ascended' : ''}` }, [
      h('div', { class: 'sboss-emblem' }, [h('i'), h('span', { class: 'emblem-art', html: art(f) })]),
      h('div', { class: 'eyebrow' }, `Special boss · ${f.level}`),
      h('h2', {}, `${f.name} challenges you!`),
      h('p', {}, `Score 75% with the beat at full speed to win her bounty (${f.bounty} ${SYMBOL}, weekly) and the exclusive ${f.rewardName}.`),
      song
        ? h('div', { class: 'sboss-linked' }, [icon('note'), h('span', {}, ['Battle music: ', h('b', {}, song.title), song.auto ? ' (found in your imports)' : ''])])
        : h('div', { class: 'sboss-need' }, [h('p', {}, `Import your “(${f.level})” arrangement${f.songName ? ` of “${f.songName}”` : ''} to unlock this battle. It stays on this device only.`)]),
      h('details', { class: 'sboss-need' }, [
        h('summary', {}, 'Choose different music'),
        imports.length ? h('div', { class: 'sboss-pick' }, [h('small', {}, 'Use something you imported:'), ...imports.slice(0, 8).map((r) => h('button', { class: 'chip-btn', onclick: () => choose(r.id) }, r.title))]) : null,
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
