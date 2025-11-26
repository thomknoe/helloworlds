// src/algorithms/heightSampling.js

import Perlin from "./perlin.js";
import { defaultTerrainConfig } from "../world/terrain/terrainConfig.js";

export function getTerrainHeight(x, z, config = defaultTerrainConfig) {
  const { noiseScale, amplitude } = config;

  // Perlin noise in range [0,1]
  const n = Perlin.noise2D(x * noiseScale, z * noiseScale);

  // Convert to [-1,1] then multiply by amplitude
  return (n - 0.5) * 2 * amplitude;
}
