// Streaming front end for the hotword-free trigger demo. Same file runs in the browser and in Node (evaluation on recordings).
//
// Every 10 ms hop:  lvl    voice-band loudness (dB)
//                   motion Doppler energy 15-80 Hz around the 19 kHz carrier, relative to the carrier (dB)
//                   voiced periodicity in the 80-400 Hz pitch range (0-1)
//                   mel    24 log-mel bands (60-3800 Hz), dop  18-bin Doppler image (log power relative to carrier)
// Utterances (voiced speech, ended by 500 ms of quiet) come out with 16 kHz audio for speech recognition, mel/dop frames
// for the learned sync model (sync.js), and two hand-made cues:
//                   near   how far the voice rises above the room's noise floor (dB)
//                   echo   whether loudness and echo motion rise and fall together (correlation at true alignment
//                          minus at ±0.4/0.7 s shifts, so smooth trends that correlate by chance cancel)

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

function biquad(type, f, fs, q = Math.SQRT1_2) {  // RBJ cookbook
  const w = 2 * Math.PI * f / fs, c = Math.cos(w), al = Math.sin(w) / (2 * q);
  const b = type === "lp" ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  const a0 = 1 + al, a1 = -2 * c / a0, a2 = (1 - al) / a0, b0 = b[0] / a0, b1 = b[1] / a0, b2 = b[2] / a0;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x => { const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
}

function corr(a, b) {
  const n = a.length;
  let ma = 0, mb = 0, xy = 0, xx = 0, yy = 0;
  for (let i = 0; i < n; i++) { ma += a[i] / n; mb += b[i] / n; }
  for (let i = 0; i < n; i++) { xy += (a[i] - ma) * (b[i] - mb); xx += (a[i] - ma) ** 2; yy += (b[i] - mb) ** 2; }
  return xy / Math.sqrt(xx * yy + 1e-20);
}

function fft(re, im) {  // in-place radix-2
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1;
    for (; j & b; b >>= 1) j ^= b;
    j ^= b;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len;
    for (let i = 0; i < n; i += len)
      for (let k = 0; k < len / 2; k++) {
        const c = Math.cos(a * k), s = Math.sin(a * k), p = i + k, q = p + len / 2;
        const tr = re[q] * c - im[q] * s, ti = re[q] * s + im[q] * c;
        re[q] = re[p] - tr; im[q] = im[p] - ti; re[p] += tr; im[p] += ti;
      }
  }
}

function melBank(m, nfft, fs, lo, hi) {  // HTK-style triangles over the nfft/2+1 power bins
  const mel = f => 2595 * Math.log10(1 + f / 700), hz = v => 700 * (10 ** (v / 2595) - 1);
  const edges = Array.from({ length: m + 2 }, (_, i) => hz(mel(lo) + (mel(hi) - mel(lo)) * i / (m + 1)));
  return Array.from({ length: m }, (_, j) => Float64Array.from({ length: nfft / 2 + 1 }, (_, k) => {
    const f = k * fs / nfft, [a, b, c] = edges.slice(j, j + 3);
    return Math.max(0, Math.min((f - a) / (b - a), (c - f) / (c - b)));
  }));
}

const LAGS = [40, 70], KEEP = 3000, AUDIO_S = 12, NMEL = 24, PAD = 100;

class Detector {
  constructor(fs, f0 = 19000) {
    this.fs = fs;
    const P = fs / gcd(fs, f0);  // demodulation table repeats exactly (48 samples at 48 kHz)
    this.cos = Float64Array.from({ length: P }, (_, n) => Math.cos(2 * Math.PI * f0 * n / fs));
    this.sin = Float64Array.from({ length: P }, (_, n) => -Math.sin(2 * Math.PI * f0 * n / fs));
    this.ph = 0;
    this.D = Math.round(fs / 1000);  // -> ~1 kHz complex baseband
    this.N = 128;                    // 128 ms Doppler window, as in the notebook
    this.re = new Float64Array(this.N); this.im = new Float64Array(this.N); this.bp = 0;
    this.ar = 0; this.ai = 0; this.an = 0; this.bbn = 0;
    const bins = [0, -10, -9, -8, -7, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 8, 9, 10];  // carrier, then the ±15.6-78 Hz Doppler image
    this.tw = bins.map(k => Array.from({ length: this.N }, (_, n) => {
      const h = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / this.N), a = -2 * Math.PI * k * n / this.N;
      return [h * Math.cos(a), h * Math.sin(a)];
    }));
    this.hp = biquad("hp", 100, fs); this.lp1 = biquad("lp", 3400, fs); this.lp2 = biquad("lp", 3400, fs);
    this.D8 = Math.round(fs / 8000); this.fs8 = fs / this.D8;
    this.a8 = new Float64Array(256); this.ap = 0; this.dn = 0; this.en = 0; this.enN = 0;
    this.mel = melBank(NMEL, 256, this.fs8, 60, 3800);
    this.w1 = biquad("lp", 7000, fs); this.w2 = biquad("lp", 7000, fs); this.fsA = fs / 3;  // speech-recognition audio
    this.audio = new Float32Array(Math.round(this.fsA * AUDIO_S)); this.na = 0; this.d3 = 0;
    this.h = { lvl: [], motion: [], voiced: [], floor: [], mel: [], dop: [] }; this.t0 = 0; this.t = 0;
    this.floor = null; this.utt = null;
  }

  push(x) {  // Float32Array of mic samples -> { hops: [...], utterances: [...] }
    const hops = [], utterances = [];
    for (let i = 0; i < x.length; i++) {
      const v = x[i];
      this.ar += v * this.cos[this.ph]; this.ai += v * this.sin[this.ph];
      this.ph = (this.ph + 1) % this.cos.length;
      const y = this.lp2(this.lp1(this.hp(v))), z = this.w2(this.w1(v));
      this.en += y * y; this.enN++;
      if (++this.dn === this.D8) { this.dn = 0; this.a8[this.ap] = y; this.ap = (this.ap + 1) % this.a8.length; }
      if (++this.d3 === 3) { this.d3 = 0; this.audio[this.na++ % this.audio.length] = z; }
      if (++this.an === this.D) {
        this.re[this.bp] = this.ar / this.D; this.im[this.bp] = this.ai / this.D;
        this.bp = (this.bp + 1) % this.N; this.ar = this.ai = this.an = 0;
        if (++this.bbn % 10 === 0) {
          hops.push(this.hop());
          const u = this.segment();
          if (u) utterances.push(u);
        }
      }
    }
    return { hops, utterances };
  }

  hop() {
    const lvl = 10 * Math.log10(this.en / this.enN + 1e-12);
    this.en = this.enN = 0;
    const pw = this.tw.map(t => {
      let r = 0, m = 0;
      for (let n = 0; n < this.N; n++) {
        const j = (this.bp + n) % this.N, [c, s] = t[n];
        r += this.re[j] * c - this.im[j] * s; m += this.re[j] * s + this.im[j] * c;
      }
      return r * r + m * m;
    });
    const carrier = pw[0], motion = 10 * Math.log10(pw.slice(1).reduce((a, b) => a + b, 0) / (carrier + 1e-20) + 1e-12);

    const L = this.a8.length, s = Float64Array.from({ length: L }, (_, n) => this.a8[(this.ap + n) % L]);
    const mu = s.reduce((a, b) => a + b, 0) / L;
    for (let n = 0; n < L; n++) s[n] -= mu;
    let voiced = 0;
    for (let l = Math.floor(this.fs8 / 400); l <= Math.ceil(this.fs8 / 80); l++) {
      let xy = 0, xx = 0, yy = 0;
      for (let n = 0; n + l < L; n++) { xy += s[n] * s[n + l]; xx += s[n] * s[n]; yy += s[n + l] * s[n + l]; }
      voiced = Math.max(voiced, xy / Math.sqrt(xx * yy + 1e-20));
    }
    const fr = Float64Array.from(s, (v, n) => v * (0.5 - 0.5 * Math.cos(2 * Math.PI * n / L))), fi = new Float64Array(L);
    fft(fr, fi);
    const mel = Float32Array.from(this.mel, w => Math.log(w.reduce((a, wk, k) => a + wk * (fr[k] ** 2 + fi[k] ** 2), 0) + 1e-10));
    const dop = Float32Array.from(pw.slice(1), p => Math.log((p + 1e-20) / (carrier + 1e-20)));

    this.floor = this.floor === null ? lvl : Math.min(this.floor + 0.02, lvl);  // noise floor, rises 2 dB/s
    for (const [k, v] of [["lvl", lvl], ["motion", motion], ["voiced", voiced], ["floor", this.floor], ["mel", mel], ["dop", dop]]) this.h[k].push(v);
    if (this.h.lvl.length > KEEP) { for (const k in this.h) this.h[k].splice(0, 1000); this.t0 += 1000; }
    this.t++;
    return { t: this.t - 1, lvl, motion, voiced, floor: this.floor, carrier: 10 * Math.log10(carrier + 1e-20) };
  }

  at(k, t) { return this.h[k][t - this.t0]; }
  range(k, a, b) { return this.h[k].slice(a - this.t0, b - this.t0); }

  segment() {
    const t = this.t - 1, loud = this.at("lvl", t) > this.at("floor", t) + 12, voiced = loud && this.at("voiced", t) > 0.5;
    if (!this.utt) {
      if (voiced) this.utt = { start: Math.max(this.t0 + 2 * LAGS[1] + 1, t - 10), last: t, nv: 1, floor: this.at("floor", t) };
      return null;
    }
    const u = this.utt;
    if (loud) u.last = t;
    if (voiced) u.nv++;
    if (t - u.last < 50 && t - u.start < 800) return null;  // ends after 500 ms quiet, or at 8 s
    this.utt = null;
    const end = Math.min(t, u.last + 10);
    if (u.nv < 15 || end - u.start < 30) return null;       // < 150 ms of voicing: not speech
    return this.features(u.start, end, u.floor);
  }

  features(a, b, floor) {
    const lvl = this.range("lvl", a, b), mot = this.range("motion", a, b);
    const loudLvl = lvl.filter(v => v > floor + 12);
    const near = loudLvl.reduce((s, v) => s + v, 0) / loudLvl.length - floor;
    const shifted = LAGS.flatMap(l => [corr(lvl, this.range("motion", a - l, b - l)), corr(this.range("lvl", a - l, b - l), mot)]);
    const echo = corr(lvl, mot) - shifted.reduce((s, v) => s + v, 0) / shifted.length;
    const n = Math.round((b - a) * this.fsA / 100), A = this.audio.length, end = this.na - (this.t - b) * Math.round(this.fsA / 100);
    const audio = new Float32Array(Math.min(n, A));
    for (let i = 0; i < audio.length; i++) audio[i] = this.audio[((end - audio.length + i) % A + A) % A];
    return { start: a, end: b, near, voice: near + floor, echo, audio, fs: this.fsA,  // voice: absolute level in dB re full scale
             mel: this.range("mel", a - PAD, b), dop: this.range("dop", a - PAD, b), pad: PAD };  // with 1 s of lead-in context
  }
}

if (typeof module !== "undefined") module.exports = { Detector };
