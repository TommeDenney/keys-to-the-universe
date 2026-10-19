// "Learn" tab, Universe layout.
//   Universe = the whole course · Galaxies = units · Solar systems = groups of
//   lessons around a "sun" (the idea being learned) · Planets = concept lessons
//   · Moons = song/practice lessons orbiting the planet that taught them.
// An animated cosmos canvas sits behind; its stars and colours follow the
// galaxy and solar system you're looking at.

import { h, icon, starsHTML, modal, toast } from '../ui.js';
import { COURSE, allLessons } from '../data/course.js';
import { progress } from '../store.js';
import { lessonUnlocked, nextLesson, galaxyStars, starGate } from './learn.js';
import { installCard, fullscreenButton } from './install.js';
import { worldTextures, WORLD_KINDS } from '../render/worlds.js';
import { songNow, pieceMeta } from '../data/catalog.js';
import { equipped, walletPill, petName } from '../economy.js';
import { shipSVG as skinSVG } from '../render/ships.js';
import { challengesCard, openQuest } from './challenges.js';
import { QUESTS } from '../data/quests.js';
import { questDone } from '../economy.js';
import { specialBossEl, specialBosses } from './specialboss.js';
import { personalGalaxyName } from '../personal.js';
import { constellationsFor, constellationEl, galaxyReached } from '../constellations.js';
import { navFocus } from '../nav.js';
import { petHTML } from '../render/pets.js';
import { rewardLook } from '../data/rewards.js';

// Moons currently on screen, animated by the cosmos loop (3D-ish orbits that pass behind their planet).
let ORBITS = [];

// ---- Galaxy identities ------------------------------------------------------

const GALAXIES = {
  u1: { name: 'Primera', style: 'twinkle', top: '#0B0B2B', bottom: '#1A1550', neb: ['#5B6CFF', '#9B7BFF', '#3BC9FF'], star: '#FFFFFF' },
  u2: { name: 'Pentara', style: 'sparkle', top: '#120A2E', bottom: '#2A1259', neb: ['#8B5CF6', '#EC4899', '#6366F1'], star: '#F3E8FF' },
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
const galaxyOf = (unit) => {
  const g = GALAXIES[unit.id] || GALAXIES.u1;
  const name = personalGalaxyName(unit.id); // a personal pack can rename galaxies
  return name ? { ...g, name } : g;
};
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
      h('a', { class: 'pill inv-pill', href: '#/inventory', title: 'Inventory: everything you own' }, [h('span', { class: 'inv-ico' }, '\u{1F392}'), h('b', {}, 'Inventory')]),
      fullscreenButton(),
    ]),
  ]));
  const inst = installCard();
  if (inst) page.append(inst);

  // Next destination card.
  if (next) {
    const gal = galaxyOf(next.unit);
    page.append(h('section', { class: 'uni-next' }, [
      h('div', { class: 'uni-next-ship', html: shipSVG() + petHTML(equipped('pet')) }),
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
      h('div', { class: 'uni-next-ship', html: shipSVG() + petHTML(equipped('pet')) }),
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
        uDone === unit.lessons.length
          ? h('button', { class: 'galaxy-title beaten', title: 'Galaxy complete: tap to reset', onclick: () => confirmReset(unit, gal, () => { root.replaceChildren(); renderUniverse(root); }) }, [h('h2', {}, `${gal.name} Galaxy`), h('span', { class: 'gt-hint' }, ['\u2713 Complete \u00b7 tap to reset'])])
          : h('h2', {}, `${gal.name} Galaxy`),
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
    // Rogue planets (and the rogue boss) wander through the galaxy at their own spot between solar systems.
    const systems = buildSystems(unit);
    const rogues = [
      ...QUESTS.filter((x) => x.after === gi + 1).map((q) => [q.id, () => roguePlanet(q, gal)]),
      ...specialBosses().filter((f) => unit.id === f.rogueAfter).map((f) => [f.id, () => h('div', { class: 'rogue rogue-boss' }, [specialBossEl(f)])]),
    ].map(([id, make]) => ({ id, make, after: hash(`${id}:spot`) % systems.length }));
    // Galactic features (asteroid belts, black holes...) between some solar systems.
    const feats = galacticFeatures(unit.id, systems.length);
    systems.forEach((sys, si) => {
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
      for (const f of feats) if (f.after === si) sec.append(featureEl(f.kind, `${unit.id}:${f.kind}`, gal));
      for (const r of rogues) if (r.after === si) sec.append(wander(r.make(), r.id));
    });
    const boss = unit.lessons.find((l) => l.boss);
    if (boss) sec.append(guardianEl(boss, gal, next));
    for (const f of specialBosses()) if (unit.id === f.galaxy) sec.append(specialBossEl(f));
    if (!galaxyReached(unit.id)) mysterify(sec);
    page.append(sec);
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
  // Stars and Stardust follow you down the map once the header scrolls away.
  const hud = h('div', { class: 'uni-hud', 'aria-hidden': 'true' }, [
    h('div', { class: 'pill stars-pill', title: 'Stars' }, [icon('star'), h('b', {}, String(progress.totalStars))]),
    walletPill(),
  ]);
  wrap.append(hud);
  const onScroll = () => hud.classList.toggle('show', root.scrollTop > 120);
  root.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  return () => {
    cosmos.destroy();
    ro.disconnect();
    root.removeEventListener('scroll', onScroll);
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
    rec && fx !== 'fx-check' ? h('i', { class: 'fx-layer' }, rewardLook(fx) ? fxRing(rewardLook(fx)) : fx === 'fx-bloom' ? Array.from({ length: 6 }, (_, i) => h('i', { class: 'bloom', style: { '--a': `${i * 60}deg` } })) : fx === 'fx-galaxy' ? [h('i', { class: 'spiral' }), h('i', { class: 'spiral s2' })] : fx === 'fx-notes' ? [h('i', { class: 'note-ring', html: '<span>\u266A</span><span>\u266B</span><span>\u2669</span><span>\u266C</span>' })] : fx === 'fx-heavenly' ? [h('i', { class: 'halo' }), h('i', { class: 'rays' }), h('i', { class: 'cloud c1' }), h('i', { class: 'cloud c2' })] : fx === 'fx-supernova' ? [h('i', { class: 'nova-ring' }), h('i', { class: 'nova-ring r2' })] : [h('i', { class: 'healed' })]) : null,
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
  if (isNext) body.append(h('div', { class: 'ship', html: shipSVG() }), petEl());
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

/** Give a rogue its own wandering path: where it sits, how far and how fast it roams. */
function wander(el, id) {
  const r = (k) => (hash(`${id}:${k}`) % 1000) / 1000;
  const sx = (k) => (r(k) < 0.5 ? -1 : 1);
  const st = el.style;
  st.setProperty('--home', `${Math.round((r('home') - 0.5) * 50)}%`);
  st.setProperty('--x1', `${Math.round(sx('a') * (90 + r('x1') * 130))}px`);
  st.setProperty('--y1', `${Math.round((r('y1') - 0.5) * 70)}px`);
  st.setProperty('--x2', `${Math.round(-sx('a') * (60 + r('x2') * 150))}px`);
  st.setProperty('--y2', `${Math.round((r('y2') - 0.5) * 90)}px`);
  st.setProperty('--x3', `${Math.round(sx('b') * (40 + r('x3') * 110))}px`);
  st.setProperty('--y3', `${Math.round((r('y3') - 0.5) * 60)}px`);
  st.setProperty('--dur', `${(16 + r('dur') * 14).toFixed(1)}s`);
  st.setProperty('--delay', `${(-r('delay') * 30).toFixed(1)}s`);
  return el;
}

/** A rogue planet (side quest) wandering through a galaxy. */
function roguePlanet(q, gal) {
  const look = { ...bodyLook(q.id, gal), tilt: 18, spin: 30 };
  const orb = worldOrb('button', { class: 'orb', 'aria-label': `Side quest: ${q.name}`, onclick: () => openQuest(q) }, q.id, look, q.kind);
  return h('div', { class: `rogue ${questDone(q.id) ? 'done' : ''}` }, [
    h('div', { class: 'rogue-body' }, [orb]),
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
  if (isNext) el.append(h('div', { class: 'ship guardian-ship', html: shipSVG() }), petEl('guardian-pet'));
  el.append(h('div', { class: 'body-label' }, [
    h('small', {}, rec ? (progress.skipped(l.unit ? l.unit.id : l.id.replace(/^boss-/, '')) ? 'Guardian defeated \u00b7 galaxy skipped' : 'Guardian defeated') : 'Boss battle'),
    h('b', {}, l.guardian || 'The Guardian'),
    !rec && open && !isNext ? h('span', { class: 'g-skip' }, '\u23E9 Beat me to skip ahead to the next galaxy') : null,
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
  const glyph = trail === 'trail-notes' ? '\u266A \u266B \u2669 ' : trail === 'trail-stars' ? '\u2726 ' : (rewardLook(trail) || {}).glyph || '';
  svg.setAttribute('class', `route ${trail}`);
  svg.innerHTML = `<path d="${d}" class="route-glow"/><path id="${pathId}" d="${d}" class="route-dash"/>${glyph ? `<text class="route-text"><textPath href="#${pathId}">${glyph.repeat(220)}</textPath></text>` : ''}`;
}

/**
 * A galaxy you haven't reached yet: everything in it becomes a dark silhouette
 * (still moving) with ??? for its details, and nothing in it can be opened.
 * Its name, emblem and constellations stay visible.
 */
function mysterify(sec) {
  sec.classList.add('unknown');
  for (const child of sec.children) {
    if (child.classList.contains('constellation') || child.classList.contains('galaxy-head')) continue;
    child.inert = true;
  }
  sec.querySelectorAll('.body-label, .sun-label, .feat-label').forEach((l) => l.replaceChildren(h('small', {}, 'Uncharted'), h('b', {}, '???')));
  sec.querySelectorAll('.moon-chip').forEach((c) => c.replaceChildren(h('i', { class: 'mc-dot' }), h('span', {}, [h('small', {}, 'Moon'), h('b', {}, '???')])));
  const sub = sec.querySelector('.galaxy-head p');
  if (sub) sub.textContent = '???';
}

/** Ask before wiping one galaxy's progress so it can be played again from scratch. */
function confirmReset(unit, gal, done) {
  modal((close) => [h('div', { class: 'reset-modal' }, [
    h('div', { class: 'reset-emblem', style: { '--g1': gal.neb[0], '--g2': gal.neb[1] } }, '\u21BB'),
    h('h2', {}, `Reset the ${gal.name} Galaxy?`),
    h('p', {}, `This clears the stars and completion for all ${unit.lessons.length} worlds in this galaxy (including its Guardian) so you can play through it fresh. Other galaxies, your Stardust, Shop items, badges and unlocked songs are not affected, and later galaxies stay open.`),
    h('p', { class: 'muted small' }, 'Replaying worlds you were already paid for won\u2019t pay their Stardust again, except for beating your old star count.'),
    h('div', { class: 'row' }, [
      h('button', { class: 'btn ghost', onclick: close }, 'Keep my progress'),
      h('button', { class: 'btn danger', onclick: () => { progress.resetLessons(unit.lessons.map((l) => l.id)); close(); toast(`${gal.name} Galaxy reset. Have fun replaying it!`, 'ok'); done(); } }, ['\u21BB Reset galaxy']),
    ]),
  ])]);
}

// ---- Galactic features --------------------------------------------------------------
const FEATURES = ['belt', 'belt', 'blackhole', 'wormhole', 'station', 'comet', 'nebula', 'debris', 'crystals', 'belt'];
const FEATURE_NAMES = { belt: 'Asteroid belt', blackhole: 'Black hole', wormhole: 'Wormhole', station: 'Space station', comet: 'Comet', nebula: 'Nebula', debris: 'Satellite graveyard', crystals: 'Crystal field' };

/** Which features a galaxy has (some have none) and where they sit. */
function galacticFeatures(unitId, nSystems) {
  const x = hash(`${unitId}:features`);
  const count = [1, 2, 1, 0, 2, 1][x % 6];
  const out = [];
  for (let i = 0; i < count; i++) {
    let kind = FEATURES[(x >>> (4 + i * 5)) % FEATURES.length];
    if (out.some((f) => f.kind === kind)) kind = FEATURES[(FEATURES.indexOf(kind) + 3) % FEATURES.length];
    out.push({ kind, after: (hash(`${unitId}:${kind}:at`) % Math.max(1, nSystems)) });
  }
  return out;
}

function featureEl(kind, seed, gal) {
  const x = hash(seed);
  const r = (k) => (hash(`${seed}:${k}`) % 1000) / 1000;
  const name = bodyName(seed);
  const label = h('div', { class: 'feat-label' }, [h('small', {}, FEATURE_NAMES[kind]), h('b', {}, kind === 'belt' ? `The ${name} Belt` : kind === 'station' ? `${name} Station` : kind === 'comet' ? `Comet ${name}` : kind === 'nebula' ? `The ${name} Nebula` : name)]);
  const el = h('div', { class: `feature feat-${kind}`, 'aria-hidden': 'true', style: { '--f1': gal.neb[0], '--f2': gal.neb[1], '--f3': gal.neb[2], '--fside': `${r('side') < 0.5 ? -1 : 1}` } });
  if (kind === 'belt') {
    const rocks = Array.from({ length: 34 }, (_, i) => {
      const s = 6 + r(`s${i}`) * 22;
      const br = [0, 1, 2, 3].map((k) => `${35 + r(`b${i}${k}`) * 30}%`).join(' ');
      return h('i', { class: `rock ${i % 4 === 0 ? 'spin' : ''}`, style: { left: `${(i / 34) * 100 + r(`x${i}`) * 2}%`, top: `${15 + r(`y${i}`) * 70}%`, width: `${s}px`, height: `${s * (0.7 + r(`h${i}`) * 0.5)}px`, borderRadius: br, '--rd': `${6 + r(`d${i}`) * 10}s`, '--tone': `${r(`t${i}`) < 0.3 ? '#8B6F52' : r(`t${i}`) < 0.6 ? '#6B7280' : '#9CA3AF'}` } });
    });
    el.append(h('div', { class: 'belt-track', style: { '--bd': `${70 + r('speed') * 50}s`, '--dir': r('dir') < 0.5 ? 'normal' : 'reverse' } }, [h('div', { class: 'belt-half' }, rocks), h('div', { class: 'belt-half' }, rocks.map((n) => n.cloneNode(true)))]), h('i', { class: 'belt-dust' }));
  } else if (kind === 'blackhole') {
    el.append(h('div', { class: 'bh' }, [h('i', { class: 'bh-glow' }), h('i', { class: 'bh-disk' }), h('i', { class: 'bh-core' }), h('i', { class: 'bh-ring' })]));
  } else if (kind === 'wormhole') {
    el.append(h('div', { class: 'wh' }, Array.from({ length: 5 }, (_, i) => h('i', { style: { '--i': i } }))));
  } else if (kind === 'station') {
    el.append(h('div', { class: 'station', html: `<svg viewBox="0 0 120 120"><g class="st-spin"><circle cx="60" cy="60" r="44" fill="none" stroke="#CBD5E1" stroke-width="7"/><circle cx="60" cy="60" r="44" fill="none" stroke="#64748B" stroke-width="7" stroke-dasharray="6 10"/>${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="60" y1="60" x2="${60 + 44 * Math.cos(a * Math.PI / 180)}" y2="${60 + 44 * Math.sin(a * Math.PI / 180)}" stroke="#94A3B8" stroke-width="2.5"/>`).join('')}<circle class="blink" cx="104" cy="60" r="3" fill="#F87171"/><circle class="blink b2" cx="16" cy="60" r="3" fill="#4ADE80"/></g><circle cx="60" cy="60" r="12" fill="#E2E8F0" stroke="#475569" stroke-width="2"/><rect x="-6" y="54" width="22" height="12" fill="#1D4ED8" stroke="#93C5FD"/><rect x="104" y="54" width="22" height="12" fill="#1D4ED8" stroke="#93C5FD"/></svg>` }));
  } else if (kind === 'comet') {
    el.append(h('div', { class: 'comet', style: { '--cd': `${16 + r('cd') * 10}s` } }, [h('i', { class: 'c-tail' }), h('i', { class: 'c-head' })]));
  } else if (kind === 'nebula') {
    el.append(h('i', { class: 'neb-cloud n1' }), h('i', { class: 'neb-cloud n2' }), h('i', { class: 'neb-cloud n3' }));
  } else if (kind === 'debris') {
    el.append(...Array.from({ length: 4 }, (_, i) => h('div', { class: 'sat', style: { left: `${10 + i * 22 + r(`sx${i}`) * 8}%`, top: `${10 + r(`sy${i}`) * 50}%`, '--sd': `${18 + r(`sd${i}`) * 20}s`, '--sr': `${r(`sr${i}`) < 0.5 ? -1 : 1}` }, html: '<svg viewBox="0 0 60 30"><rect x="22" y="9" width="16" height="12" rx="2" fill="#CBD5E1" stroke="#64748B"/><rect x="0" y="11" width="20" height="8" fill="#1E40AF" stroke="#93C5FD"/><rect x="40" y="11" width="20" height="8" fill="#1E40AF" stroke="#93C5FD"/><line x1="30" y1="9" x2="30" y2="2" stroke="#94A3B8"/><circle cx="30" cy="2" r="1.8" fill="#FCA5A5" class="blink"/></svg>' })));
  } else if (kind === 'crystals') {
    el.append(...Array.from({ length: 7 }, (_, i) => h('i', { class: 'crystal', style: { left: `${8 + i * 13 + r(`cx${i}`) * 6}%`, top: `${15 + r(`cy${i}`) * 55}%`, width: `${14 + r(`cw${i}`) * 20}px`, '--cc': [gal.neb[0], gal.neb[1], gal.neb[2], '#E0F2FE'][i % 4], '--cdel': `${-r(`cdl${i}`) * 6}s`, '--rot': `${(r(`cr${i}`) - 0.5) * 50}deg` } })));
  }
  el.append(label);
  return el;
}

/** Your pet, flying alongside the ship. */
function petEl(extra = '') {
  const id = equipped('pet');
  const html = petHTML(id);
  if (!html) return document.createTextNode('');
  const el = h('div', { class: `pet-buddy ${extra}`, html });
  if (petName(id)) el.append(h('span', { class: 'pet-tag' }, petName(id)));
  return el;
}

/** Reward completion effects: a ring of glyphs (and optional Saturn rings) around the world. */
export function fxRing(L) {
  const out = [];
  if (L.rings) out.push(h('i', { class: 'fx-saturn' }), h('i', { class: 'fx-saturn s2' }));
  if (L.glyphs) {
    const gl = [...L.glyphs];
    out.push(h('i', { class: 'glyph-ring', style: { '--c': L.color, '--spin': `${L.spin || 12}s` } }, gl.map((g, i) => h('span', { style: { '--a': `${(360 / gl.length) * i}deg` } }, g))));
  }
  return out;
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
 * The cosmos background: a fixed layer behind the page, so the stars sit in
 * the distance and glide with a little inertia (parallax) instead of moving
 * with the planets. Drawn on two canvases, kept cheap so it holds the
 * display's frame rate while you scroll:
 *  - a tiny low-resolution canvas (stretched by the GPU) for the soft sky:
 *    galaxy gradient, nebulae, sunlight, rays/aurora, warp glow;
 *  - a transparent star canvas drawn with pre-rendered sprites (no per-star
 *    paths or gradients), tinted with each galaxy's own colours.
 * Section positions are cached, so nothing forces a page layout per frame.
 */
const BG_SCALE = 0.25;
const SPRITE = 32;

class Cosmos {
  constructor(backdrop, scroller, sections) {
    this.backdrop = backdrop;
    this.scroller = scroller;
    this.sections = sections;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.bg = h('canvas', { class: 'cosmos-bg' });
    this.cv = h('canvas', { class: 'cosmos-stars' });
    backdrop.append(this.bg, this.cv);
    this.bctx = this.bg.getContext('2d', { alpha: false });
    this.ctx = this.cv.getContext('2d');
    this.gal = sections[0] ? sections[0]._gal : GALAXIES.u1;
    this.prevGal = this.gal;
    this.fade = 1;
    this.sysProgress = 0;
    this.cur = this.palette(this.gal, 0);
    this.stars = Array.from({ length: 240 }, (_, i) => ({
      x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.8, r: Math.random(), twin: i % 2,
      // Which galaxy colour this star takes: most use the galaxy's star colour, the rest its nebula colours.
      tint: Math.random() < 0.55 ? -1 : i % 3,
    }));
    this.shooters = [];
    this.sprites = new Map();
    this.sScroll = scroller.scrollTop || 0;
    this.vel = 0;
    this.warp = 0;
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
    // Planets lazily paint and lessons expand, so re-measure when the page changes size.
    this.ro = new ResizeObserver(() => this.measure());
    if (scroller.firstElementChild) this.ro.observe(scroller.firstElementChild);
    this.t0 = performance.now();
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  palette(gal, sysIndex) {
    // Each solar system shifts the nebula colours around; the galaxy sets the base.
    const n = gal.neb.map(hexToRgb);
    const k = sysIndex % n.length;
    return { top: hexToRgb(gal.top), bottom: hexToRgb(gal.bottom), neb: [n[k], n[(k + 1) % n.length], n[(k + 2) % n.length]], star: hexToRgb(gal.star) };
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.dpr = dpr;
    this.cv.width = Math.round(this.w * dpr);
    this.cv.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.bg.width = Math.max(1, Math.round(this.w * BG_SCALE));
    this.bg.height = Math.max(1, Math.round(this.h * BG_SCALE));
    this.bctx.setTransform(BG_SCALE, 0, 0, BG_SCALE, 0, 0);
    this.measure();
  }

  /** Cache where each galaxy and solar system starts (in scroll coordinates). */
  measure() {
    const base = this.scroller.getBoundingClientRect().top - (this.scroller.scrollTop || 0);
    this.marks = this.sections.map((sec, si) => ({
      gal: sec._gal,
      top: sec.getBoundingClientRect().top - base,
      systems: [...sec.querySelectorAll('.system')].map((s) => {
        const r = s.getBoundingClientRect();
        return { sys: s._sys + si * 3, top: r.top - base, height: Math.max(1, r.height) };
      }),
    }));
  }

  locate(scroll) {
    const mid = scroll + this.h * 0.45;
    let gal = this.sections[0] && this.sections[0]._gal;
    let sys = 0;
    let prog = 0;
    for (const m of this.marks) {
      if (m.top > mid) break;
      gal = m.gal;
      for (const s of m.systems) {
        if (s.top > mid) break;
        sys = s.sys;
        prog = Math.min(1, (mid - s.top) / s.height);
      }
    }
    return { gal, sys, prog };
  }

  /** A soft round star (or four-point sparkle) in one colour, drawn once and reused. */
  sprite(kind, c) {
    const key = `${kind}${c[0] >> 3},${c[1] >> 3},${c[2] >> 3}`;
    let s = this.sprites.get(key);
    if (s) return s;
    if (this.sprites.size > 300) this.sprites.clear();
    s = document.createElement('canvas');
    const ctx = s.getContext('2d');
    const col = [(c[0] >> 3) << 3, (c[1] >> 3) << 3, (c[2] >> 3) << 3];
    if (kind === 'trail') {
      s.width = 4; s.height = 128;
      const g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, rgb(col, 1)); g.addColorStop(1, rgb(col, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 128);
    } else {
      s.width = s.height = SPRITE;
      const m = SPRITE / 2;
      if (kind === 'spark') {
        const g = ctx.createRadialGradient(m, m, 0, m, m, m);
        g.addColorStop(0, rgb(col, 0.35)); g.addColorStop(1, rgb(col, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, SPRITE, SPRITE);
        ctx.fillStyle = rgb(col, 1);
        ctx.beginPath();
        ctx.moveTo(m, 0); ctx.quadraticCurveTo(m, m, SPRITE, m); ctx.quadraticCurveTo(m, m, m, SPRITE);
        ctx.quadraticCurveTo(m, m, 0, m); ctx.quadraticCurveTo(m, m, m, 0);
        ctx.fill();
      } else if (kind === 'bokeh') {
        ctx.fillStyle = rgb(col, 1);
        ctx.beginPath(); ctx.arc(m, m, m - 1, 0, Math.PI * 2); ctx.fill();
      } else { // dot: solid core with a slight halo
        const g = ctx.createRadialGradient(m, m, 0, m, m, m);
        g.addColorStop(0, rgb(col, 1)); g.addColorStop(0.35, rgb(col, 0.9)); g.addColorStop(0.5, rgb(col, 0.25)); g.addColorStop(1, rgb(col, 0));
        ctx.fillStyle = g; ctx.fillRect(0, 0, SPRITE, SPRITE);
      }
    }
    this.sprites.set(key, s);
    return s;
  }

  frame(now) {
    if (this.dead) return;
    this.raf = requestAnimationFrame((tt) => this.frame(tt));
    const t = (now - this.t0) / 1000;
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    // Smoothed scroll + velocity: stars glide with a little inertia, and fast scrolling triggers warp trails.
    const scrollTarget = this.scroller.scrollTop || 0;
    const prevS = this.sScroll;
    this.sScroll += (scrollTarget - this.sScroll) * (1 - Math.exp(-dt * 16));
    if (Math.abs(scrollTarget - this.sScroll) < 0.05) this.sScroll = scrollTarget;
    const v = dt > 0 ? (this.sScroll - prevS) / dt : 0;
    this.vel += (v - this.vel) * (1 - Math.exp(-dt * 10));
    const want = this.reduced ? 0 : Math.max(0, Math.min(1, (Math.abs(this.vel) - 900) / 3000));
    this.warp += (want - this.warp) * (1 - Math.exp(-dt * (want > this.warp ? 8 : 3)));
    const { gal, sys, prog } = this.locate(scrollTarget);
    if (gal && gal !== this.gal) { this.prevGal = this.gal; this.gal = gal; this.fade = 0; }
    this.fade = Math.min(1, this.fade + dt * 1.2);
    this.sysProgress += (prog - this.sysProgress) * Math.min(1, dt * 3);
    const target = this.palette(this.gal, sys);
    const k = Math.min(1, dt * 2.2);
    const c = this.cur;
    this.cur = {
      top: mix(c.top, target.top, k), bottom: mix(c.bottom, target.bottom, k),
      neb: c.neb.map((x, i) => mix(x, target.neb[i], k)), star: mix(c.star, target.star, k),
    };
    const tt = this.reduced ? 0 : t;
    this.drawSky(tt);
    this.drawStarsLayer(tt, dt);
    if (!this.reduced) updateOrbits(t);
    else if (!this.placed) { updateOrbits(0); this.placed = true; }
  }

  /** The soft sky on the small canvas: cheap, and blurry anyway. */
  drawSky(t) {
    const ctx = this.bctx;
    const { w, h } = this;
    const c = this.cur;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, rgb(c.top));
    g.addColorStop(1, rgb(c.bottom));
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const blobs = [
      [0.2 + 0.05 * Math.sin(t * 0.05), 0.25, 0.55, c.neb[0], 0.32],
      [0.85 + 0.04 * Math.cos(t * 0.04), 0.6, 0.5, c.neb[1], 0.26],
      [0.5, 0.95 + 0.03 * Math.sin(t * 0.06), 0.6, c.neb[2], 0.2],
    ];
    ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, r, col, a] of blobs) {
      const rg = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.max(w, h));
      rg.addColorStop(0, rgb(col, a));
      rg.addColorStop(1, rgb(col, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);
    }
    // Warm sunlight from above when you're near a system's sun.
    const sunGlow = 1 - this.sysProgress;
    const sg = ctx.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, -h * 0.1, h * 0.9);
    sg.addColorStop(0, `rgba(255,210,140,${0.22 * sunGlow})`);
    sg.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    const styleAlpha = (style) => (this.gal.style === style ? this.fade : 0) + (this.fade < 1 && this.prevGal.style === style ? 1 - this.fade : 0);
    const ra = styleAlpha('rays');
    if (ra > 0.01) this.drawRays(t, ra);
    const aa = styleAlpha('aurora');
    if (aa > 0.01) this.drawAurora(t, aa);
    if (this.warp > 0.02) {
      const wg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      wg.addColorStop(0, `rgba(200,220,255,${0.12 * this.warp})`);
      wg.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = wg;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawStarsLayer(t, dt) {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const scroll = this.sScroll;
    if (this.warp > 0.02) this.drawWarp(scroll);
    if (this.warp < 0.6) {
      const calm = this.warp > 0.02 ? 1 - this.warp / 0.6 : 1; // blend back into normal stars as we slow down
      if (this.fade < 1) this.drawStars(this.prevGal.style, (1 - this.fade) * calm, t, scroll);
      this.drawStars(this.gal.style, this.fade * calm, t, scroll);
    }
    this.drawShooters(dt);
    ctx.globalAlpha = 1;
  }

  /** This frame's star colours: the galaxy's star colour plus light tints of its nebula colours. */
  colours(style) {
    if (style === 'twins') return [[150, 200, 255], [255, 200, 140]];
    if (style === 'embers') return [[255, 160, 60], [255, 200, 70], [255, 225, 90]];
    if (style === 'motes') return [[255, 180, 190]];
    return [this.cur.star, ...this.cur.neb.map((c) => mix(c, [255, 255, 255], 0.35))];
  }
  starSprite(cols, sprites, s, style) {
    if (style === 'twins') return sprites[s.twin];
    if (style === 'embers') return sprites[Math.min(2, (s.r * 3) | 0)];
    if (style === 'motes') return sprites[0];
    return sprites[s.tint + 1];
  }

  drawStars(style, alpha, t, scroll) {
    if (alpha < 0.01) return;
    const { ctx, w, h } = this;
    // Further out in a system: more, dimmer stars. Near the sun: fewer, bigger.
    const count = Math.round(this.stars.length * (0.55 + 0.45 * this.sysProgress));
    const grow = 1 + 0.4 * (1 - this.sysProgress);
    const lines = style === 'constellations' ? [] : null;
    const cols = this.colours(style);
    const dots = cols.map((c) => this.sprite('dot', c));
    const sparks = cols.map((c) => this.sprite('spark', c));
    for (let i = 0; i < count; i++) {
      const s = this.stars[i];
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      let x = s.x * w + Math.sin(t * 0.05 + s.ph) * 4 * s.z;
      let y;
      if (style === 'embers' || style === 'motes') {
        const rise = style === 'embers' ? -1 : 1;
        y = (((s.y * h + rise * t * 14 * s.z - scroll * s.z * 0.35) % h) + h) % h;
        x += Math.sin(t * 0.6 + s.ph) * 10 * s.z;
      } else {
        // Parallax: nearer stars (bigger z) drift further as you scroll.
        y = (((s.y * h - scroll * s.z * 0.35) % h) + h) % h;
      }
      const r = (0.6 + s.z * 1.4) * grow;
      if ((style === 'sparkle' || style === 'constellations' || style === 'rays') && s.r > 0.7) {
        const d = r * 6 * tw;
        ctx.globalAlpha = alpha * 0.9 * tw;
        ctx.drawImage(this.starSprite(cols, sparks, s, style), x - d / 2, y - d / 2, d, d);
        if (lines) lines.push(x, y);
        continue;
      }
      if (style === 'bokeh' && s.r > 0.8) {
        const d = r * 14;
        ctx.globalAlpha = alpha * 0.18 * tw;
        ctx.drawImage(this.sprite('bokeh', this.cur.neb[i % 3]), x - d / 2, y - d / 2, d, d); // few of these
        continue;
      }
      const d = r * 2 / 0.4; // sprite core is ~40% of its width
      ctx.globalAlpha = alpha * tw * (0.5 + 0.5 * s.z);
      ctx.drawImage(this.starSprite(cols, dots, s, style), x - d / 2, y - d / 2, d, d);
    }
    if (lines && lines.length > 2) {
      ctx.globalAlpha = alpha * 0.16;
      ctx.strokeStyle = rgb(this.cur.star);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i + 2 < lines.length; i += 2) {
        const dx = lines[i + 2] - lines[i];
        const dy = lines[i + 3] - lines[i + 1];
        if (dx * dx + dy * dy < 200 * 200) { ctx.moveTo(lines[i], lines[i + 1]); ctx.lineTo(lines[i + 2], lines[i + 3]); }
      }
      ctx.stroke();
    }
  }

  /** Warp speed: stars stretch into light trails along the scroll direction. */
  drawWarp(scroll) {
    const { ctx, w, h } = this;
    const dir = Math.sign(this.vel) || 1;
    const wp = this.warp;
    const trail = this.sprite('trail', mix(this.cur.star, [190, 215, 255], 0.4 * wp));
    ctx.globalCompositeOperation = 'lighter';
    for (const s of this.stars) {
      const y = (((s.y * h - scroll * s.z * 0.35) % h) + h) % h;
      const x = s.x * w + (s.x - 0.5) * w * 0.08 * wp * s.z; // spread slightly outward
      const len = wp * (20 + 170 * s.z * s.z);
      const lw = 0.5 + s.z * 1.3;
      ctx.globalAlpha = Math.min(1, 0.3 + 0.5 * s.z) * (0.6 + 0.4 * wp);
      if (dir > 0) ctx.drawImage(trail, x - lw / 2, y, lw, len); // trail points back where the star came from
      else {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, -1);
        ctx.drawImage(trail, -lw / 2, 0, lw, len);
        ctx.restore();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  drawRays(t, alpha) {
    const ctx = this.bctx;
    const { w, h } = this;
    for (let i = 0; i < 5; i++) {
      const a = -0.5 + i * 0.25 + Math.sin(t * 0.1 + i) * 0.05;
      ctx.save();
      ctx.translate(w * 0.5, -h * 0.2);
      ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 0, h * 1.3);
      g.addColorStop(0, rgb(this.cur.neb[i % 3], 0.12 * alpha));
      g.addColorStop(1, rgb(this.cur.neb[i % 3], 0));
      ctx.fillStyle = g;
      ctx.fillRect(-40 - i * 6, 0, 80 + i * 12, h * 1.3);
      ctx.restore();
    }
  }

  drawAurora(t, alpha) {
    const ctx = this.bctx;
    const { w, h } = this;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      const base = h * (0.2 + k * 0.18);
      ctx.moveTo(0, base);
      for (let x = 0; x <= w; x += 48) ctx.lineTo(x, base + Math.sin(x / 160 + t * 0.4 + k) * 40 + Math.sin(x / 70 + t * 0.7) * 12);
      ctx.lineTo(w, base + 160);
      ctx.lineTo(0, base + 160);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, base - 40, 0, base + 160);
      g.addColorStop(0, rgb(this.cur.neb[k], 0.18 * alpha));
      g.addColorStop(1, rgb(this.cur.neb[k], 0));
      ctx.fillStyle = g;
      ctx.fill();
    }
  }

  drawShooters(dt) {
    const { ctx } = this;
    if (!this.reduced && Math.random() < dt * 0.25) {
      this.shooters.push({ x: Math.random() * this.w, y: Math.random() * this.h * 0.5, vx: -(300 + Math.random() * 300), vy: 120 + Math.random() * 120, life: 0 });
    }
    if (!this.shooters.length) return;
    this.shooters = this.shooters.filter((s) => s.life < 1.1);
    const trail = this.sprite('trail', [255, 255, 255]);
    for (const s of this.shooters) {
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      ctx.globalAlpha = Math.max(0, 1 - s.life);
      const len = Math.hypot(s.vx, s.vy) * 0.15;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(Math.atan2(-s.vy, -s.vx) - Math.PI / 2); // tail points back along the path
      ctx.drawImage(trail, -1, 0, 2, len);
      ctx.restore();
    }
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.ro.disconnect();
  }
}
