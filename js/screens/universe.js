// "Learn" tab, Universe layout.
//   Universe = the whole course · Galaxies = units · Solar systems = groups of
//   lessons around a "sun" (the idea being learned) · Planets = concept lessons
//   · Moons = song/practice lessons orbiting the planet that taught them.
// An animated cosmos canvas sits behind; its stars and colours follow the
// galaxy and solar system you're looking at.

import { h, icon, starsHTML } from '../ui.js';
import { COURSE, allLessons } from '../data/course.js';
import { progress } from '../store.js';
import { lessonUnlocked, nextLesson } from './learn.js';
import { installCard, fullscreenButton } from './install.js';

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
const KINDS = ['banded', 'rocky', 'ringed', 'ocean', 'lava', 'ice', 'banded', 'ringed'];
function bodyLook(id, gal) {
  const x = hash(id + 'look');
  const base = gal.neb[x % gal.neb.length];
  return { kind: KINDS[(x >>> 4) % KINDS.length], base, hue: ((x >>> 8) % 60) - 30, tilt: ((x >>> 14) % 40) - 20, spin: 10 + ((x >>> 18) % 14) };
}

// ---- Course → universe structure -------------------------------------------

/** Planets are concept lessons; pure practice (no "learn" cards) becomes a moon of the previous planet. */
function buildSystems(unit) {
  const planets = [];
  for (const l of unit.lessons) {
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
  const lessons = allLessons();
  const done = lessons.filter((l) => progress.lesson(l.id)).length;
  const next = nextLesson();
  const canvas = h('canvas', { class: 'cosmos', 'aria-hidden': 'true' });
  const page = h('div', { class: 'page uni-page' });
  const wrap = h('div', { class: 'universe' }, [canvas, page]);
  root.append(wrap);
  document.body.classList.add('in-universe');

  page.append(h('header', { class: 'top uni-top' }, [
    h('div', {}, [h('div', { class: 'eyebrow' }, 'The Ivory Universe'), h('h1', { class: 'brand' }, ['Ivory', h('span', { class: 'dot' })])]),
    h('div', { class: 'pills' }, [
      h('div', { class: 'pill flame', title: 'Day streak' }, [icon('flame'), h('b', {}, String(progress.streak))]),
      h('div', { class: 'pill stars-pill', title: 'Stars' }, [icon('star'), h('b', {}, String(progress.totalStars))]),
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
      h('a', { class: 'btn primary big', href: `#/lesson/${next.id}` }, [icon('play'), done === 0 ? 'Launch' : 'Fly there']),
    ]));
  } else {
    page.append(h('section', { class: 'uni-next' }, [h('div', { class: 'grow' }, [h('div', { class: 'eyebrow' }, 'Universe explored'), h('h2', {}, 'You visited every world!'), h('p', {}, 'Keep playing songs from the library, or import your own music.')])]));
  }

  const sections = [];
  COURSE.forEach((unit, gi) => {
    const gal = galaxyOf(unit);
    const uDone = unit.lessons.filter((l) => progress.lesson(l.id)).length;
    const sec = h('section', { class: 'galaxy', style: { '--g1': gal.neb[0], '--g2': gal.neb[1], '--g3': gal.neb[2] } });
    sec._gal = gal;
    sec.append(h('div', { class: 'galaxy-head' }, [
      h('div', { class: 'galaxy-emblem' }, [h('i'), h('i')]),
      h('div', { class: 'grow' }, [
        h('div', { class: 'eyebrow' }, `Galaxy ${gi + 1}`),
        h('h2', {}, `${gal.name} Galaxy`),
        h('p', {}, unit.subtitle),
      ]),
      h('div', { class: 'galaxy-count' }, [h('b', {}, `${uDone}/${unit.lessons.length}`), h('span', {}, 'worlds')]),
    ]));
    buildSystems(unit).forEach((sys, si) => {
      const sysEl = h('div', { class: 'system' });
      sysEl._sys = si;
      sysEl.append(h('div', { class: 'sun-wrap' }, [
        h('div', { class: 'sun' }, [h('i', { class: 'corona' }), h('i', { class: 'core' })]),
        h('div', { class: 'sun-label' }, [h('small', {}, `Solar system ${si + 1}`), h('b', {}, sys.name)]),
      ]));
      const track = h('div', { class: 'bodies' });
      const path = svgEl('svg', { class: 'route', 'aria-hidden': 'true' });
      track.append(path);
      sys.planets.forEach((p, pi) => track.append(planetEl(p, gal, pi, next)));
      sysEl.append(track);
      sec.append(sysEl);
    });
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
  const size = 92 + (hash(l.id) % 4) * 10;
  const side = index % 2 === 0 ? -1 : 1;
  const el = h('div', {
    class: `planet ${rec ? 'done' : ''} ${open ? '' : 'locked'} ${isNext ? 'current' : ''}`,
    style: { '--off': `${side * (70 + (hash(l.id) % 3) * 30)}px`, '--size': `${size}px`, '--base': look.base, '--hue': `${look.hue}deg`, '--tilt': `${look.tilt}deg`, '--spin': `${look.spin}s` },
  });
  const orb = h(open ? 'a' : 'div', { class: `orb kind-${look.kind}`, href: open ? `#/lesson/${l.id}` : null, 'aria-label': `${bodyName(l.id)}: ${l.title}` }, [
    h('i', { class: 'surface' }),
    h('i', { class: 'shade' }),
    open ? null : h('span', { class: 'lock' }, icon('lock')),
    rec ? h('span', { class: 'flag' }, icon('check')) : null,
  ]);
  // Rings wrap around the planet: back half behind it, front half in front.
  const ringed = look.kind === 'ringed';
  const body = h('div', { class: 'planet-body' }, [ringed ? h('i', { class: 'ring ring-back' }) : null, orb, ringed ? h('i', { class: 'ring ring-front' }) : null]);
  // Moons orbit the planet (decorative + tappable); chips below are the reliable targets.
  p.moons.forEach((m, mi) => {
    const mOpen = lessonUnlocked(m.id);
    const mLook = bodyLook(m.id, gal);
    const r = size / 2 + 26 + mi * 18;
    body.append(h('div', { class: 'moon-orbit', style: { '--r': `${r}px`, '--dur': `${16 + mi * 7}s`, '--delay': `${-(hash(m.id) % 20)}s` } }, [
      h(mOpen ? 'a' : 'span', { class: `moon ${progress.lesson(m.id) ? 'done' : ''} ${mOpen ? '' : 'locked'}`, href: mOpen ? `#/lesson/${m.id}` : null, tabindex: '-1', 'data-nav-skip': '1', 'aria-hidden': 'true', style: { '--base': mLook.base } }),
    ]));
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
  svg.innerHTML = `<path d="${d}" class="route-glow"/><path d="${d}" class="route-dash"/>`;
}

function shipSVG() {
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

class Cosmos {
  constructor(canvas, scroller, sections) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.scroller = scroller;
    this.sections = sections;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.gal = sections[0] ? sections[0]._gal : GALAXIES.u1;
    this.prevGal = this.gal;
    this.fade = 1;
    this.sysIndex = 0;
    this.sysProgress = 0;
    this.cur = this.palette(this.gal, 0);
    this.stars = Array.from({ length: 240 }, (_, i) => ({
      x: Math.random(), y: Math.random(), z: 0.2 + Math.random() * 0.8, ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.8, r: Math.random(), twin: i % 2,
    }));
    this.shooters = [];
    this.resize();
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);
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
    this.canvas.width = Math.round(this.w * dpr);
    this.canvas.height = Math.round(this.h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** Which galaxy / solar system is in view, and how far through the system we are. */
  locate() {
    const mid = this.h * 0.45;
    let gal = this.sections[0] && this.sections[0]._gal;
    let sys = 0;
    let prog = 0;
    for (const sec of this.sections) {
      const r = sec.getBoundingClientRect();
      if (r.top <= mid) {
        gal = sec._gal;
        for (const s of sec.querySelectorAll('.system')) {
          const sr = s.getBoundingClientRect();
          if (sr.top <= mid) {
            sys = s._sys + this.sections.indexOf(sec) * 3;
            prog = Math.max(0, Math.min(1, (mid - sr.top) / Math.max(1, sr.height)));
          }
        }
      }
    }
    return { gal, sys, prog };
  }

  frame(now) {
    if (this.dead) return;
    const t = (now - this.t0) / 1000;
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const { gal, sys, prog } = this.locate();
    if (gal && gal !== this.gal) { this.prevGal = this.gal; this.gal = gal; this.fade = 0; }
    this.fade = Math.min(1, this.fade + dt * 1.2);
    this.sysProgress += (prog - this.sysProgress) * Math.min(1, dt * 3);
    const target = this.palette(this.gal, sys);
    const k = Math.min(1, dt * 2.2);
    this.cur = {
      top: mix(this.cur.top, target.top, k), bottom: mix(this.cur.bottom, target.bottom, k),
      neb: this.cur.neb.map((c, i) => mix(c, target.neb[i], k)), star: mix(this.cur.star, target.star, k),
    };
    this.draw(this.reduced ? 0 : t, dt);
    this.raf = requestAnimationFrame((tt) => this.frame(tt));
  }

  draw(t, dt) {
    const { ctx, w, h } = this;
    const c = this.cur;
    const scroll = this.scroller.scrollTop || 0;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, rgb(c.top));
    g.addColorStop(1, rgb(c.bottom));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Nebula clouds drifting slowly; brighter near the "sun" (start of a system).
    const sunGlow = 1 - this.sysProgress;
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
    const sg = ctx.createRadialGradient(w * 0.5, -h * 0.1, 0, w * 0.5, -h * 0.1, h * 0.9);
    sg.addColorStop(0, `rgba(255,210,140,${0.22 * sunGlow})`);
    sg.addColorStop(1, 'rgba(255,210,140,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';

    // Star layers: crossfade between the previous and current galaxy's style.
    if (this.fade < 1) this.drawStars(this.prevGal.style, 1 - this.fade, t, scroll, dt);
    this.drawStars(this.gal.style, this.fade, t, scroll, dt);
    this.drawShooters(t, dt);
  }

  starPos(s, scroll, t) {
    const y = (((s.y * this.h - scroll * s.z * 0.15) % this.h) + this.h) % this.h;
    return [s.x * this.w + Math.sin(t * 0.05 + s.ph) * 4 * s.z, y];
  }

  drawStars(style, alpha, t, scroll, dt) {
    const { ctx } = this;
    const col = this.cur.star;
    // Further out in a system: more, dimmer stars. Near the sun: fewer, bigger.
    const count = Math.round(this.stars.length * (0.55 + 0.45 * this.sysProgress));
    ctx.save();
    ctx.globalAlpha = alpha;
    if (style === 'rays') this.drawRays(t);
    if (style === 'aurora') this.drawAurora(t);
    const pts = [];
    for (let i = 0; i < count; i++) {
      const s = this.stars[i];
      const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
      let [x, y] = this.starPos(s, scroll, t);
      if (style === 'embers' || style === 'motes') {
        const rise = style === 'embers' ? -1 : 1;
        y = ((((s.y * this.h + rise * t * 14 * s.z) % this.h) + this.h) % this.h);
        x += Math.sin(t * 0.6 + s.ph) * 10 * s.z;
      }
      pts.push([x, y, s]);
      const r = (0.6 + s.z * 1.4) * (1 + 0.4 * (1 - this.sysProgress));
      if (style === 'sparkle' || style === 'constellations' || style === 'rays') {
        if (s.r > 0.7) { this.sparkle(x, y, r * 3 * tw, col, tw); continue; }
      }
      if (style === 'bokeh' && s.r > 0.8) {
        ctx.fillStyle = rgb(this.cur.neb[i % 3], 0.18 * tw);
        ctx.beginPath(); ctx.arc(x, y, r * 7, 0, Math.PI * 2); ctx.fill();
        continue;
      }
      let c = col;
      if (style === 'twins') c = s.twin ? [150, 200, 255] : [255, 200, 140];
      if (style === 'embers') c = [255, 150 + 80 * s.r, 60];
      if (style === 'motes') c = [255, 180, 190];
      ctx.fillStyle = rgb(c, tw * (0.5 + 0.5 * s.z));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (style === 'constellations') {
      ctx.strokeStyle = rgb(col, 0.16);
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length - 1; i += 1) {
        const [x0, y0, s0] = pts[i];
        if (s0.r < 0.7) continue;
        let best = null;
        let bd = 160 * 160;
        for (let j = i + 1; j < Math.min(pts.length, i + 40); j++) {
          const [x1, y1, s1] = pts[j];
          if (s1.r < 0.7) continue;
          const d = (x1 - x0) ** 2 + (y1 - y0) ** 2;
          if (d < bd) { bd = d; best = pts[j]; }
        }
        if (best) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(best[0], best[1]); ctx.stroke(); }
      }
    }
    ctx.restore();
  }

  sparkle(x, y, r, col, tw) {
    const { ctx } = this;
    ctx.fillStyle = rgb(col, 0.9 * tw);
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
  }

  drawRays(t) {
    const { ctx, w, h } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const a = -0.5 + i * 0.25 + Math.sin(t * 0.1 + i) * 0.05;
      ctx.save();
      ctx.translate(w * 0.5, -h * 0.2);
      ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, 0, h * 1.3);
      g.addColorStop(0, rgb(this.cur.neb[i % 3], 0.12));
      g.addColorStop(1, rgb(this.cur.neb[i % 3], 0));
      ctx.fillStyle = g;
      ctx.fillRect(-40 - i * 6, 0, 80 + i * 12, h * 1.3);
      ctx.restore();
    }
    ctx.restore();
  }

  drawAurora(t) {
    const { ctx, w, h } = this;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      const base = h * (0.2 + k * 0.18);
      ctx.moveTo(0, base);
      for (let x = 0; x <= w; x += 24) ctx.lineTo(x, base + Math.sin(x / 160 + t * 0.4 + k) * 40 + Math.sin(x / 70 + t * 0.7) * 12);
      ctx.lineTo(w, base + 160);
      ctx.lineTo(0, base + 160);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, base - 40, 0, base + 160);
      g.addColorStop(0, rgb(this.cur.neb[k], 0.18));
      g.addColorStop(1, rgb(this.cur.neb[k], 0));
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.restore();
  }

  drawShooters(t, dt) {
    const { ctx } = this;
    if (!this.reduced && Math.random() < dt * 0.25) {
      this.shooters.push({ x: Math.random() * this.w, y: Math.random() * this.h * 0.5, vx: -(300 + Math.random() * 300), vy: 120 + Math.random() * 120, life: 0 });
    }
    this.shooters = this.shooters.filter((s) => s.life < 1.1);
    for (const s of this.shooters) {
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const a = Math.max(0, 1 - s.life);
      const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.15, s.y - s.vy * 0.15);
      g.addColorStop(0, `rgba(255,255,255,${a})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.15, s.y - s.vy * 0.15);
      ctx.stroke();
    }
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
  }
}
