// Procedural planet & moon surfaces.
// Each world gets a seamless (horizontally wrapping) surface map painted on a
// canvas from its own seed, plus an optional cloud layer. CSS scrolls the map
// behind a shaded sphere so the world appears to rotate; clouds drift at a
// different speed, so weather moves over the continents.

const cache = new Map();

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hx) {
  const v = parseInt(hx.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
const mix = (a, b, t) => a.map((x, i) => Math.round(x + (b[i] - x) * t));
const css = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

/** Draw something three times so it wraps seamlessly around the planet. */
function wrapDraw(W, x, fn) {
  fn(x);
  fn(x - W);
  fn(x + W);
}

/** A lumpy, organic blob (continent, cloud, crater field…). */
function blob(ctx, W, x, y, r, R, fill) {
  const pts = [];
  const n = 14;
  for (let i = 0; i < n; i++) pts.push(r * (0.6 + 0.6 * R()));
  wrapDraw(W, x, (cx) => {
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rr = pts[i % n];
      const px = cx + Math.cos(a) * rr * 1.25;
      const py = y + Math.sin(a) * rr * 0.8;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.quadraticCurveTo(cx + Math.cos(a - 0.2) * rr * 1.35, y + Math.sin(a - 0.2) * rr * 0.9, px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  });
}

function softSpot(ctx, W, x, y, rx, ry, col, a) {
  wrapDraw(W, x, (cx) => {
    const g = ctx.createRadialGradient(cx, y, 0, cx, y, rx);
    g.addColorStop(0, css(col, a));
    g.addColorStop(1, css(col, 0));
    ctx.save();
    ctx.translate(cx, y);
    ctx.scale(1, ry / rx);
    ctx.translate(-cx, -y);
    ctx.fillStyle = g;
    ctx.fillRect(cx - rx, y - rx, rx * 2, rx * 2);
    ctx.restore();
  });
}

function crater(ctx, W, x, y, r, base) {
  wrapDraw(W, x, (cx) => {
    ctx.beginPath();
    ctx.ellipse(cx, y, r * 1.2, r, 0, 0, Math.PI * 2);
    ctx.fillStyle = css(mix(base, [0, 0, 0], 0.35));
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.25, y + r * 0.2, r * 0.9, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = css(mix(base, [0, 0, 0], 0.15));
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.3, y - r * 0.3, r * 0.5, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = css(mix(base, [255, 255, 255], 0.25), 0.5);
    ctx.fill();
  });
}

export const WORLD_KINDS = ['terran', 'gas', 'rocky', 'lava', 'ice', 'desert', 'ocean', 'gas', 'terran'];

/**
 * Paint a world. Returns { surface, clouds } as data URLs.
 * kind: terran | gas | rocky | lava | ice | desert | ocean | moon
 */
export function worldTextures(seed, kind, tintHex) {
  const key = `${seed}:${kind}:${tintHex}`;
  if (cache.has(key)) return cache.get(key);
  const R = rng(seed);
  const W = kind === 'moon' ? 128 : 320;
  const H = W / 2;
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const tint = hexToRgb(tintHex);
  let clouds = null;

  if (kind === 'terran' || kind === 'ocean') {
    // Oceans: deeper toward the poles.
    const deep = mix([18, 60, 140], tint, 0.25);
    const shallow = mix([40, 140, 210], tint, 0.15);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, css(deep));
    g.addColorStop(0.5, css(shallow));
    g.addColorStop(1, css(deep));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const land = kind === 'terran' ? 5 + Math.floor(R() * 4) : 3 + Math.floor(R() * 3);
    const green = mix([70, 150, 70], tint, 0.15);
    const brown = [160, 130, 80];
    for (let i = 0; i < land; i++) {
      const x = R() * W;
      const y = H * (0.25 + R() * 0.5);
      const r = (kind === 'terran' ? 18 : 8) + R() * (kind === 'terran' ? 26 : 12);
      blob(ctx, W, x, y, r * 1.08, R, css(mix(green, [230, 220, 160], 0.35))); // beaches
      blob(ctx, W, x, y, r, R, css(green));
      blob(ctx, W, x + r * 0.3, y - r * 0.1, r * 0.5, R, css(brown, 0.8)); // mountains / deserts
    }
    // Ice caps
    ctx.fillStyle = 'rgba(245,250,255,.95)';
    for (const top of [true, false]) {
      ctx.beginPath();
      ctx.moveTo(0, top ? 0 : H);
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, (top ? 0 : H) + (top ? 1 : -1) * (H * 0.08 + Math.sin(x / 20 + R() * 6) * 4 + R() * 4));
      ctx.lineTo(W, top ? 0 : H);
      ctx.closePath();
      ctx.fill();
    }
    clouds = cloudLayer(W, H, R, kind === 'ocean' ? 14 : 10);
  } else if (kind === 'gas') {
    const a = mix(tint, [255, 235, 200], 0.35);
    const b = mix(tint, [90, 50, 30], 0.35);
    const bands = 9 + Math.floor(R() * 6);
    const phases = Array.from({ length: bands }, () => R());
    for (let y = 0; y < H; y++) {
      const v = y / H;
      const k = Math.floor(v * bands);
      const wobble = Math.sin(v * Math.PI * bands + phases[k] * 6) * 0.5 + 0.5;
      ctx.fillStyle = css(mix(a, b, wobble * 0.8 + phases[k] * 0.2));
      // Turbulent band edges
      for (let x = 0; x < W; x += 4) ctx.fillRect(x, y + Math.sin(x / 18 + y / 6) * 0.8, 4, 1.4);
    }
    // A great storm spot
    const sx = R() * W;
    const sy = H * (0.35 + R() * 0.3);
    softSpot(ctx, W, sx, sy, 22 + R() * 12, 12 + R() * 6, mix(b, [200, 60, 40], 0.5), 0.9);
    softSpot(ctx, W, sx, sy, 10, 6, mix(a, [255, 255, 255], 0.3), 0.6);
  } else if (kind === 'lava') {
    ctx.fillStyle = css(mix([35, 22, 22], tint, 0.15));
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) {
      // glowing cracks
      let x = R() * W;
      let y = R() * H;
      ctx.strokeStyle = css(mix([255, 140, 30], [255, 230, 120], R()), 0.9);
      ctx.lineWidth = 1 + R() * 2.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 6; k++) { x += (R() - 0.5) * 30; y += (R() - 0.5) * 16; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    for (let i = 0; i < 9; i++) softSpot(ctx, W, R() * W, R() * H, 10 + R() * 14, 8 + R() * 8, [255, 120, 30], 0.7);
  } else if (kind === 'ice') {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#F4FBFF');
    g.addColorStop(0.5, css(mix([190, 225, 245], tint, 0.25)));
    g.addColorStop(1, '#F4FBFF');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) blob(ctx, W, R() * W, R() * H, 10 + R() * 20, R, css(mix([150, 200, 235], tint, 0.3), 0.5));
    ctx.strokeStyle = 'rgba(80,150,200,.55)';
    for (let i = 0; i < 22; i++) {
      ctx.lineWidth = 0.8 + R();
      let x = R() * W;
      let y = R() * H;
      ctx.beginPath();
      ctx.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += (R() - 0.5) * 40; y += (R() - 0.5) * 20; ctx.lineTo(x, y); }
      ctx.stroke();
    }
  } else if (kind === 'desert') {
    const sand = mix([214, 160, 96], tint, 0.2);
    ctx.fillStyle = css(sand);
    ctx.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = css(mix(sand, [120, 70, 40], 0.15 + 0.15 * Math.sin(y / 5 + R())), 0.6);
      for (let x = 0; x < W; x += 6) ctx.fillRect(x, y + Math.sin(x / 14 + y) * 1.5, 6, 1.5);
    }
    for (let i = 0; i < 6; i++) blob(ctx, W, R() * W, R() * H, 8 + R() * 18, R, css(mix(sand, [90, 50, 30], 0.45), 0.7));
    for (let i = 0; i < 5; i++) crater(ctx, W, R() * W, R() * H, 3 + R() * 5, sand);
  } else {
    // rocky planets and moons
    const base = kind === 'moon' ? mix([170, 168, 180], tint, 0.25) : mix([150, 140, 135], tint, 0.35);
    ctx.fillStyle = css(base);
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) blob(ctx, W, R() * W, R() * H, W * (0.05 + R() * 0.1), R, css(mix(base, [40, 40, 50], 0.3), 0.55)); // maria
    const n = kind === 'moon' ? 14 : 30;
    for (let i = 0; i < n; i++) crater(ctx, W, R() * W, H * (0.1 + R() * 0.8), (kind === 'moon' ? 2 : 3) + R() * (kind === 'moon' ? 6 : 10), base);
  }

  const out = { surface: cv.toDataURL('image/png'), clouds: clouds ? clouds.toDataURL('image/png') : null };
  cache.set(key, out);
  return out;
}

function cloudLayer(W, H, R, count) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  for (let i = 0; i < count; i++) {
    const x = R() * W;
    const y = H * (0.15 + R() * 0.7);
    const len = 20 + R() * 50;
    for (let k = 0; k < 5; k++) softSpot(ctx, W, x + k * len * 0.25, y + (R() - 0.5) * 6, 10 + R() * 12, 5 + R() * 4, [255, 255, 255], 0.55);
  }
  // A spiral storm
  const sx = R() * W;
  const sy = H * (0.3 + R() * 0.4);
  for (let a = 0; a < Math.PI * 4; a += 0.25) softSpot(ctx, W, sx + Math.cos(a) * a * 2.2, sy + Math.sin(a) * a * 1.2, 5, 3, [255, 255, 255], 0.5);
  return cv;
}
