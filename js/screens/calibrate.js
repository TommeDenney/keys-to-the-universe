// Microphone calibration, two phases:
//  1. Pitch: play 5 known keys; we measure where the mic actually hears them
//     and store a pitch offset (fixes e.g. Middle C being heard as E).
//  2. Ghosts: play C-D-E-F-G; everything else the mic "hears" meanwhile is a
//     by-product of your piano/room (overtones, resonance). Those intervals
//     are learned so they're never flagged as wrong notes.

import { h, icon, modal } from '../ui.js';
import { mic } from '../input/mic.js';
import { settings } from '../store.js';
import { Keyboard } from '../render/keyboard.js';
import { noteName } from '../music/theory.js';

const PITCH_TARGETS = [60, 64, 67, 72, 48]; // C4 E4 G4 C5 C3
const GHOST_TARGETS = [60, 62, 64, 65, 67]; // C D E F G

const label = (m) => `${noteName(m)}${m === 60 ? ' (Middle C)' : m === 48 ? ' (the C below Middle C)' : m === 72 ? ' (the C above Middle C)' : ''}`;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function fmt(o) {
  const r = Math.round(o * 10) / 10;
  return `${r > 0 ? '+' : ''}${r} semitone${Math.abs(r) === 1 ? '' : 's'}`;
}

export function openCalibration(onDone) {
  let kb = null;
  let cancelled = false;
  const phase = h('div', { class: 'eyebrow' }, 'Step 1 of 2 · Pitch');
  const prompt = h('h2', {}, 'Calibrate the microphone');
  const info = h('p', { class: 'muted' }, 'Play each highlighted key once, firmly, and let it ring. Ivory measures where your microphone hears it.');
  const status = h('p', { class: 'calib-status' }, 'Starting the microphone…');
  const dots = h('div', { class: 'calib-dots' });
  const kbEl = h('div', { class: 'calib-kb' });
  const row = h('div', { class: 'row' });
  const close = modal((closeFn) => {
    row.append(h('button', { class: 'btn ghost', onclick: () => closeFn() }, 'Cancel'));
    return [h('div', { class: 'calib' }, [phase, prompt, info, kbEl, dots, status, row])];
  }, { onClose: () => { cancelled = true; cleanup(); } });

  function cleanup() {
    mic.frameHook = null;
    mic.calibrating = false;
    if (mic.detector) mic.detector.setExpected([]);
    if (kb) { kb.destroy(); kb = null; }
  }
  const setDots = (n) => dots.replaceChildren(...Array.from({ length: n }, () => h('i')));
  const hint = (m) => kb.setHints(new Map([[m, { hand: m < 60 ? 'L' : 'R' }]]));

  (async () => {
    const st = await mic.start();
    if (st !== 'on') { status.textContent = 'Couldn’t start the microphone. Allow microphone access for this site and try again.'; return; }
    kb = new Keyboard(kbEl, { lo: 48, hi: 74, labels: 'c', interactive: false });
    mic.calibrating = true;

    // ---- Phase 1: pitch offset ----
    setDots(PITCH_TARGETS.length);
    const offsets = [];
    for (let i = 0; i < PITCH_TARGETS.length && !cancelled; i++) {
      const target = PITCH_TARGETS[i];
      hint(target);
      prompt.textContent = `Play ${label(target)}`;
      status.textContent = 'Listening…';
      const est = await measurePitch(target, () => cancelled);
      if (cancelled) return;
      if (est == null) { status.textContent = 'Didn’t catch that, play it again.'; i--; continue; }
      offsets.push(est - target);
      dots.children[i].className = 'on';
      status.textContent = `Heard it ✓ (${fmt(est - target)})`;
      await wait(600);
    }
    if (cancelled) return;
    const sorted = [...offsets].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    const agree = offsets.filter((o) => Math.abs(o - med) < 0.6);
    const total = Math.round((settings.get('micPitchOffset') + agree.reduce((a, b) => a + b, 0) / agree.length) * 100) / 100;
    settings.set('micPitchOffset', total);
    mic.setPitchOffset(total);
    const pitchMsg = Math.abs(total) < 0.3 ? 'Pitch: in tune, no correction needed.' : `Pitch: corrected by ${fmt(total)}.`;

    // ---- Phase 2: learn ghost notes ----
    phase.textContent = 'Step 2 of 2 · Ignore phantom notes';
    info.textContent = 'Now play C, D, E, F, G one at a time, slowly, letting each ring for a second. Ivory learns which extra notes your piano and room create, so they’re never counted as mistakes.';
    setDots(GHOST_TARGETS.length);
    const ghostCounts = new Map();
    for (let i = 0; i < GHOST_TARGETS.length && !cancelled; i++) {
      const target = GHOST_TARGETS[i];
      hint(target);
      prompt.textContent = `Play ${label(target)}`;
      status.textContent = 'Listening…';
      const seen = await collectGhosts(target, () => cancelled);
      if (cancelled) return;
      if (seen == null) { status.textContent = 'Didn’t catch that, play it again.'; i--; continue; }
      for (const d of seen) ghostCounts.set(d, (ghostCounts.get(d) || 0) + 1);
      dots.children[i].className = 'on';
      status.textContent = seen.size ? `Heard it ✓ (+${seen.size} phantom note${seen.size === 1 ? '' : 's'} learned)` : 'Heard it ✓ (clean!)';
      await wait(500);
    }
    if (cancelled) return;
    const ghosts = [...ghostCounts.keys()].filter((d) => d !== 0 && Math.abs(d) <= 31);
    settings.set('micGhosts', ghosts);
    mic.setGhosts(ghosts);
    cleanup();

    phase.textContent = 'All done';
    prompt.textContent = 'Microphone calibrated ✓';
    info.textContent = '';
    status.replaceChildren(
      pitchMsg, h('br'),
      ghosts.length ? `Phantom notes: learned to ignore ${ghosts.length} pattern${ghosts.length === 1 ? '' : 's'} from your piano.` : 'Phantom notes: none detected.',
      agree.length < offsets.length ? h('br') : '',
      agree.length < offsets.length ? h('small', {}, `(${offsets.length - agree.length} pitch reading(s) disagreed and were ignored: ${offsets.map(fmt).join(', ')})`) : '',
    );
    row.replaceChildren(h('button', { class: 'btn primary', onclick: () => { close(); if (onDone) onDone(total); } }, [icon('check'), 'Done']));
  })();

  // Phase 1 measurement: wait for a clear attack, then average a fine pitch
  // scan over ~0.3 s and take the best fractional pitch near the target.
  function measurePitch(target, isCancelled) {
    return new Promise((resolve) => {
      let base = null;
      let armed = false;
      let frames = 0;
      let acc = null;
      const start = performance.now();
      const prev = settings.get('micPitchOffset');
      mic.frameHook = (det, level) => {
        if (isCancelled()) { mic.frameHook = null; resolve(null); return; }
        if (base == null) base = level;
        if (!armed) {
          base = Math.min(base * 0.95 + level * 0.05, level + 3);
          if (level > base + 12 && level > -60) armed = true;
          if (performance.now() - start > 15000) { mic.frameHook = null; resolve(null); }
          return;
        }
        frames++;
        if (frames < 5) return;
        const scan = det.pitchScan(target - 13 + prev, target + 13 + prev, 0.1);
        if (!acc) acc = scan.map((x) => ({ ...x }));
        else scan.forEach((x, k) => (acc[k].s += x.s));
        if (frames >= 22) {
          mic.frameHook = null;
          let best = acc[0];
          for (const x of acc) if (x.s > best.s) best = x;
          resolve(best.p - prev);
        }
      };
    });
  }

  // Phase 2: with the target expected, record every *other* note the
  // detector reports while it rings (signed interval from the target).
  function collectGhosts(target, isCancelled) {
    return new Promise((resolve) => {
      mic.detector.setExpected([target]);
      const seen = new Set();
      let heardAt = 0;
      const start = performance.now();
      mic.frameHook = (det, level, t, onsets) => {
        if (isCancelled()) { mic.frameHook = null; resolve(null); return; }
        for (const o of onsets || []) {
          if (o.midi === target) { if (!heardAt) heardAt = performance.now(); continue; }
          if (heardAt) seen.add(o.midi - target);
        }
        if (heardAt && performance.now() - heardAt > 1600) { mic.frameHook = null; resolve(seen); }
        else if (!heardAt && performance.now() - start > 15000) { mic.frameHook = null; resolve(null); }
      };
    });
  }
}
