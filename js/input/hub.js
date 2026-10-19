// Input hub: merges microphone, MIDI (USB / Bluetooth), on-screen touches and
// the computer keyboard into one stream of note events.
//   noteon:  { midi, time (AudioContext seconds, latency-compensated), source, velocity }
//   noteoff: { midi, source }

import { audio } from '../audio/engine.js';
import { mic } from './mic.js';
import { settings } from '../store.js';

const KEYMAP = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12, o: 13, l: 14, p: 15, ';': 16, "'": 17 };

class InputHub {
  constructor() {
    this.listeners = new Set();
    this.midiAccess = null;
    this.midiInputs = [];
    this.midiState = 'unknown'; // unsupported | denied | ready
    this.keyOctave = 4;
    this.down = new Set();
    mic.on((e) => {
      if (this.mode() !== 'mic') return;
      this.emit('noteon', { ...e, time: e.time - settings.get('micLatency') / 1000 });
    });
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }

  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(type, e) {
    for (const fn of this.listeners) fn(type, e);
  }

  /** Effective input: MIDI when a device is connected, else mic if enabled, else touch only. */
  mode() {
    const pref = settings.get('input');
    if (this.midiInputs.length && pref !== 'mic') return 'midi';
    if (pref === 'touch') return 'touch';
    return mic.state === 'on' ? 'mic' : 'touch';
  }

  /** Start whatever the user prefers. Call from a user gesture. */
  async activate() {
    audio.ensure();
    await this.initMidi();
    const pref = settings.get('input');
    if ((pref === 'mic' || pref === 'auto') && !this.midiInputs.length) await mic.start();
    else if (this.midiInputs.length && mic.state === 'on') mic.stop();
    return this.mode();
  }

  deactivate() {
    // Keep listening in menus when piano-key navigation is on.
    if (mic.state === 'on' && !settings.get('pianoNav')) mic.stop();
  }

  setExpected(midis) {
    mic.setExpected(midis);
  }

  /** The app is about to make sound itself: stop the mic from hearing it. */
  muteMic(seconds) {
    mic.mute(seconds);
  }

  async initMidi() {
    if (this.midiAccess) return this.midiState;
    if (!navigator.requestMIDIAccess) return (this.midiState = 'unsupported');
    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.midiState = 'ready';
      const refresh = () => {
        this.midiInputs = [...this.midiAccess.inputs.values()].filter((i) => i.state === 'connected');
        for (const input of this.midiInputs) input.onmidimessage = (m) => this.onMidi(m);
        if (this.midiInputs.length && mic.state === 'on' && settings.get('input') !== 'mic') mic.stop();
        this.emit('devices', this.midiInputs.map((i) => i.name));
      };
      this.midiAccess.onstatechange = refresh;
      refresh();
    } catch (e) {
      this.midiState = 'denied';
    }
    return this.midiState;
  }

  onMidi(msg) {
    const [st, d1, d2] = msg.data;
    const cmd = st & 0xf0;
    const lat = settings.get('midiLatency') / 1000;
    // Map the event's DOM timestamp onto the audio clock.
    const ago = Math.max(0, (performance.now() - msg.timeStamp) / 1000);
    const time = audio.now - ago - lat;
    if (cmd === 0x90 && d2 > 0) this.emit('noteon', { midi: d1, velocity: d2 / 127, time, source: 'midi' });
    else if (cmd === 0x80 || (cmd === 0x90 && d2 === 0)) this.emit('noteoff', { midi: d1, source: 'midi' });
  }

  /** On-screen keyboard. */
  touch(midi, down, source = 'touch') {
    if (down) {
      mic.mute(0.3); // don't let the mic hear our own key sound
      audio.play(midi, { key: `t${midi}`, velocity: 0.75 });
      this.emit('noteon', { midi, velocity: 0.75, time: audio.now, source });
    } else {
      audio.noteOff(`t${midi}`);
      this.emit('noteoff', { midi, source });
    }
  }

  onKey(e, down) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const k = e.key.toLowerCase();
    if (down && (k === 'z' || k === 'x')) {
      this.keyOctave = Math.max(1, Math.min(7, this.keyOctave + (k === 'z' ? -1 : 1)));
      return;
    }
    if (!(k in KEYMAP)) return;
    const midi = (this.keyOctave + 1) * 12 + KEYMAP[k];
    if (down) {
      if (this.down.has(k) || e.repeat) return;
      this.down.add(k);
      this.touch(midi, true, 'keys');
    } else {
      this.down.delete(k);
      this.touch(midi, false, 'keys');
    }
  }
}

export const input = new InputHub();
