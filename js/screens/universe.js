// "Learn" tab, Universe layout.
//   Universe = the whole course · Galaxies = units · Solar systems = groups of
//   lessons around a "sun" (the idea being learned) · Planets = concept lessons
//   · Moons = song/practice lessons orbiting the planet that taught them.
// An animated cosmos canvas sits behind; its stars and colours follow the
// galaxy and solar system you're looking at.

import { h, icon, starsHTML } from '../ui.js';
import { COURSE, allLessons } from '../data/course.js';
import { progress } from '../store.js';
import { lessonUnlocked, nextLesson, galaxyStars, starGate } from './learn.js';
import { installCard, fullscreenButton } from './install.js';
import { worldTextures, WORLD_KINDS } from '../render/worlds.js';
import { songNow, pieceMeta } from '../data/catalog.js';
import { equipped, walletPill } from '../economy.js';
import { shipSVG as skinSVG } from '../render/ships.js';
import { challengesCard, openQuest } from './challenges.js';
import { QUESTS } from '../data/quests.js';
import { questDone } from '../economy.js';
import { divinaeEl, FORMS as DIVINAE_FORMS } from './divinae.js';
import { constellationsFor, constellationEl } from '../constellations.js';
import { navFocus } from '../nav.js';

// Moons currently on screen, animated by the cosmos loop (3D-ish orbits that pass behind their planet).
let ORBITS = [];

// ---- Galaxy identities ------------------------------------------------------

const GALAXIES = {
  u1: { name: 'Primera', style: 'twinkle', top: '#0B0B2B', bottom: '#1A1550', neb: ['#5B6CFF', '#9B7BFF', '#3BC9FF'], star: '#FFFFFF' },
  u2: { name: 'Divine', style: 'sparkle', top: '#120A2E', bottom: '#2A1259', neb: ['#8B5CF6', '#EC4899', '#6366F1'], star: '#F3E8FF' },
  u3: { name: 'Octavia', style: 'bokeh', top: '#1B0A26', bottom: '#3D0F45', neb: ['#EC4899', '#F472B6', '#A855F7'], star: '#FFE4F1' },
  u4: { name: 'Basso Spiral', style: 'embers', top: '#1A0C08', bottom: '#3B1608', neb: ['#F97316', '#EF4444', '#F59E0B'], star: '#FFD7A8' },
  u5: { name: 'Gemini Cluster', style: 'twins', top: '#06141F', bottom: '#0B2E2A', neb: ['#10B981', '#3B82F6', '#22D3EE'], star: '#E0FFF6' },
  u6: { name: 'Chroma Nebula', style: 'aurora', top: '#04121F', bottom: '#082640', neb: ['#0EA5E9', '#22D3EE', '#6366F1'], star: '#DDF6FF' },
  u7: { name: 'Triad Crown', style: 'constellations', top: '#14100A', bottom: '#2E2208', neb: ['#EAB308', '#F59E0B', '#FDE68A'], star: '#FFF5CC' },
  u9: { name: 'Cathedral', style: 'rays', top: '#120826', bottom: '#2B0F4F', neb: ['#7C3AED', '#C084FC', '#F0ABFC'], star: '#F5E8FF' },
  u8: { name: 'Old Light', style: 'motes', top: '#1A070C', bottom: '#3A0D18', neb: ['#E11D48', '#FB7185', '#F97316'], star: '#FFE1E6' },
  // Graded repertoire galaxies
  g1: { name: 'Verdant Reach', style: 'twinkle', top: '#061A12', bottom: '#0B3324', neb: ['#22C55E', '#84CC16', '#10B981'], star: '#E8FFF0' },
  g2: { name: 'Tidal Arc', style: 'bokeh', top: '#04161C', bottom: '#073340', neb: ['#06B6D4', '#22D3EE', '#0EA5E9'], star: '#E0FBFF' },
  g3: { name: 'Sapphire Veil', style: 'sparkle', top: '#060E26', bottom: '#0B1F52', neb: ['#3B82F6', '#6366F1', '#38BDF8'], star: '#E6EEFF' },
  g4: { name: 'Story Nebula', style: 'constellations', top: '#0C0A26', bottom: '#1C1650', neb: ['#6366F1', '#A78BFA', '#818CF8'], star: '#EDE9FF' },
  g5: { name: 'Clockwork Spiral', style: 'twins', top: '#120A26', bottom: '#28124F', neb: ['#8B5CF6', '#C084FC', '#6366F1'], star: '#F3E8FF' },
  g6: { name: 'Velvet Dusk', style: 'aurora', top: '#1A0820', bottom: '#3A0F45', neb: ['#D946EF', '#F472B6', '#A855F7'], star: '#FFE8FB' },
  g7: { name: 'Syncopa', style: 'embers', top: '#1E0710', bottom: '#40101F', neb: ['#F43F5E', '#FB7185', '#F97316'], star: '#FFE4E8' },
  g8: { name: 'Recital Rings', style: 'rays', top: '#1C0E06', bottom: '#3D1E0A', neb: ['#F97316', '#FDBA74', '#F43F5E'], star: '#FFF0E0' },
  g9: { name: 'Virtuoso Expanse', style: 'motes', top: '#1A1404', bottom: '#3A2C08', neb: ['#EAB308', '#F59E0B', '#FDE047'], star: '#FFF8D6' },
  g10: { name: 'Crown of Stars', style: 'sparkle', top: '#141008', bottom: '#2E2410', neb: ['#FACC15', '#FDE68A', '#F59E0B'], star: '#FFFBEA' },
};
const galaxyOf = (unit) => GALAXIES[unit.id] || GALAXIES.u1;
export const galaxyName = (unit) => `${galaxyOf(unit).name} Galaxy`;
export const planetName = (id) => bodyName(id, false);

// ---- Deterministic fictional names / looks ---------------------------------

function hash(str) {
  let x = 2166136261;
  for (const c of str) x = Math.imul(x ^ c.charCodeAt(0), 16777619) >>> 0;
  return x;
}
const SYL = ['ka', 'lo', 'vi', 'ze', 'ru', 'mi', 'so', 'ta', 'ny', 'or', 'el', 'qua', 'xi', 'pa', 'dor', 'ren', 'sol', 'lu', 've', 'ra', 'no', 'thi', 'an', 'cy', 'mo', 'ari'];
function bodyName(id, moon) {
  const x = hash(id);
  const n = moon ? 2 : 2 + (x % 2);
  let s = '';
  for (let i = 0; i < n; i++) s += SYL[(x >>> (i * 5)) % SYL.length];
  s = s[0].toUpperCase() + s.slice(1);
  const suffix = moon ? '' : ['', '', ' Prime', ' Minor', ' IV', ' b', ' Major', ' VII'][(x >>> 20) % 8];
  return s + suffix;
}
/** Every world's own personality: surface type, spin speed/direction, axial tilt, rings. */
function bodyLook(id, gal) {
  const x = hash(id + 'look');
  const y = hash(id + 'spin');
  const base = gal.neb[x % gal.neb.length];
  const kind = WORLD_KINDS[(x >>> 4) % WORLD_KINDS.length];
  return {
    kind, base,
    ring: (kind === 'gas' || kind === 'ice') && (y % 3) !== 0,
    tilt: (y % 50) - 25, // axial tilt, degrees
    spin: 22 + (y >>> 6) % 48, // seconds per rotation
    dir: (y >>> 12) % 5 === 0 ? 'reverse' : 'normal', // some worlds spin backwards
    cloudSpin: 0.55 + ((y >>> 16) % 30) / 100,
    size: 84 + (x >>> 20) % 6 * 10,
    lift: (y >>> 20) % 40, // vertical jitter so worlds don't line up
  };
}

/** Paint a world's surface only when it's about to be seen (100+ worlds stay fast). */
let painter = null;
function paintWhenVisible(el, paint) {
  if (!('IntersectionObserver' in window)) { paint(); return; }
  if (!painter) {
    painter = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        painter.unobserve(e.target);
        const fn = e.target._paint;
        e.target._paint = null;
        if (fn) fn();
      }
    }, { rootMargin: '600px 0px' });
  }
  el._paint = paint;
  painter.observe(el);
}

/** A textured, spinning sphere (planet or moon). */
function worldOrb(tag, attrs, id, look, kind) {
  const surface = h('i', { class: 'tex', style: { '--spin': `${look.spin}s`, '--dir': look.dir } });
  const clouds = kind === 'terran' || kind === 'ocean' ? h('i', { class: 'tex clouds', style: { '--spin': `${(look.spin * look.cloudSpin).toFixed(1)}s`, '--dir': look.dir } }) : null;
  const orb = h(tag, attrs, [
    h('i', { class: 'tiltw', style: { '--tilt': `${look.tilt}deg` } }, [surface, clouds]),
    h('i', { class: `shade ${kind === 'terran' || kind === 'ocean' ? 'atmo' : ''}` }),
  ]);
  paintWhenVisible(orb, () => {
    const tex = worldTextures(hash(id + 'tex'), kind, look.base);
    surface.style.backgroundImage = `url(${tex.surface})`;
    if (clouds && tex.clouds) clouds.style.backgroundImage = `url(${tex.clouds})`;
  });
  return orb;
}

// ---- Course → universe structure -------------------------------------------

/** Planets are concept lessons; pure practice (no "learn" cards) becomes a moon of the previous planet. */
function buildSystems(unit) {
  const planets = [];
  for (const l of unit.lessons) {
    if (l.boss) continue;
    const practiceOnly = !l.steps.some((s) => s.t === 'learn');
    const host = planets[planets.length - 1];
    if (practiceOnly && host && host.moons.length < 3) host.moons.push(l);
    else planets.push({ lesson: l, moons: [] });
  }
  // Group planets into solar systems of up to 4.
  const systems = [];
  for (let i = 0; i < planets.length; i += 4) systems.push(planets.slice(i, i + 4));
  return systems.map((ps, k) => ({
    planets: ps,
    name: k === 0 ? `${unit.title} System` : `${ps[0].lesson.title} System`,
  }));
}

// ---- Rendering ----------------------------------------------------------------

export function renderUniverse(root) {
  ORBITS = [];
  const lessons = allLessons();
  const done = lessons.filter((l) => progress.lesson(l.id)).length;
  const next = nextLesson();
  const canvas = h('div', { class: 'cosmos', 'aria-hidden': 'true' });
  const page = h('div', { class: 'page uni-page' });
  const wrap = h('div', { class: 'universe' }, [canvas, page]);
  root.append(wrap);
  document.body.classList.add('in-universe');

  page.append(h('header', { class: 'top uni-top' }, [
    h('div', {}, [h('div', { class: 'eyebrow' }, 'The Ivory Universe'), h('h1', { class: 'brand' }, ['Ivory', h('span', { class: 'dot' })])]),
    h('div', { class: 'pills' }, [
      h('div', { class: 'pill flame', title: 'Day streak' }, [icon('flame'), h('b', {}, String(progress.streak))]),
      h('div', { class: 'pill stars-pill', title: 'Stars' }, [icon('star'), h('b', {}, String(progress.totalStars))]),
      walletPill(),
      h('a', { class: 'pill hb-pill', href: '#/handbook', title: 'Handbook: every lesson explanation' }, [icon('book'), h('b', {}, 'Handbook')]),
      fullscreenButton(),
    ]),
  ]));
  const inst = installCard();
  if (inst) page.append(inst);

  // Next destination card.
  if (next) {
    const gal = galaxyOf(next.unit);
    page.append(h('section', { class: 'uni-next' }, [
      h('div', { class: 'uni-next-ship', html: shipSVG() }),
      h('div', { class: 'grow' }, [
        h('div', { class: 'eyebrow' }, done === 0 ? 'Your journey begins' : `Next destination · ${gal.name} Galaxy`),
        h('h2', {}, `${bodyName(next.id, false)}: ${next.title}`),
        h('p', {}, done === 0 ? 'Every musician starts with one note. Launch to the first planet and meet Middle C.' : `${done} of ${lessons.length} worlds visited. Keep exploring!`),
      ]),
      h('button', { class: 'btn primary big', onclick: () => flyTo(page) }, [icon('play'), done === 0 ? 'Launch' : 'Fly there']),
    ]));
  } else if (starGate()) {
    const gate = starGate();
    page.append(h('section', { class: 'uni-next gate-card' }, [
      h('div', { class: 'uni-next-ship', html: shipSVG() }),
      h('div', { class: 'grow' }, [
        h('div', { class: 'eyebrow' }, 'Star gate'),
        h('h2', {}, `Collect ${gate.missing} more \u2605 in the ${galaxyOf(gate.from).name} Galaxy`),
        h('p', {}, `The way to the ${galaxyOf(gate.to).name} Galaxy opens at ${gate.needed}/${gate.max} stars (you have ${gate.total}). Replay worlds for more stars, or conquer a rogue planet for a +3 bonus.`),
      ]),
    ]));
  } else {
    page.append(h('section', { class: 'uni-next' }, [h('div', { class: 'grow' }, [h('div', { class: 'eyebrow' }, 'Universe explored'), h('h2', {}, 'You visited every world!'), h('p', {}, 'Keep playing songs from the library, or import your own music.')])]));
  }

  page.append(challengesCard());

  const sections = [];
  COURSE.forEach((unit, gi) => {
    const gal = galaxyOf(unit);
    const uDone = unit.lessons.filter((l) => progress.lesson(l.id)).length;
    const sec = h('section', { class: 'galaxy', style: { '--g1': gal.neb[0], '--g2': gal.neb[1], '--g3': gal.neb[2] } });
    sec._gal = gal;
    // Personal constellations (imported privately on this device) shine in their galaxy.
    for (const c of constellationsFor(unit.id)) sec.append(constellationEl(c, () => { root.replaceChildren(); renderUniverse(root); }));
    sec.append(h('div', { class: 'galaxy-head' }, [
      h('div', { class: 'galaxy-emblem' }, [h('i'), h('i')]),
      h('div', { class: 'grow' }, [
        h('div', { class: 'eyebrow' }, `Galaxy ${gi + 1}`),
        h('h2', {}, `${gal.name} Galaxy`),
        h('p', {}, unit.subtitle),
      ]),
      (() => {
        const g = galaxyStars(unit);
        const ok = g.total >= g.needed;
        return h('div', { class: `galaxy-count ${ok ? 'gate-open' : ''}` }, [
          h('b', {}, `${uDone}/${unit.lessons.length}`), h('span', {}, 'worlds'),
          h('div', { class: 'gate' }, [h('i', { style: { width: `${Math.min(100, (g.total / g.max) * 100)}%` } }), h('em', { style: { left: `${(g.needed / g.max) * 100}%` } })]),
          h('small', {}, `\u2605 ${g.total}/${g.max}${g.bonus ? ` (incl. +${g.bonus} bonus)` : ''} \u00b7 ${ok ? 'next galaxy open' : `${g.needed} needed`}`),
        ]);
      })(),
    ]));
    buildSystems(unit).forEach((sys, si) => {
      const sysEl = h('div', { class: 'system' });
      sysEl._sys = si;
      const star = starType(`${unit.id}:${si}`);
      sysEl.append(h('div', { class: 'sun-wrap' }, [
        h('div', { class: `sun sun-${star.id}` }, star.parts()),
        h('div', { class: 'sun-label' }, [h('small', {}, `Solar system ${si + 1} \u00b7 ${star.name}`), h('b', {}, sys.name)]),
      ]));
      const track = h('div', { class: 'bodies' });
      const path = svgEl('svg', { class: 'route', 'aria-hidden': 'true' });
      track.append(path);
      sys.planets.forEach((p, pi) => track.append(planetEl(p, gal, pi, next)));
      sysEl.append(track);
      sec.append(sysEl);
    });
    const boss = unit.lessons.find((l) => l.boss);
    if (boss) sec.append(guardianEl(boss, gal, next));
    for (const f of DIVINAE_FORMS) if (unit.id === f.galaxy) sec.append(divinaeEl(f));
    page.append(sec);
    // Divinae, Ascended roams the void as a rogue-planet boss.
    for (const f of DIVINAE_FORMS) if (unit.id === f.rogueAfter) page.append(h('div', { class: 'rogue rogue-boss' }, [h('i', { class: 'rogue-trail' }), divinaeEl(f)]));
    // Rogue planets drift through the space between galaxies.
    for (const q of QUESTS.filter((x) => x.after === gi + 1)) page.append(roguePlanet(q, gal));
    sections.push(sec);
  });

  // Draw the travel routes once laid out (and on resize).
  const drawRoutes = () => page.querySelectorAll('.bodies').forEach(drawRoute);
  requestAnimationFrame(() => {
    drawRoutes();
    const cur = page.querySelector('.planet.current, .moon-chip.current');
    if (cur && done > 0) cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
  const ro = new ResizeObserver(drawRoutes);
  ro.observe(page);

  const cosmos = new Cosmos(canvas, root, sections);
  return () => {
    cosmos.destroy();
    ro.disconnect();
    document.body.classList.remove('in-universe');
  };
}

function planetEl(p, gal, index, next) {
  const l = p.lesson;
  const rec = progress.lesson(l.id);
  const open = lessonUnlocked(l.id);
  const isNext = next && next.id === l.id;
  const look = bodyLook(l.id, gal);
  const size = look.size;
  const side = index % 2 === 0 ? -1 : 1;
  const fx = equipped('fx') || 'fx-check';
  const just = progress.justCompleted();
  const celebrate = rec && just && just.id === l.id && Date.now() - just.at < 120000;
  const el = h('div', {
    class: `planet ${rec ? 'done' : ''} ${open ? '' : 'locked'} ${isNext ? 'current' : ''} ${fx} ${!rec && fx === 'fx-restore' ? 'corrupt' : ''} ${celebrate ? 'celebrate' : ''}`,
    style: { '--off': `${side * (60 + (hash(l.id) % 4) * 28)}px`, '--size': `${size}px`, '--base': look.base, '--lift': `${look.lift}px`, '--bob': `${5 + (hash(l.id) % 5)}s` },
  });
  const orb = worldOrb(open ? 'a' : 'div', { class: 'orb', href: open ? `#/lesson/${l.id}` : null, 'aria-label': `${bodyName(l.id)}: ${l.title}` }, l.id, look, look.kind);
  if (!open) orb.append(h('span', { class: 'lock' }, icon('lock')));
  if (rec && fx === 'fx-check') orb.append(h('span', { class: 'flag' }, icon('check')));
  if (!rec && fx === 'fx-restore') orb.append(h('i', { class: 'corruption' }));
  if (celebrate) setTimeout(() => progress.clearJustCompleted(), 4000);
  const body = h('div', { class: 'planet-body' }, [
    rec && fx !== 'fx-check' ? h('i', { class: 'fx-layer' }, fx === 'fx-bloom' ? Array.from({ length: 6 }, (_, i) => h('i', { class: 'bloom', style: { '--a': `${i * 60}deg` } })) : fx === 'fx-galaxy' ? [h('i', { class: 'spiral' }), h('i', { class: 'spiral s2' })] : fx === 'fx-notes' ? [h('i', { class: 'note-ring', html: '<span>\u266A</span><span>\u266B</span><span>\u2669</span><span>\u266C</span>' })] : fx === 'fx-heavenly' ? [h('i', { class: 'halo' }), h('i', { class: 'rays' }), h('i', { class: 'cloud c1' }), h('i', { class: 'cloud c2' })] : fx === 'fx-supernova' ? [h('i', { class: 'nova-ring' }), h('i', { class: 'nova-ring r2' })] : [h('i', { class: 'healed' })]) : null,
    celebrate ? h('i', { class: 'celebration' }, Array.from({ length: 18 }, (_, i) => h('i', { style: { '--a': `${i * 20}deg`, '--d': `${60 + (i % 3) * 25}px` } }))) : null,
    look.ring ? h('i', { class: 'p-ring ring-back', style: { '--rt': `${look.tilt - 12}deg` } }) : null,
    orb,
    look.ring ? h('i', { class: 'p-ring ring-front', style: { '--rt': `${look.tilt - 12}deg` } }) : null,
  ]);
  // Moons: each on its own tilted, elliptical orbit, passing behind the planet.
  p.moons.forEach((m, mi) => {
    const mOpen = lessonUnlocked(m.id);
    const mx = hash(m.id + 'orbit');
    const mLook = { ...bodyLook(m.id, gal), tilt: 0, spin: 14 + (mx % 20) };
    const orbit = {
      r: size / 2 + 22 + mi * 20 + (mx % 10),
      k: 0.28 + ((mx >>> 4) % 30) / 100, // how "edge-on" the orbit looks
      tilt: (((mx >>> 9) % 50) - 25) * (Math.PI / 180),
      period: 9 + ((mx >>> 14) % 14) + mi * 4, // seconds per orbit
      dir: (mx >>> 19) % 3 === 0 ? -1 : 1,
      phase: ((mx >>> 21) % 628) / 100,
      size: 18 + (mx % 3) * 4,
    };
    body.append(h('i', { class: 'moon-path', style: { width: `${orbit.r * 2}px`, height: `${orbit.r * 2 * orbit.k}px`, transform: `translate(-50%, -50%) rotate(${orbit.tilt}rad)` } }));
    const moon = worldOrb(mOpen ? 'a' : 'span', {
      class: `moon3d ${progress.lesson(m.id) ? 'done' : ''} ${mOpen ? '' : 'locked'}`,
      href: mOpen ? `#/lesson/${m.id}` : null, tabindex: '-1', 'data-nav-skip': '1', 'aria-hidden': 'true',
      style: { '--ms': `${orbit.size}px` },
    }, m.id, mLook, 'moon');
    body.append(moon);
    ORBITS.push({ el: moon, ...orbit });
  });
  if (isNext) body.append(h('div', { class: 'ship', html: shipSVG() }));
  el.append(body);
  el.append(h('div', { class: 'body-label' }, [
    h('small', {}, `Planet ${bodyName(l.id)}`),
    h('b', {}, l.title),
    rec ? h('span', { class: 'mini-stars', html: starsHTML(rec.stars) }) : null,
  ]));
  if (p.moons.length) {
    el.append(h('div', { class: 'moon-chips' }, p.moons.map((m) => {
      const mRec = progress.lesson(m.id);
      const mOpen = lessonUnlocked(m.id);
      const cur = next && next.id === m.id;
      return h(mOpen ? 'a' : 'span', { class: `moon-chip ${mRec ? 'done' : ''} ${mOpen ? '' : 'locked'} ${cur ? 'current' : ''}`, href: mOpen ? `#/lesson/${m.id}` : null }, [
        h('i', { class: 'moon-dot', style: { '--base': bodyLook(m.id, gal).base } }),
        h('span', {}, [h('small', {}, `Moon ${bodyName(m.id, true)}`), m.title]),
        mRec ? h('span', { class: 'mini-stars', html: starsHTML(mRec.stars) }) : mOpen ? null : icon('lock'),
      ]);
    })));
  }
  return el;
}

/** A rogue planet (side quest) drifting between galaxies. */
function roguePlanet(q, gal) {
  const look = { ...bodyLook(q.id, gal), tilt: 18, spin: 30 };
  const orb = worldOrb('button', { class: 'orb', 'aria-label': `Side quest: ${q.name}`, onclick: () => openQuest(q) }, q.id, look, q.kind);
  return h('div', { class: `rogue ${questDone(q.id) ? 'done' : ''}` }, [
    h('div', { class: 'rogue-body' }, [h('i', { class: 'rogue-trail' }), orb]),
    h('div', { class: 'body-label' }, [h('small', {}, 'Rogue planet \u00b7 side quest'), h('b', {}, q.name), h('span', { class: 'g-sub' }, questDone(q.id) ? 'Conquered \u2713' : `Reward ${q.reward} \u2726`)]),
  ]);
}

/** Every solar system gets its own kind of star. */
const STAR_TYPES = [
  { id: 'yellow', name: 'Yellow dwarf' },
  { id: 'redgiant', name: 'Red giant' },
  { id: 'bluegiant', name: 'Blue giant' },
  { id: 'whitedwarf', name: 'White dwarf' },
  { id: 'orange', name: 'Orange dwarf' },
  { id: 'binary', name: 'Binary stars' },
  { id: 'pulsar', name: 'Pulsar' },
  { id: 'magenta', name: 'Magenta star' },
  { id: 'proto', name: 'Protostar' },
  { id: 'emerald', name: 'Emerald star' },
  { id: 'aqua', name: 'Aqua star' },
  { id: 'prism', name: 'Prism star' },
  { id: 'void', name: 'Void star' },
  { id: 'rosegold', name: 'Rose-gold star' },
];
// A fixed rotation through all nine types: even spread, no neighbours alike.
const STAR_ORDER = [0, 9, 2, 12, 1, 5, 10, 3, 7, 13, 4, 11, 6, 8];
const starSeen = new Map();
function starType(key) {
  if (!starSeen.has(key)) starSeen.set(key, STAR_TYPES[STAR_ORDER[starSeen.size % STAR_ORDER.length]]);
  const t = starSeen.get(key);
  return {
    ...t,
    parts: () => t.id === 'binary'
      ? [h('i', { class: 'binary-orbit' }, [h('i', { class: 'core a' }), h('i', { class: 'core b' })])]
      : t.id === 'pulsar'
        ? [h('i', { class: 'beam' }), h('i', { class: 'beam b2' }), h('i', { class: 'core' })]
        : t.id === 'proto'
          ? [h('i', { class: 'disk' }), h('i', { class: 'core' })]
          : [h('i', { class: 'corona' }), h('i', { class: 'core' })],
  };
}

/** "Fly there": glide to your next world and make it call out (tap it to start). */
function flyTo(page) {
  const target = page.querySelector('.planet.current, .guardian.current, .moon-chip.current');
  if (!target) return;
  const host = target.classList.contains('moon-chip') ? target.closest('.planet') : target;
  host.scrollIntoView({ block: 'center', behavior: 'smooth' });
  // Piano navigation: the next C4 lands on this world.
  navFocus(target.classList.contains('moon-chip') ? target : host.querySelector('.orb, .guardian-orb') || host);
  host.classList.remove('arrive');
  setTimeout(() => { void host.offsetWidth; host.classList.add('arrive'); }, 500);
  setTimeout(() => host.classList.remove('arrive'), 3200);
}

/** The Guardian: a boss world at the edge of each galaxy. */
function guardianEl(l, gal, next) {
  const rec = progress.lesson(l.id);
  const open = lessonUnlocked(l.id);
  const isNext = next && next.id === l.id;
  const el = h('div', { class: `guardian ${rec ? 'done' : ''} ${open ? '' : 'locked'} ${isNext ? 'current' : ''}`, style: { '--g1': gal.neb[0], '--g2': gal.neb[1] } });
  el.append(h(open ? 'a' : 'div', { class: 'guardian-orb', href: open ? `#/lesson/${l.id}` : null, 'aria-label': `Boss battle: ${l.guardian}` }, [
    h('i', { class: 'disk' }), h('i', { class: 'disk d2' }), h('i', { class: 'core' }),
    h('span', { class: 'g-icon' }, rec ? '\u{1F3C6}' : open ? '\u2694' : ''),
    open ? null : h('span', { class: 'lock' }, icon('lock')),
  ]));
  if (isNext) el.append(h('div', { class: 'ship guardian-ship', html: shipSVG() }));
  el.append(h('div', { class: 'body-label' }, [
    h('small', {}, rec ? 'Guardian defeated' : 'Boss battle'),
    h('b', {}, l.guardian || 'The Guardian'),
    h('span', { class: 'g-sub' }, `Test: ${(songNow(l.song) || pieceMeta(l.song) || l).title.replace(/^Boss Battle: /, '')}`),
    rec ? h('span', { class: 'mini-stars', html: starsHTML(rec.stars) }) : null,
  ]));
  return el;
}

/** Move every moon along its orbit (called from the cosmos animation loop). */
function updateOrbits(t) {
  for (const o of ORBITS) {
    const th = o.phase + (o.dir * Math.PI * 2 * t) / o.period;
    const x = Math.cos(th) * o.r;
    const y = Math.sin(th) * o.r * o.k;
    const xr = x * Math.cos(o.tilt) - y * Math.sin(o.tilt);
    const yr = x * Math.sin(o.tilt) + y * Math.cos(o.tilt);
    const front = Math.sin(th) > 0;
    const sc = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(th)); // a touch bigger when closer
    o.el.style.transform = `translate(-50%, -50%) translate(${xr.toFixed(1)}px, ${yr.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    if (o.front !== front) {
      o.front = front;
      o.el.style.zIndex = front ? '4' : '0';
      o.el.classList.toggle('behind', !front);
    }
  }
}

function svgEl(tag, attrs) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/** Smooth dotted travel route through the planets of a system. */
function drawRoute(track) {
  const svg = track.querySelector('.route');
  const box = track.getBoundingClientRect();
  if (!box.width) return;
  const pts = [...track.querySelectorAll('.planet .orb')].map((o) => {
    const r = o.getBoundingClientRect();
    return [r.left + r.width / 2 - box.left, r.top + r.height / 2 - box.top];
  });
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  svg.setAttribute('width', box.width);
  svg.setAttribute('height', box.height);
  if (pts.length < 2) { svg.innerHTML = ''; return; }
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const my = (y0 + y1) / 2;
    d += ` C${x0},${my} ${x1},${my} ${x1},${y1}`;
  }
  const trail = equipped('trail') || 'trail-dots';
  const pathId = `rt${Math.random().toString(36).slice(2, 8)}`;
  const glyph = trail === 'trail-notes' ? '\u266A \u266B \u2669 ' : trail === 'trail-stars' ? '\u2726 ' : '';
  svg.setAttribute('class', `route ${trail}`);
  svg.innerHTML = `<path d="${d}" class="route-glow"/><path id="${pathId}" d="${d}" class="route-dash"/>${glyph ? `<text class="route-text"><textPath href="#${pathId}">${glyph.repeat(220)}</textPath></text>` : ''}`;
}

function shipSVG() {
  return skinSVG(equipped('ship'));
}

function oldShipSVG() {
  return `<svg viewBox="0 0 64 64" aria-hidden="true">
    <g class="ship-body">
      <path class="flame" d="M26 46 Q32 64 38 46 Z"/>
      <path d="M32 4 C44 14 46 30 42 44 L22 44 C18 30 20 14 32 4 Z" fill="#F5F4FB"/>
      <path d="M22 44 L14 52 L16 38 Z M42 44 L50 52 L48 38 Z" fill="#F04461"/>
      <circle cx="32" cy="22" r="6" fill="#3D7BFF" stroke="#1E1B3A" stroke-width="2"/>
      <path d="M32 4 C38 9 41 14 42 18 L22 18 C23 14 26 9 32 4 Z" fill="#F04461"/>
    </g></svg>`;
}

// ---- Animated cosmos background -------------------------------------------------

function hexToRgb(hx) {
  const v = parseInt(hx.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
const mix = (a, b, t) => a.map((x, i) => x + (b[i] - x) * t);
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/**
 * The cosmos background, built from GPU-composited layers so it animates at
 * the display's full refresh rate (120 Hz on ProMotion iPads):
 *  - a fixed backdrop: galaxy colours (smooth CSS colour transitions), drifting
 *    nebula clouds and a twinkling distant starfield;
 *  - each galaxy carries its own near-star layer in its style, scrolling
 *    natively with the planets (it can never lag behind them);
 *  - warp speed on fast scrolling and shooting stars are CSS animations.
 * Only the (slow) moon orbits are updated from script.
 */
class Cosmos {
  constructor(backdrop, scroller, sections) {
    this.backdrop = backdrop;
    this.scroller = scroller;
    this.sections = sections;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    backdrop.append(
      h('i', { class: 'neb n1' }), h('i', { class: 'neb n2' }), h('i', { class: 'neb n3' }),
      h('i', { class: 'far f1', style: { backgroundImage: `url(${starTile('far', 1)})` } }),
      h('i', { class: 'far f2', style: { backgroundImage: `url(${starTile('far', 2)})` } }),
      h('i', { class: 'warp-glow' }),
      h('i', { class: 'shooters' }),
    );
    // Near stars per galaxy, in that galaxy's style.
    for (const sec of sections) {
      const g = sec._gal;
      const layer = h('div', { class: `gstars st-${g.style}`, 'aria-hidden': 'true' }, [
        h('i', { class: 'gs a', style: { backgroundImage: `url(${starTile(g.style, 1, g)})` } }),
        h('i', { class: 'gs b', style: { backgroundImage: `url(${starTile(g.style, 2, g)})` } }),
        h('i', { class: 'gs streaks', style: { backgroundImage: `url(${starTile('streak', 3, g)})` } }),
        g.style === 'rays' ? h('i', { class: 'g-rays' }) : null,
        g.style === 'aurora' ? h('i', { class: 'g-aurora' }) : null,
      ]);
      sec.prepend(layer);
    }
    this.onScroll = () => this.scrolled();
    scroller.addEventListener('scroll', this.onScroll, { passive: true });
    this.lastY = scroller.scrollTop;
    this.lastT = performance.now();
    this.scrolled();
    if (!this.reduced) this.shootTimer = setInterval(() => this.shoot(), 4000);
    this.t0 = performance.now();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  /** Which galaxy is in view → backdrop colours; scroll speed → warp. */
  scrolled() {
    const mid = window.innerHeight * 0.45;
    let gal = this.sections[0] && this.sections[0]._gal;
    let sys = 0;
    for (const sec of this.sections) {
      if (sec.getBoundingClientRect().top <= mid) {
        gal = sec._gal;
        sec.querySelectorAll('.system').forEach((s) => { if (s.getBoundingClientRect().top <= mid) sys = s._sys; });
      }
    }
    if (gal && (gal !== this.gal || sys !== this.sys)) {
      this.gal = gal;
      this.sys = sys;
      const k = sys % gal.neb.length;
      const st = this.backdrop.style;
      st.setProperty('--c-top', gal.top);
      st.setProperty('--c-bottom', gal.bottom);
      st.setProperty('--c-n1', gal.neb[k]);
      st.setProperty('--c-n2', gal.neb[(k + 1) % gal.neb.length]);
      st.setProperty('--c-n3', gal.neb[(k + 2) % gal.neb.length]);
      st.setProperty('--c-star', gal.star);
    }
    // Warp: fast scrolling stretches stars into light trails (CSS transitions do the motion).
    const now = performance.now();
    const y = this.scroller.scrollTop;
    const v = Math.abs(y - this.lastY) / Math.max(1, now - this.lastT) * 1000; // px/s
    this.lastY = y;
    this.lastT = now;
    if (!this.reduced && v > 2200) {
      document.body.classList.add('warping');
      document.body.classList.toggle('warp-up', y < this.lastWarpY);
      this.lastWarpY = y;
      clearTimeout(this.warpOff);
      this.warpOff = setTimeout(() => document.body.classList.remove('warping', 'warp-up'), 180);
    }
  }

  shoot() {
    if (document.hidden || Math.random() < 0.35) return;
    const s = h('i', { class: 'shooting', style: { left: `${30 + Math.random() * 70}%`, top: `${Math.random() * 45}%` } });
    this.backdrop.querySelector('.shooters').append(s);
    setTimeout(() => s.remove(), 1600);
  }

  frame(now) {
    if (this.dead) return;
    const t = (now - this.t0) / 1000;
    if (!this.reduced) updateOrbits(t);
    else if (!this.placed) { updateOrbits(0); this.placed = true; }
    this.raf = requestAnimationFrame((tt) => this.frame(tt));
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    clearInterval(this.shootTimer);
    clearTimeout(this.warpOff);
    document.body.classList.remove('warping', 'warp-up');
    this.scroller.removeEventListener('scroll', this.onScroll);
  }
}

// ---- Star tiles: painted once per style, then repeated by the GPU ------------
const tileCache = new Map();
function starTile(style, variant, gal) {
  const key = `${style}:${variant}:${gal ? gal.name : ''}`;
  if (tileCache.has(key)) return tileCache.get(key);
  const S = 512; // CSS px; drawn at 2x for Retina
  const cv = document.createElement('canvas');
  cv.width = cv.height = S * 2;
  const ctx = cv.getContext('2d');
  ctx.scale(2, 2);
  let seed = hash(key);
  const R = () => ((seed = Math.imul(seed ^ (seed >>> 15), 2246822507) >>> 0) / 4294967296);
  const col = gal ? gal.star : '#FFFFFF';
  const neb = gal ? gal.neb : ['#FFFFFF'];
  const dot = (x, y, r, c, a) => {
    for (const dx of [0, -S, S]) for (const dy of [0, -S, S]) { // wrap so the tile repeats seamlessly
      ctx.globalAlpha = a;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const sparkle = (x, y, r, c, a) => {
    ctx.globalAlpha = a;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(x, y - r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y); ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  };
  const glow = (x, y, r, c, a) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  if (style === 'far') {
    for (let i = 0; i < (variant === 1 ? 140 : 70); i++) dot(R() * S, R() * S, 0.4 + R() * (variant === 1 ? 0.7 : 1.1), '#FFFFFF', 0.35 + R() * 0.5);
  } else if (style === 'streak') {
    ctx.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      const x = R() * S; const y = R() * S; const len = 40 + R() * 140;
      const g = ctx.createLinearGradient(x, y, x, y + len);
      g.addColorStop(0, col); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 0.5 + R() * 0.5; ctx.strokeStyle = g; ctx.lineWidth = 0.8 + R() * 1.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + len); ctx.stroke();
    }
  } else {
    const n = variant === 1 ? 70 : 34;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = R() * S; const y = R() * S; const z = R();
      pts.push([x, y, z]);
      if (style === 'sparkle' || style === 'rays' || style === 'constellations') {
        if (z > 0.72) { sparkle(x, y, 3 + z * 6, col, 0.9); glow(x, y, 10 + z * 10, col, 0.25); } else dot(x, y, 0.7 + z * 1.4, col, 0.8);
      } else if (style === 'bokeh') {
        if (z > 0.75) glow(x, y, 10 + z * 18, neb[i % neb.length], 0.35); else dot(x, y, 0.7 + z * 1.4, col, 0.85);
      } else if (style === 'embers') {
        dot(x, y, 0.8 + z * 2, ['#FFB45C', '#FF7A3D', '#FFD58A'][i % 3], 0.85); glow(x, y, 6 + z * 6, '#FF8A3D', 0.25);
      } else if (style === 'motes') {
        dot(x, y, 0.8 + z * 1.8, ['#FFC2CF', '#FFE1C2', '#FFFFFF'][i % 3], 0.75);
      } else if (style === 'twins') {
        dot(x, y, 0.8 + z * 1.6, i % 2 ? '#9BC8FF' : '#FFC890', 0.9);
        if (z > 0.8) glow(x, y, 9, i % 2 ? '#9BC8FF' : '#FFC890', 0.3);
      } else {
        dot(x, y, 0.7 + z * 1.6, col, 0.9);
        if (z > 0.85) glow(x, y, 8, col, 0.3);
      }
    }
    if (style === 'constellations' && variant === 1) {
      ctx.globalAlpha = 0.18; ctx.strokeStyle = col; ctx.lineWidth = 1;
      const bright = pts.filter((p) => p[2] > 0.72);
      for (let i = 0; i + 1 < bright.length; i += 1) {
        const [x0, y0] = bright[i]; const [x1, y1] = bright[i + 1];
        if ((x1 - x0) ** 2 + (y1 - y0) ** 2 < 170 * 170) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
      }
    }
  }
  const url = cv.toDataURL('image/png');
  tileCache.set(key, url);
  return url;
}
