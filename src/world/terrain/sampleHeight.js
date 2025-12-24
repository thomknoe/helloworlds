import Perlin from "../../algorithms/perlin.js";

export function sampleTerrainHeight(x, z, config) {
  const seed = config.seed ?? 42;
  const scale = config.scale ?? 0.05;
  const octaves = Math.max(1, Math.floor(config.octaves ?? 4));
  const persistence = config.persistence ?? 0.5;
  const amplitude = config.amplitude ?? 10;
  const baseFreq = config.frequency ?? 1;

  Perlin.init(seed);

  let total = 0;
  let freq = baseFreq;
  let amp = 1;
  let maxAmp = 0;
  const safeScale = scale > 0 ? scale : 0.0001;

  for (let o = 0; o < octaves; o++) {
    total += Perlin.noise2D(x * safeScale * freq, z * safeScale * freq) * amp;
    maxAmp += amp;
    amp *= persistence;
    freq *= 2;
  }

  const normalized = maxAmp > 0 ? total / maxAmp : total;

  return normalized * amplitude;
}
