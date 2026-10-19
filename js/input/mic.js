// Microphone listener: feeds the PianoDetector at ~60 fps and filters its
// output before it reaches the game.

import { audio } from '../audio/engine.js';
import { PianoDetector } from './detector.js';

// Intervals at which a sounding piano note commonly produces phantom
// detections: neighbours (sympathetic resonance / spectral leakage) and
// overtone relationships (octaves, fifths, twelfths…).
const LEAK_INTERVALS = new Set([1, 2, 3, 4, 5, 7, 8, 9, 12, 15, 16, 17, 19, 24, 28, 31]);

class Mic {
  constructor() {
    this.state = 'off'; // off | starting | on | denied | error | unsupported
    this.listeners = new Set();
    this.level = -100;
    this.loudest = null;
    this.muteUntil = 0;
    this.sensitivity = 0.5;
    this.expected = [];
    this.held = []; // unexpected onsets waiting to be checked for leakage
    this.ghosts = new Set(); // signed intervals learned during calibration
    this.recent = []; // recent onsets (for leakage filtering)
  }

  get supported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  async start() {
    if (this.state === 'on' || this.state === 'starting') return this.state;
    if (!this.supported) return (this.state = 'unsupported');
    this.state = 'starting';
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'play-and-record';
    } catch { /* not supported */ }
    try {
      const ctx = audio.ensure();
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
      });
      this.source = ctx.createMediaStreamSource(this.stream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 8192;
      this.analyser.smoothingTimeConstant = 0;
      this.source.connect(this.analyser);
      // Some browsers (Safari especially) only pull audio through nodes that
      // reach the destination, so route the analyser into a muted gain.
      this.sink = ctx.createGain();
      this.sink.gain.value = 0;
      this.analyser.connect(this.sink).connect(ctx.destination);
      if (ctx.state !== 'running') await ctx.resume().catch(() => {});
      this.buf = new Float32Array(this.analyser.fftSize);
      this.detector = new PianoDetector(ctx.sampleRate);
      this.detector.setSensitivity(this.sensitivity);
      this.detector.setPitchOffset(this.pitchOffset || 0);
      this.detector.setExpected(this.expected);
      this.timer = setInterval(() => this.tick(), 16);
      this.state = 'on';
    } catch (e) {
      console.warn('mic', e);
      this.state = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError') ? 'denied' : 'error';
    }
    return this.state;
  }

  stop() {
    clearInterval(this.timer);
    if (this.stream) this.stream.getTracks().forEach((t) => t.stop());
    if (this.source) this.source.disconnect();
    if (this.sink) this.sink.disconnect();
    this.stream = this.source = this.analyser = null;
    this.state = 'off';
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch { /* ignore */ }
  }

  setExpected(midis) {
    this.expected = midis;
    if (this.detector) this.detector.setExpected(midis);
  }

  setPitchOffset(o) {
    this.pitchOffset = o;
    if (this.detector) this.detector.setPitchOffset(o);
  }

  /** Ghost intervals learned by calibration (signed semitones relative to a played note). */
  setGhosts(list) {
    this.ghosts = new Set(list || []);
  }

  /** Is this unexpected onset most likely a by-product of notes already sounding? */
  isGhost(h, t) {
    const det = this.detector;
    // 1) Related to a recent onset (attack transients, chords).
    if (this.recent.some((o) => o !== h && o.midi !== h.midi && t - o.time < 0.6 && o.strength >= h.strength - 6 && (LEAK_INTERVALS.has(Math.abs(o.midi - h.midi)) || this.ghosts.has(h.midi - o.midi)))) return true;
    // 2) Related to any note still ringing at least as loud.
    const hs = det.E[h.midi] - det.floor[h.midi];
    for (let a = 21; a < det.E.length; a++) {
      if (a === h.midi || !det.active[a]) continue;
      const as = det.E[a] - det.floor[a];
      if (as < hs - 6) continue;
      const d = h.midi - a;
      if (LEAK_INTERVALS.has(Math.abs(d)) || this.ghosts.has(d)) return true;
    }
    // 3) The app's own metronome click.
    if (audio.clickTimes && audio.clickTimes.some((c) => h.time > c - 0.03 && h.time < c + 0.2)) return true;
    return false;
  }

  setSensitivity(s) {
    this.sensitivity = s;
    if (this.detector) this.detector.setSensitivity(s);
  }

  /** Ignore input for a while (e.g. while the app itself is playing notes). */
  mute(seconds) {
    this.muteUntil = Math.max(this.muteUntil, audio.now + seconds);
  }

  tick() {
    if (!this.analyser) return;
    const ctx = audio.ctx;
    this.analyser.getFloatTimeDomainData(this.buf);
    const t = ctx.currentTime;
    const { onsets, level, loudest } = this.detector.process(this.buf, t);
    this.level = level;
    this.loudest = loudest;
    if (this.frameHook) this.frameHook(this.detector, level, t, onsets);
    if (this.calibrating) return;
    const muted = t < this.muteUntil;
    for (const o of onsets) {
      if (muted) continue;
      // A click is unpitched, but be safe: an expected note can't be the click
      // unless it's way up where the click's energy lives.
      if (o.expected && o.midi >= 84 && audio.clickTimes && audio.clickTimes.some((c) => o.time > c - 0.03 && o.time < c + 0.2)) continue;
      this.recent.push(o);
      if (o.expected) this.emit(o);
      else this.held.push(o);
    }
    this.recent = this.recent.filter((o) => t - o.time < 1.5);
    // Release held (unexpected) onsets only once we're sure they aren't
    // ghosts of notes that are already sounding.
    const keep = [];
    for (const h of this.held) {
      if (t - h.time < 0.15) { keep.push(h); continue; }
      if (!this.isGhost(h, t)) this.emit(h);
    }
    this.held = keep;
  }

  emit(o) {
    for (const fn of this.listeners) fn({ midi: o.midi, time: o.time, velocity: 0.7, source: 'mic', expected: o.expected, strength: o.strength });
  }
}

export const mic = new Mic();
