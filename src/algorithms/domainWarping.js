import Perlin from "./perlin.js";

const DomainWarping = {
  initialized: false,

  init(seed = 1) {
    if (this.initialized) return;
    Perlin.init(seed);
    this.initialized = true;
  },

  // Warp coordinates using noise
  warp2D(x, y, warpStrength = 5.0, warpScale = 0.1) {
    this.init();
    
    // Sample noise at original position to get warp offsets
    const warpX = Perlin.noise2D(x * warpScale, y * warpScale) * warpStrength;
    const warpY = Perlin.noise2D((x + 100) * warpScale, (y + 100) * warpScale) * warpStrength;
    
    // Return warped coordinates
    return {
      x: x + warpX,
      y: y + warpY,
    };
  },

  // Multi-layer domain warping
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

  // Generate noise using domain warping
  noise2D(x, y, baseScale = 0.05, warpStrength = 5.0, warpScale = 0.1) {
    this.init();
    
    // Warp the coordinates
    const warped = this.warp2D(x, y, warpStrength, warpScale);
    
    // Sample base noise at warped position
    return Perlin.noise2D(warped.x * baseScale, warped.y * baseScale);
  },

  // Multi-octave domain warped noise
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
      // Warp coordinates for this octave
      const warped = this.warp2D(x * freq, y * freq, warpStrength * amp, warpScale * freq);
      
      // Sample noise at warped position
      total += Perlin.noise2D(warped.x * baseScale, warped.y * baseScale) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }
    
    return maxAmp > 0 ? total / maxAmp : total;
  },
};

export default DomainWarping;

