import Perlin from "./perlin.js";
import { defaultTerrainConfig } from "../world/terrain/terrainConfig.js";
export function getTerrainHeight(x, z, config = defaultTerrainConfig) {
  const { noiseScale, amplitude } = config;
  const n = Perlin.noise2D(x * noiseScale, z * noiseScale);
  return (n - 0.5) * 2 * amplitude;
}
