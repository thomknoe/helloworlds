import Perlin from "./perlin.js";

const RidgeNoise = {
  initialized: false,

  init(seed = 1) {
    if (this.initialized) return;
    Perlin.init(seed);
    this.initialized = true;
  },

  // Basic ridge noise: invert and take absolute value
  noise2D(x, y, scale = 0.05, offset = 0.0) {
    this.init();
    
    // Get base Perlin noise
    const n = Perlin.noise2D(x * scale, y * scale);
    
    // Invert and create ridge
    const inverted = 1.0 - n;
    const ridged = Math.abs(inverted - offset);
    
    return ridged;
  },

  // Sharp ridges using power function
  noise2DSharp(x, y, scale = 0.05, power = 2.0, offset = 0.0) {
    this.init();
    
    const n = Perlin.noise2D(x * scale, y * scale);
    const inverted = 1.0 - n;
    const ridged = Math.abs(inverted - offset);
    
    // Sharpen ridges with power function
    return Math.pow(ridged, power);
  },

  // Multi-octave ridge noise
  noise2DFractal(
    x,
    y,
    scale = 0.05,
    octaves = 4,
    persistence = 0.5,
    offset = 0.0,
    power = 2.0
  ) {
    this.init();
    
    let total = 0;
    let freq = 1;
    let amp = 1;
    let maxAmp = 0;
    
    for (let o = 0; o < octaves; o++) {
      const n = Perlin.noise2D(x * scale * freq, y * scale * freq);
      const inverted = 1.0 - n;
      const ridged = Math.pow(Math.abs(inverted - offset), power);
      
      total += ridged * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }
    
    return maxAmp > 0 ? total / maxAmp : total;
  },

  // Billow noise (absolute value of noise)
  billow2D(x, y, scale = 0.05, octaves = 4, persistence = 0.5) {
    this.init();
    
    let total = 0;
    let freq = 1;
    let amp = 1;
    let maxAmp = 0;
    
    for (let o = 0; o < octaves; o++) {
      const n = Perlin.noise2D(x * scale * freq, y * scale * freq);
      const billow = Math.abs(n - 0.5) * 2.0; // Center at 0.5 and double
      
      total += billow * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }
    
    return maxAmp > 0 ? total / maxAmp : total;
  },
};

export default RidgeNoise;

