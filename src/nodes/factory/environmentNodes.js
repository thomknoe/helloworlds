const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
export function createPerlinNoiseNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("perlin"),
    type: "perlinNoise",
    position,
    data: {
      label: "Perlin Noise",
      seed: 42,
      scale: 0.05,
      octaves: 4,
      persistence: 0.5,
      amplitude: 10,
      frequency: 1,
    },
  };
}
export function createTerrainNode(position = { x: 300, y: 0 }) {
  return {
    id: makeId("terrain"),
    type: "terrain",
    position,
    data: {
      elevationInfo: null,
      waterHeight: 0, 
    },
  };
}
export function createVoronoiNoiseNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("voronoi"),
    type: "voronoiNoise",
    position,
    data: {
      label: "Voronoi Noise",
      seed: 42,
      scale: 0.1,
      octaves: 4,
      persistence: 0.5,
      amplitude: 10,
      mode: "f1",
    },
  };
}
export function createDomainWarpingNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("domainWarping"),
    type: "domainWarping",
    position,
    data: {
      label: "Domain Warping",
      seed: 42,
      baseScale: 0.05,
      warpStrength: 5.0,
      warpScale: 0.1,
      octaves: 4,
      persistence: 0.5,
      amplitude: 10,
    },
  };
}
export function createRidgeNoiseNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("ridgeNoise"),
    type: "ridgeNoise",
    position,
    data: {
      label: "Ridge Noise",
      seed: 42,
      scale: 0.05,
      octaves: 4,
      persistence: 0.5,
      amplitude: 10,
      offset: 0.0,
      power: 2.0,
    },
  };
}
export function createSimplexNoiseNode(position = { x: 0, y: 0 }) {
  return {
    id: makeId("simplex"),
    type: "simplexNoise",
    position,
    data: {
      label: "Simplex Noise",
      seed: 42,
      scale: 0.05,
      octaves: 4,
      persistence: 0.5,
      amplitude: 10,
      zOffset: 0.0,
    },
  };
}
