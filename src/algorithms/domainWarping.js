import Perlin from "./perlin.js";
const DomainWarping = {
  initialized: false,
  init(seed = 1) {
    if (this.initialized) return;
    Perlin.init(seed);
    this.initialized = true;
  },
  warp2D(x, y, warpStrength = 5.0, warpScale = 0.1) {
    this.init();
    const warpX = Perlin.noise2D(x * warpScale, y * warpScale) * warpStrength;
    const warpY = Perlin.noise2D((x + 100) * warpScale, (y + 100) * warpScale) * warpStrength;
    return {
      x: x + warpX,
      y: y + warpY,
    };
  },
  warp2DFractal(x, y, warpStrength = 5.0, warpScale = 0.1, octaves = 3) {
    let warpedX = x;
    let warpedY = y;
    let freq = 1;
    let amp = 1;
    for (let o = 0; o < octaves; o++) {
      const warp = this.warp2D(warpedX, warpedY, warpStrength * amp, warpScale * freq);
      warpedX = warp.x;
      warpedY = warp.y;
      freq *= 2;
      amp *= 0.5;
    }
    return { x: warpedX, y: warpedY };
  },
  noise2D(x, y, baseScale = 0.05, warpStrength = 5.0, warpScale = 0.1) {
    this.init();
    const warped = this.warp2D(x, y, warpStrength, warpScale);
    return Perlin.noise2D(warped.x * baseScale, warped.y * baseScale);
  },
  noise2DFractal(
    x,
    y,
    baseScale = 0.05,
    warpStrength = 5.0,
    warpScale = 0.1,
    octaves = 4,
    persistence = 0.5
  ) {
    this.init();
    let total = 0;
    let freq = 1;
    let amp = 1;
    let maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
      const warped = this.warp2D(x * freq, y * freq, warpStrength * amp, warpScale * freq);
      total += Perlin.noise2D(warped.x * baseScale, warped.y * baseScale) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }
    return maxAmp > 0 ? total / maxAmp : total;
  },
};
export default DomainWarping;
