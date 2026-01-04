import Perlin from "../../algorithms/perlin.js";
import Voronoi from "../../algorithms/voronoi.js";
import DomainWarping from "../../algorithms/domainWarping.js";
import RidgeNoise from "../../algorithms/ridgeNoise.js";
import Simplex from "../../algorithms/simplex.js";

/**
 * Sample noise value at a given 2D position using the specified noise type
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @param {object} config - Noise configuration
 * @param {string} config.type - Noise type: 'perlinNoise', 'voronoiNoise', 'domainWarping', 'ridgeNoise', 'simplexNoise'
 * @param {number} config.seed - Random seed
 * @param {number} config.scale - Noise scale
 * @param {number} config.octaves - Number of octaves
 * @param {number} config.persistence - Persistence value
 * @param {number} config.amplitude - Amplitude multiplier
 * @param {number} config.frequency - Base frequency
 * @param {string} [config.mode] - Voronoi mode: 'f1', 'f2', 'f2MinusF1'
 * @param {number} [config.warpStrength] - Domain warping strength
 * @param {number} [config.warpScale] - Domain warping scale
 * @param {number} [config.baseScale] - Domain warping base scale
 * @param {number} [config.offset] - Ridge noise offset
 * @param {number} [config.power] - Ridge noise power
 * @param {number} [config.zOffset] - Simplex Z offset
 * @returns {number} Noise value (0-1 range)
 */
export function sampleNoise2D(x, z, config) {
  const noiseType = config.type || "perlinNoise";
  const seed = config.seed ?? 42;
  const scale = config.scale ?? 0.05;
  const octaves = Math.max(1, Math.floor(config.octaves ?? 4));
  const persistence = config.persistence ?? 0.5;
  const baseFreq = config.frequency ?? 1;
  const safeScale = scale > 0 ? scale : 0.0001;

  switch (noiseType) {
    case "voronoiNoise": {
      const mode = config.mode || "f1";
      return Voronoi.noise2DFractal(x, z, safeScale, octaves, persistence, seed, mode);
    }

    case "domainWarping": {
      // DomainWarping.init() initializes Perlin internally with the seed
      DomainWarping.init(seed);
      const baseScale = config.baseScale ?? 0.05;
      const warpStrength = config.warpStrength ?? 5.0;
      const warpScale = config.warpScale ?? 0.1;
      return DomainWarping.noise2DFractal(
        x,
        z,
        baseScale,
        warpStrength,
        warpScale,
        octaves,
        persistence
      );
    }

    case "ridgeNoise": {
      RidgeNoise.init(seed);
      const offset = config.offset ?? 0.0;
      const power = config.power ?? 2.0;
      return RidgeNoise.noise2DFractal(
        x,
        z,
        safeScale,
        octaves,
        persistence,
        offset,
        power
      );
    }

    case "simplexNoise": {
      Simplex.init(seed);
      const zOffset = config.zOffset ?? 0.0;
      return Simplex.noise2DFractal(x, z, octaves, persistence, safeScale);
    }

    case "perlinNoise":
    default: {
      Perlin.init(seed);
      let total = 0;
      let freq = baseFreq;
      let amp = 1;
      let maxAmp = 0;

      for (let o = 0; o < octaves; o++) {
        total += Perlin.noise2D(x * safeScale * freq, z * safeScale * freq) * amp;
        maxAmp += amp;
        amp *= persistence;
        freq *= 2;
      }

      return maxAmp > 0 ? total / maxAmp : total;
    }
  }
}

