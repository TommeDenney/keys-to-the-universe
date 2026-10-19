// Polyphonic piano note-onset detector for microphone input.
//
// Pure DSP (no DOM) so it can be unit-tested offline. Each frame:
//   1. Two FFTs of the most recent audio: 4096 samples for mid/high notes
//      (fast) and 8192 for low notes (frequency resolution). Windows are
//      skewed toward the newest samples to cut latency.
//   2. Harmonic salience per piano key = weighted sum of spectral peaks at
//      its first harmonics.
//   3. Iterative pick-and-subtract (strongest note first, remove its
//      harmonics) so octaves/fifths of a played note aren't reported as
//      separate "wrong" notes.
//   4. Notes the song expects next use their raw salience (lenient: if you
//      play them they're heard, even inside chords/octaves).
//   5. Per-note onset tracking: a note "starts" when its level rises sharply
//      above an adaptive noise floor; re-strikes are found by a fresh rise
//      after the note began to decay.

const LO = 33; // A1
const HI = 96; // C7
const SPLIT = 57; // below A3 use the long window

function makeFFT(n) {
  const levels = Math.log2(n) | 0;
  const rev = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    let r = 0;
    for (let b = 0; b < levels; b++) r |= ((i >> b) & 1) << (levels - 1 - b);
    rev[i] = r;
  }
  const cos = new Float64Array(n / 2);
  const sin = new Float64Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / n);
    sin[i] = Math.sin((2 * Math.PI * i) / n);
  }
  const re = new Float64Array(n);
  const im = new Float64Array(n);
  return function fftMag(input, window, out) {
    for (let i = 0; i < n; i++) {
      re[rev[i]] = input[i] * window[i];
      im[rev[i]] = 0;
    }
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1;
      const step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const a = i + j;
          const b = a + half;
          const tr = re[b] * cos[k] + im[b] * sin[k];
          const ti = -re[b] * sin[k] + im[b] * cos[k];
          re[b] = re[a] - tr;
          im[b] = im[a] - ti;
          re[a] += tr;
          im[a] += ti;
        }
      }
    }
    for (let k = 0; k < out.length; k++) out[k] = Math.hypot(re[k], im[k]);
  };
}

/** Window rising slowly (Hann) over the first 80%, falling fast over the last 20%. */
function skewWindow(n) {
  const w = new Float64Array(n);
  const peak = Math.floor(n * 0.8);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    w[i] = i < peak ? 0.5 - 0.5 * Math.cos((Math.PI * i) / peak) : 0.5 + 0.5 * Math.cos((Math.PI * (i - peak)) / (n - peak));
    sum += w[i];
  }
  for (let i = 0; i < n; i++) w[i] /= sum / 2; // sine of amplitude A → peak ≈ A
  return w;
}

export class PianoDetector {
  constructor(sampleRate) {
    this.sr = sampleRate;
    this.nS = 4096;
    this.nL = 8192;
    this.fftS = makeFFT(this.nS);
    this.fftL = makeFFT(this.nL);
    this.winS = skewWindow(this.nS);
    this.winL = skewWindow(this.nL);
    this.magS = new Float64Array(this.nS / 2);
    this.magL = new Float64Array(this.nL / 2);
    this.workS = new Float64Array(this.nS / 2);
    this.workL = new Float64Array(this.nL / 2);
    this.binS = sampleRate / this.nS;
    this.binL = sampleRate / this.nL;
    const N = HI + 1;
    this.E = new Float64Array(N).fill(-120);
    this.raw = new Float64Array(N).fill(-120);
    this.floor = new Float64Array(N).fill(-100);
    this.dev = new Float64Array(N).fill(3);
    this.fine = new Float64Array(N).fill(-120);
    this.hist = Array.from({ length: N }, () => []);
    this.active = new Uint8Array(N);
    this.peak = new Float64Array(N);
    this.trough = new Float64Array(N).fill(Infinity);
    this.lastOnset = new Float64Array(N).fill(-1);
    this.frames = 0;
    this.expected = new Set();
    this.pending = [];
    this.setSensitivity(0.5);
    this.setPitchOffset(0);
  }

  /**
   * Calibration: semitones by which this microphone hears notes off-pitch
   * (piano tuning, or a device sample-rate mismatch). Key m is then looked
   * for at the frequency of m + offset.
   */
  setPitchOffset(offset) {
    this.offset = offset || 0;
    // Precompute harmonic bin ranges per note for both spectra.
    this.harm = [];
    for (let m = LO; m <= HI; m++) {
      const f0 = 440 * Math.pow(2, (m - 69 + this.offset) / 12);
      const H = Math.max(3, Math.min(8, Math.floor(4500 / f0)));
      const long = m < SPLIT;
      const list = [];
      for (let h = 1; h <= H; h++) {
        const f = f0 * h * (1 + 0.0004 * h * h); // slight piano inharmonicity
        list.push({ h, w: 1 / Math.sqrt(h), rS: this.binRange(f, this.binS, this.nS), rL: this.binRange(f, this.binL, this.nL) });
      }
      this.harm[m] = { long, list };
    }
  }

  /**
   * Where does the sound currently in the long spectrum actually sit?
   * Returns harmonic-sum salience for fractional pitches lo..hi (uncalibrated).
   */
  pitchScan(lo, hi, step = 0.1) {
    const out = [];
    const spec = this.magL;
    const at = (f) => {
      const c = f / this.binL;
      const k = Math.floor(c);
      if (k < 1 || k + 1 >= spec.length) return 0;
      return Math.max(spec[k], spec[k + 1]) * 0.5 + (spec[k] + (spec[k + 1] - spec[k]) * (c - k)) * 0.5;
    };
    for (let p = lo; p <= hi + 1e-9; p += step) {
      const f0 = 440 * Math.pow(2, (p - 69) / 12);
      let s = 0;
      for (let h = 1; h <= 6; h++) s += at(f0 * h * (1 + 0.0004 * h * h)) / Math.sqrt(h);
      out.push({ p, s });
    }
    return out;
  }

  binRange(f, binHz, n) {
    const c = f / binHz;
    const hw = Math.max(0.5, c * (Math.pow(2, 0.25 / 12) - 1));
    return [Math.max(1, Math.round(c - hw)), Math.min(n / 2 - 1, Math.round(c + hw))];
  }

  /** sensitivity 0 (strict) … 1 (very sensitive) */
  setSensitivity(s) {
    this.sens = s;
    this.onDb = 22 - 14 * s; // dB above the noise floor
  }

  setExpected(midis) {
    this.expected = new Set(midis);
  }

  salience(m, specS, specL, forceLong = false) {
    const { list } = this.harm[m];
    const long = forceLong || this.harm[m].long;
    const spec = long ? specL : specS;
    let s = 0;
    for (const { w, rS, rL } of list) {
      const [a, b] = long ? rL : rS;
      let p = 0;
      for (let k = a; k <= b; k++) if (spec[k] > p) p = spec[k];
      s += w * p;
    }
    return s;
  }

  subtract(m, specS, specL) {
    for (const { rS, rL } of this.harm[m].list) {
      for (let k = rS[0] - 1; k <= rS[1] + 1; k++) if (k > 0 && k < specS.length) specS[k] *= 0.12;
      for (let k = rL[0] - 1; k <= rL[1] + 1; k++) if (k > 0 && k < specL.length) specL[k] *= 0.12;
    }
  }

  /**
   * @param {Float32Array} buf  most recent samples (length ≥ 8192, newest last)
   * @param {number} t          time in seconds of the newest sample
   * @returns {{onsets: {midi:number, strength:number, expected:boolean, time:number}[], level:number, loudest:number|null}}
   */
  process(buf, t) {
    const n = buf.length;
    const small = buf.subarray(n - this.nS);
    const large = buf.subarray(n - this.nL);
    // Level (RMS of the newest ~40ms)
    let sq = 0;
    const rmsN = Math.min(2048, n);
    for (let i = n - rmsN; i < n; i++) sq += buf[i] * buf[i];
    const level = 10 * Math.log10(sq / rmsN + 1e-12);

    this.fftS(small, this.winS, this.magS);
    this.fftL(large, this.winL, this.magL);
    this.workS.set(this.magS);
    this.workL.set(this.magL);

    const raw = this.raw;
    const fine = this.fine; // high-resolution salience, used to tell neighbouring semitones apart
    for (let m = LO; m <= HI; m++) {
      raw[m] = 20 * Math.log10(this.salience(m, this.magS, this.magL) + 1e-9);
      fine[m] = this.harm[m].long ? raw[m] : 20 * Math.log10(this.salience(m, this.magS, this.magL, true) + 1e-9);
    }

    // Iterative pick + subtract on the working copy.
    const picked = new Map();
    let firstV = null;
    for (let iter = 0; iter < 6; iter++) {
      let best = -1;
      let bestV = -Infinity;
      let bestAbs = 0;
      for (let m = LO; m <= HI; m++) {
        if (picked.has(m)) continue;
        const a = 20 * Math.log10(this.salience(m, this.workS, this.workL) + 1e-9);
        const v = a - this.floor[m];
        if (v > bestV) { bestV = v; best = m; bestAbs = a; }
      }
      if (best < 0 || bestV < this.onDb) break;
      if (firstV === null) firstV = bestAbs;
      else if (bestAbs < firstV - 24) break; // much quieter than the main note: leakage, not a key
      picked.set(best, raw[best]);
      this.subtract(best, this.workS, this.workL);
    }

    const onsets = [];
    const warm = this.frames < 15;
    let loudest = null;
    let loudestV = 0;
    for (let m = LO; m <= HI; m++) {
      const exp = this.expected.has(m);
      let e;
      if (exp) {
        e = raw[m];
      } else if (picked.has(m)) {
        e = picked.get(m);
      } else {
        e = 20 * Math.log10(this.salience(m, this.workS, this.workL) + 1e-9);
      }
      const canFire = exp || picked.has(m);
      this.E[m] = e;
      const hist = this.hist[m];
      const minPrev = hist.length ? Math.min(...hist) : e;
      hist.push(e);
      if (hist.length > 6) hist.shift();

      const floor = this.floor[m];
      const above = e - floor;
      const onDb = Math.max(exp ? this.onDb - 3 : this.onDb + 3, 4 * this.dev[m]);
      const riseDb = exp ? 5 : 8;
      if (!warm && level > -70) {
        if (!this.active[m]) {
          if (canFire && above >= onDb && e - minPrev >= riseDb && t - this.lastOnset[m] > 0.09) {
            this.fire(m, e, t, onsets, exp, above);
          }
        } else {
          if (e > this.peak[m]) this.peak[m] = e;
          else if (e < this.peak[m] - 1.5) this.trough[m] = Math.min(this.trough[m], e);
          if (canFire && above >= onDb && e - this.trough[m] >= riseDb && t - this.lastOnset[m] > 0.12) {
            this.fire(m, e, t, onsets, exp, above);
          } else if (above < onDb * 0.45 || e < this.peak[m] - 28) {
            this.active[m] = 0;
          }
        }
      }
      if (!this.active[m]) {
        // Adaptive noise floor (mean) and its typical deviation.
        const a = warm ? 0.3 : 0.03;
        this.floor[m] += (e - floor) * a;
        this.dev[m] += (Math.min(12, Math.abs(e - floor)) - this.dev[m]) * a;
      }
      if (this.active[m] && above > loudestV) { loudestV = above; loudest = m; }
    }

    // Confirm pending onsets: over the next few frames the note must stay
    // loud and beat its (non-expected) neighbours within 2 semitones in the
    // high-resolution spectrum. Attack transients smear across neighbours;
    // real notes win once the window fills. Onset time is back-dated.
    let maxRaw = -Infinity;
    for (let m = LO; m <= HI; m++) if (raw[m] > maxRaw) maxRaw = raw[m];
    const still = [];
    for (const p of this.pending) {
      const m = p.midi;
      p.n++;
      let nb = -Infinity;
      for (let k = Math.max(LO, m - 2); k <= Math.min(HI, m + 2); k++) {
        if (k !== m && !this.expected.has(k) && fine[k] > nb) nb = fine[k];
      }
      const above = this.E[m] - this.floor[m];
      if (above < this.onDb * 0.4) continue; // faded away: it was a transient
      if (!p.expected && this.isOvertone(m)) continue; // octave/twelfth ghost of a sounding note
      if (!p.expected && above < this.onDb + 6) continue; // a wrong note has to be played clearly
      const own = this.lowHarmonicsPresent(m);
      // A real key is one of the dominant sounds, not a faint overtone match
      // inside a much louder (wrong) note.
      const dominant = raw[m] >= maxRaw - 10;
      p.ok = fine[m] >= nb - 0.5 && own && dominant ? (p.ok || 0) + 1 : 0;
      if (p.ok >= (p.expected ? 1 : 3) && p.n >= 2) onsets.push(p);
      else if (p.n < 8) still.push(p);
      else {
        // Never confirmed (a ghost). Re-arm so a genuine strike later is
        // judged as a fresh rise from the current level.
        this.peak[m] = this.E[m];
        this.trough[m] = this.E[m];
      }
    }
    this.pending = still;
    this.frames++;
    return { onsets, level, loudest };
  }

  /**
   * A real key has energy at its fundamental or 2nd harmonic. A note that only
   * shares higher partials with other sounding notes (e.g. E4 inside C4's
   * overtones) doesn't.
   */
  lowHarmonicsPresent(m) {
    const list = this.harm[m].list;
    const peak = ([a, b]) => { let p = 0; for (let k = a; k <= b; k++) if (this.magL[k] > p) p = this.magL[k]; return p; };
    let max = 0;
    for (const hm of list) max = Math.max(max, peak(hm.rL));
    // From C3 up a piano's fundamental is strong; below that allow the 2nd harmonic.
    const low = m >= 48 ? peak(list[0].rL) : Math.max(peak(list[0].rL), list[1] ? peak(list[1].rL) : 0);
    return low >= max * 0.18;
  }

  /** Is m an overtone (or sub-octave) of another note that's sounding louder? */
  isOvertone(m) {
    for (let a = LO; a <= HI; a++) {
      if (a === m || !this.active[a]) continue;
      const d = m - a;
      if ((d === 12 || d === 19 || d === 24 || d === 28 || d === 31 || d === -12 || d === -19 || d === -24) && this.E[a] - this.floor[a] >= this.E[m] - this.floor[m] - 6) return true;
    }
    return false;
  }

  fire(m, e, t, onsets, exp, above) {
    this.active[m] = 1;
    this.peak[m] = e;
    this.trough[m] = Infinity;
    this.lastOnset[m] = t;
    this.pending.push({ midi: m, strength: above, expected: exp, time: t, n: 0 });
  }

  reset() {
    this.pending = [];
    this.active.fill(0);
    this.hist.forEach((h) => (h.length = 0));
    this.frames = 0;
  }
}
