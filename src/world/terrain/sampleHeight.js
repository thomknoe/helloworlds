import { sampleNoise2D } from "./sampleNoise.js";
export function sampleTerrainHeight(x, z, config) {
  const scale = config.scale ?? config.noiseScale ?? 0.05;
  const amplitude = config.amplitude ?? 10;
  const noiseValue = sampleNoise2D(x, z, {
    type: config.type || "perlinNoise",
    seed: config.seed ?? 42,
    scale: scale,
    octaves: config.octaves ?? 4,
    persistence: config.persistence ?? 0.5,
    frequency: config.frequency ?? 1,
    amplitude: amplitude,
    mode: config.mode,
    baseScale: config.baseScale,
    warpStrength: config.warpStrength,
    warpScale: config.warpScale,
    offset: config.offset,
    power: config.power,
    zOffset: config.zOffset,
  });
  return noiseValue * amplitude;
}
