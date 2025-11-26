// src/nodes/factory/environmentNodes.js

// Simple ID generator to avoid extra deps
const makeId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// ---------------------------------------------------------
// Perlin Noise Node
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// Terrain Node
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// Number Slider Node
// ---------------------------------------------------------
export function createNumberSliderNode(position = { x: 0, y: 200 }) {
  return {
    id: makeId("slider"),
    type: "numberSlider",
    position,
    data: {
      label: "Number",
      min: 0,
      max: 1,
      step: 0.01,
      value: 0,
    },
  };
}

// ---------------------------------------------------------
// Panel Node
// ---------------------------------------------------------
export function createPanelNode(position = { x: 0, y: 350 }) {
  return {
    id: makeId("panel"),
    type: "panel",
    position,
    data: {
      label: "Panel",
      children: "Panel Content",
    },
  };
}
