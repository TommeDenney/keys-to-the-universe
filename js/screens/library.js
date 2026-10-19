// "Songs" tab: built-in library + imported sheet music.

import { h, icon, starsHTML, toast, coverGradient } from '../ui.js';
import { builtinSongs } from '../data/songs.js';
import { catalogPieces } from '../data/catalog.js';
import { songUnlocked, unlockCondition } from '../unlocks.js';
import { songPrice, IMPORT_COST } from '../data/shop.js';
import { spend, balance, buySong, SYMBOL, walletPill } from '../economy.js';
import { library, progress } from '../store.js';
import { importFile } from '../music/importer.js';
import { practicePlan } from '../music/song.js';
import { excerpt, snippetSVG, loadSnippets } from '../render/snippet.js';

const LEVELS = ['All', 'Beginner', 'Easy', 'Intermediate', 'Advanced', 'Professional'];
const levelName = (l, grade) => {
  if (grade) return grade <= 2 ? 'Beginner' : grade <= 4 ? 'Easy' : grade <= 6 ? 'Intermediate' : grade <= 8 ? 'Advanced' : 'Professional';
  return l <= 1 ? 'Beginner' : l <= 2 ? 'Easy' : l <= 3 ? 'Easy+' : 'Intermediate';
};

export const SOURCES = [
  { name: 'MuseScore', url: 'https://musescore.com/sheetmusic/beginner/piano', fmt: 'MusicXML', note: 'Huge community library. On a score page choose Download → MusicXML (free account; some scores are Pro-only).' },
  { name: '8notes', url: 'https://www.8notes.com/piano/sheet_music/?difficulty=1', fmt: 'MIDI', note: 'Beginner arrangements. Many pieces include a MIDI download next to the PDF.' },
  { name: 'G Major Music Theory', url: 'https://www.gmajormusictheory.org/', fmt: 'MIDI', note: 'Free PDFs, MIDI files and slow MP3s sorted by level. Grab the MIDI.' },
  { name: 'Mutopia Project', url: 'https://www.mutopiaproject.org/', fmt: 'MIDI', note: 'Public-domain classical pieces with MIDI downloads.' },
  { name: 'Making Music Fun', url: 'https://www.makingmusicfun.net/htm/printit_piano_sheet_music_index', fmt: 'PDF', note: 'Lovely level-based printables (PDF). Play from paper, or convert to MusicXML.' },
  { name: 'Hoffman Academy', url: 'https://www.hoffmanacademy.com/', fmt: 'PDF', note: 'Early-elementary printables (PDF).' },
  { name: 'IMSLP', url: 'https://imslp.org/', fmt: 'PDF', note: 'The biggest public-domain score library. Mostly PDF; some MIDI/MusicXML.' },
];

let filter = { q: '', level: 'All', src: 'all' };
let SNIPS = {};
const liveSnips = new Map(); // imports and personal songs, worked out on this device
function snippetFor(s) {
  if (SNIPS[s.id] !== undefined) return SNIPS[s.id];
  if (!liveSnips.has(s.id)) { let ex = null; try { ex = Array.isArray(s.notes) ? excerpt(s) : null; } catch { /* odd file */ } liveSnips.set(s.id, ex); }
  return liveSnips.get(s.id);
}

export async function renderLibrary(root) {
  const [imports, snips] = await Promise.all([library.all(), loadSnippets()]);
  SNIPS = snips;
  const builtins = builtinSongs();
  const page = h('div', { class: 'page library' });
  root.append(page);

  const fileInput = h('input', { type: 'file', class: 'hidden', multiple: true, onchange: (e) => doImport([...e.target.files]) });

  async function doImport(files) {
    // Importing your own music costs Stardust (per file).
    const cost = IMPORT_COST * files.length;
    if (!spend(cost)) { toast(`Importing costs ${IMPORT_COST} ${SYMBOL} per file. You need ${cost - balance()} more. Keep playing to earn Stardust!`, 'bad'); return; }
    for (const f of files) {
      try {
        const song = await importFile(f);
        const id = `imp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        song.id = id;
        await library.put({ id, title: song.title, composer: song.composer, fileName: f.name, createdAt: Date.now(), song });
        toast(`Imported “${song.title}”`, 'ok');
        if (files.length === 1) { location.hash = `#/song/${id}`; return; }
      } catch (err) {
        toast(`${f.name}: ${err.message}`, 'bad');
      }
    }
    root.replaceChildren();
    renderLibrary(root);
  }

  const grid = h('div', { class: 'song-grid' });
  const draw = () => {
    grid.replaceChildren();
    const q = filter.q.toLowerCase();
    const items = [
      ...(filter.src === 'builtin' ? [] : imports.map((r) => ({ ...r.song, id: r.id, imported: true }))),
      ...(filter.src === 'mine' ? [] : builtins.filter((b) => !b.id.startsWith('boss-'))),
      ...(filter.src === 'mine' ? [] : catalogPieces().map((p) => ({ ...p, tags: p.skills || [], piece: true }))),
    ].filter((s) => (!q || `${s.title} ${s.composer} ${(s.tags || []).join(' ')}`.toLowerCase().includes(q))
      && (filter.level === 'All' || s.imported || levelName(s.level, s.grade).startsWith(filter.level)));
    if (!items.length) grid.append(h('p', { class: 'muted empty' }, filter.src === 'mine' ? 'No imported music yet. Tap “Import sheet music” to add MusicXML or MIDI files.' : 'No songs match.'));
    for (const s of items) grid.append(songCard(s));
  };

  page.append(
    h('header', { class: 'top' }, [h('div', {}, [h('div', { class: 'eyebrow' }, 'Library'), h('h1', {}, 'Songs')]), walletPill('big')]),
    h('section', { class: 'import-card' }, [
      h('div', { class: 'import-icon' }, icon('upload')),
      h('div', { class: 'grow' }, [
        h('h3', {}, 'Import sheet music'),
        h('p', {}, `Add MusicXML (.musicxml, .xml, .mxl) or MIDI (.mid) files. The app reads the notes, splits them into hands and sections, and builds a practice plan. Costs ${IMPORT_COST} ${SYMBOL} per file.`),
        h('p', { class: 'muted small' }, 'Only import music you have the right to use (public domain, your own, or licensed to you). Imports stay on this device and are never uploaded.'),
      ]),
      h('button', { class: 'btn primary', onclick: () => fileInput.click() }, [icon('upload'), 'Import']),
      fileInput,
    ]),
    h('div', { class: 'filters' }, [
      h('label', { class: 'search' }, [icon('search'), h('input', { type: 'search', placeholder: 'Search songs', value: filter.q, oninput: (e) => { filter.q = e.target.value; draw(); } })]),
      h('div', { class: 'seg' }, [['all', 'All'], ['builtin', 'Built-in'], ['mine', `My music${imports.length ? ` (${imports.length})` : ''}`]].map(([v, l]) =>
        h('button', { class: filter.src === v ? 'on' : '', onclick: (e) => { filter.src = v; e.target.parentNode.querySelectorAll('button').forEach((b) => b.classList.remove('on')); e.target.classList.add('on'); draw(); } }, l))),
      h('div', { class: 'chips' }, LEVELS.map((l) => h('button', { class: `chip ${filter.level === l ? 'on' : ''}`, onclick: (e) => { filter.level = l; e.target.parentNode.querySelectorAll('.chip').forEach((b) => b.classList.remove('on')); e.target.classList.add('on'); draw(); } }, l))),
    ]),
    grid,
    sourcesSection(),
  );
  draw();
}

function songCard(s) {
  const recs = progress.songSteps(s.id);
  let pct = 0;
  if (s.piece) {
    pct = Math.min(100, Math.round((Object.values(recs).reduce((a, b) => a + b, 0) / 50) * 100));
  } else {
    const plan = practicePlan(s);
    const best = plan.reduce((a, p) => a + (recs[p.key] || 0), 0);
    pct = Math.round((best / (plan.length * 5)) * 100);
  }
  const locked = !s.imported && !songUnlocked(s.id);
  const card = h('a', { class: `song-card ${locked ? 'locked' : ''}`, href: `#/song/${s.id}` }, [
    h('div', { class: 'cover has-snip', style: { '--accent': coverGradient(s.id + s.title) } }, [
      h('div', { class: 'cover-snip', html: snippetSVG(snippetFor(s), s.id) }),
      locked ? h('span', { class: 'price-tag' }, [icon('lock'), ` ${songPrice(s).toLocaleString('en-US')} ${SYMBOL}`]) : null,
      s.imported ? h('span', { class: 'tag light' }, 'Imported') : h('span', { class: 'tag light' }, s.grade ? (locked ? `Grade ${s.grade}` : `Grade ${s.grade} \u00b7 ${levelName(0, s.grade)}`) : levelName(s.level)),
    ]),
    h('div', { class: 'meta' }, [
      h('b', {}, s.title),
      h('span', {}, s.composer || 'Unknown composer'),
      locked ? h('small', { class: 'unlock-cond' }, unlockCondition(s.id) || 'Not on the Learn path: unlock it with Stardust') : h('div', { class: 'progress-line' }, h('i', { style: { width: `${pct}%` } })),
      locked ? buyNow(s, () => card.replaceWith(songCard(s))) : null,
    ]),
  ]);
  return card;
}

/** "Buy now" on a locked song card: tap once to see the price confirm, tap again to buy. */
function buyNow(s, done) {
  const price = songPrice(s);
  let armed = 0;
  const label = () => [`Buy now \u00b7 ${price.toLocaleString('en-US')} ${SYMBOL}`];
  const btn = h('button', { class: 'btn primary sm buy-now', onclick: (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!armed) {
      if (balance() < price) { toast(`You need ${(price - balance()).toLocaleString('en-US')} more ${SYMBOL}. Complete lessons and challenges to earn more!`, 'bad'); return; }
      btn.classList.add('armed'); btn.replaceChildren(`Tap again to spend ${price.toLocaleString('en-US')} ${SYMBOL}`);
      armed = setTimeout(() => { armed = 0; btn.classList.remove('armed'); btn.replaceChildren(...label()); }, 3500);
      return;
    }
    clearTimeout(armed); armed = 0;
    if (!buySong(s.id, price)) { toast(`You need ${(price - balance()).toLocaleString('en-US')} more ${SYMBOL}.`, 'bad'); return; }
    toast(`${s.title} unlocked!`, 'ok');
    done();
  } }, label());
  return btn;
}

function sourcesSection() {
  return h('section', { class: 'sources' }, [
    h('h2', {}, 'Find free sheet music'),
    h('p', { class: 'muted' }, 'Download MusicXML or MIDI files from these sites, then import them above. Files stay on this device. Look for the format badge: MusicXML and MIDI import directly; PDF needs converting first.'),
    h('div', { class: 'source-list' }, SOURCES.map((s) => h('a', { class: 'source', href: s.url, target: '_blank', rel: 'noopener' }, [
      h('div', { class: 'grow' }, [h('b', {}, s.name), h('span', {}, s.note)]),
      h('span', { class: `fmt fmt-${s.fmt.toLowerCase()}` }, s.fmt),
      icon('link'),
    ]))),
    h('details', { class: 'pdf-help' }, [
      h('summary', {}, 'Converting PDFs'),
      h('p', {}, 'A PDF is a picture of the music, so the notes have to be recognised first (“optical music recognition”). Free options: open the PDF in MuseScore Studio’s PDF import, or use Audiveris, then export as MusicXML and import it here. Clean, simple scores convert best. Check the result before practising.'),
    ]),
  ]);
}
