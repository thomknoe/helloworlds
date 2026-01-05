export class NoiseGenerator {
  constructor(seed = 42) {
    if (this.constructor === NoiseGenerator) {
      throw new Error("NoiseGenerator is an abstract class and cannot be instantiated directly");
    }
    this.seed = seed;
    this.initialized = false;
  }
  init(seed) {
    this.seed = seed ?? this.seed;
    this.initialized = true;
  }
  noise2D(x, y) {
    throw new Error("noise2D must be implemented by subclass");
  }
  noise2DOctaves(x, y, config = {}) {
    const { octaves = 4, persistence = 0.5, frequency = 1 } = config;
    let value = 0;
    let amplitude = 1;
    let freq = frequency;
    let maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * freq, y * freq) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      freq *= 2;
    }
    return value / maxValue;
  }
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  lerp(t, a, b) {
    return a + t * (b - a);
  }
}
