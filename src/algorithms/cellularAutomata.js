export class CellularAutomata {
  constructor(config = {}) {
    this.width = config.width || 100;
    this.height = config.height || 100;
    this.surviveMin = config.surviveMin || 2; 
    this.surviveMax = config.surviveMax || 3; 
    this.birthMin = config.birthMin || 3; 
    this.birthMax = config.birthMax || 3; 
    this.grid = new Array(this.height).fill(0).map(() => 
      new Array(this.width).fill(0)
    );
    this.nextGrid = new Array(this.height).fill(0).map(() => 
      new Array(this.width).fill(0)
    );
  }
  setCell(x, y, state) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      this.grid[iy][ix] = state ? 1 : 0;
    }
  }
  getCell(x, y) {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix >= 0 && ix < this.width && iy >= 0 && iy < this.height) {
      return this.grid[iy][ix];
    }
    return 0;
  }
  countNeighbors(x, y) {
    let count = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue; 
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          count += this.grid[ny][nx];
        }
      }
    }
    return count;
  }
  update() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const neighbors = this.countNeighbors(x, y);
        const current = this.grid[y][x];
        if (current === 1) {
          this.nextGrid[y][x] = 
            (neighbors >= this.surviveMin && neighbors <= this.surviveMax) ? 1 : 0;
        } else {
          this.nextGrid[y][x] = 
            (neighbors >= this.birthMin && neighbors <= this.birthMax) ? 1 : 0;
        }
      }
    }
    [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
  }
  randomize(density = 0.3) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = Math.random() < density ? 1 : 0;
      }
    }
  }
  sample(nx, ny) {
    const x = Math.floor(nx * (this.width - 1));
    const y = Math.floor(ny * (this.height - 1));
    return this.getCell(x, y);
  }
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
