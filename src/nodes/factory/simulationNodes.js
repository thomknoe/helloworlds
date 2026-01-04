const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export function createLSystemNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("lsystem"),
    type: "lsystem",
    position,
    data: {
      label: "L-System",
      axiom: "F",
      rule1: "F",
      rule1Replacement: "F[+F]F[-F]F",
      rule2: "",
      rule2Replacement: "",
      rule3: "",
      rule3Replacement: "",
      iterations: 3,
      angle: 25,
      stepSize: 1.0,
    },
  };
}

export function createPlantNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("plant"),
    type: "plant",
    position,
    data: {
      label: "Plant",
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      branchThickness: 0.1,
      branchColor: "#8B4513",
      leafSize: 0.3,
      leafColor: "#228B22",
      leafDensity: 0.7,
    },
  };
}

export function createFlowerNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("flower"),
    type: "flower",
    position,
    data: {
      label: "Flowers",
      count: 50,
      spread: 50.0,
      size: 1.0,
    },
  };
}

export function createDiffusionNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("diffusion"),
    type: "diffusion",
    position,
    data: {
      label: "Diffusion Heat",
      width: 100,
      height: 100,
      diffusionRate: 0.1,
      dt: 0.1,
    },
  };
}

export function createCellularAutomataNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("cellularAutomata"),
    type: "cellularAutomata",
    position,
    data: {
      label: "Cellular Automata",
      width: 100,
      height: 100,
      surviveMin: 2,
      surviveMax: 3,
      birthMin: 3,
      birthMax: 3,
    },
  };
}

export function createParticleSystemNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("particleSystem"),
    type: "particleSystem",
    position,
    data: {
      label: "Particle System",
      maxParticles: 1000,
      spawnRate: 10,
      gravityX: 0,
      gravityY: -9.8,
      gravityZ: 0,
      windX: 0,
      windY: 0,
      windZ: 0,
      spawnX: 0,
      spawnY: 50,
      spawnZ: 0,
      spawnSizeX: 10,
      spawnSizeY: 5,
      spawnSizeZ: 10,
      lifetime: 5.0,
    },
  };
}

export function createWavePropagationNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("wavePropagation"),
    type: "wavePropagation",
    position,
    data: {
      label: "Wave Propagation",
      amplitude: 1.0,
      speed: 10.0,
      decayRate: 0.1,
      lifetime: 5.0,
      maxWaves: 10,
    },
  };
}
