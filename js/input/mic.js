// Microphone listener: feeds the PianoDetector at ~60 fps and filters its
// output before it reaches the game.

import { audio } from '../audio/engine.js';
import { PianoDetector } from './detector.js';

const LEAK_INTERVALS = new Set([1, 2, 5, 7, 12, 19, 24, 28, 31]);

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
    if (this.frameHook) this.frameHook(this.detector, level, t);
    if (this.calibrating) return;
    const muted = t < this.muteUntil;
    for (const o of onsets) {
      if (muted) continue;
      this.recent.push(o);
      if (o.expected) this.emit(o);
      else this.held.push(o);
    }
    this.recent = this.recent.filter((o) => t - o.time < 0.4);
    // Release held (unexpected) onsets once we're sure they aren't leakage
    // from a stronger related note played at the same moment.
    const keep = [];
    for (const h of this.held) {
      if (t - h.time < 0.12) { keep.push(h); continue; }
      const leak = this.recent.some((o) => o !== h && Math.abs(o.time - h.time) < 0.15 && o.strength >= h.strength - 3 && LEAK_INTERVALS.has(Math.abs(o.midi - h.midi)));
      if (!leak) this.emit(h);
    }
    this.held = keep;
  }

  emit(o) {
    for (const fn of this.listeners) fn({ midi: o.midi, time: o.time, velocity: 0.7, source: 'mic', expected: o.expected, strength: o.strength });
  }
}

export const mic = new Mic();
