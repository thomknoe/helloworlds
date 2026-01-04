/**
 * Abstract base class for noise generators
 * Provides common interface and utilities for all noise algorithms
 */
export class NoiseGenerator {
  constructor(seed = 42) {
    if (this.constructor === NoiseGenerator) {
      throw new Error("NoiseGenerator is an abstract class and cannot be instantiated directly");
    }
    this.seed = seed;
    this.initialized = false;
  }

  /**
   * Initialize the noise generator with a seed
   * @param {number} seed - Random seed value
   */
  init(seed) {
    this.seed = seed ?? this.seed;
    this.initialized = true;
  }

  /**
   * Generate noise value at 2D coordinates
   * Must be implemented by subclasses
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {number} Noise value between 0 and 1
   */
  noise2D(x, y) {
    throw new Error("noise2D must be implemented by subclass");
  }

  /**
   * Generate multi-octave noise
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} config - Octave configuration
   * @param {number} config.octaves - Number of octaves
   * @param {number} config.persistence - Amplitude decay per octave
   * @param {number} config.frequency - Base frequency
   * @returns {number} Combined noise value
   */
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

  /**
   * Fade function for smooth interpolation
   * @param {number} t - Interpolation parameter (0-1)
   * @returns {number} Faded value
   */
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Linear interpolation
   * @param {number} t - Interpolation parameter (0-1)
   * @param {number} a - Start value
   * @param {number} b - End value
   * @returns {number} Interpolated value
   */
  lerp(t, a, b) {
    return a + t * (b - a);
  }
}

