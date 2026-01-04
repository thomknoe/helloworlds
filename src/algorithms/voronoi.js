import Perlin from "./perlin.js";

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Voronoi = {
  currentSeed: null,
  points: [],
  random: null,

  init(seed = 1, numPoints = 9) {
    // Reinitialize if seed changed
    if (this.currentSeed === seed && this.points.length > 0) return;
    
    this.currentSeed = seed;
    this.random = mulberry32(seed);
    this.points = [];
    
    // Generate random feature points in a grid pattern for better tiling
    const gridSize = Math.ceil(Math.sqrt(numPoints));
    const cellSize = 100.0;
    
    for (let i = 0; i < numPoints; i++) {
      const gridX = (i % gridSize) * cellSize;
      const gridY = Math.floor(i / gridSize) * cellSize;
      
      // Add jitter within cell
      const jitterX = (this.random() - 0.5) * cellSize * 0.8;
      const jitterY = (this.random() - 0.5) * cellSize * 0.8;
      
      this.points.push({
        x: gridX + jitterX,
        y: gridY + jitterY,
      });
    }
  },

  // Distance to nearest feature point (F1)
  f1(x, y) {
    let minDist = Infinity;
    
    for (const point of this.points) {
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      minDist = Math.min(minDist, dist);
    }
    
    return minDist;
  },

  // Distance to second nearest feature point (F2)
  f2(x, y) {
    let dists = [];
    
    for (const point of this.points) {
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      dists.push(dist);
    }
    
    dists.sort((a, b) => a - b);
    return dists.length > 1 ? dists[1] : dists[0];
  },

  // F2 - F1 (ridge-like pattern)
  f2MinusF1(x, y) {
    return this.f2(x, y) - this.f1(x, y);
  },

  noise2D(x, y, seed = 1, mode = "f1", scale = 1.0) {
    this.init(seed, 9);
    
    const scaledX = x * scale;
    const scaledY = y * scale;
    
    let value;
    switch (mode) {
      case "f1":
        value = this.f1(scaledX, scaledY);
        break;
      case "f2":
        value = this.f2(scaledX, scaledY);
        break;
      case "f2MinusF1":
        value = this.f2MinusF1(scaledX, scaledY);
        break;
      default:
        value = this.f1(scaledX, scaledY);
    }
    
    // Normalize to 0-1 range (adjust based on expected max distance)
    const maxDist = 50; // Approximate max distance for normalization
    return Math.min(value / maxDist, 1.0);
  },

  // Multi-octave Voronoi
  noise2DFractal(x, y, scale = 1.0, octaves = 4, persistence = 0.5, seed = 1, mode = "f1") {
    this.init(seed, 9);
    
    let total = 0;
    let freq = 1;
    let amp = 1;
    let maxAmp = 0;
    
    for (let o = 0; o < octaves; o++) {
      total += this.noise2D(x * freq, y * freq, seed, mode, scale) * amp;
      maxAmp += amp;
      amp *= persistence;
      freq *= 2;
    }
    
    return maxAmp > 0 ? total / maxAmp : total;
  },
};

export default Voronoi;

