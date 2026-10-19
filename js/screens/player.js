// The practice player: scrolling sheet + keyboard + input judging.
// Modes: 'wait' (own pace: the music waits for you), 'timed' (keep the beat),
// and a temporary 'listen' demo.

import { h, icon, starsHTML } from '../ui.js';
import { audio } from '../audio/engine.js';
import { input } from '../input/hub.js';
import { mic } from '../input/mic.js';
import { settings } from '../store.js';
import { Sheet } from '../render/sheet.js';
import { Keyboard, rangeFor } from '../render/keyboard.js';
import { sliceSong, buildEvents, handsLabel } from '../music/song.js';
import { spellMidi, noteName } from '../music/theory.js';
import { openCalibration } from './calibrate.js';
import { track } from '../challenges.js';
import { applySound, SOUNDS, appVoice } from '../sound.js';

const PERFECT = 0.1;
const GOOD = 0.2;
const WINDOW = 0.32;

export function starsFor(score, mode) {
  if (mode === 'wait') return score >= 0.9 ? 3 : score >= 0.7 ? 2 : 1;
  return score >= 0.9 ? 3 : score >= 0.75 ? 2 : score >= 0.5 ? 1 : 0;
}

export class Player {
  static current = null;

  /**
   * cfg: { song, hands, range:[fromIdx,toIdx], mode, tempo, names, hideOther,
   *        title, subtitle, onFinish(result), onExit(), actions(result) → [{label, primary, fn}] }
   */
  constructor(container, cfg) {
    this.cfg = { hands: 'both', mode: 'wait', tempo: 1, ...cfg };
    Player.current = this;
    applySound(cfg.song && cfg.song.instrument);
    this.container = container;
    this.mode = this.cfg.mode;
    this.tempo = this.cfg.tempo;
    this.prepare();
    this.render();
    this.reset();
    this.raf = requestAnimationFrame((t) => this.frame(t));
    this.unsub = input.on((type, e) => this.onInput(type, e));
    this.onVis = () => { if (document.hidden && this.running && this.mode === 'timed') this.pause(); };
    document.addEventListener('visibilitychange', this.onVis);
    this.ro = new ResizeObserver(() => { this.sheet.resize(); });
    this.ro.observe(this.canvas);
  }

  prepare() {
    const { song, range, hideOther } = this.cfg;
    let hands = this.cfg.hands;
    if (hands === 'both' && !(song.hands.R && song.hands.L)) hands = song.hands.R ? 'R' : 'L';
    if (hands !== 'both' && !song.hands[hands]) hands = song.hands.R ? 'R' : 'L';
    this.hands = hands;
    const from = range ? range[0] : 0;
    const to = range ? range[1] : song.measures.length - 1;
    const slice = sliceSong(song, from, to);
    if (hideOther && hands !== 'both') {
      slice.notes = slice.notes.filter((n) => n.hand === hands);
      slice.rests = slice.rests.filter((r) => r.hand === hands);
    }
    this.slice = slice;
    this.active = slice.notes.filter((n) => hands === 'both' || n.hand === hands);
    this.passive = slice.notes.filter((n) => !(hands === 'both' || n.hand === hands));
    this.events = buildEvents(this.active);
    const names = this.cfg.names;
    const pref = settings.get('noteNames');
    this.showNames = pref === 'always' ? true : pref === 'never' ? false : names !== false;
    const t = slice.time || [4, 4];
    this.clickUnit = t[1] === 8 && t[0] % 3 === 0 && t[0] > 3 ? 1.5 : 4 / t[1];
    this.barLen = (t[0] * 4) / t[1];
    this.endBeat = Math.max(...slice.notes.map((n) => n.start + n.dur), slice.length || 0);
  }

  get spq() {
    return 60 / ((this.slice.bpm || 90) * this.tempo);
  }

  render() {
    const c = this.cfg;
    const subtitle = c.subtitle || `${handsLabel(this.hands)} · ${this.mode === 'wait' ? 'Your own pace' : 'With the beat'}`;
    this.el = h('div', { class: `player ${this.cfg.exam ? 'exam' : ''}` }, [
      h('header', { class: 'pl-top' }, [
        h('button', { class: 'icon-btn', 'aria-label': 'Close', onclick: () => this.exit() }, icon('close')),
        h('div', { class: 'pl-title' }, [h('div', { class: 't' }, c.title || this.slice.title), h('div', { class: 'sub' }, subtitle)]),
        h('div', { class: 'pl-progress' }, h('div', { class: 'bar' })),
        this.cfg.exam ? h('div', { class: 'energy', title: 'Energy: keep it up!' }, [h('i'), h('span', {}, 'Energy')]) : null,
        h('div', { class: 'pl-input' }),
      ]),
      h('div', { class: 'pl-stage' }, [
        h('canvas', { class: 'pl-canvas' }),
        h('div', { class: 'pl-count' }),
        h('div', { class: 'pl-toast' }),
      ]),
      h('div', { class: 'pl-controls' }, [
        h('button', { class: 'chip-btn listen', onclick: () => this.listen() }, [icon('ear'), h('span', {}, 'Listen')]),
        h('button', { class: 'chip-btn play', onclick: () => this.togglePlay() }, [icon('play'), h('span', {}, 'Start')]),
        h('button', { class: 'chip-btn', onclick: () => this.restart() }, [icon('restart'), h('span', {}, 'Restart')]),
        h('div', { class: 'spacer' }),
        h('div', { class: 'tempo' }, [
          h('button', { class: 'icon-btn sm', 'aria-label': 'Slower', onclick: () => this.setTempo(this.tempo - 0.1) }, '−'),
          h('span', { class: 'tempo-val' }),
          h('button', { class: 'icon-btn sm', 'aria-label': 'Faster', onclick: () => this.setTempo(this.tempo + 0.1) }, '+'),
        ]),
        h('button', { class: 'chip-btn toggle names', title: 'Note names', onclick: () => this.toggleNames() }, [h('b', {}, 'ABC')]),
        h('button', { class: 'chip-btn toggle metro', title: 'Metronome', onclick: () => this.toggleMetro() }, [icon('metronome')]),
        h('button', { class: 'chip-btn', title: 'Piano volume', 'aria-label': 'Piano volume', onclick: () => this.showVolume() }, [icon('volume')]),
      ]),
      h('div', { class: 'pl-keys' }),
      h('div', { class: 'pl-overlay' }),
    ]);
    this.container.appendChild(this.el);
    this.canvas = this.el.querySelector('canvas');
    this.sheet = new Sheet(this.canvas);
    this.sheet.setSong(this.slice, { hands: this.hands, showNames: this.showNames });
    const [lo, hi] = rangeFor(this.slice.minMidi ?? 60, this.slice.maxMidi ?? 72);
    this.kb = new Keyboard(this.el.querySelector('.pl-keys'), {
      lo, hi, labels: settings.get('keyLabels'),
      onKey: (m, down) => input.touch(m, down),
    });
    this.updateControls();
  }

  updateControls() {
    const q = (s) => this.el.querySelector(s);
    q('.tempo-val').textContent = `${Math.round(this.tempo * 100)}%`;
    q('.names').classList.toggle('on', this.showNames);
    q('.metro').classList.toggle('on', settings.get('metronome'));
    q('.metro').style.display = this.mode === 'timed' ? '' : 'none';
    const play = q('.play');
    play.style.display = this.mode === 'timed' ? '' : 'none';
    play.replaceChildren(icon(this.running ? 'pause' : 'play'), h('span', {}, this.running ? 'Pause' : 'Play'));
    this.updateInputChip();
  }

  updateInputChip() {
    const chip = this.el.querySelector('.pl-input');
    const mode = input.mode();
    const label = mode === 'midi' ? 'MIDI piano' : mode === 'mic' ? 'Listening' : 'Touch keys';
    chip.className = `pl-input mode-${mode}`;
    chip.innerHTML = '';
    chip.append(icon(mode === 'midi' ? 'piano' : mode === 'mic' ? 'mic' : 'hand'), h('span', {}, label));
    if (mode === 'mic') chip.append(h('i', { class: 'lvl' }));
    chip.onclick = () => { if (mode !== 'midi') this.showMicHelp(); };
  }

  // ---- state ----------------------------------------------------------

  reset() {
    this.stopAudio();
    this.energy = 0.6;
    this.knockedOut = false;
    const ebar = this.el && this.el.querySelector('.energy i');
    if (ebar) ebar.style.transform = 'scaleX(0.6)';
    this.sheet.state.clear();
    this.sheet.effects = [];
    this.hits = 0;
    this.grades = { perfect: 0, good: 0, ok: 0, miss: 0 };
    this.wrong = 0;
    this.lastWrong = new Map();
    this.ei = 0;
    this.hitSet = new Set();
    this.running = false;
    this.finished = false;
    this.beat = this.mode === 'timed' ? 0 : this.events.length ? this.events[0].start - 0.001 : 0;
    this.sheet.scroll = this.mode === 'timed' ? -this.barLen * 0.5 : this.beat;
    this.streak = 0;
    this.eventFirstHit = 0;
    this.accomp = [];
    if (this.mode === 'wait') this.setWaitTargets();
    else this.setTimedTargets();
    this.showStart();
    this.updateControls();
  }

  restart() {
    this.hideOverlay();
    this.reset();
  }

  showStart() {
    const c = this.cfg;
    if (c.exam) {
      this.showOverlay(h('div', { class: 'card start-card boss-card pop' }, [
        h('div', { class: 'boss-emblem' }, [h('i'), h('i'), h('span', {}, '\u2694')]),
        h('div', { class: 'eyebrow' }, 'Boss battle'),
        h('h2', {}, `${c.exam.name || 'The Guardian'} challenges you!`),
        h('p', {}, `Play \u201c${this.slice.title}\u201d with the beat at full speed. Score ${Math.round(c.exam.pass * 100)}% or more to pass, and keep your energy up: misses drain it, good notes refill it.`),
        this.inputNotice(),
        h('div', { class: 'row' }, [
          h('button', { class: 'btn ghost', onclick: () => { this.hideOverlay(); this.listen(); } }, [icon('ear'), 'Hear it first']),
          h('button', { class: 'btn primary', onclick: () => this.begin() }, ['\u2694 Accept the challenge']),
        ]),
      ]));
      return;
    }
    const hint = this.mode === 'wait'
      ? 'Play each highlighted note when you’re ready. The music waits for you.'
      : 'Wait for the count-in, then play each note as it reaches the line.';
    this.showOverlay(h('div', { class: 'card start-card pop' }, [
      h('div', { class: 'eyebrow' }, this.mode === 'wait' ? 'Your own pace' : 'With the beat'),
      h('h2', {}, c.title || this.slice.title),
      h('p', {}, hint),
      this.inputNotice(),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: () => { this.hideOverlay(); this.listen(); } }, [icon('ear'), 'Listen first']),
        h('button', { class: 'btn primary', onclick: () => this.begin() }, [icon('play'), 'Start']),
      ]),
    ]));
  }

  inputNotice() {
    const mode = input.mode();
    if (mode === 'midi') return h('p', { class: 'notice ok' }, [icon('piano'), 'MIDI piano connected']);
    if (settings.get('input') === 'touch') return h('p', { class: 'notice' }, [icon('hand'), 'Using the on-screen keys (change in Settings)']);
    if (mic.state === 'denied') return h('p', { class: 'notice warn' }, [icon('mic'), 'Microphone blocked. Allow it in Settings › Safari › Microphone.']);
    return h('p', { class: 'notice' }, [icon('mic'), 'The app will listen to your piano through the microphone.']);
  }

  async begin() {
    audio.ensure();
    this.hideOverlay();
    if (!this.playStart) this.playStart = performance.now();
    // The key press that hit "Start" (piano navigation) must not count as the
    // first note, and its sound needs a moment to die away.
    this.readyAt = performance.now() + 1300;
    await input.activate();
    this.updateInputChip();
    if (this.mode === 'timed') this.play();
    else {
      this.setWaitTargets();
      this.readyCue();
    }
  }

  readyCue() {
    const count = this.el.querySelector('.pl-count');
    const show = (txt, cls) => { count.textContent = txt; count.className = `pl-count ${cls}`; void count.offsetWidth; count.classList.add('pulse'); };
    show('Ready…', 'word');
    clearTimeout(this.readyT);
    this.readyT = setTimeout(() => {
      show('Go!', 'word go');
      this.readyT = setTimeout(() => { count.textContent = ''; count.className = 'pl-count'; }, 650);
    }, 700);
  }

  // ---- wait mode --------------------------------------------------------

  setWaitTargets() {
    for (const [id, st] of this.sheet.state) if (st === 'target') this.sheet.state.delete(id);
    const ev = this.events[this.ei];
    const hints = new Map();
    if (ev) {
      for (const n of ev.notes) {
        if (!this.hitSet.has(n.id)) {
          this.sheet.state.set(n.id, 'target');
          hints.set(n.midi, { hand: n.hand, finger: n.finger });
        }
      }
      input.setExpected(ev.notes.filter((n) => !this.hitSet.has(n.id)).map((n) => n.midi));
    } else input.setExpected([]);
    this.kb.setHints(settings.get('keyHints') ? hints : new Map());
  }

  waitInput(e) {
    const ev = this.events[this.ei];
    if (!ev) return;
    // Mic: just after a chord/note completes, its ringing overtones can look
    // like the next notes. Give the sound a moment to settle.
    if (e.source === 'mic' && performance.now() - (this.lastAdvance || 0) < 130) return;
    const pending = ev.notes.filter((n) => !this.hitSet.has(n.id));
    const match = pending.find((n) => n.midi === e.midi) || (e.source === 'mic' && pending.find((n) => n.midi < 48 && Math.abs(n.midi - e.midi) === 12));
    if (match) {
      this.hitNote(match);
      if (!this.eventFirstHit) this.eventFirstHit = performance.now();
      const left = pending.length - 1;
      // Microphone leniency for big chords: accept when all but one note was heard.
      if (left === 0) this.advanceWait();
      else if (e.source === 'mic' && ev.notes.length >= 3 && left === 1) {
        clearTimeout(this.chordTimer);
        this.chordTimer = setTimeout(() => {
          if (this.events[this.ei] === ev) {
            ev.notes.filter((n) => !this.hitSet.has(n.id)).forEach((n) => this.hitNote(n, true));
            this.advanceWait();
          }
        }, 450);
      } else this.setWaitTargets();
      return;
    }
    if (ev.notes.some((n) => n.midi === e.midi)) return; // re-struck a note already played
    this.wrongNote(e);
  }

  advanceWait() {
    clearTimeout(this.chordTimer);
    this.lastAdvance = performance.now();
    this.prevMidis = new Set(this.events[this.ei].notes.map((n) => n.midi));
    this.ei++;
    this.eventFirstHit = 0;
    this.streak++;
    if (this.streak % 8 === 0) this.sheet.popup(['Nice!', 'Great!', 'Awesome!', 'Keep going!'][(this.streak / 8) % 4 | 0]);
    if (this.ei >= this.events.length) {
      this.setWaitTargets();
      setTimeout(() => this.finish(), 450);
      return;
    }
    this.setWaitTargets();
  }

  // ---- timed mode -------------------------------------------------------

  play() {
    if (this.finished) return;
    audio.ensure();
    const now = audio.now;
    const spq = this.spq;
    const countBeats = this.mode === 'listen' ? 0 : this.barLen >= 2 ? this.barLen : this.barLen * 2;
    const startBeat = Math.max(0, this.beat);
    // Count-in clicks, then the song starts at `startBeat`.
    const lead = 0.15;
    this.t0 = now + lead + countBeats * spq - startBeat * spq;
    this.countEnd = now + lead + countBeats * spq;
    const clicks = Math.round(countBeats / this.clickUnit);
    for (let i = 0; i < clicks; i++) audio.click(now + lead + i * this.clickUnit * spq, i === 0);
    this.countClicks = clicks;
    this.countStart = now + lead;
    this.nextClick = Math.ceil(startBeat / this.clickUnit - 1e-6) * this.clickUnit;
    this.schedIdx = 0;
    this.scheduleFrom = startBeat;
    this.running = true;
    this.updateControls();
  }

  pause() {
    if (!this.running) return;
    this.running = false;
    this.stopAudio();
    // Rewind to the start of the current bar for a clean restart.
    this.beat = Math.max(0, Math.floor(this.beat / this.barLen) * this.barLen);
    this.updateControls();
    this.el.querySelector('.pl-count').textContent = '';
  }

  togglePlay() {
    if (this.mode !== 'timed') return;
    if (this.running) this.pause();
    else {
      this.hideOverlay();
      input.activate().then(() => this.updateInputChip());
      this.play();
    }
  }

  stopAudio() {
    audio.stopAll();
  }

  /** Schedule clicks, accompaniment and demo notes slightly ahead of time. */
  schedule(now) {
    const spq = this.spq;
    const horizon = now + 0.25;
    const toBeat = (horizon - this.t0) / spq;
    if (settings.get('metronome') || this.mode === 'listen') {
      while (this.nextClick <= toBeat && this.nextClick <= this.endBeat + 0.01) {
        const t = this.t0 + this.nextClick * spq;
        if (settings.get('metronome') && this.mode !== 'listen') audio.click(t, Math.abs(this.nextClick % this.barLen) < 1e-6);
        this.nextClick += this.clickUnit;
      }
    } else {
      this.nextClick = Math.ceil(toBeat / this.clickUnit) * this.clickUnit;
    }
    const playList = this.mode === 'listen' ? this.slice.notes : settings.get('otherHand') ? this.passive : [];
    while (this.schedIdx < playList.length && playList[this.schedIdx].start <= toBeat) {
      const n = playList[this.schedIdx++];
      if (n.start < this.scheduleFrom - 1e-6) continue;
      const t = this.t0 + n.start * spq;
      audio.schedule(n.midi, t, Math.max(0.15, n.dur * spq * 0.95), this.mode === 'listen' ? 0.7 : 0.45, n.hand);
      this.accomp.push({ midi: n.midi, t });
    }
    if (this.accomp.length > 64) this.accomp = this.accomp.filter((a) => a.t > now - 1);
  }

  setTimedTargets() {
    const beat = this.beat;
    for (const [id, st] of this.sheet.state) if (st === 'target') this.sheet.state.delete(id);
    // Next unresolved event.
    const ev = this.events.find((e) => e.notes.some((n) => !this.sheet.state.has(n.id)) && e.start >= beat - (WINDOW / this.spq));
    const hints = new Map();
    if (ev && ev.start - beat < this.barLen) {
      for (const n of ev.notes) if (!this.sheet.state.has(n.id)) {
        this.sheet.state.set(n.id, 'target');
        hints.set(n.midi, { hand: n.hand, finger: n.finger });
      }
    }
    const key = [...hints.keys()].join(',');
    if (key !== this.hintKey) {
      this.hintKey = key;
      this.kb.setHints(settings.get('keyHints') && this.mode !== 'listen' ? hints : new Map());
    }
    // Mic expectations: every unresolved note within reach.
    const spq = this.spq;
    const exp = this.active.filter((n) => !this.hitSet.has(n.id) && Math.abs(n.start - beat) * spq < 0.7).map((n) => n.midi);
    input.setExpected(exp);
  }

  timedInput(e) {
    const spq = this.spq;
    const b = (e.time - this.t0) / spq;
    let best = null;
    let bestD = Infinity;
    for (const n of this.active) {
      const octaveOk = e.source === 'mic' && n.midi < 48 && Math.abs(n.midi - e.midi) === 12;
      if ((n.midi !== e.midi && !octaveOk) || this.hitSet.has(n.id) || this.sheet.state.get(n.id) === 'miss') continue;
      const d = Math.abs(n.start - b) * spq;
      if (d < bestD) { bestD = d; best = n; }
    }
    if (best && bestD <= WINDOW) {
      const early = best.start > b;
      const grade = bestD <= PERFECT ? 'perfect' : bestD <= GOOD ? 'good' : 'ok';
      this.grades[grade]++;
      this.addEnergy(grade === 'perfect' ? 0.05 : grade === 'good' ? 0.035 : 0.02);
      this.hitNote(best);
      this.streak++;
      if (grade === 'perfect') this.sheet.popup(this.streak >= 10 ? `Perfect ×${this.streak}` : 'Perfect!', '#17B26A');
      else if (grade === 'good') this.sheet.popup('Good', '#3D7BFF');
      else this.sheet.popup(early ? 'Early' : 'Late', '#E9A100');
      return;
    }
    // Ignore re-strikes of a note just played, and (with the mic) our own accompaniment.
    const recent = this.active.some((n) => n.midi === e.midi && this.hitSet.has(n.id) && Math.abs(n.start - b) * spq < 0.8);
    if (recent) return;
    if (e.source === 'mic' && this.accomp.some((a) => Math.abs(a.t - e.time) < 0.6 && (a.midi - e.midi) % 12 === 0)) return;
    this.wrongNote(e);
  }

  // ---- shared -------------------------------------------------------------

  hitNote(n, silent = false) {
    this.hitSet.add(n.id);
    this.sheet.state.set(n.id, 'hit');
    this.hits++;
    if (!silent) this.sheet.burst(n);
    this.kb.flash(n.midi, 'good', 300);
  }

  wrongNote(e) {
    if (e.source === 'mic') {
      // Ignore stray detections far outside this piece's range…
      if (e.midi < (this.slice.minMidi ?? 0) - 12 || e.midi > (this.slice.maxMidi ?? 127) + 12) return;
      // …and the previous notes still ringing after we moved on.
      if (this.prevMidis && this.prevMidis.has(e.midi) && performance.now() - (this.lastAdvance || 0) < 700) return;
    }
    // Wrong-note feedback is optional (Settings › Display). Off: not shown and
    // not counted against you.
    const style = settings.get('wrongNotes');
    if (style === 'off') return;
    const now = performance.now();
    if (now - (this.lastWrong.get(e.midi) || 0) < 500) return;
    this.lastWrong.set(e.midi, now);
    this.wrong++;
    this.streak = 0;
    const hand = e.midi >= 60 || this.hands === 'R' ? (this.hands === 'L' ? 'L' : 'R') : 'L';
    this.sheet.wrong({ ...spellMidi(e.midi, this.slice.keyFifths || 0), midi: e.midi, hand: this.hands === 'both' ? (e.midi >= 60 ? 'R' : 'L') : hand }, style === 'subtle');
    this.kb.flash(e.midi, style === 'subtle' ? 'soft' : 'bad', 400);
    if (this.mode === 'wait' && this.wrong % 3 === 0) {
      const ev = this.events[this.ei];
      if (ev) this.toast(`Look for ${ev.notes.filter((n) => !this.hitSet.has(n.id)).map((n) => noteName(n.midi, this.slice.keyFifths)).join(' + ')} — it’s highlighted on the keyboard`);
    }
  }

  onInput(type, e) {
    if (type === 'devices') { this.updateInputChip(); return; }
    if (type === 'noteon' && e.source !== 'mic') this.kb.press(e.midi, 'play');
    if (type === 'noteoff') { this.kb.release(e.midi); return; }
    if (type !== 'noteon' || this.finished || this.overlayOpen || this.demo) return;
    if (performance.now() < (this.readyAt || 0)) return;
    if (this.mode === 'wait') this.waitInput(e);
    else if (this.mode === 'timed' && this.running && audio.now >= this.countEnd - 0.4) this.timedInput(e);
  }

  // ---- listen (demo) ------------------------------------------------------

  /** Piano volume card. `then` runs after "Done" (used before the first Listen). */
  showVolume(then) {
    const wasRunning = this.running && this.mode === 'timed';
    if (wasRunning) this.pause();
    audio.ensure();
    const val = h('b', { class: 'vol-val' }, `${Math.round(settings.get('musicVolume') * 100)}%`);
    const sample = () => {
      const t = audio.now + 0.03;
      [60, 64, 67, 72].forEach((m, i) => audio.play(m, { when: t + i * 0.16, dur: 0.9, velocity: 0.7 }));
    };
    this.showOverlay(h('div', { class: 'card start-card pop' }, [
      h('div', { class: 'eyebrow' }, then ? 'Before you listen' : 'Sound'),
      h('h2', {}, 'Piano volume'),
      h('p', {}, then
        ? 'Set how loud the app’s piano plays. It’s saved, so you only do this once. Metronome and effects keep their own volume.'
        : 'How loud the app’s piano plays (Listen, the other hand and on-screen keys). Metronome and effects aren’t affected.'),
      h('label', { class: 'field' }, [h('span', {}, 'App sound'), h('div', { class: 'seg' }, [['match', 'Match keyboard'], ...SOUNDS.map((x) => [x.id, x.name.replace(' (bass + piano)', '')])].map(([id, name]) => h('button', {
        class: settings.get('appSound') === id ? 'on' : '',
        onclick: (ev) => {
          settings.set('appSound', id);
          applySound(this.cfg.song && this.cfg.song.instrument);
          ev.currentTarget.parentNode.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === ev.currentTarget));
          sample();
        },
      }, name)))]),
      h('div', { class: 'vol-row' }, [
        icon('volume'),
        h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: settings.get('musicVolume'), oninput: (e) => {
          const v = +e.target.value;
          settings.set('musicVolume', v);
          audio.setMusicVolume(v);
          val.textContent = `${Math.round(v * 100)}%`;
        }, onchange: sample }),
        val,
      ]),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: sample }, [icon('ear'), 'Play a sample']),
        h('button', { class: 'btn primary', onclick: () => { settings.set('musicVolumeSet', true); this.hideOverlay(); if (then) then(); } }, then ? [icon('play'), 'Listen'] : 'Done'),
      ]),
    ]));
  }

  listen() {
    if (this.demo) { this.stopDemo(); return; }
    if (!settings.get('musicVolumeSet')) { this.showVolume(() => this.listen()); return; }
    audio.ensure();
    this.pause();
    this.demo = { prevMode: this.mode, prevBeat: this.beat, prevScroll: this.sheet.scroll, prevStates: new Map(this.sheet.state) };
    this.mode = 'listen';
    this.sheet.state.clear();
    this.beat = this.slice.measures[0] ? this.slice.measures[0].start : 0;
    const dur = (this.endBeat - this.beat) * this.spq + 2;
    mic.mute(dur + 0.5);
    this.el.classList.add('demo');
    this.el.querySelector('.listen span').textContent = 'Stop';
    this.play();
  }

  stopDemo() {
    if (!this.demo) return;
    this.running = false;
    this.stopAudio();
    mic.mute(0.6);
    const d = this.demo;
    this.demo = null;
    this.mode = d.prevMode;
    this.beat = d.prevBeat;
    this.sheet.scroll = d.prevScroll;
    this.sheet.state = d.prevStates;
    this.el.classList.remove('demo');
    this.el.querySelector('.listen span').textContent = 'Listen';
    this.el.querySelector('.pl-count').textContent = '';
    this.kb.setHints(new Map());
    this.hintKey = null;
    if (this.mode === 'wait') this.setWaitTargets();
    else this.setTimedTargets();
    this.updateControls();
  }

  // ---- frame loop ---------------------------------------------------------

  frame(ts) {
    if (this.destroyed) return;
    const dt = Math.min(0.05, this.lastTs ? (ts - this.lastTs) / 1000 : 0);
    this.lastTs = ts;
    const now = audio.now;
    const count = this.el.querySelector('.pl-count');

    if ((this.mode === 'timed' || this.mode === 'listen') && this.running) {
      this.beat = (now - this.t0) / this.spq;
      this.schedule(now);
      // count-in numbers
      if (now < this.countEnd) {
        const i = Math.floor((now - this.countStart) / (this.clickUnit * this.spq));
        const txt = i >= 0 ? String(Math.max(1, this.countClicks - i)) : '';
        if (count.textContent !== txt) { count.textContent = txt; count.classList.remove('pulse'); void count.offsetWidth; count.classList.add('pulse'); }
      } else if (count.textContent) count.textContent = '';
      this.sheet.scroll = this.beat;
      if (this.mode === 'listen') {
        for (const n of this.slice.notes) {
          if (n.start <= this.beat && !this.sheet.state.has(n.id)) {
            this.sheet.state.set(n.id, 'hit');
            this.kb.flash(n.midi, 'play', Math.max(150, n.dur * this.spq * 900));
          }
        }
        if (this.beat > this.endBeat + 0.5) this.stopDemo();
      } else {
        // misses
        for (const n of this.active) {
          if (!this.hitSet.has(n.id) && this.sheet.state.get(n.id) !== 'miss' && (this.beat - n.start) * this.spq > WINDOW) {
            this.sheet.state.set(n.id, 'miss');
            this.grades.miss++;
            this.addEnergy(-0.1);
            this.streak = 0;
          }
        }
        this.setTimedTargets();
        if (this.beat > this.endBeat + 0.6) this.finish();
      }
    } else if (this.mode === 'wait') {
      const ev = this.events[this.ei];
      const target = ev ? ev.start : this.endBeat;
      this.sheet.scroll += (target - this.sheet.scroll) * (1 - Math.exp(-dt * 9));
    }

    // progress
    const p = this.mode === 'wait'
      ? this.ei / Math.max(1, this.events.length)
      : Math.max(0, Math.min(1, this.beat / Math.max(0.01, this.endBeat)));
    this.el.querySelector('.pl-progress .bar').style.transform = `scaleX(${p})`;
    // mic level meter
    const lvl = this.el.querySelector('.pl-input .lvl');
    if (lvl) lvl.style.setProperty('--lvl', Math.max(0, Math.min(1, (mic.level + 70) / 50)).toFixed(2));

    this.sheet.draw(dt);
    this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  // ---- boss battles ---------------------------------------------------------

  addEnergy(d) {
    if (!this.cfg.exam || this.finished) return;
    this.energy = Math.max(0, Math.min(1, (this.energy ?? 0.6) + d));
    const bar = this.el.querySelector('.energy i');
    if (bar) bar.style.transform = `scaleX(${this.energy})`;
    const box = this.el.querySelector('.energy');
    if (box) {
      box.classList.toggle('low', this.energy < 0.3);
      box.classList.remove('hit', 'hurt');
      void box.offsetWidth;
      box.classList.add(d > 0 ? 'hit' : 'hurt');
    }
    if (this.energy <= 0) { this.knockedOut = true; this.finish(); }
  }

  // ---- results ------------------------------------------------------------

  finish() {
    if (this.finished) return;
    this.finished = true;
    this.running = false;
    this.stopAudio();
    input.setExpected([]);
    this.kb.setHints(new Map());
    let score;
    const total = this.active.length;
    if (this.mode === 'wait') {
      score = total ? total / (total + this.wrong * 0.5) : 1;
    } else {
      const g = this.grades;
      score = total ? (g.perfect + g.good * 0.85 + g.ok * 0.6) / total : 1;
      score = Math.max(0, score - Math.min(0.15, this.wrong * 0.01));
    }
    if (this.knockedOut) score = Math.min(score, (this.beat / Math.max(1, this.endBeat)) * score);
    const stars = this.knockedOut ? 0 : starsFor(score, this.mode);
    const result = { stars, score, mode: this.mode, wrong: this.wrong, grades: { ...this.grades }, total };
    if (this.cfg.exam) {
      result.exam = true;
      result.passed = !this.knockedOut && score >= this.cfg.exam.pass;
      result.knockedOut = !!this.knockedOut;
    }
    if (stars > 0) audio.chime('good');
    // Challenges: correct notes, results with the beat, 3-star runs.
    const notesHit = this.mode === 'wait' ? this.hits : this.grades.perfect + this.grades.good + this.grades.ok;
    if (notesHit) track('notes', notesHit);
    if (this.mode === 'timed' && stars >= 2) track('timed');
    if (stars === 3) track('threeStar');
    if (this.cfg.onFinish) this.cfg.onFinish(result);
    this.showResult(result);
  }

  showResult(r) {
    if (r.exam) { this.showExamResult(r); return; }
    const titles = ['Keep practicing!', 'Nice work!', 'Great job!', 'Amazing!'];
    const pct = Math.round(r.score * 100);
    const stats = r.mode === 'wait'
      ? [stat(`${r.total}`, 'notes played'), stat(`${r.wrong}`, r.wrong === 1 ? 'wrong note' : 'wrong notes'), stat(`${pct}%`, 'accuracy')]
      : [stat(`${r.grades.perfect}`, 'perfect'), stat(`${r.grades.good + r.grades.ok}`, 'good'), stat(`${r.grades.miss}`, 'missed'), stat(`${pct}%`, 'score')];
    const actions = (this.cfg.actions && this.cfg.actions(r)) || [];
    this.showOverlay(h('div', { class: 'card result-card pop' }, [
      h('div', { class: 'stars-big', html: starsHTML(r.stars, 3, true) }),
      h('h2', {}, titles[r.stars]),
      h('p', { class: 'muted' }, r.stars === 0 ? 'Try slowing the tempo down, or practise at your own pace first.' : r.mode === 'wait' && r.stars === 3 ? 'Ready to try it with the beat?' : ''),
      h('div', { class: 'stats' }, stats),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: () => this.restart() }, [icon('restart'), 'Try again']),
        ...actions.map((a) => h('button', { class: `btn ${a.primary ? 'primary' : 'ghost'}`, onclick: () => a.fn(r) }, a.label)),
      ]),
    ]));
    if (r.stars >= 2) confetti(this.el.querySelector('.pl-overlay'));
  }

  showExamResult(r) {
    const pct = Math.round(r.score * 100);
    const need = Math.round(this.cfg.exam.pass * 100);
    const actions = (this.cfg.actions && this.cfg.actions(r)) || [];
    this.showOverlay(h('div', { class: `card result-card exam-result ${r.passed ? 'won' : 'lost'} pop` }, [
      h('div', { class: 'exam-badge' }, r.passed ? '\u2694 Victory' : '\u2620 Defeated'),
      r.passed ? h('div', { class: 'stars-big', html: starsHTML(r.stars, 3, true) }) : null,
      h('h2', {}, r.passed ? `${this.cfg.exam.name || 'The Guardian'} is defeated!` : r.knockedOut ? 'Your energy ran out' : 'Not quite enough'),
      h('p', { class: 'muted' }, r.passed
        ? 'The way to the next galaxy is open.'
        : `You scored ${pct}%. You need ${need}% to pass. Practise the tricky parts in the lessons, then come back for a rematch.`),
      h('div', { class: 'stats' }, [stat(`${pct}%`, 'score'), stat(`${need}%`, 'to pass'), stat(`${r.grades.perfect}`, 'perfect'), stat(`${r.grades.miss}`, 'missed')]),
      h('div', { class: 'row' }, [
        h('button', { class: `btn ${r.passed ? 'ghost' : 'primary'}`, onclick: () => { this.energy = 0.6; this.knockedOut = false; this.addEnergy(0); this.restart(); } }, [icon('restart'), r.passed ? 'Play again' : 'Rematch']),
        ...actions.map((a) => h('button', { class: `btn ${a.primary ? 'primary' : 'ghost'}`, onclick: () => a.fn(r) }, a.label)),
      ]),
    ]));
    if (r.passed) confetti(this.el.querySelector('.pl-overlay'));
  }

  showMicHelp() {
    const wasRunning = this.running;
    if (wasRunning) this.pause();
    const sens = h('input', { type: 'range', min: 0, max: 1, step: 0.05, value: settings.get('micSensitivity'), oninput: (e) => { settings.set('micSensitivity', +e.target.value); mic.setSensitivity(+e.target.value); } });
    this.showOverlay(h('div', { class: 'card pop' }, [
      h('h2', {}, 'Listening tips'),
      h('ul', { class: 'tips' }, [
        h('li', {}, 'Put your iPad on the music stand, close to the piano.'),
        h('li', {}, 'Use headphones for the app sound so the mic only hears your piano.'),
        h('li', {}, 'Play each note firmly and clearly, especially chords.'),
        h('li', {}, 'Wrong notes being detected (e.g. C heard as E)? Tap “Calibrate pitch”.'),
        h('li', {}, 'For the best accuracy, connect a MIDI piano (see Settings).'),
      ]),
      h('label', { class: 'field' }, [h('span', {}, 'Mic sensitivity'), sens]),
      h('div', { class: 'row' }, [
        h('button', { class: 'btn ghost', onclick: () => openCalibration() }, 'Calibrate pitch'),
        h('button', { class: 'btn primary', onclick: () => this.hideOverlay() }, 'Done'),
      ]),
    ]));
  }

  toast(msg) {
    const t = this.el.querySelector('.pl-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this.toastT);
    this.toastT = setTimeout(() => t.classList.remove('show'), 3200);
  }

  showOverlay(node) {
    const o = this.el.querySelector('.pl-overlay');
    o.innerHTML = '';
    o.appendChild(node);
    o.classList.add('open');
    this.overlayOpen = true;
  }

  hideOverlay() {
    const o = this.el.querySelector('.pl-overlay');
    o.classList.remove('open');
    o.innerHTML = '';
    this.overlayOpen = false;
  }

  setTempo(t) {
    if (this.cfg.exam) { this.toast('Boss battles are played at full speed. Practise slower in the lesson first.'); return; }
    const was = this.running && this.mode === 'timed';
    if (was) this.pause();
    this.tempo = Math.round(Math.max(0.4, Math.min(1.5, t)) * 10) / 10;
    this.updateControls();
  }

  toggleNames() {
    this.showNames = !this.showNames;
    this.sheet.showNames = this.showNames;
    this.updateControls();
  }

  toggleMetro() {
    settings.set('metronome', !settings.get('metronome'));
    this.updateControls();
  }

  exit() {
    this.destroy();
    if (this.cfg.onExit) this.cfg.onExit();
  }

  destroy() {
    this.destroyed = true;
    // Practice time counts toward challenges (capped so an idle screen doesn't farm minutes).
    if (this.playStart) track('minutes', Math.min(30, (performance.now() - this.playStart) / 60000));
    if (Player.current === this) Player.current = null;
    applySound();
    cancelAnimationFrame(this.raf);
    clearTimeout(this.chordTimer);
    clearTimeout(this.readyT);
    this.stopAudio();
    this.unsub();
    input.setExpected([]);
    document.removeEventListener('visibilitychange', this.onVis);
    this.ro.disconnect();
    this.kb.destroy();
    this.el.remove();
  }
}

function stat(v, label) {
  return h('div', { class: 'stat' }, [h('b', {}, v), h('span', {}, label)]);
}

export function confetti(host) {
  if (!host) return;
  const colors = ['#6C4DF6', '#3D7BFF', '#17B26A', '#FFC43D', '#F04461', '#F0821E'];
  const layer = h('div', { class: 'confetti' });
  for (let i = 0; i < 70; i++) {
    const p = h('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = `${Math.random() * 0.4}s`;
    p.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    p.style.setProperty('--dx', `${(Math.random() - 0.5) * 220}px`);
    p.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
    layer.appendChild(p);
  }
  host.appendChild(layer);
  setTimeout(() => layer.remove(), 3500);
}
