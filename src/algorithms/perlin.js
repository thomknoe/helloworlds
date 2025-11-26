// src/algorithms/perlin.js

// Classic Perlin Noise implementation (2D)
// Deterministic, no external dependencies

const Perlin = {
  permutation: [],
  p: [],
  initialized: false,

  init(seed = 1) {
    if (this.initialized) return;

    // Deterministic RNG
    const random = mulberry32(seed);

    // Create permutation array
    this.permutation = new Array(256).fill(0).map((_, i) => i);

    // Shuffle
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [
        this.permutation[j],
        this.permutation[i],
      ];
    }

    // Duplicate the array
    this.p = [...this.permutation, ...this.permutation];

    this.initialized = true;
  },

  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  },

  lerp(t, a, b) {
    return a + t * (b - a);
  },

  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  },

  noise2D(x, y) {
    this.init();

    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;

    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.p[this.p[xi] + yi];
    const ab = this.p[this.p[xi] + yi + 1];
    const ba = this.p[this.p[xi + 1] + yi];
    const bb = this.p[this.p[xi + 1] + yi + 1];

    const x1 = this.lerp(u, this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf));
    const x2 = this.lerp(
      u,
      this.grad(ab, xf, yf - 1),
      this.grad(bb, xf - 1, yf - 1)
    );

    // Normalize output to [0,1]
    return (this.lerp(v, x1, x2) + 1) / 2;
  },
};

// --------------------------------------------------
// Deterministic PRNG
// --------------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default Perlin;
