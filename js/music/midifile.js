// Standard MIDI File → Song. Notes are quantized to a fine grid so sheet
// music renders cleanly; hands come from track names / track order / pitch.

import { spellMidi } from './theory.js';
import { buildMeasures, finalizeSong, measureLength } from './song.js';

function readVarLen(d, p) {
  let v = 0;
  let b;
  do {
    b = d[p.i++];
    v = (v << 7) | (b & 0x7f);
  } while (b & 0x80);
  return v;
}

export function parseMidiFile(arrayBuffer, fileName = '', opts = {}) {
  const d = new Uint8Array(arrayBuffer);
  const str = (o, n) => String.fromCharCode(...d.subarray(o, o + n));
  if (str(0, 4) !== 'MThd') throw new Error('Not a MIDI file.');
  const u16 = (o) => (d[o] << 8) | d[o + 1];
  const u32 = (o) => ((d[o] << 24) | (d[o + 1] << 16) | (d[o + 2] << 8) | d[o + 3]) >>> 0;
  const hdrLen = u32(4);
  const ntrks = u16(10);
  const division = u16(12);
  if (division & 0x8000) throw new Error('SMPTE-timed MIDI files aren’t supported.');
  const ppq = division;

  let off = 8 + hdrLen;
  let tempo = null;
  let timeSig = null;
  let keySig = null;
  let firstName = null;
  const tracks = [];
  for (let t = 0; t < ntrks && off < d.length; t++) {
    if (str(off, 4) !== 'MTrk') break;
    const len = u32(off + 4);
    const end = off + 8 + len;
    const p = { i: off + 8 };
    let tick = 0;
    let running = 0;
    const open = new Map();
    const notes = [];
    let name = '';
    while (p.i < end) {
      tick += readVarLen(d, p);
      let st = d[p.i];
      if (st & 0x80) p.i++;
      else st = running;
      if (st === 0xff) {
        const type = d[p.i++];
        const l = readVarLen(d, p);
        const data = d.subarray(p.i, p.i + l);
        p.i += l;
        if (type === 0x51 && tempo === null) tempo = 60000000 / ((data[0] << 16) | (data[1] << 8) | data[2]);
        else if (type === 0x58 && !timeSig) timeSig = [data[0], 2 ** data[1]];
        else if (type === 0x59 && keySig === null) keySig = (data[0] << 24) >> 24;
        else if (type === 0x03) name = String.fromCharCode(...data);
      } else if (st === 0xf0 || st === 0xf7) {
        p.i += readVarLen(d, p);
      } else {
        running = st;
        const cmd = st & 0xf0;
        const ch = st & 0x0f;
        const a = d[p.i++];
        const b = cmd === 0xc0 || cmd === 0xd0 ? 0 : d[p.i++];
        if (ch === 9) continue; // drums
        const k = `${ch}:${a}`;
        if (cmd === 0x90 && b > 0) {
          if (!open.has(k)) open.set(k, []);
          open.get(k).push({ tick, vel: b, ch });
        } else if (cmd === 0x80 || (cmd === 0x90 && b === 0)) {
          const q = open.get(k);
          if (q && q.length) {
            const on = q.shift();
            notes.push({ midi: a, startTick: on.tick, endTick: tick, ch });
          }
        }
      }
    }
    if (!firstName && name) firstName = name;
    tracks.push({ name, notes });
    off = end;
  }

  const withNotes = tracks.filter((t) => t.notes.length);
  if (!withNotes.length) throw new Error('This MIDI file has no notes.');

  // Hand assignment.
  const avg = (t) => t.notes.reduce((a, n) => a + n.midi, 0) / t.notes.length;
  const split = opts.split || 60;
  let handOf;
  if (withNotes.length >= 2) {
    const named = (t, re) => re.test(t.name.toLowerCase());
    const rh = withNotes.find((t) => named(t, /right|\brh\b|treble|upper|melody/));
    const lh = withNotes.find((t) => named(t, /left|\blh\b|bass|lower/));
    let r = rh;
    let l = lh;
    if (!r || !l || r === l) {
      const sorted = [...withNotes].sort((a, b) => avg(b) - avg(a));
      r = sorted[0];
      l = sorted[sorted.length - 1];
    }
    const tr = new Map(withNotes.map((t) => [t, t === r ? 'R' : t === l ? 'L' : avg(t) >= split ? 'R' : 'L']));
    handOf = (t) => () => tr.get(t);
  } else {
    // Single track: split by channel if there are two channels, else by pitch.
    const chans = [...new Set(withNotes[0].notes.map((n) => n.ch))];
    if (chans.length === 2) {
      const avgCh = (c) => { const ns = withNotes[0].notes.filter((n) => n.ch === c); return ns.reduce((a, n) => a + n.midi, 0) / ns.length; };
      const hiCh = avgCh(chans[0]) >= avgCh(chans[1]) ? chans[0] : chans[1];
      handOf = () => (n) => (n.ch === hiCh ? 'R' : 'L');
    } else {
      handOf = () => (n) => (n.midi >= split ? 'R' : 'L');
    }
  }

  const grid = 1 / 12; // quarter-note subdivisions: handles 16ths and triplets
  const q = (x) => Math.round(x / grid) * grid;
  const fifths = keySig || 0;
  const notes = [];
  for (const t of withNotes) {
    const hf = handOf(t);
    for (const n of t.notes) {
      const start = q(n.startTick / ppq);
      const dur = Math.max(grid * 1.5, q((n.endTick - n.startTick) / ppq));
      notes.push({ midi: n.midi, ...spellMidi(n.midi, fifths), start, dur, hand: hf(n) });
    }
  }
  // Drop exact duplicates (same pitch & start), common in doubled tracks.
  const seen = new Set();
  const uniq = notes.filter((n) => {
    const k = `${n.midi}:${n.start.toFixed(3)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // Shift so the music starts at 0 (some files have a leading silent bar).
  const time = timeSig || [4, 4];
  const mLen = measureLength(time);
  const first = Math.min(...uniq.map((n) => n.start));
  const shift = Math.floor(first / mLen + 1e-6) * mLen;
  uniq.forEach((n) => (n.start -= shift));
  const total = Math.max(...uniq.map((n) => n.start + n.dur));

  const song = {
    id: 'import',
    title: (firstName && firstName.length > 2 && !/^track/i.test(firstName) ? firstName : fileName.replace(/\.[^.]+$/, '')) || 'Imported MIDI',
    composer: '',
    level: 0,
    tags: [],
    bpm: Math.round(tempo || 100),
    time,
    keyFifths: fifths,
    notes: uniq,
    rests: [],
    measures: buildMeasures(total, mLen, 0),
    sections: [],
    source: 'import',
  };
  return finalizeSong(song);
}
