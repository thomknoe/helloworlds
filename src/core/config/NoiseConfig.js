/**
 * Configuration class for noise generators
 * Encapsulates all noise-related parameters
 */
export class NoiseConfig {
  constructor(config = {}) {
    this.seed = config.seed ?? 42;
    this.scale = config.scale ?? 0.05;
    this.octaves = config.octaves ?? 4;
    this.persistence = config.persistence ?? 0.5;
    this.amplitude = config.amplitude ?? 10;
    this.frequency = config.frequency ?? 1;
    this.type = config.type ?? "perlinNoise";
    
    // Voronoi specific
    this.mode = config.mode;
    
    // Domain Warping specific
    this.baseScale = config.baseScale;
    this.warpStrength = config.warpStrength;
    this.warpScale = config.warpScale;
    
    // Ridge Noise specific
    this.offset = config.offset;
    this.power = config.power;
    
    // Simplex specific
    this.zOffset = config.zOffset;
  }

  /**
   * Create a copy of this configuration
   * @returns {NoiseConfig} New configuration instance
   */
  clone() {
    return new NoiseConfig({
      seed: this.seed,
      scale: this.scale,
      octaves: this.octaves,
      persistence: this.persistence,
      amplitude: this.amplitude,
      frequency: this.frequency,
      type: this.type,
      mode: this.mode,
      baseScale: this.baseScale,
      warpStrength: this.warpStrength,
      warpScale: this.warpScale,
      offset: this.offset,
      power: this.power,
      zOffset: this.zOffset,
    });
  }

  /**
   * Update configuration with new values
   * @param {Object} updates - Partial configuration updates
   */
  update(updates) {
    Object.assign(this, updates);
  }

  /**
   * Convert to plain object for serialization
   * @returns {Object} Plain object representation
   */
  toObject() {
    return {
      seed: this.seed,
      scale: this.scale,
      octaves: this.octaves,
      persistence: this.persistence,
      amplitude: this.amplitude,
      frequency: this.frequency,
      type: this.type,
      mode: this.mode,
      baseScale: this.baseScale,
      warpStrength: this.warpStrength,
      warpScale: this.warpScale,
      offset: this.offset,
      power: this.power,
      zOffset: this.zOffset,
    };
  }
}

