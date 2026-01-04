import { NoiseGenerator } from "../core/algorithms/NoiseGenerator.js";

/**
 * Mulberry32 PRNG function generator
 * @param {number} seed - Seed value
 * @returns {Function} Random number generator function
 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Perlin noise generator implementation
 * Extends NoiseGenerator base class
 */
class PerlinNoise extends NoiseGenerator {
  constructor(seed = 42) {
    super(seed);
    this.permutation = [];
    this.p = [];
  }

  /**
   * Initialize the permutation table
   * @param {number} seed - Random seed value
   */
  init(seed) {
    if (this.initialized && this.seed === seed) return;
    super.init(seed);

    const random = mulberry32(seed);
    this.permutation = new Array(256).fill(0).map((_, i) => i);

    for (let i = 255; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [this.permutation[i], this.permutation[j]] = [
        this.permutation[j],
        this.permutation[i],
      ];
    }

    this.p = [...this.permutation, ...this.permutation];
  }

  /**
   * Calculate gradient value
   * @param {number} hash - Hash value
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Gradient value
   */
  grad(hash, x, y) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  /**
   * Generate 2D Perlin noise
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Noise value between 0 and 1
   */
  noise2D(x, y) {
    this.init(this.seed);

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

    return (this.lerp(v, x1, x2) + 1) / 2;
  }
}

// Singleton instance for backward compatibility
const Perlin = new PerlinNoise(42);

// Export both class and singleton
export default Perlin;
export { PerlinNoise };
