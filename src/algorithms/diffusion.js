/**
 * Diffusion/Heat Equation simulation
 * Simple grid-based diffusion for material spreading, erosion, temperature gradients
 */
export class DiffusionSystem {
  constructor(config = {}) {
    this.width = config.width || 100;
    this.height = config.height || 100;
    this.diffusionRate = config.diffusionRate || 0.1;
    this.dt = config.dt || 0.1;
    
    // Initialize grid with zeros
    this.grid = new Array(this.height).fill(0).map(() => 
      new Array(this.width).fill(0)
    );
    this.nextGrid = new Array(this.height).fill(0).map(() => 
      new Array(this.width).fill(0)
    );
  }

  // Set value at position
  setValue(x, y, value) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      this.grid[iy][ix] = value;
    }
  }

  // Get value at position
  getValue(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      return this.grid[iy][ix];
    }
    return 0;
  }

  // Add source at position
  addSource(x, y, intensity = 1.0) {
    this.setValue(x, y, this.getValue(x, y) + intensity);
  }

  // Update diffusion step
  update() {
    const d = this.diffusionRate;
    const dt = this.dt;

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        // Laplacian: sum of neighbors minus center
        const laplacian = 
          this.grid[y - 1][x] +
          this.grid[y + 1][x] +
          this.grid[y][x - 1] +
          this.grid[y][x + 1] -
          4 * this.grid[y][x];

        // Diffusion equation: dT/dt = D * ∇²T
        this.nextGrid[y][x] = this.grid[y][x] + d * dt * laplacian;
      }
    }

    // Copy boundaries (no diffusion at edges)
    for (let y = 0; y < this.height; y++) {
      this.nextGrid[y][0] = this.grid[y][0];
      this.nextGrid[y][this.width - 1] = this.grid[y][this.width - 1];
    }
    for (let x = 0; x < this.width; x++) {
      this.nextGrid[0][x] = this.grid[0][x];
      this.nextGrid[this.height - 1][x] = this.grid[this.height - 1][x];
    }

    // Swap grids
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }

  // Sample value at normalized coordinates (0-1)
  sample(nx, ny) {
    const x = Math.floor(nx * (this.width - 1));
    const y = Math.floor(ny * (this.height - 1));
    return this.getValue(x, y);
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

export default DiffusionSystem;

