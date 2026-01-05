export class NoiseConfig {
  constructor(config = {}) {
    this.seed = config.seed ?? 42;
    this.scale = config.scale ?? 0.05;
    this.octaves = config.octaves ?? 4;
    this.persistence = config.persistence ?? 0.5;
    this.amplitude = config.amplitude ?? 10;
    this.frequency = config.frequency ?? 1;
    this.type = config.type ?? "perlinNoise";
    this.mode = config.mode;
    this.baseScale = config.baseScale;
    this.warpStrength = config.warpStrength;
    this.warpScale = config.warpScale;
    this.offset = config.offset;
    this.power = config.power;
    this.zOffset = config.zOffset;
  }
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
  update(updates) {
    Object.assign(this, updates);
  }
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
