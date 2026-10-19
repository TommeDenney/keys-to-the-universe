// Learn-tab ambience: procedurally generated soundscapes (no recordings).
// Every note swells in slowly (≥1.2 s) so the microphone listener, which
// looks for sharp piano-like attacks, doesn't mistake it for your playing.

import { audio } from './engine.js';
import { settings } from '../store.js';
import { midiToFreq } from '../music/theory.js';

let current = null;

const PROGRESSIONS = {
  'amb-nebula': [[48, 55, 62, 67], [45, 52, 60, 64], [41, 48, 57, 64], [43, 50, 59, 62]],
  'amb-lofi': [[50, 57, 60, 65], [55, 59, 62, 65], [48, 55, 59, 64], [45, 52, 55, 60]],
  'amb-choir': [[48, 55, 64, 67], [53, 57, 60, 65], [45, 57, 60, 64], [43, 55, 59, 62]],
  'amb-shimmer': [[72, 79, 84, 88], [69, 76, 81, 84], [65, 72, 77, 81], [67, 74, 79, 83]],
};

export function startAmbient(id) {
  stopAmbient();
  if (!id || id === 'amb-none' || !PROGRESSIONS[id] || settings.get('ambientOn') === false) return;
  const ctx = audio.ensure();
  const out = ctx.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(settings.get('ambientVolume') ?? 0.35, ctx.currentTime + 3);
  out.connect(audio.musicBus);
  const prog = PROGRESSIONS[id];
  const chordLen = id === 'amb-lofi' ? 4.8 : 9;
  let k = 0;
  let nextAt = ctx.currentTime + 0.1;
  const voices = [];
  const st = { id, out, timer: 0, voices };

  const playChord = (t, notes) => {
    for (const m of notes) {
      const f = midiToFreq(m);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      const peak = id === 'amb-shimmer' ? 0.035 : id === 'amb-lofi' ? 0.05 : 0.045;
      g.gain.linearRampToValueAtTime(peak, t + (id === 'amb-lofi' ? 1.2 : 2.6));
      g.gain.setTargetAtTime(0, t + chordLen - 1.2, 1.1);
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = id === 'amb-shimmer' ? 6000 : id === 'amb-choir' ? 1600 : 1100;
      g.connect(lp).connect(out);
      const types = id === 'amb-lofi' ? ['sine', 'triangle'] : id === 'amb-choir' ? ['sawtooth', 'sawtooth'] : ['sawtooth', 'triangle'];
      types.forEach((type, i) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f * (1 + (i ? 0.004 : -0.004));
        if (id === 'amb-choir') { // vowel-ish formant
          const bp = ctx.createBiquadFilter();
          bp.type = 'bandpass';
          bp.frequency.value = 700 + i * 450;
          bp.Q.value = 3;
          o.connect(bp).connect(g);
        } else o.connect(g);
        o.start(t);
        o.stop(t + chordLen + 4);
        voices.push(o);
      });
    }
    if (voices.length > 80) voices.splice(0, voices.length - 80);
  };

  // Gentle vinyl crackle for lo-fi.
  if (id === 'amb-lofi') {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < 0.0008 ? (Math.random() - 0.5) * 0.6 : (Math.random() - 0.5) * 0.01;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0.25;
    src.connect(g).connect(out);
    src.start();
    voices.push(src);
  }

  const tick = () => {
    while (nextAt < ctx.currentTime + 1.5) {
      playChord(nextAt, prog[k % prog.length]);
      k++;
      nextAt += chordLen;
    }
  };
  tick();
  st.timer = setInterval(tick, 500);
  current = st;
}

export function stopAmbient() {
  if (!current) return;
  const st = current;
  current = null;
  clearInterval(st.timer);
  const ctx = audio.ctx;
  st.out.gain.cancelScheduledValues(ctx.currentTime);
  st.out.gain.setValueAtTime(st.out.gain.value, ctx.currentTime);
  st.out.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => {
    for (const v of st.voices) { try { v.stop(); } catch { /* done */ } }
    st.out.disconnect();
  }, 1000);
}

export function setAmbientVolume(v) {
  if (current && audio.ctx) current.out.gain.setTargetAtTime(v, audio.ctx.currentTime, 0.2);
}

export const ambientPlaying = () => !!current;
