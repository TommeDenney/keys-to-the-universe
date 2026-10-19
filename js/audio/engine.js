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
    this.volume = 0.8; // effects + metronome
    this.musicVolume = 0.35; // the piano itself: Listen, accompaniment, on-screen keys
    this.clickVolume = 0.6;
    this.voices = new Map(); // key → {src, gain}
  }

  /** Must be called from a user gesture the first time (iOS). */
  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: 'interactive' });
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -10;
      comp.ratio.value = 4;
      comp.connect(this.ctx.destination);
      // Two independent buses: effects/metronome and piano sound.
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(comp);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicVolume;
      this.musicBus.connect(comp);
      this.loadSamples();
    }
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    return this.ctx;
  }

  get now() {
    return this.ctx ? this.ctx.currentTime : performance.now() / 1000;
  }

  /** Effects + metronome volume. */
  setVolume(v) {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  /** Piano volume (Listen, accompaniment, on-screen keys). */
  setMusicVolume(v) {
    this.musicVolume = v;
    if (this.musicBus) this.musicBus.gain.setTargetAtTime(v, this.ctx.currentTime, 0.03);
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
  /** Which voice plays a note (split = bass in the left hand, piano in the right). */
  voiceFor(hand) {
    if (this.voice === 'split') return hand === 'L' ? 'bass' : 'piano';
    return this.voice || 'piano';
  }

  /** Called whenever the app plays a sound directly (not scheduled music). */
  onPlay(fn) { (this.playSubs ||= new Set()).add(fn); return () => this.playSubs.delete(fn); }

  play(midi, { when = 0, dur, velocity = 0.8, key, voice, hand } = {}) {
    if (!this.inSchedule && this.playSubs) this.playSubs.forEach((f) => f());
    const ctx = this.ensure();
    const t = Math.max(when || 0, ctx.currentTime);
    const v = voice || this.voiceFor(hand || (midi < 60 ? 'L' : 'R'));
    const gain = ctx.createGain();
    const amp = 0.15 + 0.85 * velocity * velocity;
    gain.connect(this.musicBus);
    let src;
    let rel = 0.08;
    const sm = v === 'piano' ? this.nearestSample(midi) : null;
    if (sm != null) {
      src = ctx.createBufferSource();
      src.buffer = this.buffers.get(sm);
      src.playbackRate.value = Math.pow(2, (midi - sm) / 12);
      gain.gain.setValueAtTime(amp, t);
      src.connect(gain);
    } else {
      ({ src, rel } = this.synth(v, midi, t, amp, gain));
    }
    src.start(t);
    const vo = { src, gain, rel };
    if (dur != null) {
      this.release(vo, t + dur);
    } else if (key != null) {
      const old = this.voices.get(key);
      if (old) this.release(old, ctx.currentTime);
      this.voices.set(key, vo);
    }
    return vo;
  }

  /**
   * Synth voices for keyboards' other modes. Returns {src, rel} where src has
   * start/stop like an AudioNode (several oscillators may hide behind it).
   */
  synth(v, midi, t, amp, out) {
    const ctx = this.ctx;
    const f = midiToFreq(midi);
    const oscs = [];
    const osc = (type, freq, g, dest = out) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const gn = ctx.createGain();
      gn.gain.value = g;
      o.connect(gn).connect(dest);
      oscs.push(o);
      return { o, gn };
    };
    const group = { start: (at) => oscs.forEach((o) => o.start(at)), stop: (at) => oscs.forEach((o) => { try { o.stop(at); } catch { /* stopped */ } }) };
    const env = out.gain;
    if (v === 'organ') {
      // Drawbar organ, gospel-style registration (16' 8' 5 1/3' 4' 2 2/3' 2'),
      // with scanner-style vibrato, 3rd-harmonic percussion and a key click.
      const bars = [[0.5, 0.55], [1, 1], [1.5, 0.55], [2, 0.5], [3, 0.22], [4, 0.25]];
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 6.7;
      oscs.push(lfo);
      for (const [mul, g] of bars) {
        const { o } = osc('sine', f * mul, g * 0.16);
        const depth = ctx.createGain();
        depth.gain.value = f * mul * 0.0035;
        lfo.connect(depth).connect(o.frequency);
      }
      const perc = osc('sine', f * 3, 0.18);
      perc.gn.gain.setValueAtTime(0.18, t);
      perc.gn.gain.setTargetAtTime(0, t, 0.12);
      env.setValueAtTime(0, t);
      env.linearRampToValueAtTime(amp * 0.9, t + 0.006);
      return { src: group, rel: 0.02 };
    }
    if (v === 'epiano') {
      // Tine electric piano: sine body + soft 2nd harmonic + quick bell partial.
      osc('sine', f, 0.5);
      const h2 = osc('sine', f * 2, 0.18);
      h2.gn.gain.setTargetAtTime(0.03, t, 0.4);
      const bell = osc('sine', f * 7.1, 0.07);
      bell.gn.gain.setTargetAtTime(0, t, 0.05);
      env.setValueAtTime(0, t);
      env.linearRampToValueAtTime(amp * 0.85, t + 0.004);
      env.setTargetAtTime(amp * 0.25, t + 0.01, 1.2);
      return { src: group, rel: 0.12 };
    }
    if (v === 'pad') {
      // Warm pad: detuned saws through a soft low-pass, slow swell.
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.min(4000, 900 + f * 2);
      lp.Q.value = 0.6;
      lp.connect(out);
      osc('sawtooth', f * Math.pow(2, 6 / 1200), 0.09, lp);
      osc('sawtooth', f * Math.pow(2, -6 / 1200), 0.09, lp);
      osc('triangle', f / 2, 0.08, lp);
      env.setValueAtTime(0, t);
      env.linearRampToValueAtTime(amp * 0.8, t + 0.35);
      return { src: group, rel: 0.45 };
    }
    if (v === 'bass') {
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 700;
      lp.connect(out);
      osc('triangle', f, 0.5, lp);
      osc('sine', f, 0.4, lp);
      osc('square', f, 0.05, lp);
      env.setValueAtTime(0, t);
      env.linearRampToValueAtTime(amp * 0.9, t + 0.005);
      env.setTargetAtTime(amp * 0.35, t + 0.02, 0.6);
      return { src: group, rel: 0.06 };
    }
    // Fallback while piano samples load: a few decaying partials.
    const o = ctx.createOscillator();
    o.setPeriodicWave(ctx.createPeriodicWave(new Float32Array([0, 1, 0.45, 0.25, 0.12, 0.06]), new Float32Array(6)));
    o.frequency.value = f;
    o.connect(out);
    env.setValueAtTime(0, t);
    env.linearRampToValueAtTime(amp * 0.35, t + 0.005);
    env.setTargetAtTime(amp * 0.12, t + 0.01, 0.4);
    return { src: o, rel: 0.08 };
  }

  release(voice, at) {
    const ctx = this.ctx;
    const t = Math.max(at, ctx.currentTime);
    voice.gain.gain.cancelScheduledValues(t);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value || 0.5, t);
    voice.gain.gain.setTargetAtTime(0, t, voice.rel || 0.08);
    try { voice.src.stop(t + 0.6 + (voice.rel || 0) * 5); } catch { /* already stopped */ }
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
  schedule(midi, when, dur, velocity = 0.7, hand) {
    this.inSchedule = true;
    let v;
    try { v = this.play(midi, { when, dur, velocity, hand }); } finally { this.inSchedule = false; }
    (this.scheduled ||= []).push(v);
    if (this.scheduled.length > 200) this.scheduled.splice(0, 100);
    return v;
  }

  /**
   * Metronome tick: a short burst of filtered noise (like a woodblock).
   * Unpitched on purpose, so the microphone listener doesn't mistake it for
   * a piano key. Click times are recorded so the mic can ignore them anyway.
   */
  click(when, accent = false) {
    const ctx = this.ensure();
    const t = Math.max(when, ctx.currentTime);
    if (!this.noise) {
      const n = Math.floor(ctx.sampleRate * 0.04);
      this.noise = ctx.createBuffer(1, n, ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = accent ? 3200 : 2400;
    bp.Q.value = 1.4;
    const g = ctx.createGain();
    g.gain.value = this.clickVolume * (accent ? 2.2 : 1.5);
    src.connect(bp).connect(g).connect(this.master);
    src.start(t);
    (this.clickTimes ||= []).push(t);
    if (this.clickTimes.length > 32) this.clickTimes.splice(0, this.clickTimes.length - 32);
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
