// The self-supervised audio-echo sync encoders (trained by train_phone_sync.py on detector.js features), in plain JS.
// Score > 0: the voice's articulation lines up with Doppler motion in front of the phone better than at ±0.4/0.7 s shifts.

function makeSync({ norm, state: S, pad, lags }) {
  const std = (rows, [mu, sd]) => rows.map(r => Float32Array.from(r, (v, i) => (v - mu[i]) / sd[i]));

  function conv1d(x, T, w, b, d) {  // causal; x: T rows of Cin, w: [Cout][Cin][K]
    const Cout = w.length, Cin = w[0].length, K = w[0][0].length, y = Array.from({ length: T }, () => new Float32Array(Cout));
    for (let t = 0; t < T; t++)
      for (let o = 0; o < Cout; o++) {
        let s = b[o];
        for (let k = 0; k < K; k++) {
          const tt = t - (K - 1 - k) * d;
          if (tt < 0) continue;
          const xr = x[tt], wo = w[o];
          for (let i = 0; i < Cin; i++) s += wo[i][k] * xr[i];
        }
        y[t][o] = s;
      }
    return y;
  }

  function conv2d(x, H, T, w, b, dt) {  // x: [Cin][H][T]; kernel (5 over Doppler bins, centred; 3 over time, causal)
    const Cout = w.length, Cin = w[0].length, y = Array.from({ length: Cout }, () => Array.from({ length: H }, () => new Float32Array(T)));
    for (let o = 0; o < Cout; o++)
      for (let h = 0; h < H; h++)
        for (let t = 0; t < T; t++) {
          let s = b[o];
          for (let c = 0; c < Cin; c++)
            for (let i = 0; i < 5; i++) {
              const hh = h + i - 2;
              if (hh < 0 || hh >= H) continue;
              for (let j = 0; j < 3; j++) {
                const tt = t - (2 - j) * dt;
                if (tt >= 0) s += w[o][c][i][j] * x[c][hh][tt];
              }
            }
          y[o][h][t] = Math.max(0, s);
        }
    return y;
  }

  const relu = rows => rows.map(r => r.map(v => Math.max(0, v)));

  function audio(a) {
    const T = a.length;
    let x = relu(conv1d(a, T, S["ae.net.0.weight"], S["ae.net.0.bias"], 1));
    x = relu(conv1d(x, T, S["ae.net.2.weight"], S["ae.net.2.bias"], 2));
    return conv1d(x, T, S["ae.net.4.weight"], S["ae.net.4.bias"], 4);
  }

  function echo(e) {
    const T = e.length, H = e[0].length;
    const x0 = [Array.from({ length: H }, (_, h) => Float32Array.from(e, r => r[h]))];
    const x = conv2d(conv2d(x0, H, T, S["ee.c1.weight"], S["ee.c1.bias"], 1), H, T, S["ee.c2.weight"], S["ee.c2.bias"], 2);
    const W = S["ee.fc.weight"], b = S["ee.fc.bias"], C = x.length;
    return Array.from({ length: T }, (_, t) => Float32Array.from(b, (bo, o) => {
      let s = bo;
      for (let c = 0; c < C; c++) for (let h = 0; h < H; h++) s += W[o][c * H + h] * x[c][h][t];
      return s;
    }));
  }

  const unit = rows => rows.map(r => { const n = Math.hypot(...r) || 1e-12; return r.map(v => v / n); });
  const dot = (p, q) => p.reduce((s, v, i) => s + v * q[i], 0);

  return u => {  // u.mel / u.dop: utterance frames with u.pad frames of lead-in context
    const za = unit(audio(std(u.mel, norm.a))), ze = unit(echo(std(u.dop, norm.e))), T = za.length;
    const mean = f => { let s = 0; for (let t = pad; t < T; t++) s += f(t); return s / (T - pad); };
    const fake = lags.reduce((s, l) => s + mean(t => dot(za[t], ze[t - l])) + mean(t => dot(za[t - l], ze[t])), 0) / (2 * lags.length);
    return mean(t => dot(za[t], ze[t])) - fake;
  };
}

if (typeof module !== "undefined") module.exports = { makeSync };
