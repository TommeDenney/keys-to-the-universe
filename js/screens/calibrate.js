// Microphone calibration: play a few known keys; we measure where the mic
// actually hears them and store the pitch offset.

import { h, icon, modal } from '../ui.js';
import { mic } from '../input/mic.js';
import { settings } from '../store.js';
import { Keyboard } from '../render/keyboard.js';
import { noteName } from '../music/theory.js';

const TARGETS = [60, 64, 67, 72, 48]; // C4 E4 G4 C5 C3

export function openCalibration(onDone) {
  let kb = null;
  let cancelled = false;
  const status = h('p', { class: 'calib-status' }, 'Starting the microphone…');
  const prompt = h('h2', {}, 'Calibrate the microphone');
  const dots = h('div', { class: 'calib-dots' }, TARGETS.map(() => h('i')));
  const kbEl = h('div', { class: 'calib-kb' });
  const close = modal((closeFn) => [
    h('div', { class: 'calib' }, [
      prompt,
      h('p', { class: 'muted' }, 'Play each highlighted key once, firmly, and let it ring. Ivory measures where your microphone hears it and corrects for the difference.'),
      kbEl, dots, status,
      h('div', { class: 'row' }, [h('button', { class: 'btn ghost', onclick: () => closeFn() }, 'Cancel')]),
    ]),
  ], { onClose: () => { cancelled = true; cleanup(); } });

  function cleanup() {
    mic.frameHook = null;
    mic.calibrating = false;
    if (kb) kb.destroy();
  }

  (async () => {
    const st = await mic.start();
    if (st !== 'on') { status.textContent = 'Couldn’t start the microphone. Allow microphone access for this site and try again.'; return; }
    kb = new Keyboard(kbEl, { lo: 48, hi: 74, labels: 'c', interactive: false });
    mic.calibrating = true;
    const offsets = [];
    for (let i = 0; i < TARGETS.length && !cancelled; i++) {
      const target = TARGETS[i];
      kb.setHints(new Map([[target, { hand: target < 60 ? 'L' : 'R' }]]));
      prompt.textContent = `Play ${noteName(target)}${target === 60 ? ' (Middle C)' : target === 48 ? ' (the C below Middle C)' : target === 72 ? ' (the C above Middle C)' : ''}`;
      status.textContent = 'Listening…';
      const est = await measure(target, () => cancelled);
      if (cancelled) return;
      if (est == null) { status.textContent = 'Didn’t catch that, play it again.'; i--; continue; }
      offsets.push(est - target);
      dots.children[i].className = 'on';
      status.textContent = `Heard it ✓ (${fmt(est - target)})`;
      await wait(500);
    }
    if (cancelled) return;
    // Median, folded to the most common octave.
    const sorted = [...offsets].sort((a, b) => a - b);
    const med = sorted[Math.floor(sorted.length / 2)];
    const agree = offsets.filter((o) => Math.abs(o - med) < 0.6);
    const offset = agree.reduce((a, b) => a + b, 0) / agree.length;
    cleanup();
    const prev = settings.get('micPitchOffset');
    const total = Math.round((prev + offset) * 100) / 100;
    settings.set('micPitchOffset', total);
    mic.setPitchOffset(total);
    kb.setHints(new Map());
    prompt.textContent = Math.abs(total) < 0.3 ? 'Your microphone is in tune ✓' : 'Calibrated ✓';
    status.replaceChildren(
      Math.abs(total) < 0.3 ? 'No correction needed.' : `Your mic was hearing notes ${fmt(total)} off. That’s now corrected.`,
      agree.length < offsets.length ? h('br') : '',
      agree.length < offsets.length ? h('small', {}, `(${offsets.length - agree.length} reading(s) disagreed and were ignored: ${offsets.map(fmt).join(', ')})`) : '',
    );
    const row = document.querySelector('.calib .row');
    row.replaceChildren(h('button', { class: 'btn primary', onclick: () => { close(); if (onDone) onDone(total); } }, [icon('check'), 'Done']));
  })();

  // Measure one note: wait for a clear attack, then average the pitch scan
  // over ~0.3 s and take the best fractional pitch near the target.
  function measure(target, isCancelled) {
    return new Promise((resolve) => {
      let base = null;
      let armed = false;
      let frames = 0;
      let acc = null;
      const start = performance.now();
      const scanLo = target - 13 + settings.get('micPitchOffset');
      const scanHi = target + 13 + settings.get('micPitchOffset');
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
        if (frames < 5) return; // let the window fill with the new note
        const scan = det.pitchScan(scanLo, scanHi, 0.1);
        if (!acc) acc = scan.map((x) => ({ ...x }));
        else scan.forEach((x, k) => (acc[k].s += x.s));
        if (frames >= 22) {
          mic.frameHook = null;
          let best = acc[0];
          for (const x of acc) if (x.s > best.s) best = x;
          // The detector already applied the old offset; scan is absolute, so
          // report relative to the uncorrected target.
          resolve(best.p - settings.get('micPitchOffset'));
        }
      };
    });
  }
}

function fmt(o) {
  const r = Math.round(o * 10) / 10;
  return `${r > 0 ? '+' : ''}${r} semitone${Math.abs(r) === 1 ? '' : 's'}`;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
