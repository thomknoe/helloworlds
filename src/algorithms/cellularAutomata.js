/**
 * Cellular Automata (Game of Life variants)
 * 2D grid with neighbor rules for organic growth, forest fires, spreading phenomena
 */
export class CellularAutomata {
  constructor(config = {}) {
    this.width = config.width || 100;
    this.height = config.height || 100;
    this.surviveMin = config.surviveMin || 2; // Min neighbors to survive
    this.surviveMax = config.surviveMax || 3; // Max neighbors to survive
    this.birthMin = config.birthMin || 3; // Min neighbors to be born
    this.birthMax = config.birthMax || 3; // Max neighbors to be born
    
    // Initialize grid (0 = dead, 1 = alive)
    this.grid = new Array(this.height).fill(0).map(() => 
      new Array(this.width).fill(0)
    );
    this.nextGrid = new Array(this.height).fill(0).map(() => 
      new Array(this.width).fill(0)
    );
  }

  // Set cell state
  setCell(x, y, state) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      this.grid[iy][ix] = state ? 1 : 0;
    }
  }

  // Get cell state
  getCell(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      return this.grid[iy][ix];
    }
    return 0;
  }

  // Count living neighbors (Moore neighborhood - 8 neighbors)
  countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; // Skip center
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          count += this.grid[ny][nx];
        }
      }
    }
    return count;
  }

  // Update one generation
  update() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const neighbors = this.countNeighbors(x, y);
        const current = this.grid[y][x];

        if (current === 1) {
          // Cell is alive: survives if neighbors in [surviveMin, surviveMax]
          this.nextGrid[y][x] = 
            (neighbors >= this.surviveMin && neighbors <= this.surviveMax) ? 1 : 0;
        } else {
          // Cell is dead: born if neighbors in [birthMin, birthMax]
          this.nextGrid[y][x] = 
            (neighbors >= this.birthMin && neighbors <= this.birthMax) ? 1 : 0;
        }
      }
    }

    // Swap grids
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }

  // Random initialization
  randomize(density = 0.3) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = Math.random() < density ? 1 : 0;
      }
    }
  }

  // Sample value at normalized coordinates (0-1)
  sample(nx, ny) {
    const x = Math.floor(nx * (this.width - 1));
    const y = Math.floor(ny * (this.height - 1));
    return this.getCell(x, y);
  }

  // Reset grid
  reset() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = 0;
        this.nextGrid[y][x] = 0;
      }
    }
  }
}

export default CellularAutomata;

