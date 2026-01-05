import Perlin from "../../algorithms/perlin.js";
import Voronoi from "../../algorithms/voronoi.js";
import DomainWarping from "../../algorithms/domainWarping.js";
import RidgeNoise from "../../algorithms/ridgeNoise.js";
import Simplex from "../../algorithms/simplex.js";
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
