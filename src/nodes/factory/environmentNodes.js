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
    },
  };
}
