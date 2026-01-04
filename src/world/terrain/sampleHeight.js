import { sampleNoise2D } from "./sampleNoise.js";

export function sampleTerrainHeight(x, z, config) {
  // Support both 'scale' (from noise nodes) and 'noiseScale' (from defaultTerrainConfig)
  const scale = config.scale ?? config.noiseScale ?? 0.05;
  const amplitude = config.amplitude ?? 10;
  
  // Use the unified noise sampler
  const noiseValue = sampleNoise2D(x, z, {
    type: config.type || "perlinNoise",
    seed: config.seed ?? 42,
    scale: scale,
    octaves: config.octaves ?? 4,
    persistence: config.persistence ?? 0.5,
    frequency: config.frequency ?? 1,
    amplitude: amplitude,
    // Voronoi specific
    mode: config.mode,
    // Domain Warping specific
    baseScale: config.baseScale,
    warpStrength: config.warpStrength,
    warpScale: config.warpScale,
    // Ridge Noise specific
    offset: config.offset,
    power: config.power,
    // Simplex specific
    zOffset: config.zOffset,
  });

  return noiseValue * amplitude;
}
