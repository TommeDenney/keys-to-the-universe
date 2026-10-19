// Travel animations on the Learn map:
//  - diving into a planet (its colour sweeps out from the planet to fill the screen),
//  - returning to orbit (the reverse, shrinking back into the planet),
//  - after finishing a world, your ship and pet fly along the route to the next one.
// Everything is transform/clip-path based so it stays smooth on the GPU.

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let pending = null;

/** Remember where we're coming back from, for the return-to-orbit animation. */
export function markReturn(id, { completed = false } = {}) {
  pending = { id, completed, at: Date.now() };
}
export function takeReturn() {
  const r = pending && Date.now() - pending.at < 20000 ? pending : null;
  pending = null;
  return r;
}

function overlay(x, y, color) {
  const el = document.createElement('div');
  el.className = 'travel-overlay';
  el.style.setProperty('--x', `${x}px`);
  el.style.setProperty('--y', `${y}px`);
  el.style.setProperty('--c', color || '#6D5BFF');
  el.innerHTML = '<i class="travel-streaks"></i>';
  document.body.appendChild(el);
  return el;
}
const center = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
const R = () => Math.hypot(window.innerWidth, window.innerHeight);

/** Dive into a planet, then open its lesson. */
export function diveInto(orb, href, color) {
  if (reduced() || !orb) { location.hash = href; return; }
  const [x, y] = center(orb);
  const el = overlay(x, y, color);
  const grow = el.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R()}px at ${x}px ${y}px)` }], { duration: 560, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
  orb.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }], { duration: 560, easing: 'ease-in' });
  grow.onfinish = () => {
    location.hash = href;
    // Let the lesson appear underneath, then fade the colour away.
    setTimeout(() => {
      const fade = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, fill: 'forwards' });
      fade.onfinish = () => el.remove();
    }, 260);
  };
}

/** Back to orbit: the screen shrinks into the planet you just left. */
export function surfaceInto(orb, color) {
  if (reduced() || !orb) return Promise.resolve();
  const [x, y] = center(orb);
  const el = overlay(x, y, color);
  const shrink = el.animate([{ clipPath: `circle(${R()}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }], { duration: 620, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
  orb.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
  return new Promise((ok) => { shrink.onfinish = () => { el.remove(); ok(); }; });
}

/**
 * Fly your ship (and pet) from one world to the next, with the map following.
 * `host` is the positioned page element, `scroller` the scrolling container.
 */
export function flyShip({ host, scroller, from, to, shipHTML, petHTML }) {
  if (reduced() || !from || !to) return Promise.resolve();
  const hr = host.getBoundingClientRect();
  const pos = (el) => { const r = el.getBoundingClientRect(); return [r.left - hr.left + r.width / 2, r.top - hr.top + r.height / 2]; };
  const [x0, y0] = pos(from);
  const [x1, y1] = pos(to);
  const flyer = document.createElement('div');
  flyer.className = 'ship-flyer';
  flyer.innerHTML = `<div class="sf-ship">${shipHTML}</div>${petHTML ? `<div class="sf-pet">${petHTML}</div>` : ''}`;
  host.appendChild(flyer);
  // A gentle arc: bow out to the side of the route.
  const side = x1 >= x0 ? -1 : 1;
  const mx = (x0 + x1) / 2 + side * Math.min(160, Math.abs(y1 - y0) * 0.35 + 60);
  const my = (y0 + y1) / 2;
  const pts = [];
  const N = 24;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1;
    const dx = 2 * (1 - t) * (mx - x0) + 2 * t * (x1 - mx);
    const dy = 2 * (1 - t) * (my - y0) + 2 * t * (y1 - my);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI + 90; // the ship art points up
    const s = 1 + 0.25 * Math.sin(t * Math.PI); // a little bigger mid-flight
    pts.push({ x, y, ang, s, t });
  }
  const dur = Math.min(3200, Math.max(1800, Math.hypot(x1 - x0, y1 - y0) * 3.2));
  const anim = flyer.animate(pts.map((p) => ({ transform: `translate(${p.x}px, ${p.y}px) rotate(${p.ang}deg) scale(${p.s})`, offset: p.t })), { duration: dur, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
  // Keep the ship in view: ease the map's scroll along with it.
  const s0 = scroller.scrollTop;
  const target = Math.max(0, s0 + (y1 - y0));
  const t0 = performance.now();
  let raf = 0;
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const follow = (now) => {
    const t = Math.min(1, (now - t0) / dur);
    scroller.scrollTop = s0 + (target - s0) * ease(t);
    if (t < 1) raf = requestAnimationFrame(follow);
  };
  raf = requestAnimationFrame(follow);
  // A sparkle trail behind the ship.
  const trail = setInterval(() => {
    const m = flyer.getAnimations()[0];
    if (!m) return;
    const r = flyer.getBoundingClientRect();
    const dot = document.createElement('i');
    dot.className = 'sf-spark';
    dot.style.left = `${r.left - hr.left + r.width / 2}px`;
    dot.style.top = `${r.top - host.getBoundingClientRect().top + r.height / 2}px`;
    host.appendChild(dot);
    setTimeout(() => dot.remove(), 900);
  }, 70);
  return new Promise((ok) => {
    anim.onfinish = () => {
      clearInterval(trail);
      cancelAnimationFrame(raf);
      flyer.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }).onfinish = () => flyer.remove();
      ok();
    };
  });
}
