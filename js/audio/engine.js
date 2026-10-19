// Audio output: sampled grand piano (Salamander, CC-BY 3.0) with a synth
// fallback while samples load, plus a metronome click.

import { midiToFreq } from '../music/theory.js';

const SAMPLE_NOTES = ['A1', 'C2', 'Ds2', 'Fs2', 'A2', 'C3', 'Ds3', 'Fs3', 'A3', 'C4', 'Ds4', 'Fs4', 'A4', 'C5', 'Ds5', 'Fs5', 'A5', 'C6', 'Ds6', 'Fs6', 'A6', 'C7'];
const NAME_SEMI = { C: 0, Ds: 3, Fs: 6, A: 9 };

function sampleMidi(name) {
  const m = /^([A-Z]s?)(\d)$/.exec(name);
  return (parseInt(m[2], 10) + 1) * 12 + NAME_SEMI[m[1]];
}

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.buffers = new Map(); // midi → AudioBuffer
    this.loading = null;
    this.volume = 0.8;
    this.clickVolume = 0.6;
    this.voices = new Map(); // key → {src, gain}
  }

  /** Must be called from a user gesture the first time (iOS). */
  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: 'interactive' });
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.ratio.value = 4;
      this.master.connect(comp).connect(this.ctx.destination);
      this.loadSamples();
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  get now() {
    return this.ctx ? this.ctx.currentTime : performance.now() / 1000;
  }

  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  loadSamples() {
    if (this.loading) return this.loading;
    const base = new URL('../../assets/samples/', import.meta.url);
    this.loading = Promise.all(
      SAMPLE_NOTES.map(async (name) => {
        try {
          const res = await fetch(new URL(`${name}.mp3`, base));
          const data = await res.arrayBuffer();
          const buf = await new Promise((ok, fail) => this.ctx.decodeAudioData(data, ok, fail));
          this.buffers.set(sampleMidi(name), buf);
        } catch (e) {
          console.warn('sample failed', name, e);
        }
      }),
    ).then(() => this.buffers.size);
    return this.loading;
  }

  nearestSample(midi) {
    let best = null;
    let bestD = 1e9;
    for (const m of this.buffers.keys()) {
      const d = Math.abs(m - midi);
      if (d < bestD) { bestD = d; best = m; }
    }
    return best;
  }

  /**
   * Play a note. `when` in AudioContext time (default now), `dur` seconds
   * (undefined = hold until noteOff(key)).
   */
  play(midi, { when = 0, dur, velocity = 0.8, key } = {}) {
    const ctx = this.ensure();
    const t = Math.max(when || 0, ctx.currentTime);
    const gain = ctx.createGain();
    const amp = 0.15 + 0.85 * velocity * velocity;
    gain.connect(this.master);
    let src;
    const sm = this.nearestSample(midi);
    if (sm != null) {
      src = ctx.createBufferSource();
      src.buffer = this.buffers.get(sm);
      src.playbackRate.value = Math.pow(2, (midi - sm) / 12);
      gain.gain.setValueAtTime(amp, t);
      src.connect(gain);
    } else {
      // Fallback synth: a few decaying partials.
      src = ctx.createOscillator();
      const wave = ctx.createPeriodicWave(new Float32Array([0, 1, 0.45, 0.25, 0.12, 0.06]), new Float32Array(6));
      src.setPeriodicWave(wave);
      src.frequency.value = midiToFreq(midi);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(amp * 0.35, t + 0.005);
      gain.gain.setTargetAtTime(amp * 0.12, t + 0.01, 0.4);
      src.connect(gain);
    }
    src.start(t);
    const voice = { src, gain };
    if (dur != null) {
      this.release(voice, t + dur);
    } else if (key != null) {
      const old = this.voices.get(key);
      if (old) this.release(old, ctx.currentTime);
      this.voices.set(key, voice);
    }
    return voice;
  }

  release(voice, at) {
    const ctx = this.ctx;
    const t = Math.max(at, ctx.currentTime);
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value || 0.5, t);
    voice.gain.gain.setTargetAtTime(0, t, 0.08);
    try { voice.src.stop(t + 0.6); } catch { /* already stopped */ }
  }

  /** Release every note scheduled or held (e.g. on pause). */
  stopAll() {
    if (!this.ctx) return;
    for (const v of this.scheduled || []) this.release(v, this.ctx.currentTime);
    this.scheduled = [];
    for (const v of this.voices.values()) this.release(v, this.ctx.currentTime);
    this.voices.clear();
  }

  noteOff(key) {
    const v = this.voices.get(key);
    if (v) {
      this.release(v, this.ctx.currentTime);
      this.voices.delete(key);
    }
  }

  /** Schedule a note that can be cancelled by stopAll(). */
  schedule(midi, when, dur, velocity = 0.7) {
    const v = this.play(midi, { when, dur, velocity });
    (this.scheduled ||= []).push(v);
    if (this.scheduled.length > 200) this.scheduled.splice(0, 100);
    return v;
  }

  click(when, accent = false) {
    const ctx = this.ensure();
    const t = Math.max(when, ctx.currentTime);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = accent ? 1760 : 1175;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(this.clickVolume * (accent ? 0.5 : 0.32), t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /** Small success chime. */
  chime(kind = 'good') {
    const ctx = this.ensure();
    const t = ctx.currentTime;
    const notes = kind === 'good' ? [84, 88, 91] : [72, 67];
    notes.forEach((m, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = midiToFreq(m);
      const s = t + i * 0.09;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.12, s + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
      osc.connect(g).connect(this.master);
      osc.start(s);
      osc.stop(s + 0.55);
    });
  }
}

export const audio = new AudioEngine();

// iOS needs a user gesture to start audio; unlock on the first touch anywhere.
const unlock = () => {
  audio.ensure();
  window.removeEventListener('pointerdown', unlock, true);
  window.removeEventListener('keydown', unlock, true);
};
window.addEventListener('pointerdown', unlock, true);
window.addEventListener('keydown', unlock, true);
